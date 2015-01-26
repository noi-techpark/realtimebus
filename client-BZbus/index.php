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
<html dir="ltr" lang="it-IT">
	<head>
		<meta charset="utf-8" />
	    <title><?php ___("bzbustitle"); ?></title>
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,minimal-ui">
		<!--[if lte IE 9]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
	    <!-- Stylesheets -->
	    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/ui-lightness/jquery-ui.css" type="text/css" media="all" />
	    <link href="css/standard.css" rel="stylesheet" media="screen,projection,print" type="text/css" />
	   	<link href="css/smartphone.css" media="only screen and (max-width: 671px)" rel="stylesheet" />
        <!--<link href="css/smartphone.css" rel="stylesheet" />-->
		<script src="js/detect_device.js" type="text/javascript"></script>
        <script src="js/OpenLayers/OpenLayers.sasabus.js"></script>
        <!-- script src="http://sasatest.r3-gis.com/js/OpenLayers/lib/OpenLayers.js"></script -->
        <script src="js/OpenLayers/proj4js.min.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
        <script src="js/sasabus.js"></script>
        <script>  
			var txtVariante = '<?php ___("varianti"); ?>';
		</script>
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
		<header class="header" id="header">
			<div class="aux">
				<h1 class="logo" id="logo"><a href="#"><img src="images/logo-bz-bus.png" alt="Logo Bolzano Parking Beta" /> <span class="alt">Bolzano Bus</span></a><a href="#" class="beta round">Beta</a></h1>
				<div class="lang round">
 					<span class="round"><?php echo $lang ?></span>
					<ul class="round">
						<?php if($lang != 'it'): ?><li><a href="?l=it">IT</a></li><?php endif; ?>
						<?php if($lang != 'de'): ?><li><a href="?l=de">DE</a></li><?php endif; ?>
						<?php if($lang != 'en'): ?><li><a href="?l=en">EN</a></li><?php endif; ?>
					</ul>
				</div>	
			</div>
	    </header>
	    <main id="main" class="main main-map">
	        <div class="map-container" id="map" style="width:100%;height:100%;"></div>
	        <div class="panel main-map-panel-2">
            	<span class="btn-toggle open first"></span>
	            <div class="panel-main">
					<div id="search-container" class="search-container">
	            		<div class="search-box">     			
		                	<form id="search-form" action="#" method="post" role="search">
						        <input type="text" id="search-field" name="search-field" value="<?php ___('camporicerca'); ?>" />
						        <input type="submit" id="search-submit" value="<?php ___('cerca'); ?>" />
		                    </form>
		                </div>
                        <div class="scroll">
                            <div class="search-box result">
                            	<div class="aux">
                                    <span class="title"><?php ___('fermatevicine'); ?>...</span>
                                    <ul id="listResults">
                                        <!--<li class="result-item nearest"><a href="#">Fermata Finele</a></li>
                                        <li class="result-item"><a href="#">Fermata Jaufenstr.</a></li>
                                        <li class="result-item"><a href="#">Fermata Stemmerhof</a></li>-->
                                    </ul>
                                </div>
                            </div>
                        </div>
					</div>
					<div class="panel-content-out">
						<div class="scroll" id="scroll">
			            	<div class="scroll-content">
								<div class="panel-content">
									<div id="variants">
					                    <div class="tabbed-content">
					                    	<ul class="tabs">
					                    		<li class="button"><?php ___('urbani'); ?></li>
					                    		<li class="button"><?php ___('extraurbani'); ?></li>
					                    	</ul>
						                    <span id="uncheckall">
						                    	<?php if($lang != 'de'): ?>
							                    	<span><?php ___('deseleziona'); ?></span> <?php ___('tuttelelinee');
							                    else:
							                    	___('tuttelelinee'); ?> <span><?php ___('deseleziona'); ?></span>
							                    <?php endif; ?>
											</span>
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
	            </div>
	        </div>
	        <a href="#" id="zoomToMyPosition"></a>
	        <p id="credits"><?php ___('mappe'); ?> <a href="<?php ___('linkr3gis'); ?>" rel="external">R3Gis</a> - <?php ___('design'); ?> <a href="<?php ___('linkmadeincima'); ?>" rel="external">Madeincima</a></p>
	    </main>
	    <aside id="aside" class="aside">
		    <div class="aux">
		    	<div class="share">
			    	<div class="addthisbox">
						<h3><?php ___('condividisuisocial'); ?>:</h3>
						<div class="addthis_toolbox addthis_default_style addthis_32x32_style">
							<a class="addthis_button_facebook"></a>
							<a class="addthis_button_twitter"></a>
							<a class="addthis_button_pinterest_share"></a>
							<a class="addthis_button_google_plusone_share"></a>
							<a class="addthis_button_compact"></a><a class="addthis_counter addthis_bubble_style"></a>
						</div>
						<script type="text/javascript">var addthis_config = {"data_track_addressbar":true};</script>
						<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-4fd055665d176cbf"></script>
			    	</div>
		    	</div>	
		    	<ul class="buttons">
		    		<!--<li class="share-btn round"><a href="#"><strong><?php ___('condividi'); ?></strong> <?php ___('sui'); ?> <em><?php ___('social'); ?></em> <?php ___('evia'); ?> <em><?php ___('widget'); ?></em></a></li>-->
		    		<li class="developers-btn round"><a href="https://github.com/tis-innovation-park/realtimebus/tree/master/client-BZbus"><strong><?php ___('developer'); ?></strong> <em><?php ___('collabora'); ?></em> <?php ___('alprogetto'); ?></a></li>
		    	</ul>
		    	<!--<div class="widget-cont">
			    	<div class="widget">
				    	<h3>Widget</h3>
				    	<div class="embed-box">
					    	<div class="link">
					    		<h4><?php ___('codice'); ?> <?php ___('link'); ?></h4>
						    	<textarea onclick="this.focus();this.select()" readonly>http://www.nomedelsito.it/parametri?altriparametri</textarea>
					    	</div>	
					    	<div class="embed">
						    	<h4><?php ___('codice'); ?> <?php ___('embed'); ?></h4>
						    	<textarea onclick="this.focus();this.select()" readonly>&lt;div class="parking-widget" data-href="http://parking.integreen-life.bz.it" data-ref="108"&gt;&lt;/div&gt;&lt;script&gt;!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=http://parking.integreen-life.bz.it/parkbz/it/static/js/widget.js;fjs.parentNode.insertBefore(js,fjs);}(document,"script","parking-widget");&lt;/script&gt;</textarea>
					    	</div>
				    	</div>
			    	</div>
		    	</div>	-->
		    </div>
	    </aside>
	    <footer id="footer-1" class="footer-1">
	    	<div class="aux">
		    	<h3><?php ___('leappdelprogetto'); ?> <strong><?php ___('bztraffic'); ?></strong></h3>
				<ul>
					<li class="bzparking"><a href="http://parking.integreen-life.bz.it/"><img src="images/logo-bzparking.png" alt="BZ Parking" /></a></li>
					<li class="bzbus"><a href="#"><img src="images/logo-bzbus.png" alt="BZ Bus" /></a></li>
					<li class="bztraffic"><a href="http://traffic.bz.it/"><img src="images/logo-bztraffic.png" alt="BZ Traffic" /></a></li>
				</ul>	
	    	</div>
	    </footer>
	    <footer id="footer-2" class="footer-2">
	    	<div class="aux">
			    <div class="aux2">
			    	<ul>
						<li class="eu"><a href="http://ec.europa.eu/environment/life/"></a></li>
						<li class="ait"><a href="http://www.ait.ac.at/"></a></li>
						<li class="bz"><a href="http://www.comune.bolzano.it/"></a></li>
						<li class="tis"><a href="http://tis.bz.it/"></a></li>
						<li class="integreen"><a href="http://www.integreen-life.bz.it/it/"></a></li>
					</ul>
			    </div>
			    <div class="text">		    
				    <p><?php ___('codice'); ?> <?php ___('licenziatosotto'); ?> <a href="http://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License</a> <?php ___('pubblicatosu'); ?> <a href="https://github.com/tis-innovation-park/realtimebus/tree/master/client-BZbus">github</a></p>
					<p><?php ___('contatto'); ?>: project [at] integreen-life.bz.it</p>
				</div>
	    	</div>
	    </footer>
		<a href="https://github.com/tis-innovation-park/realtimebus/tree/master/client-BZbus" id="github">Fork me on GitHub</a>
        <script src="js/iscroll.js" type="text/javascript"></script>
        <!--[if lte IE 8]>
            <script src="scripts/PIE_IE678.js" type="text/javascript"></script>
        <![endif]-->
        <script src="js/jquery.easyListSplitter.js" type="text/javascript"></script>
		<script src="js/jquery.scrollTo.min.js" type="text/javascript"></script>
		<script src="js/init.js" type="text/javascript"></script>
        <script src="js/utility.js" type="text/javascript"></script>
        <!--[if lt IE 9]>
            <script src="http://css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script>
        <![endif]-->
	</body>
</html>
