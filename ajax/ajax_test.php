<?php

	error_reporting(E_ERROR);
	
	$gets = count($_GET);
	$posts = count($_POST);
	
	$outputStr = '';
	
	if ($gets > 0)
	{		
		$outputStr = $gets.' GET variables were found: ';
		
		foreach ($_GET as $key => $value) 
		{ 
			$outputStr .= $key.'='.$value.'; ';
		}
	}
	
	if ($posts > 0)
	{		
		$outputStr = $posts.' POST variables were found: ';
		
		foreach ($_POST as $key => $value) 
		{ 
			$outputStr .= $key.'='.$value.'; ';
		}
	}
	
	echo $outputStr;