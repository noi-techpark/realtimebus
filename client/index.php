<?php 
	$browser_language = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
	$lang = 'it';
	switch($browser_language):
		case 'de':
			$lang = 'de';
		break;
		case 'en':
			$lang = 'en';
		break;
	endswitch;

	/*global $lang;
	$lang = 'it';*/
	if(isset($_GET['l'])) $lang = $_GET['l'];
	if($lang != 'it' && $lang != 'en' && $lang != 'de')
		$lang = 'it';
	include 'lang.php';
?>
<!DOCTYPE html>
<html dir="ltr">
	<head>
		<meta charset="utf-8" />
		<title><?php ___("meranotitle"); ?></title>
		<link rel="icon" href="favicon.ico" type="image/x-icon"> 
		<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
		<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->

		<!-- Stylesheets -->
		<link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/ui-lightness/jquery-ui.css" type="text/css" media="all" />
		<link href="css/standard.css" rel="stylesheet" media="screen,projection,print" type="text/css" />
		<link href="css/smartphone.css" media="only screen and (max-width: 671px)" rel="stylesheet" /> <!-- max-device-width: 671px -->
		<link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
		<link href="css/smartphoneLandscape.css" media="only screen and (max-width: 671px) and (orientation: landscape)" rel="stylesheet" />  <!-- max-device-width: 671px -->
		<link href="css/radialStyle.css" rel="stylesheet" />
		<link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/ui-lightness/jquery-ui.css" type="text/css" media="all" />
		<style>
			.ui-dialog {z-index:1000;}
		</style>
		<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0">
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="default" /> 
	</head>
	<!--[if IE 8]>
	<body class="lte-8 ie-8 map-body">
	<![endif]-->
	<!--[if lte IE 7]>
	<body class="lte-8 lte-7 map-body">
	<![endif]-->
	<!--[if gt IE 8]>
	<body class="map-body ie-9">
	<![endif]-->
	<!--[if !IE]><!-->
	<body class="map-body <?php echo $lang ?>">
		<script>  
		if (/*@cc_on!@*/false) {  
			document.documentElement.className+=' ie10';  
		}  
		</script>
	<!--<![endif]-->
		<header class="header-mobile clearfix" id="header-mobile">
			<span class="mobile-menu-btn open" id="mobile-menu-btn">
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px"  viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">
				<g style="stroke:#fff;stroke-width:5">
					<line x1="70" y1="100" x2="130" y2="100" />
					<line y1="70" x1="100" y2="130" x2="100" />
					<circle fill="transparent"  r="60" cx="100" cy ="100" />
				</g>
				</svg>
			</span>
			<img id="logo-mobile" src="images/logo-small.gif" alt="Merano real time bus"/>
			<a href="javascript:void(0)" target="_blank" class="beta">Beta</a>
			<a href="<?php ___('feedbackform'); ?>" target="_blank" class="feedback">Feedback</a>
		</header>
		<div class="map-container" id="map" style="width:100%;height:100%">
		</div>
		<div class="map-controls">
			<a href="#" class="config" id="bus-c">
				<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 110.34375 110.34375" enable-background="new 0 0 200 200" xml:space="preserve">
					<g transform="translate(-49.03125,-47.125)" fill="#ee9712"><g><g><path stroke-miterlimit="10" d="m 104.197,48.121 c 29.922,0 54.176,24.256 54.176,54.178 0,29.918 -24.254,54.176 -54.176,54.176 -29.92,0 -54.176,-24.258 -54.176,-54.176 0,-29.923 24.256,-54.178 54.176,-54.178 z" connector-curvature="0" style=""></path></g></g>
						<g><polygon stroke-miterlimit="10" points="99.205,80.781 95.545,73.626 86.007,78.507 89.667,85.662 86.119,90.486 78.008,87.865 74.515,98.681 82.625,101.3 82.681,107.289 75.527,110.949 80.407,120.488 87.562,116.828 92.386,120.376 89.766,128.486 95.173,130.234 100.58,131.98 103.2,123.869 109.189,123.814 112.85,130.968 122.388,126.085 118.728,118.933 122.275,114.109 130.387,116.728 133.88,105.914 125.77,103.292 125.714,97.304 132.867,93.644 127.987,84.105 120.833,87.767 116.008,84.218 118.628,76.107 113.221,74.361 107.813,72.615 105.193,80.724 " style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10"></polygon><circle stroke-miterlimit="10" cx="104.197" cy="102.297" r="5.6820002" cx="104.197" cy="102.297" rx="5.6820002" ry="5.6820002" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10" d="m 109.879,102.297 c 0,3.13808 -2.54392,5.682 -5.682,5.682 -3.13808,0 -5.682002,-2.54392 -5.682002,-5.682 0,-3.138085 2.543922,-5.682003 5.682002,-5.682003 3.13808,0 5.682,2.543918 5.682,5.682003 z"></circle></g>
	                           		<text x="0" y="15" fill="red">I love SVG!</text>
					</g>
				</svg>
			</a>
			<a href="#" class="config" id="walking-c">
				<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 110.34375 110.34375" enable-background="new 0 0 200 200" xml:space="preserve">
					<g transform="translate(-49.03125,-47.125)" fill="#ce5400"><g><g><path stroke-miterlimit="10" d="m 104.197,48.121 c 29.922,0 54.176,24.256 54.176,54.178 0,29.918 -24.254,54.176 -54.176,54.176 -29.92,0 -54.176,-24.258 -54.176,-54.176 0,-29.923 24.256,-54.178 54.176,-54.178 z" connector-curvature="0" style=""></path></g></g>
						<g><polygon stroke-miterlimit="10" points="99.205,80.781 95.545,73.626 86.007,78.507 89.667,85.662 86.119,90.486 78.008,87.865 74.515,98.681 82.625,101.3 82.681,107.289 75.527,110.949 80.407,120.488 87.562,116.828 92.386,120.376 89.766,128.486 95.173,130.234 100.58,131.98 103.2,123.869 109.189,123.814 112.85,130.968 122.388,126.085 118.728,118.933 122.275,114.109 130.387,116.728 133.88,105.914 125.77,103.292 125.714,97.304 132.867,93.644 127.987,84.105 120.833,87.767 116.008,84.218 118.628,76.107 113.221,74.361 107.813,72.615 105.193,80.724 " style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10"></polygon><circle stroke-miterlimit="10" cx="104.197" cy="102.297" r="5.6820002" cx="104.197" cy="102.297" rx="5.6820002" ry="5.6820002" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10" d="m 109.879,102.297 c 0,3.13808 -2.54392,5.682 -5.682,5.682 -3.13808,0 -5.682002,-2.54392 -5.682002,-5.682 0,-3.138085 2.543922,-5.682003 5.682002,-5.682003 3.13808,0 5.682,2.543918 5.682,5.682003 z"></circle></g></g></svg>
			</a>
			<a href="#" class="config" id="carsharing-c">
				<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 110.34375 110.34375" enable-background="new 0 0 200 200" xml:space="preserve">
					<g transform="translate(-49.03125,-47.125)" fill="#8aaa30"><g><g><path stroke-miterlimit="10" d="m 104.197,48.121 c 29.922,0 54.176,24.256 54.176,54.178 0,29.918 -24.254,54.176 -54.176,54.176 -29.92,0 -54.176,-24.258 -54.176,-54.176 0,-29.923 24.256,-54.178 54.176,-54.178 z" connector-curvature="0" style=""></path></g></g>
						<g><polygon stroke-miterlimit="10" points="99.205,80.781 95.545,73.626 86.007,78.507 89.667,85.662 86.119,90.486 78.008,87.865 74.515,98.681 82.625,101.3 82.681,107.289 75.527,110.949 80.407,120.488 87.562,116.828 92.386,120.376 89.766,128.486 95.173,130.234 100.58,131.98 103.2,123.869 109.189,123.814 112.85,130.968 122.388,126.085 118.728,118.933 122.275,114.109 130.387,116.728 133.88,105.914 125.77,103.292 125.714,97.304 132.867,93.644 127.987,84.105 120.833,87.767 116.008,84.218 118.628,76.107 113.221,74.361 107.813,72.615 105.193,80.724 " style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10"></polygon><circle stroke-miterlimit="10" cx="104.197" cy="102.297" r="5.6820002" cx="104.197" cy="102.297" rx="5.6820002" ry="5.6820002" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10" d="m 109.879,102.297 c 0,3.13808 -2.54392,5.682 -5.682,5.682 -3.13808,0 -5.682002,-2.54392 -5.682002,-5.682 0,-3.138085 2.543922,-5.682003 5.682002,-5.682003 3.13808,0 5.682,2.543918 5.682,5.682003 z"></circle></g></g></svg>
			</a>
			<a href="#" class="config" id="bike-c">
				<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 110.34375 110.34375" enable-background="new 0 0 200 200" xml:space="preserve">
					<g transform="translate(-49.03125,-47.125)" fill="#bb392b"><g><g><path stroke-miterlimit="10" d="m 104.197,48.121 c 29.922,0 54.176,24.256 54.176,54.178 0,29.918 -24.254,54.176 -54.176,54.176 -29.92,0 -54.176,-24.258 -54.176,-54.176 0,-29.923 24.256,-54.178 54.176,-54.178 z" connector-curvature="0" style=""></path></g></g>
						<g><polygon stroke-miterlimit="10" points="99.205,80.781 95.545,73.626 86.007,78.507 89.667,85.662 86.119,90.486 78.008,87.865 74.515,98.681 82.625,101.3 82.681,107.289 75.527,110.949 80.407,120.488 87.562,116.828 92.386,120.376 89.766,128.486 95.173,130.234 100.58,131.98 103.2,123.869 109.189,123.814 112.85,130.968 122.388,126.085 118.728,118.933 122.275,114.109 130.387,116.728 133.88,105.914 125.77,103.292 125.714,97.304 132.867,93.644 127.987,84.105 120.833,87.767 116.008,84.218 118.628,76.107 113.221,74.361 107.813,72.615 105.193,80.724 " style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10"></polygon><circle stroke-miterlimit="10" cx="104.197" cy="102.297" r="5.6820002" cx="104.197" cy="102.297" rx="5.6820002" ry="5.6820002" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10" d="m 109.879,102.297 c 0,3.13808 -2.54392,5.682 -5.682,5.682 -3.13808,0 -5.682002,-2.54392 -5.682002,-5.682 0,-3.138085 2.543922,-5.682003 5.682002,-5.682003 3.13808,0 5.682,2.543918 5.682,5.682003 z"></circle></g></g></svg>
			</a>
			<a href="#" class="config" id="emobility-c">
				<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 110.34375 110.34375" enable-background="new 0 0 200 200" xml:space="preserve">
					<g transform="translate(-49.03125,-47.125)" fill="#f2bf00"><g><g><path stroke-miterlimit="10" d="m 104.197,48.121 c 29.922,0 54.176,24.256 54.176,54.178 0,29.918 -24.254,54.176 -54.176,54.176 -29.92,0 -54.176,-24.258 -54.176,-54.176 0,-29.923 24.256,-54.178 54.176,-54.178 z" connector-curvature="0" style=""></path></g></g>
						<g><polygon stroke-miterlimit="10" points="99.205,80.781 95.545,73.626 86.007,78.507 89.667,85.662 86.119,90.486 78.008,87.865 74.515,98.681 82.625,101.3 82.681,107.289 75.527,110.949 80.407,120.488 87.562,116.828 92.386,120.376 89.766,128.486 95.173,130.234 100.58,131.98 103.2,123.869 109.189,123.814 112.85,130.968 122.388,126.085 118.728,118.933 122.275,114.109 130.387,116.728 133.88,105.914 125.77,103.292 125.714,97.304 132.867,93.644 127.987,84.105 120.833,87.767 116.008,84.218 118.628,76.107 113.221,74.361 107.813,72.615 105.193,80.724 " style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10"></polygon><circle stroke-miterlimit="10" cx="104.197" cy="102.297" r="5.6820002" cx="104.197" cy="102.297" rx="5.6820002" ry="5.6820002" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10" d="m 109.879,102.297 c 0,3.13808 -2.54392,5.682 -5.682,5.682 -3.13808,0 -5.682002,-2.54392 -5.682002,-5.682 0,-3.138085 2.543922,-5.682003 5.682002,-5.682003 3.13808,0 5.682,2.543918 5.682,5.682003 z"></circle></g></g></svg>
			</a>
			<a href="#" class="config" id="carpooling-c">
				<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 110.34375 110.34375" enable-background="new 0 0 200 200" xml:space="preserve">
					<g transform="translate(-49.03125,-47.125)" fill="royalblue"><g><g><path stroke-miterlimit="10" d="m 104.197,48.121 c 29.922,0 54.176,24.256 54.176,54.178 0,29.918 -24.254,54.176 -54.176,54.176 -29.92,0 -54.176,-24.258 -54.176,-54.176 0,-29.923 24.256,-54.178 54.176,-54.178 z" connector-curvature="0" style=""></path></g></g>
						<g><polygon stroke-miterlimit="10" points="99.205,80.781 95.545,73.626 86.007,78.507 89.667,85.662 86.119,90.486 78.008,87.865 74.515,98.681 82.625,101.3 82.681,107.289 75.527,110.949 80.407,120.488 87.562,116.828 92.386,120.376 89.766,128.486 95.173,130.234 100.58,131.98 103.2,123.869 109.189,123.814 112.85,130.968 122.388,126.085 118.728,118.933 122.275,114.109 130.387,116.728 133.88,105.914 125.77,103.292 125.714,97.304 132.867,93.644 127.987,84.105 120.833,87.767 116.008,84.218 118.628,76.107 113.221,74.361 107.813,72.615 105.193,80.724 " style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10"></polygon><circle stroke-miterlimit="10" cx="104.197" cy="102.297" r="5.6820002" cx="104.197" cy="102.297" rx="5.6820002" ry="5.6820002" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-miterlimit:10" d="m 109.879,102.297 c 0,3.13808 -2.54392,5.682 -5.682,5.682 -3.13808,0 -5.682002,-2.54392 -5.682002,-5.682 0,-3.138085 2.543922,-5.682003 5.682002,-5.682003 3.13808,0 5.682,2.543918 5.682,5.682003 z"></circle></g></g></svg>
			</a>
			<div class="global">
				<a href="#" id="zoomToMyPosition"><img src="images/2_Map/GPS.svg" alt="Zoom"/></a>
				<a id="switcheroo" title="switch map" href="javascript:void(0)">EARTH</a>
			</div>
		</div>

            
		<header class="header" id="header">
			<img id = "logo" src ="images/logo.gif" alt="Merano real time bus"/>
			<a href="javascript:void(0)" target="_blank" class="beta">BETA</a>
			<a href="<?php ___('feedbackform'); ?>" target="_blank" class="feedback">Feedback</a>
			<nav class="language-switcher">
				<ul>
					<li <?php if($lang=='it') echo 'class="active"'; ?>><a href="?l=it">IT</a></li>
					<li <?php if($lang=='de') echo 'class="active"'; ?>><a href="?l=de">DE</a></li>
					<li <?php if($lang=='en') echo 'class="active"'; ?>><a href="?l=en">EN</a></li>
				</ul>
			</nav>
		</header>
		<div class="panel" id="panel">
			<!--<span class="btn-toggle open first" id="btn-toggle"></span>-->
			<ul class="menu">
				<li>
				<a href="javascript:void(0)" class="bus" id="bus">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="100%" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">
						<g>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M86.957,77.193h26.086v-2.898H86.957V77.193z M86.957,72.846h26.086   c0.797,0,1.45,0.652,1.45,1.449v2.898c0,0.797-0.653,1.449-1.45,1.449H86.957c-0.797,0-1.449-0.652-1.449-1.449v-2.898   C85.508,73.498,86.16,72.846,86.957,72.846z M79.712,113.424c-1.595,0-2.899,1.306-2.899,2.898s1.305,2.898,2.899,2.898   c1.593,0,2.897-1.306,2.897-2.898S81.305,113.424,79.712,113.424z M79.712,120.67c-2.406,0-4.348-1.941-4.348-4.348   s1.941-4.348,4.348-4.348c2.405,0,4.348,1.941,4.348,4.348S82.117,120.67,79.712,120.67z M120.289,113.424   c-1.593,0-2.898,1.306-2.898,2.898s1.306,2.898,2.898,2.898c1.594,0,2.899-1.306,2.899-2.898S121.883,113.424,120.289,113.424z    M120.289,120.67c-2.406,0-4.348-1.941-4.348-4.348s1.941-4.348,4.348-4.348s4.348,1.941,4.348,4.348   S122.695,120.67,120.289,120.67z M133.332,87.338c0-0.797-0.652-1.449-1.448-1.449h-1.45v14.492h1.45   c0.796,0,1.448-0.652,1.448-1.449V87.338z M127.536,106.178H72.465v11.594c0,3.203,2.594,5.797,5.797,5.797h10.146h23.187h10.145   c3.203,0,5.798-2.594,5.798-5.797V106.178z M127.536,81.541H72.465v23.188h55.071V81.541z M127.536,77.193   c0-3.203-2.595-5.797-5.798-5.797H78.262c-3.203,0-5.797,2.594-5.797,5.797v2.898h55.071V77.193z M79.712,132.988   c0,1.203,0.97,2.174,2.174,2.174h1.448c1.203,0,2.174-0.971,2.174-2.174v-6.521h-5.796V132.988z M114.493,132.988   c0,1.203,0.97,2.174,2.174,2.174h1.448c1.203,0,2.174-0.971,2.174-2.174v-6.521h-5.796V132.988z M69.566,85.889h-1.449   c-0.797,0-1.448,0.652-1.448,1.449v11.594c0,0.797,0.651,1.449,1.448,1.449h1.449V85.889z M132.607,101.83h-2.174v15.941   c0,4.304-3.145,7.854-7.245,8.551v6.666c0,2.797-2.276,5.072-5.073,5.072h-1.448c-2.797,0-5.073-2.275-5.073-5.072v-6.521H88.407   v6.521c0,2.797-2.276,5.072-5.073,5.072h-1.448c-2.797,0-5.073-2.275-5.073-5.072v-6.666c-4.102-0.696-7.246-4.247-7.246-8.551   V101.83h-2.174c-1.203,0-2.174-0.971-2.174-2.174V86.613c0-1.203,0.971-2.174,2.174-2.174h2.174v-7.246   c0-4.798,3.898-8.695,8.695-8.695h43.477c4.797,0,8.695,3.897,8.695,8.695v7.246h2.174c1.203,0,2.174,0.971,2.174,2.174v13.043   C134.781,100.859,133.811,101.83,132.607,101.83z"></path>
	                           			<text x="100" y="180" fill="#fff"><tspan>BUS</tspan></text>
						</g>
					</svg>
				</a>
				</li>
				<li>
				<a href="javascript:void(0)" class="walk" id="walking">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve" class="svg replaced-svg">
					<g>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M88.871,103.968c-0.624-1.461-2.028-4.266-2.47-5.165l-0.213-0.504l-13.972,2.959   l0.214,0.822c0.092,0.351,0.198,0.839,0.35,1.401l0.121,0.595l0.031,0.016c0.686,2.543,1.875,6.154,3.396,7.543   c1.145,1.066,2.667,1.797,4.756,2.039c0.428-0.012,2.652,0.033,5.076-0.82c2.193-0.764,3.306-1.829,3.565-3.093   C90.153,107.674,89.679,105.874,88.871,103.968z M82.976,69.409c-1.359-1.706-4.65-2.91-7.742-2.91l-0.457,0.016   c-1.965,0.076-3.932,0.609-5.543,1.752c-2.258,1.586-3.445,4.085-3.919,7.04c-0.914,5.775-0.625,7.667,1.522,14.033   c0.73,2.15,3.001,6.143,4.299,8.336c0.059,0.168,0.334,1.006,0.654,2.119l13.866-2.941c-0.181-0.55-0.335-1.035-0.44-1.357   c-0.307-1.734-0.762-4.996-0.154-6.536c0.898-2.255,1.996-5.866,1.996-9.311C87.044,74.881,85.886,73.021,82.976,69.409z    M87.151,115.75c-2.682,0.943-5.09,0.973-5.883,0.989h-0.09l-0.215,0.015l-0.229-0.031c-2.574-0.305-4.74-1.248-6.446-2.816   c-2.942-2.715-4.54-9.814-4.968-11.919l-0.428-2.147c-1.264-2.118-4.007-6.841-4.922-9.508c-2.221-6.584-2.682-8.961-1.646-15.514   c0.657-4.054,2.395-7.115,5.168-9.066c1.98-1.402,4.465-2.193,7.16-2.3l0.58-0.017c3.414,0,7.849,1.252,10.088,4.039   c3.232,4.022,4.754,6.537,4.754,12.175c0,4.252-1.372,8.366-2.193,10.454c-0.244,0.731,0.016,3.597,0.516,5.896l0.017,0.091   l0.519,1.007c0.079,0.153,1.949,3.841,2.713,5.667c0.868,2.045,1.676,4.543,1.036,7.619   C92.177,112.838,90.32,114.635,87.151,115.75z M124.284,95.115c-0.473-2.957-1.66-5.455-3.914-7.039   c-1.615-1.143-3.584-1.676-5.547-1.754l-0.457-0.016c-3.096,0-6.385,1.205-7.743,2.912c-2.909,3.61-4.067,5.471-4.081,10.238   c0,3.445,1.097,7.057,1.996,9.312c0.607,1.538,0.152,4.8-0.154,6.537c-0.107,0.32-0.26,0.809-0.441,1.355l13.865,2.942   c0.32-1.112,0.598-1.951,0.658-2.119c1.295-2.193,3.564-6.187,4.295-8.335C124.909,102.781,125.199,100.892,124.284,95.115z    M100.728,123.777c-0.809,1.906-1.281,3.703-0.854,5.792c0.258,1.266,1.37,2.331,3.565,3.094c2.421,0.854,4.647,0.809,5.073,0.823   c2.088-0.245,3.614-0.977,4.756-2.043c1.523-1.387,2.712-4.999,3.397-7.544l0.032-0.015l0.119-0.592   c0.15-0.565,0.259-1.053,0.352-1.402l0.215-0.823l-13.974-2.957l-0.214,0.503C102.752,119.512,101.353,122.315,100.728,123.777z    M125.627,110.143c-0.914,2.666-3.657,7.389-4.922,9.506l-0.429,2.15c-0.425,2.101-2.025,9.203-4.967,11.916   c-1.707,1.57-3.871,2.513-6.445,2.818l-0.229,0.031l-0.211-0.016h-0.094c-0.793-0.016-3.199-0.047-5.883-0.99   c-3.167-1.113-5.027-2.912-5.531-5.365c-0.639-3.078,0.168-5.576,1.039-7.619c0.76-1.826,2.632-5.514,2.709-5.668l0.52-1.006   l0.018-0.092c0.501-2.301,0.76-5.164,0.516-5.897c-0.822-2.086-2.193-6.201-2.193-10.454c0-5.637,1.522-8.149,4.752-12.174   c2.24-2.787,6.676-4.037,10.09-4.037l0.576,0.015c2.699,0.107,5.184,0.899,7.164,2.301c2.773,1.95,4.512,5.013,5.164,9.065   C128.308,101.181,127.851,103.559,125.627,110.143z"></path>
	                           		<text x="100" y="180" fill="#fff"><tspan>WALK</tspan></text>
					</g>
					</svg>
				</a>
				</li>
				<li>
				<a href="javascript:void(0)" class="carsharing" id="carsharing">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">
