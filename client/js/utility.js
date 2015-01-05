

Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}

Array.prototype.containsSubStr = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i].indexOf(obj)>=0) {
			return true;
		}
	}
	return false;
}

// logs the styleName value of the given element
function println(elementID, styleName) {
	console.log(elementID + "." + styleName + ": " + 
		window.getComputedStyle(
			document.getElementById(elementID)
		).getPropertyValue(styleName)
	);
}

function isSmartPhoneMode() {
	println("header-mobile", "display");

	return window.getComputedStyle(document.getElementById("header-mobile")).getPropertyValue("display") !== "none";
}

var mapLinesInit;
var mapLines;
var initialTop;


$(document).ready(function() {
	console.log("$(document).ready(function()");
//	console.log($(document).height());
//	console.log($(window).height());


	
	// ---- Link esterno ----------------------------------------------------------------------------------------------------------
	$("a[href*='http://']:not([href*='"+location.hostname+"']),[href*='https://']:not([href*='"+location.hostname+"'])").attr("target","_blank");	


 	// ---- Translations --------------
	lang 					= "it";
	lang_no_results 			= "Nessun risultato...";
	lang_no_results_text 			= "Prova a fare una nuova ricerca oppure usa i filtri per linea";
	lang_near_stop 				= "Le fermate più vicine...";
	lang_menu_linee				= "Filtro linee";
	lang_menu_search			= "Ricerca";
	lang_menu_about				= "About";
	lang_menu_settings			= "Settings";
	lang_close				= "chiudi";
	lang_lingua				= "Lingua";
	
	if($('body').hasClass('en')){
		lang = "en";
		lang_no_results 		= "No results...";
		lang_no_results_text 		= "Try another search or use the line-filters";
		lang_near_stop 			= "The closest stops...";
		lang_menu_linee			= "Lines";
		lang_menu_search		= "Search";
		lang_menu_about			= "EN About";
		lang_menu_settings		= "Settings";
		lang_close			= "close";
		lang_lingua			= "Language";
	}
	if($('body').hasClass('de')){
		lang = "de";
		lang_no_results 		= "Kein Ergebnis...";
		lang_no_results_text 		= "Versuchen Sie es mit einer neuen Suche oder benutzen Sie die Linienfilter";
		lang_near_stop 			= "Die nächsten Haltestellen...";
		lang_menu_linee			= "Linienfilter";
		lang_menu_search		= "Suche";
		lang_menu_about			= "DE About";
		lang_menu_settings		= "Einstellungen";
		lang_close			= "Schließen";
		lang_lingua			= "Sprache";
	}

	panelScrollElement = Array();
	
	device = detectDevice();
 	
	//if(device[0] == 'desktop'){
	if(device[0] == 'smartphone'){
		$('body').addClass('smartphone');
	}
	
	init(false);
	oneTime(device);

	//----------------------
	//on orientation change
	//----------------------	
	function onOrientationChange(){
		setTimeout(function(){
			init(true);
		},20);
	}
	
	//android don't support orientationchange but resize
	var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	$(window).bind(orientationEvent, function(){
		onOrientationChange();
	});

	// ---- Generic Stuff ----------------------------------------------------------------------------------------------------------
	function init(varOrientationChange){
		console.log("init()");

		var smartPhoneMode = isSmartPhoneMode();
		console.log("smartPhoneMode: " + smartPhoneMode);
	}
	
	function oneTime(device){
		console.log('oneTime');
		
		$('#map').append('<div id="zoomButtons"><a href="#" id="zoomInButton">Zoom in</a><a href="#" id="zoomOutButton">Zoom out</a></div>');
		
		SASABus.init('map');
		SASABus.getAllLines(initLinesAfterRead);
		
		function getReadableTime(time){
			var a = new Date(time*1000);

			//var date = a.getDate();
			var hour = a.getHours();
			if(hour < 10){
				hour = '0' + hour;
			}
			var minutes = a.getMinutes();
			if(minutes < 10){
				minutes = '0' + minutes;
			}
			//var sec = a.getSeconds();
			var time = hour + ':' + minutes ;

			$('#serverTime .reload').html(time);
		}
		
		setInterval(function() {
			SASABus.getServerTime(function(time){
				getReadableTime(time);
			});
		}, 10 * 1000);
		
		SASABus.getServerTime(function(time){
			getReadableTime(time);
		});
		
		$('a[rel=external]').attr('target','_blank');
	}

});

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function initLinesAfterRead(lines) { 
	console.log('initLinesAfterRead');
	//alert(lines.toSource())

	// sort lines
	lines.sort(function(a,b){
		var el1 = pad((''+a['li_nr']).replace(' ','_'),5)+a['str_li_var'].replace(' ','_');
		var el2 = pad((''+b['li_nr']).replace(' ','_'),5)+b['str_li_var'].replace(' ','_');
		return el1-el2;
	});

	// transform line data into html and put in #extra and #urbani tags
	var htmlLineeU = new Array();
	var htmlLineeE = new Array();
	mapLinesInit = new Array();
	for(var i=0;i<lines.length;i++)
	{
		//if (lines[i].lidname=='10A' || lines[i].lidname=='10B')
			//console.log(lines[i]);
		var linea = new Array();
		var k = 0;
		var codLinea = (''+lines[i]['li_nr']).replace(' ','_');
		var codVariante = lines[i]['str_li_var'].replace(' ','_');
		var nomeLinea = lines[i]['lidname'];
		var nomeVariante = lines[i]['str_li_var'];
		var color = 'rgb('+lines[i].li_r+','+lines[i].li_g+','+lines[i].li_b+') ';
		if(typeof htmlLineeU[codLinea] == 'undefined' && typeof htmlLineeE[codLinea] == 'undefined')
		{
			linea[k++] = '<li class="tick-list"><p class="line l-'+codLinea+'"><strong class="line-no" id="l_'+codLinea+'">'+nomeLinea+'</strong><span class="icon" style="background-color:'+color+'" />';
			linea[k++] = '';
			linea[k++] = '</p>';
			linea[k++] = '<ul class="child-tick">';
			linea[k++] = '<li id="v_'+codLinea+'_'+codVariante+'">'+nomeVariante+'</li>';
			linea[k++] = '</ul>';
			linea[k++] = '</li>';
			if(codificaLinee[codLinea]==0)
				htmlLineeU[codLinea] = linea;
			else
				htmlLineeE[codLinea] = linea;
		}
		else
		{
			if(codificaLinee[codLinea]==0)
			{
				htmlLineeU[codLinea][1] = '<span class="var">'+txtVariante+'</span>'
				htmlLineeU[codLinea][4] += '<li id="v_'+codLinea+'_'+codVariante+'">'+nomeVariante+'</li>';
			}
			else
			{
				htmlLineeE[codLinea][1] = '<span class="var">'+txtVariante+'</span>'
				htmlLineeE[codLinea][4] += '<li id="v_'+codLinea+'_'+codVariante+'">'+nomeVariante+'</li>';
			}
		}
		mapLinesInit[i] = codLinea+':'+codVariante;
	}
	var htmlL = '';
	for(var i=0;i<htmlLineeU.length;i++)
	{
		if(typeof htmlLineeU[i] != 'undefined')
		{
			if(htmlLineeU[i][1].length == 0)
				htmlL += htmlLineeU[i][0]+htmlLineeU[i][2]+htmlLineeU[i][6];
			else
				htmlL += htmlLineeU[i][0]+htmlLineeU[i][1]+htmlLineeU[i][2]+htmlLineeU[i][3]+htmlLineeU[i][4]+htmlLineeU[i][5]+htmlLineeU[i][6];
		}
	}
	$('#urbani').html(htmlL);
	//console.log('Urbane');
	//console.log(htmlL);
	htmlL = '';
	for(var i=0;i<htmlLineeE.length;i++)
	{
		if(typeof htmlLineeE[i] != 'undefined')
		{
			if(htmlLineeE[i][1].length == 0)
				htmlL += htmlLineeE[i][0]+htmlLineeE[i][2]+htmlLineeE[i][6];
			else
				htmlL += htmlLineeE[i][0]+htmlLineeE[i][1]+htmlLineeE[i][2]+htmlLineeE[i][3]+htmlLineeE[i][4]+htmlLineeE[i][5]+htmlLineeE[i][6];
		}
	}
	//console.log('Extra');
	//console.log(htmlL);
	$('#extra').html(htmlL);
	SASABus.getLines(showLinesAfterRead(lines));
}

