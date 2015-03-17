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
		<!--<link href="css/smartphoneLandscape.css" media="only screen and (max-width: 671px) and (orientation: landscape)" rel="stylesheet" /> --> <!-- max-device-width: 671px -->
		<!-- media="only screen and (orientation: landscape) -->
		<script src="js/detect_device.js" type="text/javascript"></script>
		<script src="js/OpenLayers/OpenLayers.sasabus.js"></script>
		<!--<script src="http://sasatest.r3-gis.com/js/OpenLayers/lib/OpenLayers.js"></script>-->
		<script src="js/OpenLayers/proj4js.min.js"></script>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
		<script src="js/sasabus.js"></script>
		<script> var txtVariante = '<?php ___("varianti"); ?>';</script>

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
			<span class="mobile-menu-btn" id="mobile-menu-btn">
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px"  viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">
				<g fill="#fff">
					<g>
						<path d="M140.978,72.704H59.022c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h81.956c1.933,0,3.5,1.567,3.5,3.5    S142.911,72.704,140.978,72.704z"></path>
					</g>
					<g>
						<path d="M140.978,97.708H59.022c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h81.956c1.933,0,3.5,1.567,3.5,3.5    S142.911,97.708,140.978,97.708z"></path>
					</g>
					<g>
						<path d="M140.978,122.71H59.022c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h81.956c1.933,0,3.5,1.567,3.5,3.5    S142.911,122.71,140.978,122.71z"></path>
					</g>
				</g>
				</svg>
			</span>
			<img id="logo-mobile" src="images/logo-small.gif" alt="Merano real time bus"/>
			<span class="beta-mobile">Beta version</span>
		</header>
		<div class="map-container" id="map" style="width:100%;height:100%">
		</div>
		<div class="map-controls">
			<a href="#" id="config"><img src="images/3_Bus/Config.svg" alt="Zoom"/></a>
			<a href="#" id="zoomToMyPosition"><img src="images/2_Map/GPS.svg" alt="Zoom"/></a>
			<a id="switcheroo" title="switch map" href="javascript:void(0)">EARTH</a>
		</div>

            
		<div class="panel" id="panel">
			<header class="header" id="header">
				<h1 id="logo">Merano real time bus</h1>
				<span class="beta">Beta version</span>
				<nav class="language-switcher">
					<ul>
						<li <?php if($lang=='it') echo 'class="active"'; ?>><a href="?l=it">IT</a></li>
						<li <?php if($lang=='de') echo 'class="active"'; ?>><a href="?l=de">DE</a></li>
						<li <?php if($lang=='en') echo 'class="active"'; ?>><a href="?l=en">EN</a></li>
					</ul>
				</nav>
			</header>
			<span class="btn-toggle open first" id="btn-toggle"></span>
			<ul class="menu">
				<li>
				<a href="javascript:void(0)" class="bus" id="bus">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="100%" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">

						<g>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M86.957,77.193h26.086v-2.898H86.957V77.193z M86.957,72.846h26.086   c0.797,0,1.45,0.652,1.45,1.449v2.898c0,0.797-0.653,1.449-1.45,1.449H86.957c-0.797,0-1.449-0.652-1.449-1.449v-2.898   C85.508,73.498,86.16,72.846,86.957,72.846z M79.712,113.424c-1.595,0-2.899,1.306-2.899,2.898s1.305,2.898,2.899,2.898   c1.593,0,2.897-1.306,2.897-2.898S81.305,113.424,79.712,113.424z M79.712,120.67c-2.406,0-4.348-1.941-4.348-4.348   s1.941-4.348,4.348-4.348c2.405,0,4.348,1.941,4.348,4.348S82.117,120.67,79.712,120.67z M120.289,113.424   c-1.593,0-2.898,1.306-2.898,2.898s1.306,2.898,2.898,2.898c1.594,0,2.899-1.306,2.899-2.898S121.883,113.424,120.289,113.424z    M120.289,120.67c-2.406,0-4.348-1.941-4.348-4.348s1.941-4.348,4.348-4.348s4.348,1.941,4.348,4.348   S122.695,120.67,120.289,120.67z M133.332,87.338c0-0.797-0.652-1.449-1.448-1.449h-1.45v14.492h1.45   c0.796,0,1.448-0.652,1.448-1.449V87.338z M127.536,106.178H72.465v11.594c0,3.203,2.594,5.797,5.797,5.797h10.146h23.187h10.145   c3.203,0,5.798-2.594,5.798-5.797V106.178z M127.536,81.541H72.465v23.188h55.071V81.541z M127.536,77.193   c0-3.203-2.595-5.797-5.798-5.797H78.262c-3.203,0-5.797,2.594-5.797,5.797v2.898h55.071V77.193z M79.712,132.988   c0,1.203,0.97,2.174,2.174,2.174h1.448c1.203,0,2.174-0.971,2.174-2.174v-6.521h-5.796V132.988z M114.493,132.988   c0,1.203,0.97,2.174,2.174,2.174h1.448c1.203,0,2.174-0.971,2.174-2.174v-6.521h-5.796V132.988z M69.566,85.889h-1.449   c-0.797,0-1.448,0.652-1.448,1.449v11.594c0,0.797,0.651,1.449,1.448,1.449h1.449V85.889z M132.607,101.83h-2.174v15.941   c0,4.304-3.145,7.854-7.245,8.551v6.666c0,2.797-2.276,5.072-5.073,5.072h-1.448c-2.797,0-5.073-2.275-5.073-5.072v-6.521H88.407   v6.521c0,2.797-2.276,5.072-5.073,5.072h-1.448c-2.797,0-5.073-2.275-5.073-5.072v-6.666c-4.102-0.696-7.246-4.247-7.246-8.551   V101.83h-2.174c-1.203,0-2.174-0.971-2.174-2.174V86.613c0-1.203,0.971-2.174,2.174-2.174h2.174v-7.246   c0-4.798,3.898-8.695,8.695-8.695h43.477c4.797,0,8.695,3.897,8.695,8.695v7.246h2.174c1.203,0,2.174,0.971,2.174,2.174v13.043   C134.781,100.859,133.811,101.83,132.607,101.83z"></path>
						</g>
					</svg>
				</a>
				</li>
				<li>
				<a href="javascript:void(0)" class="walk" id="walk">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve" class="svg replaced-svg">
					<g>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M88.871,103.968c-0.624-1.461-2.028-4.266-2.47-5.165l-0.213-0.504l-13.972,2.959   l0.214,0.822c0.092,0.351,0.198,0.839,0.35,1.401l0.121,0.595l0.031,0.016c0.686,2.543,1.875,6.154,3.396,7.543   c1.145,1.066,2.667,1.797,4.756,2.039c0.428-0.012,2.652,0.033,5.076-0.82c2.193-0.764,3.306-1.829,3.565-3.093   C90.153,107.674,89.679,105.874,88.871,103.968z M82.976,69.409c-1.359-1.706-4.65-2.91-7.742-2.91l-0.457,0.016   c-1.965,0.076-3.932,0.609-5.543,1.752c-2.258,1.586-3.445,4.085-3.919,7.04c-0.914,5.775-0.625,7.667,1.522,14.033   c0.73,2.15,3.001,6.143,4.299,8.336c0.059,0.168,0.334,1.006,0.654,2.119l13.866-2.941c-0.181-0.55-0.335-1.035-0.44-1.357   c-0.307-1.734-0.762-4.996-0.154-6.536c0.898-2.255,1.996-5.866,1.996-9.311C87.044,74.881,85.886,73.021,82.976,69.409z    M87.151,115.75c-2.682,0.943-5.09,0.973-5.883,0.989h-0.09l-0.215,0.015l-0.229-0.031c-2.574-0.305-4.74-1.248-6.446-2.816   c-2.942-2.715-4.54-9.814-4.968-11.919l-0.428-2.147c-1.264-2.118-4.007-6.841-4.922-9.508c-2.221-6.584-2.682-8.961-1.646-15.514   c0.657-4.054,2.395-7.115,5.168-9.066c1.98-1.402,4.465-2.193,7.16-2.3l0.58-0.017c3.414,0,7.849,1.252,10.088,4.039   c3.232,4.022,4.754,6.537,4.754,12.175c0,4.252-1.372,8.366-2.193,10.454c-0.244,0.731,0.016,3.597,0.516,5.896l0.017,0.091   l0.519,1.007c0.079,0.153,1.949,3.841,2.713,5.667c0.868,2.045,1.676,4.543,1.036,7.619   C92.177,112.838,90.32,114.635,87.151,115.75z M124.284,95.115c-0.473-2.957-1.66-5.455-3.914-7.039   c-1.615-1.143-3.584-1.676-5.547-1.754l-0.457-0.016c-3.096,0-6.385,1.205-7.743,2.912c-2.909,3.61-4.067,5.471-4.081,10.238   c0,3.445,1.097,7.057,1.996,9.312c0.607,1.538,0.152,4.8-0.154,6.537c-0.107,0.32-0.26,0.809-0.441,1.355l13.865,2.942   c0.32-1.112,0.598-1.951,0.658-2.119c1.295-2.193,3.564-6.187,4.295-8.335C124.909,102.781,125.199,100.892,124.284,95.115z    M100.728,123.777c-0.809,1.906-1.281,3.703-0.854,5.792c0.258,1.266,1.37,2.331,3.565,3.094c2.421,0.854,4.647,0.809,5.073,0.823   c2.088-0.245,3.614-0.977,4.756-2.043c1.523-1.387,2.712-4.999,3.397-7.544l0.032-0.015l0.119-0.592   c0.15-0.565,0.259-1.053,0.352-1.402l0.215-0.823l-13.974-2.957l-0.214,0.503C102.752,119.512,101.353,122.315,100.728,123.777z    M125.627,110.143c-0.914,2.666-3.657,7.389-4.922,9.506l-0.429,2.15c-0.425,2.101-2.025,9.203-4.967,11.916   c-1.707,1.57-3.871,2.513-6.445,2.818l-0.229,0.031l-0.211-0.016h-0.094c-0.793-0.016-3.199-0.047-5.883-0.99   c-3.167-1.113-5.027-2.912-5.531-5.365c-0.639-3.078,0.168-5.576,1.039-7.619c0.76-1.826,2.632-5.514,2.709-5.668l0.52-1.006   l0.018-0.092c0.501-2.301,0.76-5.164,0.516-5.897c-0.822-2.086-2.193-6.201-2.193-10.454c0-5.637,1.522-8.149,4.752-12.174   c2.24-2.787,6.676-4.037,10.09-4.037l0.576,0.015c2.699,0.107,5.184,0.899,7.164,2.301c2.773,1.95,4.512,5.013,5.164,9.065   C128.308,101.181,127.851,103.559,125.627,110.143z"></path>
						</g>
					</svg>
				</a>
				</li>
			</ul>
			<!--<footer id="footer-1" class="footer">
				<ul class="logos">
					<li class="merano"><a target="_blank" href="<?php ___('linkmerano'); ?>"><?php ___('merano'); ?></a></li>
					<li class="tis"><a target="_blank" href="<?php ___('linktis'); ?>">TIS innovation park South Tyrol</a></li>
					<li class="sasa"><a target="_blank" href="<?php ___('linksasa'); ?>">SASA Bus</a></li>
				</ul>
			</footer>-->
			<!--<footer id="footer-2" class="footer">
				<nav>
					<?php ___('infocontatti'); ?><a href="mailto:info@meran.eu">info@meran.eu</a>
				</nav>
				<div id="pages">
					<div id="servizio" class="page">
						<h3><?php ___('servizio'); ?></h3>
					</div>
					<div id="impressum" class="page">
						<h3><?php ___('impressum'); ?></h3>
					</div>
					<div id="contatti" class="page">
						<h3><?php ___('contatti'); ?></h3>
					</div>
				</div>
			</footer>-->
		</div>
		<div class="modal">
			<main class="main" id="main">
				<!--<div id="search-container">
					<div class="search-box">     			
						<form id="search-form" action="#" method="post" role="search">
							<input type="text" id="search-field" name="search-field" value="<?php ___('camporicerca'); ?>" />
							<input type="submit" id="search-submit" value="<?php ___('cerca'); ?>" />
						</form>
					</div>
					<div class="search-box result">
						<span class="title"><?php ___('fermatevicine'); ?>...</span>
						<ul id="listResults">
						</ul>
					</div>
				</div>-->
				<div class="panel-content-out">
					<div class="scroll-content">
						<div class="panel-content">
							<div class="filters">
								<p><a href="#">Städtische Linien</a></p>
								<p><a href="#">Auserstädtische Linien</a></p>	
								<span id="deselectall"> <span><?php ___('deselectall'); ?></span> </span>
							</div>
							<div id="variants">
								<div class="scroll" id="scroll">
									<div class="tabbed-content">
									<!--<ul class="tabs">
										<li class="button"><?php ___('urbani'); ?></li>
										<li class="button"><?php ___('extraurbani'); ?></li>
									</ul>-->
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
	        <p id="credits"><?php ___('mappe'); ?> <a href="http://www.openstreetmap.org/copyright" rel="external">OpenStreetMap</a> &amp; <a href="<?php ___('linkr3gis'); ?>" rel="external">R3 GIS</a> - <?php ___('design'); ?> <a href="<?php ___('linkmadeincima'); ?>" rel="external">Madeincima</a></p>
            
		<div id="busPopup" style="display:none;">
                                    <div class="clearfix pophead">
                                        <h2 class="bus c-${lidname}"><?php ___('linea'); ?> ${lidname}</h2>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 0 48 48" width="30" class="svg" style="width: 30px;" fill="rgb(${li_r},${li_g},${li_b});">
                                                        <path fill="rgb(${li_r},${li_g},${li_b})" d="M8 32c0 1.77.78 3.34 2 4.44v3.56c0 1.1.9 2 2 2h2c1.11 0 2-.9 2-2v-2h16v2c0 1.1.89 2 2 2h2c1.1 0 2-.9 2-2v-3.56c1.22-1.1 2-2.67 2-4.44v-20c0-7-7.16-8-16-8s-16 1-16 8v20zm7 2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm18 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-12h-24v-10h24v10z"></path>
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
                                    <span class="tip"></span>
                                </div>
                                <div id="stopPopup" style="display:none;">
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
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 48 48" width="18" class="svg" style="width: 18px; vertical-align:bottom" fill="rgb(${li_r},${li_g},${li_b});">
                                                        <path fill="rgb(${li_r},${li_g},${li_b})" d="M8 32c0 1.77.78 3.34 2 4.44v3.56c0 1.1.9 2 2 2h2c1.11 0 2-.9 2-2v-2h16v2c0 1.1.89 2 2 2h2c1.1 0 2-.9 2-2v-3.56c1.22-1.1 2-2.67 2-4.44v-20c0-7-7.16-8-16-8s-16 1-16 8v20zm7 2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm18 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-12h-24v-10h24v10z"></path>
                                                        </svg>

                                                <?php ___('linea'); ?> ${lidname}
                                                </td>
                                                <td class="time">${bus_passes_at}</td> <!-- temporaneo, non ho ancora i dati sull'orario -->
                                            </tr>
                                        </tbody>
                                    </table>
                                    <span class="tip"></span>
                                </div>

		<script src="js/iscroll.js" type="text/javascript"></script>
		<!--[if lte IE 8]>
			<script src="scripts/PIE_IE678.js" type="text/javascript"></script>
		<![endif]-->
		<script src="js/jquery.easyListSplitter.js" type="text/javascript"></script>
		<script src="js/init.js" type="text/javascript"></script>
		<script src="js/utility.js" type="text/javascript"></script>
		<!--[if lt IE 9]>
			<script src="http://css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script>
		<![endif]-->
		<!--</div>-->
	</body>
</html>