<g>
	<g>
		<path d="M117.715,104.208c-2.535,0-4.6,2.063-4.6,4.6c0,2.535,2.064,4.599,4.6,4.599c2.536,0,4.6-2.063,4.6-4.599    C122.315,106.271,120.251,104.208,117.715,104.208z M117.715,112.093c-1.812,0-3.285-1.472-3.285-3.285s1.473-3.286,3.285-3.286    c1.813,0,3.285,1.473,3.285,3.286S119.529,112.093,117.715,112.093z"></path>
		<path d="M123.332,99.853c-1.033,0.219-2.102,0.338-3.2,0.338c-0.596,0-1.181-0.042-1.76-0.108v0.182H73.694V86.861    c0-2.759,1.668-4.993,3.719-4.993h27.636c0.177-0.909,0.441-1.784,0.77-2.628H77.413c-3.562,0-6.348,3.351-6.348,7.621v12.195    c-3.719,0.632-6.57,3.876-6.57,7.779v10.513c0,3.904,2.852,7.122,6.57,7.754v7.358c0,2.536,2.063,4.6,4.6,4.6h1.314    c2.535,0,4.599-2.063,4.599-4.6v-7.228h28.91v7.228c0,2.536,2.063,4.6,4.6,4.6h1.313c2.536,0,4.6-2.063,4.6-4.6v-7.358    c3.719-0.632,6.57-3.85,6.57-7.754v-10.513C127.571,103.803,125.845,101.173,123.332,99.853z M78.95,132.461    c0,1.091-0.881,1.971-1.971,1.971h-1.314c-1.091,0-1.971-0.88-1.971-1.971v-7.228h5.256V132.461z M110.488,122.605h-28.91H78.95    v-3.285c0-2.536,2.063-4.6,4.6-4.6h24.967c2.537,0,4.6,2.063,4.6,4.6v3.285H110.488z M118.373,132.461    c0,1.091-0.88,1.971-1.972,1.971h-1.313c-1.091,0-1.972-0.88-1.972-1.971v-7.228h5.257V132.461z M124.943,117.349    c0,2.904-2.353,5.257-5.257,5.257h-5.256v-3.942c0-2.904-2.352-5.257-5.256-5.257H82.892c-2.904,0-5.257,2.353-5.257,5.257v3.942    h-5.256c-2.904,0-5.257-2.353-5.257-5.257v-10.513c0-2.904,2.353-5.256,5.257-5.256h1.314h44.679h1.313    c2.904,0,5.257,2.352,5.257,5.256V117.349z"></path>
		<path d="M74.35,104.208c-2.535,0-4.6,2.063-4.6,4.6c0,2.535,2.064,4.599,4.6,4.599c2.536,0,4.6-2.063,4.6-4.599    C78.95,106.271,76.886,104.208,74.35,104.208z M74.35,112.093c-1.812,0-3.285-1.472-3.285-3.285s1.473-3.286,3.285-3.286    c1.813,0,3.285,1.473,3.285,3.286S76.164,112.093,74.35,112.093z"></path>
	</g>
	<g>
		<path d="M110.288,91.292l0.516,0.519h-1.48v2h3.884l1-1v-3.885h-2v1.47l-0.362-0.362c-2.806-3.787-2.409-9.143,0.936-12.486    c1.811-1.812,4.22-2.811,6.785-2.811v-2c-3.099,0-6.011,1.206-8.199,3.396C107.307,80.194,106.843,86.711,110.288,91.292z"></path>
		<path d="M129.549,78.082l-0.515-0.519h1.48v-2h-3.886l-1,1v3.885h2v-1.472l0.363,0.363c2.806,3.788,2.409,9.144-0.935,12.486    c-1.812,1.813-4.222,2.812-6.785,2.812v2c3.098,0,6.01-1.207,8.199-3.397C132.53,89.181,132.994,82.664,129.549,78.082z"></path>
	</g>
	<text x="100" y="180" fill="#fff"><tspan>SHARE</tspan></text>