function stopPropagationCustom(){
	console.log("stopPropagationCustom()");

	$('input, textarea, button, a, select, .line .icon, .line .var,.child-tick li, .tabs li').off('touchstart mousedown').on('touchstart mousedown', function(e) {
		e.stopPropagation();
	});
}

function showLinesAfterRead(lines){ 
	console.log('showLinesAfterRead');

	// ---- Tabs ----------------------------------------------------------------------------------------------------------

	$('.child-tick').hide();
	$(".tab-content").hide();
	$('#variants .tabs li:first').addClass('active');
	$("#variants .tab-content:first").show();
	//$("#variants .tab-content .line").append('<span class="icon" />');

	$('.tabbed-content').each(function(){
		$(this).find('.tabs li').click(function(){ 
			tabbed_content = $(this).parents('.tabbed-content');
			tabbed_content.find('.active').removeClass('active');
			$(this).addClass('active'); 
			tabbed_content.find('.tab-content').hide();
			var activeTab = $(this).index(); 
			tabbed_content.find('.tab-content').eq(activeTab).fadeIn().addClass('active');
			panelScroll();
		});
	});
	
	// ---- Listing Variants ----------------------------------------------------------------------------------------------------------
	$('#variants ul.child-tick').hide();
	
	$('#deselectall').bind('touchstart click', function(){
		if($(this).hasClass('disabled')){
				return
			}else{
				$('#variants .enabled .icon').each(function(){
					var line = $(this).parent('.line').find('.line-no').attr('id').replace('l_','');
					var k = 0;
					if(mapLinesInit.containsSubStr(line+':'))
					{
						$(this).parent('.line').toggleClass('enabled');
						
						//Elimino le linee da mapLines
						for(var i=0;i<mapLines.length;i++)
						{
							if(mapLines[i].indexOf(line+':')==0)
							{
								mapLines.splice(i, 1);
								i--;
							}
							k++;
						}
						
						SASABus.showLines(mapLines);
						panelScroll();
					}
				});
				$('#deselectall').addClass('disabled');
			}
	});

	$('#variants .tick-list').bind('touchstart click', function(){
		var line = $(this).find('.line-no').attr('id').replace('l_','');
		var k = 0;
		if(mapLinesInit.containsSubStr(line+':'))
		{
			$(this).find('.line').toggleClass('enabled');
			if($('.line.enabled').length){
				$('#deselectall').removeClass('disabled');
			}else{
				$('#deselectall').addClass('disabled');
			}
			//console.log($(this).parent('.line').attr('class'));
			var isEnable = $(this).find('.line').attr('class').indexOf('enabled')>=0;
			if(isEnable)
			{
				//console.log('ADD: '+mapLinesInit);
				//Aggiungo le linee da mapLines

				for(var i=0;i<mapLinesInit.length;i++)
				{
					if(mapLinesInit[i].indexOf(line+':')==0)
					{
						//console.log('Aggiungo: '+mapLinesInit[i]);
						mapLines.push(mapLinesInit[i]);
					}
					k++;
					//if(k>100) return;
				}
			}
			else
			{
				//console.log('DEL: '+mapLinesInit);
				//Elimino le linee da mapLines
				for(var i=0;i<mapLines.length;i++)
				{
					if(mapLines[i].indexOf(line+':')==0)
					{
						//console.log('trovato: elimino: '+mapLines[i]);
						mapLines.splice(i, 1);
						i--;
					}
					k++;
					//if(k>100) return;
				}
			}
			SASABus.showLines(mapLines);
			panelScroll();
		}
	});
		
	$('#variants .var').click(function(){
		$('#variants .line').addClass('close');
		$(this).parent('.line').toggleClass('close');
		if($(this).parent('.line').next('.child-tick').is(':hidden')){
			$('#variants ul.child-tick').slideUp();
		} else {
			$('#variants .line').addClass('close');
		}
		$(this).parent('.line').next('.child-tick').slideToggle(100,function(){
			setTimeout(function(){
				panelScroll();
			},10);
			
		});
	});

	$('#variants .child-tick li').append('<span />');
	
	$('#variants .child-tick li').click(function(){
		var line = $(this).parent().parent().find('.line-no').attr('id').replace('l_','');
		var variante = $(this).attr('id').replace('v_'+line+'_','').trim();
		var k = 0;
		if(mapLinesInit.containsSubStr(line+':'+variante))
		{
			$(this).toggleClass('ticked');
			
			//console.log($(this).parent('.line').attr('class'));
			var isEnable = $(this).attr('class').indexOf('ticked')>=0;
			if(isEnable)
			{
				//console.log('ADD: '+mapLinesInit);
				//Aggiungo le linee da mapLines
				for(var i=0;i<mapLinesInit.length;i++)
				{
					if(mapLinesInit[i].indexOf(line+':'+variante)==0)
					{
						//console.log('Aggiungo: '+mapLinesInit[i]);
						mapLines.push(mapLinesInit[i]);
					}
					k++;
					if(k>100) return;
				}
			}
			else
			{
				//console.log('DEL: '+mapLinesInit);
				//Elimino le linee da mapLines
				for(var i=0;i<mapLines.length;i++)
				{
					if(mapLines[i].indexOf(line+':'+variante)==0)
					{
						//console.log('trovato: elimino: '+mapLines[i]);
						mapLines.splice(i, 1);
						i--;
					}
					k++;
					if(k>100) return;
				}
			}
			SASABus.showLines(mapLines);
			panelScroll();
		}
	});

	// ---- easyListSplitter ----------------------------------------------------------------------------------------------------------
	$('#variants .tab-content').each(function(){
		$(this).find('ul.tick').easyListSplitter({ 
				colNumber: 3,
				direction: 'horizontal'
		});
	});
	
	
	// ---- PreFilled   ----------------------------------------------------------------------------------------------------------			
	$.fn.preFilled = function() {
		$(this).focus(function(){
			if( this.value == this.defaultValue ) {
				this.value = "";
			}				   
		}).blur(function(){
			if( !this.value.length ) {
				this.value = this.defaultValue;
			}
		});
	};
	
	$('#search-field').preFilled();


	// ---- Map Panel   ----------------------------------------------------------------------------------------------------------	
		
	//$('#main span.btn-toggle').click(function(){
	$('span.btn-toggle').click(function(){
		if($(this).hasClass('open')){
			$('div.panel').animate({'left' : '-375px'});
			$(this).removeClass('open').addClass('close').hide();
			var e = $(this);
			setTimeout(function(){
				e.animate({'right' : '-32px'});
				e.show();
			},400);
		}else{
			$(this).addClass('open').removeClass('close').css({'right':'0'});
			$('div.panel').animate({'left' : '0'});
		}
	});

	// in smartphone.css a menu button (mobile-menu-btn) will be displayed
	// in the header. the user can slideToggle the menu clicking it
	$('span.mobile-menu-btn').click(function(){
		$('div.panel').slideToggle();
	});

	$(window).resize(function(){
		panelScroll();
	});
	panelScroll();
	
	if(!$('body').hasClass('lte-8')){
		$('#scroll .iScrollIndicator').mousedown(function() {
			$(this).addClass('grabbing');
		});
		$('#scroll .iScrollIndicator').mouseup(function() {
			$(this).removeClass('grabbing');
		});
	};
		
	stopPropagationCustom();
	
	
	
	// ---- CSS PIE - Round Corners  ----------------------------------------------------------------------------------------------------------
	
	if($('body').hasClass('lte-8')){
		$('.list-actions .btn-add').addClass('corner-type-a');
		$('.corner-type-a').each(function(){
			$(this).append('<span class="corner-a corner-tl" /><span class="corner-a corner-tr" /><span class="corner-a corner-bl" /><span class="corner-a corner-br" />');
		});
	}

	if($('body').hasClass('lte-8')){
		if(window.PIE){
			$('.login-panel .submit input,.login-panel .field input,.panel-actions li.first,.panel-actions li.last,.panel-actions,.list-actions .search-form,.main-buttons a,.list-tab,.list-actions .order,.panel .btn-1,.panel .btn-2,.map-tools .btn-close').not('.panel .indicators .btn-2').each(function(){
				PIE.attach(this);
			});
		}
	}
	
	if($('body').hasClass('ie-8')){
		if(window.PIE){
			$('.box').each(function(){
				PIE.attach(this);
			});
		}
	}

	$('.tick-list').each(function(){
		var line = $(this).find('.line-no').html();
		$(this).parent('.line').toggleClass('enabled');
		//console.log(line);
	});

	//console.log(lines);
	mapLines = new Array();
	for(var i=0;i<lines.length;i++)
	{
		var codLinea = (''+lines[i]['li_nr']).replace(' ','_');
		var codVariante = lines[i]['str_li_var'].replace(' ','_');
		mapLines[i] = codLinea+':'+codVariante;
		$('#v_'+codLinea+'_'+codVariante).toggleClass('ticked');
	}

	SASABus.showLines(mapLines);
	//console.log(mapLines); 

	$("#variants .tab-content .line").each(function(){
		var line = $(this).find('.line-no').attr('id').replace('l_','');
		if(mapLines.containsSubStr(line+':'))
			$(this).addClass('enabled close');
		else
			$(this).addClass('close');
	});
	//console.log('search-submit -> click'); 
	$("#search-form").submit(findResults); 

}

