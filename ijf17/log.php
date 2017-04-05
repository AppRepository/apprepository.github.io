<?php
date_default_timezone_set('Europe/Rome');
file_put_contents("logs/log.txt",date(DATE_RFC2822).": ".$_GET['message']."\n",FILE_APPEND );

?>