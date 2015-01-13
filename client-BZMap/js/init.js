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

codificaLinee['16'] = 0;
codificaLinee['1001'] = 0;
codificaLinee['1003'] = 0;
codificaLinee['1005'] = 0;
codificaLinee['1006'] = 0;
codificaLinee['1008'] = 0;
codificaLinee['1009'] = 0;
codificaLinee['1011'] = 0;
codificaLinee['1012'] = 0;
codificaLinee['1014'] = 0;
codificaLinee['1071'] = 0;
codificaLinee['1072'] = 0;
codificaLinee['1101'] = 0;
codificaLinee['1102'] = 0;
codificaLinee['1153'] = 0;

codificaLinee['201'] = 0;
codificaLinee['183'] = 0;

if(device[0] == 'smartphone'){
	SASABus.config.rowsLimit = 2;
	SASABus.setDialogWidth(260);
	SASABus.config.pinToDialogDistance 	= 48;
	SASABus.config.pinHeight			= 40;
	SASABus.config.yOffset				= 100;
	$('#main').append('<div id="serverTime"><span class="label">Time</span><span class="reload"></span></div>');
}
if(device[0] == 'desktop'){
	SASABus.config.yOffset = 182; // 20
	//SASABus.config.pinToDialogDistance 	= 48; // added
	SASABus.setDialogWidth(300);
	$('.panel').append('<div id="serverTime"><span class="label">Time</span> <span class="reload"></span></div>');
}