// configures the internal scroll bars in .panel around #scroll
function panelScroll(){
	console.log("panelScroll()");

	maxHeight = $('.panel-content-out').height();

	// there seams to be a problem on change of orientation, 
	// the height of panel-content-out gets reported 0
	// we ignore these intermediate calls, because they create
	// the effect the menu gats shown without the content in the scroll
	if (maxHeight > 0) {
		$('.panel .scroll').css('max-height', maxHeight + 'px');
	
		if($('body').hasClass('lte-8')){
			$('#scroll').css('overflow-y','auto');
		}else{
			if($('#scroll').data('initialize') == '1'){
				panelScrollElement.refresh();
			}else{
				panelScrollElement 	= new IScroll('#scroll', { scrollbars: 'custom', mouseWheel: true, interactiveScrollbars: true});
				$('#scroll').data('initialize','1');
			}
			if($('.panel .scroll').height() < maxHeight){
				$('.iScrollVerticalScrollbar').addClass('hidden');
			}else{
				$('.iScrollVerticalScrollbar').removeClass('hidden');
			}
		}
	}
}

function findResults(){
	console.log('findresults()');

	SASABus.removeAllLocations();
	var strFind = $("#search-field").val();
	if(strFind.length > 0){
		//console.log('length > 0');
		SASABus.geocode(strFind, successFind, failureFind);
		//console.log('after geocode');
	}
	return false;
}

