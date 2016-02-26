var codificaLinee = new Array();
var i = 0;
/*
Leggenda campi:
li_loc: contesto di localizzazione - 0 Urbano e 1 Extraurbano (solo nostro)
li_nr: numero della linea
str_li_var: variante
lidname: nome della linea
li_ri_nr: direzione della linea - 1 andata e 2 ritorno
li_r,li_g,li_b: colore RGB
*/

device = detectDevice();

codificaLinee['1'] = 0;
codificaLinee['2'] = 0;
codificaLinee['3'] = 0;
codificaLinee['4'] = 0;
codificaLinee['6'] = 0;
codificaLinee['146'] = 0;

codificaLinee['211'] = 1;
codificaLinee['201'] = 1;
codificaLinee['212'] = 1;
codificaLinee['213'] = 1;
codificaLinee['214'] = 1;
codificaLinee['225'] = 1;

if(device[0] == 'smartphone'){
	SASABus.config.rowsLimit = 2;
	SASABus.config.pinToDialogDistance 	= 48;
	SASABus.config.pinHeight			= 40;
	SASABus.config.yOffset				= 60;
	$('.map-body').append('<div id="serverTime"><span class="label">Time</span><span class="reload"></span></div>');
}
if(device[0] == 'desktop'){
	SASABus.config.yOffset				= 20;
	$('#map').append('<div id="serverTime"><span class="label">Time</span> <span class="reload"></span></div>');
}