</g>
					</svg>
				</a>
				</li>
				<li>
					<a href="javascript:void(0)" class="bikesharing" id="bike">
						<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">
							<g>
								<path fill-rule="evenodd" clip-rule="evenodd" d="M118.709,107.366c0,0.938,0.769,1.707,1.709,1.707   c0.938,0,1.707-0.769,1.707-1.707s-0.77-1.708-1.707-1.708C119.478,105.658,118.709,106.428,118.709,107.366z M120.418,95.411   c-0.734,0-1.452,0.067-2.152,0.205l2.578,8.367c1.675,0.224,2.989,1.642,2.989,3.383c0,1.878-1.538,3.415-3.415,3.415   c-1.879,0-3.416-1.537-3.416-3.415c0-1.314,0.75-2.461,1.861-3.022l-2.529-8.199c-4.594,1.658-7.871,6.046-7.871,11.222   c0,6.609,5.344,11.955,11.955,11.955c6.609,0,11.955-5.346,11.955-11.955C132.373,100.756,127.027,95.411,120.418,95.411z    M112.492,83.505l-0.648-0.049H86.089l7.207,20.546l0.632-0.035l0.086-0.017c0.528,0,1.059,0.102,1.589,0.307l0.581,0.24   l16.633-19.967L112.492,83.505z M84.329,84.6l-6.302,10.214c3.945,2.766,6.525,7.36,6.525,12.553h5.225l0.205-0.563   c0.24-0.65,0.598-1.213,1.077-1.656l0.392-0.395L84.329,84.6z M76.217,97.715l-4.524,7.347c0.546,0.612,0.903,1.417,0.903,2.305   h8.539C81.135,103.403,79.188,99.886,76.217,97.715z M70.889,107.366c0-0.938-0.769-1.708-1.709-1.708   c-0.938,0-1.707,0.77-1.707,1.708s0.77,1.707,1.707,1.707C70.12,109.073,70.889,108.305,70.889,107.366z M69.18,95.411   c-6.609,0-11.955,5.345-11.955,11.955c0,6.609,5.346,11.955,11.955,11.955c6.027,0,10.982-4.459,11.819-10.248h-8.88   c-0.582,1.024-1.674,1.708-2.939,1.708c-1.877,0-3.415-1.537-3.415-3.415c0-1.879,1.538-3.416,3.415-3.416   c0.258,0,0.514,0.033,0.752,0.085l4.578-7.36C72.903,95.871,71.094,95.411,69.18,95.411z M93.945,110.781   c1.416,0,2.562-1.144,2.562-2.561c0-1.418-1.146-2.562-2.562-2.562c-1.418,0-2.562,1.145-2.562,2.562   C91.383,109.638,92.527,110.781,93.945,110.781z M120.418,122.736c-8.49,0-15.371-6.883-15.371-15.37   c0-6.712,4.303-12.399,10.297-14.5l-1.929-6.284l-15.85,19.246l0.256,0.496c0.309,0.615,0.479,1.247,0.479,1.896   c0,2.355-1.93,4.27-4.286,4.27c-1.794,0-3.416-1.145-4.016-2.853l-0.203-0.564h-5.348c-0.853,7.686-7.359,13.663-15.268,13.663   c-8.488,0-15.37-6.883-15.37-15.37c0-8.488,6.882-15.371,15.37-15.371c2.58,0,5.005,0.649,7.139,1.759l7.174-11.547l-1.382-4.335   l-0.821,0.238c-0.512,0.153-1.007,0.238-1.484,0.238c-3.297,0-5.397-3.159-5.62-3.519c-0.171-0.273-0.188-0.871-0.018-1.145   c0.188-0.308,0.514-0.478,0.888-0.478h14.006c0.494,0,0.938,0.343,0.992,0.805c0.066,0.493-0.309,1.144-0.736,1.245   c-0.238,0.052-2.236,0.546-4.645,1.451l-0.752,0.309l1.502,4.729h26.473l-2.048-7.207c-0.087-0.272-0.035-0.562,0.153-0.784   c0.186-0.24,0.493-0.395,0.818-0.395c2.203,0,3.178-1.314,3.178-2.611c0-0.701-0.273-1.334-0.77-1.794   c-0.599-0.564-1.452-0.872-2.408-0.872h-6.455c-0.564,0-1.008-0.377-1.008-0.854s0.443-0.854,1.008-0.854h6.455   c2.033,0,3.229,0.717,3.878,1.314c0.854,0.82,1.331,1.896,1.331,3.059c0,1.861-1.229,3.466-3.109,4.115l-0.783,0.256l4.746,15.986   l0.378,1.211c1.022-0.203,2.083-0.323,3.159-0.323c8.488,0,15.37,6.883,15.37,15.371   C135.788,115.854,128.906,122.736,120.418,122.736z"></path>
	                           			<text x="100" y="180" fill="#fff"><tspan>RENT</tspan></text>
							</g>
						</svg>
					</a>
				</li>
				<li>
					<a href="javascript:void(0)" class="echarging" id="emobility">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Ebene_1" x="0px" y="0px" viewBox="0 0 200 200" style="enable-background:new 0 0 200 200;" xml:space="preserve"> <style type="text/css"> .st0{fill-rule:evenodd;clip-rule:evenodd;fill:#FFFFFF;} .st1{fill-rule:evenodd;clip-rule:evenodd;fill:none;stroke:#FFFFFF;stroke-miterlimit:10;} .st2{fill-rule:evenodd;clip-rule:evenodd;fill:none;stroke:#FFFFFF;stroke-width:2;stroke-miterlimit:10;} .st3{fill-rule:evenodd;clip-rule:evenodd;} .st4{fill-rule:evenodd;clip-rule:evenodd;fill:none;stroke:#000000;stroke-miterlimit:10;} .st5{fill-rule:evenodd;clip-rule:evenodd;fill:none;stroke:#000000;stroke-width:1.4173;stroke-miterlimit:10;} .st6{fill-rule:evenodd;clip-rule:evenodd;fill:none;stroke:#000000;stroke-width:2;stroke-miterlimit:10;} </style>
						<g>
							<path class="st0" d="M79,97.5c-1.8,0-3.3,1.5-3.3,3.3s1.5,3.3,3.3,3.3c1.8,0,3.3-1.5,3.3-3.3S80.9,97.5,79,97.5z M79,105.3   c-2.5,0-4.6-2.1-4.6-4.6c0-2.5,2.1-4.6,4.6-4.6c2.5,0,4.6,2.1,4.6,4.6C83.6,103.3,81.6,105.3,79,105.3z M122.4,97.5   c-1.8,0-3.3,1.5-3.3,3.3s1.5,3.3,3.3,3.3c1.8,0,3.3-1.5,3.3-3.3S124.2,97.5,122.4,97.5z M122.4,105.3c-2.5,0-4.6-2.1-4.6-4.6   c0-2.5,2.1-4.6,4.6-4.6c2.5,0,4.6,2.1,4.6,4.6C127,103.3,124.9,105.3,122.4,105.3z M129.6,98.8c0-2.9-2.4-5.3-5.3-5.3h-1.3H78.4   h-1.3c-2.9,0-5.3,2.4-5.3,5.3v10.5c0,2.9,2.4,5.3,5.3,5.3h5.3v-3.9c0-2.9,2.4-5.3,5.3-5.3h26.3c2.9,0,5.3,2.4,5.3,5.3v3.9h5.3   c2.9,0,5.3-2.4,5.3-5.3V98.8z M123.1,78.8c0-2.8-1.7-5-3.7-5H82.1c-2.1,0-3.7,2.2-3.7,5v13.4h44.7V78.8z M78.4,124.4   c0,1.1,0.9,2,2,2h1.3c1.1,0,2-0.9,2-2v-7.2h-5.3V124.4z M86.3,114.5h28.9h2.6v-3.3c0-2.5-2.1-4.6-4.6-4.6h-25   c-2.5,0-4.6,2.1-4.6,4.6v3.3H86.3z M117.8,124.4c0,1.1,0.9,2,2,2h1.3c1.1,0,2-0.9,2-2v-7.2h-5.3V124.4z M125.7,117v7.4   c0,2.5-2.1,4.6-4.6,4.6h-1.3c-2.5,0-4.6-2.1-4.6-4.6v-7.2H86.3v7.2c0,2.5-2.1,4.6-4.6,4.6h-1.3c-2.5,0-4.6-2.1-4.6-4.6V117   c-3.7-0.6-6.6-3.8-6.6-7.8V98.8c0-3.9,2.9-7.1,6.6-7.8V78.8c0-4.3,2.8-7.6,6.3-7.6h37.2c3.6,0,6.3,3.4,6.3,7.6V91   c3.7,0.6,6.6,3.9,6.6,7.8v10.5C132.3,113.2,129.4,116.4,125.7,117z"></path>
							<g>
								<path class="st1" d="M86.9,58.8"></path>
								<path class="st1" d="M86.9,55.7"></path>
								<path class="st0" d="M87.8,61.2h5.9c2.1,7.2,16.3,4.7,16.3,4.7v-4.4h10.6v-2.7H110v-5.7h10.6v-2.5H110v-2.6    c-17-2.6-16.9,7.7-16.9,7.7h-5l-1.1,1.8v2.7L87.8,61.2z"></path>
								<path class="st2" d="M130.4,69.4c0,0,29,27.6,2.8,58.3c0,0-21.6,27.2-58.3,8.1c0,0-33.6-21.2-14.1-58.7c0,0,11.4-16.6,26.7-18.4"></path>
							</g>
						</g>
	                           		<text x="100" y="180" fill="#fff"><tspan>CHARGE</tspan></text>
					</svg>
					</a>
				</li>
				<li>
					<a href="javascript:void(0)" class="carpooling" id="carpooling">
						<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Ebene_1" x="0px" y="0px" viewBox="0 0 200 200" xml:space="preserve" version="0.48.4 r9939" width="100%" height="100%" docname="icon_charge.svg" class="svg replaced-svg"><metadata id="metadata34"><rdf:RDF><cc:Work about=""><dc:format>image/svg+xml</dc:format><dc:type resource="http://purl.org/dc/dcmitype/StillImage"></dc:type></cc:Work></rdf:RDF></metadata><defs id="defs32"></defs><sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10" guidetolerance="10" pageopacity="0" pageshadow="2" window-width="1855" window-height="1056" id="namedview30" showgrid="false" fit-margin-top="0" fit-margin-left="0" fit-margin-right="0" fit-margin-bottom="0" zoom="3.337544" cx="146.3889" cy="76.720506" window-x="1665" window-y="24" window-maximized="1" current-layer="Ebene_1"></sodipodi:namedview><g id="Ebene_1_1_" transform="translate(-60.792062,78.414051)"></g><g id="g6" transform="translate(-60.792062,78.414051)"><g id="g10"><path class="st1" d="M 86.9,58.8" id="path12" connector-curvature="0" style="fill:none;stroke:#ffffff;stroke-miterlimit:10"></path><path class="st1" d="M 86.9,55.7" id="path14" connector-curvature="0" style="fill:none;stroke:#ffffff;stroke-miterlimit:10"></path></g></g><path class="st4" d="M 26.107938,137.21405" id="path22" connector-curvature="0" style="fill:none;stroke:#000000;stroke-miterlimit:10"></path><path class="st4" d="M 26.107938,134.11405" id="path24" connector-curvature="0" style="fill:none;stroke:#000000;stroke-miterlimit:10"></path><path connector-curvature="0" class="st3" d="m 79.330804,97.400045 c -1.805728,0 -3.310501,1.499981 -3.310501,3.299955 0,1.79999 1.504773,3.29997 3.310501,3.29997 1.805727,0 3.310502,-1.49998 3.310502,-3.29997 0,-1.799974 -1.404457,-3.299955 -3.310502,-3.299955 z m 0,7.799895 c -2.507956,0 -4.614638,-2.09997 -4.614638,-4.59994 0,-2.499963 2.106682,-4.599936 4.614638,-4.599936 2.507955,0 4.614638,2.099973 4.614638,4.599936 0,2.59997 -2.006364,4.59994 -4.614638,4.59994 z m 43.538106,-7.799895 c -1.80573,0 -3.3105,1.499981 -3.3105,3.299955 0,1.79999 1.50477,3.29997 3.3105,3.29997 1.80573,0 3.31051,-1.49998 3.31051,-3.29997 0,-1.799974 -1.50478,-3.299955 -3.31051,-3.299955 z m 0,7.799895 c -2.50796,0 -4.61464,-2.09997 -4.61464,-4.59994 0,-2.499963 2.10668,-4.599936 4.61464,-4.599936 2.50796,0 4.61464,2.099973 4.61464,4.599936 0,2.59997 -2.10668,4.59994 -4.61464,4.59994 z m 7.22292,-6.499913 c 0,-2.899962 -2.40764,-5.299929 -5.31687,-5.299929 h -1.30414 -44.741926 -1.304136 c -2.909229,0 -5.316866,2.399967 -5.316866,5.299929 v 10.499863 c 0,2.89996 2.407637,5.29993 5.316866,5.29993 h 5.316866 v -3.89995 c 0,-2.89996 2.407637,-5.29993 5.316865,-5.29993 h 26.383681 c 2.90924,0 5.31687,2.39997 5.31687,5.29993 v 3.89995 h 5.31687 c 2.90924,0 5.31687,-2.39997 5.31687,-5.29993 V 98.700027 z m -6.52069,-19.999736 c 0,-2.799963 -1.70541,-4.999934 -3.71178,-4.999934 H 82.440669 c -2.106682,0 -3.711775,2.199971 -3.711775,4.999934 V 92.100115 H 123.57114 V 78.700291 z M 78.728894,124.29967 c 0,1.1 0.902865,1.99999 2.006365,1.99999 h 1.304137 c 1.1035,0 2.006364,-0.89999 2.006364,-1.99999 v -7.19989 h -5.316866 v 7.19989 z m 7.92514,-9.89985 h 28.991956 2.60828 v -3.29997 c 0,-2.49997 -2.10668,-4.59993 -4.61464,-4.59993 H 88.560079 c -2.507955,0 -4.614637,2.09996 -4.614637,4.59993 v 3.29997 h 2.708592 z m 31.600236,9.89985 c 0,1.1 0.90286,1.99999 2.00637,1.99999 h 1.30413 c 1.10351,0 2.00637,-0.89999 2.00637,-1.99999 v -7.19989 h -5.31687 v 7.19989 z m 7.92515,-7.3999 v 7.3999 c 0,2.49998 -2.10669,4.59995 -4.61465,4.59995 h -1.30413 c -2.50796,0 -4.61465,-2.09997 -4.61465,-4.59995 v -7.19989 H 86.654034 v 7.19989 c 0,2.49998 -2.106683,4.59995 -4.614638,4.59995 h -1.304137 c -2.507956,0 -4.614638,-2.09997 -4.614638,-4.59995 v -7.3999 c -3.711774,-0.59999 -6.621003,-3.79995 -6.621003,-7.79988 V 98.700027 c 0,-3.899947 2.909229,-7.099905 6.621003,-7.799897 V 78.700291 c 0,-4.299943 2.80891,-7.599899 6.320048,-7.599899 h 37.318371 c 3.61146,0 6.32006,3.399955 6.32006,7.599899 V 90.90013 c 3.71177,0.599992 6.62099,3.89995 6.62099,7.799897 v 10.499863 c 0.10031,3.89993 -2.8089,7.09989 -6.52067,7.69988 z" id="path20-3" style="fill-rule:evenodd"></path><path type="arc" style="fill-opacity:1" id="path3031" cx="20.021187" cy="8.3296566" rx="3.9194915" ry="3.6016948" d="m 23.940678,8.3296566 a 3.9194915,3.6016948 0 1 1 -7.838983,0 3.9194915,3.6016948 0 1 1 7.838983,0 z" transform="matrix(1.0031822,0,0,0.99998683,69.499618,71.100392)"></path><rect style="fill-opacity:1" id="rect3065" width="6.4481668" height="8.8640366" x="86.360435" y="83.525345"></rect><path transform="matrix(1.0031822,0,0,0.99998683,90.540944,70.994453)" type="arc" style="fill-opacity:1" id="path3031-2" cx="20.021187" cy="8.3296566" rx="3.9194915" ry="3.6016948" d="m 23.940678,8.3296566 a 3.9194915,3.6016948 0 1 1 -7.838983,0 3.9194915,3.6016948 0 1 1 7.838983,0 z"></path><rect style="fill-opacity:1" id="rect3065-9" width="6.4481668" height="8.8640366" x="107.40176" y="83.419411"></rect>
	                                        <text x="100" y="180" fill="#fff"><tspan>RIDE</tspan></text>
					</svg>
					</a>
				</li>
			</ul>
		</div>
		<div class="hidden modal bus">
			<main class="main" id="main">
				<div class="panel-content-out">
					<div class="scroll-content">
						<div class="panel-content">
							<div id="variants">
								<div class="scroll" id="scroll">
									<div class="tabbed-content">
										<!--<a href="#" class="close-modal"><img src="images/3_Bus/Close.svg" alt="close"/></a>-->
										<div class="filters-container">
											<div class="filters clearfix">
												<p><?php ___('urbani');?></p>
												<a id="urban" class="bus toggler" href="#">
													<svg width="55" height="30">
														<g>
														  <rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#ee9712" height="24"/>
														  <circle cx="34" cy="17" r="9"  fill="#ee9712" />
														</g>
														  Sorry, your browser does not support inline SVG.
													</svg>
												</a>
												<p><?php ___('extraurbani');?></p>
												<a id="eurban" class="toggler bus enabled" href="#">
													<svg width="55" height="30">
														<g>
														  <rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#ee9712" height="24"/>
														  <circle cx="34" cy="17" r="9"  fill="#ee9712" />
														</g>
														  Sorry, your browser does not support inline SVG.
													</svg>
												</a>	
												<p id="deselectall"> <span><?php ___('deselectall'); ?></span> </p>
											</div>
                        								<a href="javascript:void(0)" class="backtomap ibutton clearfix" ><div><?php ___('backtomap'); ?></div></a>
										</div>
										<div class="tab-container">
											<div class="tab-content">
												<ul class="tick" id="urbani">
													<li class="tick-list"></li>
												</ul>
											</div>
											<div class="tab-content">
												<ul class="tick" id="extra">
													<li class="tick-list"></li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!---apiedi part -->
                <div class="hidden modal walk-route">
                       <div class="walk-container">
                               <div class="title">
                               </div>
                               <div class="metadata clearfix">
                                       <div class="time"></div>
                                       <div class="distance"></div>
                                       <div class="drop"></div>
                                       <div class="kcal"></div>
                               </div>
                               <div class="chartContainer">
                                       <div id="highChart"></div>
                               </div>
			       <a href="" class="ibutton more" target="_blank"><div><?php ___('more'); ?></div></a>
                               <a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
                       </div>
                               
               </div>

                <div class="hidden modal walking">
			<div class="walk-container">
	                	<!--<a href="#" class="close-modal"><img src="images/3_Bus/Close.svg" alt="close"/></a>-->
				<div class="main-config clearfix">
					<div>
						<p><?php ___('themeroutes'); ?></p>
						<a href="#" id="theme" class="toggler">
							<svg width="55" height="30">
								<g>
									<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#ce5400" height="24"/>
									<circle cx="34" cy="17" r="9"  fill="#ce5400" />
								</g>
								  Sorry, your browser does not support inline SVG.
							</svg>
						</a>
					</div>
					<div>
						<p><?php ___('walkroutes'); ?></p>
						<a href="#" id="hike" class="toggler">
							<svg width="55" height="30">
								<g>
								  <rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#ce5400" height="24"/>
								  <circle cx="34" cy="17" r="9"  fill="#ce5400" />
								</g>
							  	Sorry, your browser does not support inline SVG.
							</svg>
						</a>
					</div>
                        		<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
				</div>
				<ul class="routes-list">
				<ul>
			</div> 
		</div> 
                <div class="hidden modal carsharing">
			<div class="walk-container">
				<div class="main-config clearfix">
					<ul class="cartypes clearfix">
					</ul>
                        		<a href="javascript:void(0)" class="deselect-all" ></div></a>
                        		<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
				</div>
			</div> 
		</div> 
                <div class="hidden modal bike">
			<div class="walk-container">
				<div class="main-config clearfix">
					<ul class="biketypes clearfix">
					</ul>
                        		<a href="javascript:void(0)" class="deselect-all" ></a>
                        		<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
				</div>
			</div> 
		</div> 
                <div class="hidden modal emobility">
			<div class="walk-container">
				<div class="main-config clearfix">
					<ul class="echargingtypes clearfix">
					</ul>
                        		<a href="javascript:void(0)" class="deselect-all" ></a>
                        		<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
				</div>
			</div> 
		</div> 
                <div class="hidden modal carpooling">
			<div class="walk-container">
				<div class="main-config clearfix">
					<ul class="carpoolingtypes clearfix">
					</ul>
                        		<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
				</div>
			</div> 
		</div> 
	        <p id="credits"><?php ___('mappe'); ?> <a href="http://www.openstreetmap.org/copyright" rel="external">OpenStreetMap</a> - <a href="javascript:void(0)" class="about-selector">About</a> - <a href="<?php ___('feedbackform'); ?>" target="_blank">Feedback</a></p>
           
		<div  class="hidden modal bus-position" >
		<div class="modal-container"> 
	        <!--<a href="#" class="close-modal"><img src="images/3_Bus/Close.svg" alt="close"/></a>-->
		<div id="busPopup">
                                    <div class="clearfix pophead">
                                        <h2 class="bus c-${lidname}"><?php ___('linea'); ?> ${lidname}</h2>
					<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" version="1.1" x="0px" y="0px" width="30" viewBox="0 0 69.563004 69.561996" enable-background="new 0 0 200 200" xml:space="preserve">
						<g transform="translate(-65.219,-68.498)" fill="rgb(${li_r},${li_g},${li_b})">
							<path clip-rule="evenodd" d="m 86.957,77.193 h 26.086 V 74.295 H 86.957 v 2.898 z m 0,-4.347 h 26.086 c 0.797,0 1.45,0.652 1.45,1.449 v 2.898 c 0,0.797 -0.653,1.449 -1.45,1.449 H 86.957 c -0.797,0 -1.449,-0.652 -1.449,-1.449 v -2.898 c 0,-0.797 0.652,-1.449 1.449,-1.449 z m -7.245,40.578 c -1.595,0 -2.899,1.306 -2.899,2.898 0,1.592 1.305,2.898 2.899,2.898 1.593,0 2.897,-1.306 2.897,-2.898 0,-1.592 -1.304,-2.898 -2.897,-2.898 z m 0,7.246 c -2.406,0 -4.348,-1.941 -4.348,-4.348 0,-2.407 1.941,-4.348 4.348,-4.348 2.405,0 4.348,1.941 4.348,4.348 0,2.407 -1.943,4.348 -4.348,4.348 z m 40.577,-7.246 c -1.593,0 -2.898,1.306 -2.898,2.898 0,1.592 1.306,2.898 2.898,2.898 1.594,0 2.899,-1.306 2.899,-2.898 0,-1.592 -1.305,-2.898 -2.899,-2.898 z m 0,7.246 c -2.406,0 -4.348,-1.941 -4.348,-4.348 0,-2.407 1.941,-4.348 4.348,-4.348 2.407,0 4.348,1.941 4.348,4.348 0,2.407 -1.942,4.348 -4.348,4.348 z m 13.043,-33.332 c 0,-0.797 -0.652,-1.449 -1.448,-1.449 h -1.45 v 14.492 h 1.45 c 0.796,0 1.448,-0.652 1.448,-1.449 V 87.338 z m -5.796,18.84 H 72.465 v 11.594 c 0,3.203 2.594,5.797 5.797,5.797 h 10.146 23.187 10.145 c 3.203,0 5.798,-2.594 5.798,-5.797 v -11.594 z m 0,-24.637 H 72.465 v 23.188 h 55.071 V 81.541 z m 0,-4.348 c 0,-3.203 -2.595,-5.797 -5.798,-5.797 H 78.262 c -3.203,0 -5.797,2.594 -5.797,5.797 v 2.898 h 55.071 v -2.898 z m -47.824,55.795 c 0,1.203 0.97,2.174 2.174,2.174 h 1.448 c 1.203,0 2.174,-0.971 2.174,-2.174 v -6.521 h -5.796 v 6.521 z m 34.781,0 c 0,1.203 0.97,2.174 2.174,2.174 h 1.448 c 1.203,0 2.174,-0.971 2.174,-2.174 v -6.521 h -5.796 v 6.521 z M 69.566,85.889 h -1.449 c -0.797,0 -1.448,0.652 -1.448,1.449 v 11.594 c 0,0.797 0.651,1.449 1.448,1.449 h 1.449 V 85.889 z m 63.041,15.941 h -2.174 v 15.941 c 0,4.304 -3.145,7.854 -7.245,8.551 v 6.666 c 0,2.797 -2.276,5.072 -5.073,5.072 h -1.448 c -2.797,0 -5.073,-2.275 -5.073,-5.072 v -6.521 H 88.407 v 6.521 c 0,2.797 -2.276,5.072 -5.073,5.072 h -1.448 c -2.797,0 -5.073,-2.275 -5.073,-5.072 v -6.666 c -4.102,-0.696 -7.246,-4.247 -7.246,-8.551 V 101.83 h -2.174 c -1.203,0 -2.174,-0.971 -2.174,-2.174 V 86.613 c 0,-1.203 0.971,-2.174 2.174,-2.174 h 2.174 v -7.246 c 0,-4.798 3.898,-8.695 8.695,-8.695 h 43.477 c 4.797,0 8.695,3.897 8.695,8.695 v 7.246 h 2.174 c 1.203,0 2.174,0.971 2.174,2.174 v 13.043 c -0.001,1.203 -0.971,2.174 -2.175,2.174 z" id="path5" connector-curvature="0"></path>
						</g>
					</svg>
                                    </div>
                                    <p class="noData" style="display: none;">Questo autobus non è in servizio.</p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><?php ___('prossimefermate'); ?></th>
                                                <th class="time"><?php ___('stimato'); ?></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="${odd} ${last}">
                                                <td>${ort_ref_ort_name}</td>
                                                <td class="time">${time_est}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                        	<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
			</div>
		</div>
		<div  class="hidden modal stop-position" >
			<div class="modal-container"> 
			        <!--<a href="#" class="close-modal"><img src="images/3_Bus/Close.svg" alt="close"/></a>-->
                                <div id="stopPopup">
                                    <h2><?php ___('fermata'); ?> ${ort_ref_ort_name}</h2>
                                    <p class="noData" style="display: none;">Nelle prossime ore non sono previsti passaggi in questa fermata.</p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><?php ___('arrivo'); ?></th>
                                                <th class="time"><?php ___('stimato'); ?></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="${odd} ${last}">
                                                <td class="bus">
							<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" version="1.1" x="0px" y="0px" width="18" viewBox="0 0 69.563004 69.561996" enable-background="new 0 0 200 200" xml:space="preserve">
                        	        	                <g transform="translate(-65.219,-68.498)" fill="rgb(${li_r},${li_g},${li_b})">
                	                                        <path clip-rule="evenodd" d="m 86.957,77.193 h 26.086 V 74.295 H 86.957 v 2.898 z m 0,-4.347 h 26.086 c 0.797,0 1.45,0.652 1.45,1.449 v 2.898 c 0,0.797 -0.653,1.449 -1.45,1.449 H 86.957 c -0.797,0 -1.449,-0.652 -1.449,-1.449 v -2.898 c 0,-0.797 0.652,-1.449 1.449,-1.449 z m -7.245,40.578 c -1.595,0 -2.899,1.306 -2.899,2.898 0,1.592 1.305,2.898 2.899,2.898 1.593,0 2.897,-1.306 2.897,-2.898 0,-1.592 -1.304,-2.898 -2.897,-2.898 z m 0,7.246 c -2.406,0 -4.348,-1.941 -4.348,-4.348 0,-2.407 1.941,-4.348 4.348,-4.348 2.405,0 4.348,1.941 4.348,4.348 0,2.407 -1.943,4.348 -4.348,4.348 z m 40.577,-7.246 c -1.593,0 -2.898,1.306 -2.898,2.898 0,1.592 1.306,2.898 2.898,2.898 1.594,0 2.899,-1.306 2.899,-2.898 0,-1.592 -1.305,-2.898 -2.899,-2.898 z m 0,7.246 c -2.406,0 -4.348,-1.941 -4.348,-4.348 0,-2.407 1.941,-4.348 4.348,-4.348 2.407,0 4.348,1.941 4.348,4.348 0,2.407 -1.942,4.348 -4.348,4.348 z m 13.043,-33.332 c 0,-0.797 -0.652,-1.449 -1.448,-1.449 h -1.45 v 14.492 h 1.45 c 0.796,0 1.448,-0.652 1.448,-1.449 V 87.338 z m -5.796,18.84 H 72.465 v 11.594 c 0,3.203 2.594,5.797 5.797,5.797 h 10.146 23.187 10.145 c 3.203,0 5.798,-2.594 5.798,-5.797 v -11.594 z m 0,-24.637 H 72.465 v 23.188 h 55.071 V 81.541 z m 0,-4.348 c 0,-3.203 -2.595,-5.797 -5.798,-5.797 H 78.262 c -3.203,0 -5.797,2.594 -5.797,5.797 v 2.898 h 55.071 v -2.898 z m -47.824,55.795 c 0,1.203 0.97,2.174 2.174,2.174 h 1.448 c 1.203,0 2.174,-0.971 2.174,-2.174 v -6.521 h -5.796 v 6.521 z m 34.781,0 c 0,1.203 0.97,2.174 2.174,2.174 h 1.448 c 1.203,0 2.174,-0.971 2.174,-2.174 v -6.521 h -5.796 v 6.521 z M 69.566,85.889 h -1.449 c -0.797,0 -1.448,0.652 -1.448,1.449 v 11.594 c 0,0.797 0.651,1.449 1.448,1.449 h 1.449 V 85.889 z m 63.041,15.941 h -2.174 v 15.941 c 0,4.304 -3.145,7.854 -7.245,8.551 v 6.666 c 0,2.797 -2.276,5.072 -5.073,5.072 h -1.448 c -2.797,0 -5.073,-2.275 -5.073,-5.072 v -6.521 H 88.407 v 6.521 c 0,2.797 -2.276,5.072 -5.073,5.072 h -1.448 c -2.797,0 -5.073,-2.275 -5.073,-5.072 v -6.666 c -4.102,-0.696 -7.246,-4.247 -7.246,-8.551 V 101.83 h -2.174 c -1.203,0 -2.174,-0.971 -2.174,-2.174 V 86.613 c 0,-1.203 0.971,-2.174 2.174,-2.174 h 2.174 v -7.246 c 0,-4.798 3.898,-8.695 8.695,-8.695 h 43.477 c 4.797,0 8.695,3.897 8.695,8.695 v 7.246 h 2.174 c 1.203,0 2.174,0.971 2.174,2.174 v 13.043 c -0.001,1.203 -0.971,2.174 -2.175,2.174 z" id="path5" connector-curvature="0"></path>                                                                                            </g>
		                                        </svg>
	
                                                <?php ___('linea'); ?> ${lidname}
                                                </td>
                                                <td class="time">${bus_passes_at}</td> <!-- temporaneo, non ho ancora i dati sull'orario -->
                                            </tr>
                                        </tbody>
                                    </table>
                                    <span class="tip"></span>
                                </div>
                        	<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
			</div>
		</div>
                <div class="hidden modal bikesharingstation">
			<div class="walk-container">
				<div class="title">
				</div>
				<div class="number-available" id="totalAvailable">
				</div>
				<p class="caption"></p>
				<div class="bike-categorys">
					<div class="clearfix">
						<div id="mountain_bike_adult-container" class="number-available"></div>
						<span></span>
					</div>
					<div class="clearfix">
						<div id="city_bike_adult_with_gears-container" class="number-available"></div><span></span>
					</div>
					<div class="clearfix">
						<div id="mountain_bike_teenager-container" class="number-available"></div><span></span>
					</div>
					<div class="clearfix">
						<div id="mountain_bike_child-container" class="number-available"></div><span></span>
					</div>
					<div class="clearfix">
						<div id="city_bike_adult_without_gears-container" class="number-available"></div><span></span>
					</div>
					
					<ul class="legend clearfix">
					</ul>
				</div>
				<a href="<?php ___('bikelink'); ?>" class="backtomap ibutton" ><div><?php ___('more'); ?></div></a>
				<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
			</div>
				
		</div>
                <div class="hidden modal carsharingstation">
			<div class="walk-container">
				<div class="title">
				</div>
				<div class="number-available">
				</div>
				<p class="caption"></p>
				<ul class="legend clearfix">	
				</ul>
				<a href="http://booking.carsharing.bz.it" target="_blank" class="clearfix ibutton" ><div><?php ___('book_car'); ?></div></a>
				<a href="javascript:void(0)" class="clearfix backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
			</div>
		</div>		
                <div class="hidden modal station">
			<div class="walk-container">
				<div class="title">
				</div>
				<div class="content">
				</div>
				<div class="legend"></div>
			</div>
		</div>		
		<div class="hidden modal" id="artModal">
			<div class="walk-container">
				<div class="title">
					<h3>Human Shapes</h3>
				</div> 
				<div class="metadata">
					<img src="images/human_shapes.jpg" alt="human shapes" width="100%"/>
				</div>
				<a href="http://www.meran.eu/culture-tradition/monuments/human-shapes/" class="ibutton" target="_blank"><div><?php ___('more'); ?></div></a>
                        	<a href="javascript:void(0)" class="backtomap ibutton" ><div><?php ___('backtomap'); ?></div></a>
			</div>
		</div>
		<div class="about-box">
			<div class="about">
				<a href="#" class="about-selector"><img src="images/3_Bus/Close.svg" alt="close" width="15px" style="float:right"/></a>
				<h3>Developed by</h3>
				<ul class="clearfix">
					<li class="idm"><a href="http://idm-suedtirol.com/" target="_blank" title="IDM Südtirol / Alto Adige"></a></li>
					<li class="r3gis"><a href="http://www.r3-gis.com/" target="_blank" title="R3-GIS"></a></li>
				</ul>
				<h3>Supported by</h3>
				<ul class="clearfix">
					<li class="meran"><a href="http://www.meran.eu/it/azienda-di-soggiorno/" target="_blank" title="Azienda di Soggiorno di Merano"></a></li>
					<li class="merang"><a href="http://www.comune.merano.bz.it/" target="_blank" title="Comune di Merano"></a></li>
					<li class="fesr"><a href="http://www.provincia.bz.it/europa/" target="_blank" title="Fondo Europeo di Sviluppo Regionale (FESR)"></a></li>
					<li class="mof"><a href="http://mobility.bz.it/" target="_blank" title="Mobility of the future"></a></li>
					<li class="gm"><a href="http://www.greenmobility.bz.it/" target="_blank" title="Green Mobility"></a></li>
				</ul>
				<h3>Designed by</h3>
				<ul class="clearfix">
					<li class="cima"><a href="http://www.madeincima.it/" target="_blank" title="MadeinCima"></a></li>
					<li class="hell"><a href="http://www.hellcompany.eu/" target="_blank" title="Hell Company"></a></li>
				</ul>
				<h3>Data provided by</h3>
				<ul class="clearfix">
					<li class="sasa"><a title ="SASA" href="http://www.sasabz.it/" target="_blank"></a><h4>Public transport</h4></li>
					<li class="province"><a href="http://www.provinz.bz.it/informatik/kartografie/Geoportal.asp" title="Autonomous province of Bolzano"target="_blank"></a><h4>Walking routes</h4></li>
					<li class="carsharing"><a href="http://www.carsharing.bz.it/it/" target="_blank" title="CAR sharing Südtirol Altoadige"></a><h4>Carsharing</h4></li>
					<li class="algorab"><a href="http://www.algorab.com/" target="_blank" title="Algorab"></a><h4>Bikesharing</h4></li>
					<li class="aew"><a href="https://www.alperiaenergy.eu" target="_blank" title="Alperia"></a><h4>Chargestation</h4></li>
				</ul>
				<h3 style="text-align:center"> <a href="https://github.com/tis-innovation-park/realtimebus.git" target="_blank">Source code available on github.com</h3>
			</div>	
		</div>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js" type="text/javascript"></script>
		<script src="js/OpenLayers.js" type="text/javascript"></script>
		<script src="scripts/scripts.js" type="text/javascript"></script>
		<script> var txtVariante = '';</script>
		<script type="text/javascript" src="https://www.google.com/jsapi?autoload={
	            'modules':[{
        	      'name':'visualization',
	              'version':'1',
        	      'packages':['corechart']
            	     }]}"
	        ></script>
	</body>
</html>