function successFind(rows){
	console.log("successFind()");

	//console.log('success');
	//console.log(rows);
	//alert(rows.toSource())
	var strHtml = '';
	if(rows.length == 0){
		$('.search-box.result .title').html(lang_no_results);
		strHtml = '<li class="no-results">' + lang_no_results_text + '</li>';
	}else{
		$('.search-box.result .title').html(lang_near_stop);
		
		for(var i=0;i<rows.length;i++){
			fermate = rows[i]['stops'];
			for(var j=0;j<fermate.length;j++){
				//console.log(fermate[j]);
				SASABus.addLocation(rows[i]['lon'], rows[i]['lat']);
				strHtml += '<li class="result-item stop"><a href="#" rel="'+fermate[j]['ort_nr']+','+fermate[j]['onr_typ_nr']+'">'+fermate[j]['name']+'</a></li>';
			}
		}
	}
	$('.search-box.result .close').show();
	$("#listResults").html(strHtml);
	/*$("#listResults a").addClass('testing').click(function(){
		alert('test');
		showPoint($(this));
	});*/
	$("#listResults a").on('touchstart click',function(){
		showPoint($(this));
	});
	showResults();
	stopPropagationCustom();
	withoutHeaderHeight = $(window).outerHeight() - 130;

	scrollPanel = $('#search-container .scroll');
	scrollPanel.css('height',withoutHeaderHeight + 'px');
	elementNumber = scrollPanel.data('number');
	panelScrollElement[elementNumber].refresh();
}

function failureFind(){
	console.log("failureFind()");

	$('.search-box.result .title').html(lang_no_results);
	$("#listResults").html('<li class="no-results">' + lang_no_results_text + '</li>');
	showResults();
}

function showPoint(element){
	console.log("showPoint()");

	var arrCoord = element.attr('rel').split(',');
	//SASABus.showLocation(arrCoord[0],arrCoord[1]);
	SASABus.zoomToStop(arrCoord[0], arrCoord[1]);
//	if($('body').hasClass('smartphone')){
//		closePanel($('#search-container'));
//		closeMainMenuMobile();
//	}
}

function showResults(){
	$('div.search-box.result').show(0,function(){
		var resultHeight = $('div.search-box.result').outerHeight();
		var newTop = initialTop + resultHeight;
		$('.panel-content-out').css('top','auto');
	});		
}


