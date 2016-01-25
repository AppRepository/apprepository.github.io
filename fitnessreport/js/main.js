
var currentYear = new Date().getFullYear();
var currentYearWorkout =0;
var currentYearKm = 0;

// Some functions

truncateDecimals = function (number, digits) {
	var multiplier = Math.pow(10, digits),
	adjustedNum = number * multiplier,
	truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
	return truncatedNum / multiplier;
};

function getTimeStamp() {
var now = new Date();
return ((now.getMonth() + 1) + '/' +
		(now.getDate()) + '/' +
		 now.getFullYear() + " " +
		 now.getHours() + ':' +
		 ((now.getMinutes() < 10)
			 ? ("0" + now.getMinutes())
			 : (now.getMinutes())) + ':' +
		 ((now.getSeconds() < 10)
			 ? ("0" + now.getSeconds())
			 : (now.getSeconds())));
}

//Login done
function doLogin() {
	FB.login(function(response) {
	   if (response.authResponse) {
		 console.log('Welcome!  Fetching your information.... ');
		 $( "#dialog-login" ).dialog("close");
		 afterLogin();
	   } else {
		 alert('User cancelled login or did not fully authorize.');
	   }
	 });
}

$(document).ready(function () {
	FB.init({ 
		appId: '400909303397939', 
		cookie: true, 
		xfbml: true, 
		status: true 
	});

	var fbToken = localStorage.getItem("fbToken");
	if (fbToken != "null" && fbToken != null ) {
		getData(showData);
	} else {
		showLogin();
	}

});
	
	function showLogin() {
		$("body").removeClass("loading");
		$( "#dialog-login" ).dialog({
		  modal: true,
		  resizable: false,
		  draggable: false,
		  closeOnEscape: false
		});
		$(".ui-dialog-titlebar").hide();
	}
	
	function savePDF() {
		var doc = new jsPDF();
		
		var specialElementHandlers = {
			'#editor': function(element, renderer){
				return true;
			}
		};
		doc.fromHTML($('#ReportCont').get(0), 15, 15, {
			'width': 300, 
			'elementHandlers': specialElementHandlers
		});
		doc.save('FacebookFitnessReport-' + localStorage.getItem("lastUpdate") +  '.pdf');
	}
	
	function getData(callback) {
		var fbToken = localStorage.getItem("fbToken");
		var ids = localStorage.getItem("ids");
		if (ids != null) {
			ids = ids.split(",");
			console.log("Using cached data...");
			showData(ids);
		} else {
			console.log("Retrieve new data...");
			$("body").addClass("loading");
			$.getJSON("https://graph.facebook.com/v2.2/me/fitness.runs?limit=100000&access_token=" + fbToken , function(results){
				var mydata = eval(results.data);
	
				var ids = [];
				var years = [];
				var apps = [];

				var totalActivities = 0;
				var totalKm = 0;
				
				for (var i = 0; i < mydata.length; i++) {	
						var courseID = mydata[i].data.course.id;

						var courseDate = mydata[i].publish_time;
courseDate = courseDate.replace("+0000","");
						var year = new Date(courseDate).getFullYear();
						var month = new Date(courseDate).getMonth() + 1;
						var day = new Date(courseDate).getDate();
						
						var hour = new Date(courseDate).getHours();
					
						var distance = mydata[i].data.course.title;
						if (distance.indexOf("km")>0) {
							//kilometers
							distance = distance.replace("a","");
							distance = distance.split("km")[0];
						} else {
							//Miles
							distance = truncateDecimals(distance.split("miles")[0] * 1.609,2);
						}
						
						//Peace
						// var startTS = new Date(mydata[i].start_time);
						// var endTS = new Date(mydata[i].end_time);
						// var exeTime = (endTS - startTS) / (1000);
						// var paceS = exeTime / distance;
						
						// var minutes = Math.floor(paceS / 60);
						// var seconds =  Math.floor(paceS - minutes * 60);
						
						// var pace = minutes + ":" + seconds;
						
						// console.log(startTS + "-" + endTS + "=" + exeTime + "    PEACE=" + pace);
						
						var isNumber = function( obj ) {
							return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
						}
						
						var appname = mydata[i].application.name;
						
						if (isNumber(distance)) {
							localStorage.setItem("activity." + courseID + ".app",appname);
							localStorage.setItem("activity." + courseID + ".distance",distance);
							localStorage.setItem("activity." + courseID + ".year",year);
							localStorage.setItem("activity." + courseID + ".month",month);
							localStorage.setItem("activity." + courseID + ".day",day);
							localStorage.setItem("activity." + courseID + ".hour",hour);
							//localStorage.setItem("activity." + courseID + ".pace",pace);
							
							//ADD ID
							ids.push(courseID);
							
							if (!isNumber(parseInt(localStorage.getItem("year." + year + ".activities")))) {
								localStorage.setItem("year." + year + ".activities",0);
							}
							
							if (!isNumber(parseInt(localStorage.getItem("year." + year + ".km")))) {
								localStorage.setItem("year." + year + ".km",0);
							}
							
							if (!isNumber(parseInt(localStorage.getItem("apps." + appname + ".activities")))) {
								localStorage.setItem("apps." + appname + ".activities",0);
							}
							
							//Total activities
							totalActivities++;
							//Total kilometers
							totalKm = parseInt(totalKm) + parseInt(distance);
							
							
							//Total year workouts
							localStorage.setItem("year." + year + ".activities",parseInt(localStorage.getItem("year." + year + ".activities")) + 1);
							//Total Year kilometers
							localStorage.setItem("year." + year + ".km",parseInt(localStorage.getItem("year." + year + ".km")) + parseInt(distance));
							
							//Apps workouts
							localStorage.setItem("apps." + appname + ".activities",parseInt(localStorage.getItem("apps." + appname + ".activities")) + 1);
							
							
							
							
							if (years.indexOf(year) == -1 ) {
								years.push(year);
							} 
							
							if (apps.indexOf(appname) == -1 ) {
								apps.push(appname);
							} 
						} else {
							continue;
						}
				}
				localStorage.setItem("ids",ids);
				localStorage.setItem("years",years);
				localStorage.setItem("apps",apps);
				
				localStorage.setItem("totalActivities",totalActivities);
				localStorage.setItem("totalKm",totalKm);
				
				console.log("Data update ok!");
				$("body").removeClass("loading");
				
				//Set last update
				var newDate = new Date();
				localStorage.setItem("lastUpdate",getTimeStamp());
				
				callback(ids);
			}).fail(function() { 
				showLogin();
			})
		}
		
	}
	
	
	 function FBShare() {
        FB.ui(
          {
            method: 'feed',
            name: 'My ' + currentYear + " running report: " +  localStorage.getItem("year." + currentYear + ".activities") + " workouts and " +  localStorage.getItem("year." + currentYear + ".km") + " km!",
            link: 'http://fitnessreport.andreafortuna.org/',
            picture: 'http://fitnessreport.andreafortuna.org/img/running.png',
            caption: 'In ' + currentYear + ' I have made ' + localStorage.getItem("year." + currentYear + ".activities") + ' workouts and I have ran for ' +  localStorage.getItem("year." + currentYear + ".km") + ' km   ',
            description: 'Report provided by http://fitnessreport.andreafortuna.org/'
          },
          function(response) {
            if (response && response.post_id) {
              alert('Post was published.');
            } else {
              //alert('Post was not published.');
            }
          }
        );
    }
	
	function showData(ids) {
	$("body").addClass("loading");
			$("#TableCont").empty();
		$("#ReportCont").empty();
		console.log("Printing data...");
		var table = "<table>";
		table += "<tr><th>Year</th><th>Month</th><th>Day</th><th>Distance</th><th>Tracking App</th></tr>";
			
			ids.forEach(function(courseID) {
				var appName = localStorage.getItem("activity." + courseID + ".app");
				var courseDistance = localStorage.getItem("activity." + courseID + ".distance");
				var year = localStorage.getItem("activity." + courseID + ".year");
				var month = localStorage.getItem("activity." + courseID + ".month");
				var day = localStorage.getItem("activity." + courseID + ".day");
				var hour = localStorage.getItem("activity." + courseID + ".hour");
				//var pace = localStorage.getItem("activity." + courseID + ".pace");
				
				table += "<tr><td>" + year + "</td><td>" + month + "</td><td>" + day + "</td><td>" + courseDistance + "</td><td>" + appName + "</td></tr>";
			});

			table += "</table>";
			
			var statistics = "<img src='/img/share.png' width='130px' onclick='FBShare()'/><h4>Years</h4><ul>";
			localStorage.getItem("years").split(",").forEach(function(year) {
				statistics += "<li>Total activities for year " + year + ": " + localStorage.getItem("year." + year + ".activities") + "</li>";
				statistics += "<li>Total km for year " + year + ": " + localStorage.getItem("year." + year + ".km") + "</li>";
			});
			statistics += "</ul>"
			
			statistics += "<h4>Total</h4><ul><li>Total activities:" + localStorage.getItem("totalActivities")+"</li><li>Total distance: " + localStorage.getItem("totalKm") + " km</li></ul>"  ;
			
			statistics += "<h4>Apps</h4><ul>";
			localStorage.getItem("apps").split(",").forEach(function(appName) {
				statistics += "<li>Total activities tracked with " + appName + ": " + localStorage.getItem("apps." + appName + ".activities") + "</li>";
			});
			statistics += "</ul>"
			
			$(statistics).appendTo("#ReportCont");
			$(table).appendTo("#TableCont");
			console.log("Done printing data...");
			
			$("#lastUpdate").html("Last Update: " + localStorage.getItem("lastUpdate"));
			
			$("#ReportCont").show("slow");
			$("#TableCont").show("slow");
			$("body").removeClass("loading");
			
	}
	
	function resetData() {
		if (confirm("Are you sure?")) {
			localStorage.clear();
			location.reload();
		}
	}
	
	function refreshData() {
		$("#TableCont").hide("slow");
		$("#ReportCont").hide("slow");
		var fbToken = localStorage.getItem("fbToken");
		localStorage.clear();
		localStorage.setItem("fbToken",fbToken);
		getData(showData);
	}
	
	function afterLogin()
	{
		FB.getLoginStatus(function(response) {
		    if (response.authResponse) {
				localStorage.setItem("fbToken", response.authResponse.accessToken);
				getData(showData);
            } 
		});
	}
	
