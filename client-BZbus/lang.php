<?php
	function ___($varName)
	{
		global $lang,$vars;
		if(isset($vars[$lang.'_'.$varName]))
			print $vars[$lang.'_'.$varName];
		else print $lang.'_'.$varName;
	}

	global $vars;
	$vars = array();
	// Italiano
	$vars['it_bzbustitle'] = 'Homepage | BZ Bus';
	$vars['it_urbani'] = 'Urbani';
	$vars['it_extraurbani'] = 'Extraurbani';
	$vars['it_deseleziona'] = 'Deseleziona';
	$vars['it_tuttelelinee'] = 'tutte le linee';
	$vars['it_varianti'] = 'Varianti';
	$vars['it_camporicerca'] = 'Indirizzo o fermata';
	$vars['it_prossimefermate'] = 'Prossime fermate';
	$vars['it_stimato'] = 'Stimato';
	$vars['it_nondisp'] = '* dato NON disponibile in tempo reale';
	$vars['it_fermata'] = 'Fermata';
	$vars['it_direzione'] = 'Direzione';
	$vars['it_arrivo'] = 'In arrivo';
	$vars['it_cerca'] = 'Cerca';
	$vars['it_norisultati'] = 'Nessun risultato';
	$vars['it_fermatevicine'] = 'Le fermate pi&ugrave; vicine';
	$vars['it_nuovaricerca'] = 'Prova a fare una nuova ricerca oppure usa i filtri per linea';
	$vars['it_linea'] = 'Linea';
	$vars['it_linkr3gis'] = 'http://www.r3-gis.com/it';
	$vars['it_linkmadeincima'] = 'http://www.madeincima.it/';
	$vars['it_mappe'] = 'mappa';
	$vars['it_design'] = 'design';
	
	$vars['it_condividisuisocial'] = 'Condividi BZ Bus sui social';
	$vars['it_condividi'] = 'Condividi';
	$vars['it_sui'] = 'sui';
	$vars['it_social'] = 'social';
	$vars['it_evia'] = 'e via';
	$vars['it_widget'] = 'widget';
	$vars['it_codice'] = 'Codice';
	$vars['it_embed'] = 'Embed';
	$vars['it_link'] = 'Link';
	
	$vars['it_developer'] = 'Sei uno sviluppatore?';
	$vars['it_collabora'] = 'collabora';
	$vars['it_alprogetto'] = 'al progetto';
	$vars['it_leappdelprogetto'] = 'Le app sperimentali del';
	$vars['it_bztraffic'] = 'Comune di Bolzano';
	
	$vars['it_licenziatosotto'] = 'licenziato sotto';
	$vars['it_pubblicatosu'] = 'pubblicato su';
	$vars['it_contatto'] = 'Contatto';
	$vars['it_user_input'] = 'Vai al questionario!';
	$vars['it_user_input_link'] = 'https://docs.google.com/forms/d/1qgBMiNqcWilOYJcOI4KM2YqB7Vt9nH-cACty__zCzD8/viewform';
	
	// Inglese
	$vars['en_bzbustitle'] = 'Homepage | BZ Bus';
	$vars['en_urbani'] = 'Urban';
	$vars['en_extraurbani'] = 'Suburban';
	$vars['en_deseleziona'] = 'Uncheck';
	$vars['en_tuttelelinee'] = 'all lines';
	$vars['en_varianti'] = 'Variations';
	$vars['en_camporicerca'] = 'Address or bus stop';
	$vars['en_prossimefermate'] = 'Next stops';
	$vars['en_stimato'] = 'Estimated';
	$vars['en_nondisp'] = '* not real time available data';
	$vars['en_fermata'] = 'Bus stop';
	$vars['en_direzione'] = 'Direction';
	$vars['en_arrivo'] = 'Arriving';
	$vars['en_cerca'] = 'Search';
	$vars['en_norisultati'] = 'No results';
	$vars['en_fermatevicine'] = 'The closest stops';
	$vars['en_nuovaricerca'] = 'Try another search or use the line-filters';
	$vars['en_linea'] = 'Route';
	$vars['en_linkr3gis'] = 'http://www.r3-gis.com/en';
	$vars['en_linkmadeincima'] = 'http://www.madeincima.it/en/';
	$vars['en_mappe'] = 'map';
	$vars['en_design'] = 'design';

	$vars['en_condividisuisocial'] = 'Share BZ Bus on social networks';
	$vars['en_condividi'] = 'Share';
	$vars['en_sui'] = 'on';
	$vars['en_social'] = 'social';
	$vars['en_evia'] = 'and go';
	$vars['en_widget'] = 'widget';
	$vars['en_codice'] = 'Source code';
	$vars['en_embed'] = 'Embed';
	$vars['en_link'] = 'Link';
	
	$vars['en_developer'] = 'Are you a developer?';
	$vars['en_collabora'] = 'join';
	$vars['en_alprogetto'] = 'the project';
	$vars['en_leappdelprogetto'] = 'The experimental apps of the';
	$vars['en_bztraffic'] = 'Municipality of Bolzano';
	
	$vars['en_licenziatosotto'] = 'code licensed under the ';
	$vars['en_pubblicatosu'] = '';
	$vars['en_contatto'] = 'Contact';
	$vars['en_user_input'] = 'Go to the survey!';
	$vars['en_user_input_link'] = 'https://docs.google.com/forms/d/1qgBMiNqcWilOYJcOI4KM2YqB7Vt9nH-cACty__zCzD8/viewform';

	// Tedesco
	$vars['de_bzbustitle'] = 'Homepage | BZ Bus';
	$vars['de_urbani'] = 'St&auml;dtische Busse';
	$vars['de_extraurbani'] = 'Au&szlig;erst&auml;dtische Busse';
	$vars['de_deseleziona'] = 'deselektieren';
	$vars['de_tuttelelinee'] = 'Alle Linien';
	$vars['de_varianti'] = 'Varianten';
	$vars['de_camporicerca'] = 'Adresse oder Haltestelle';
	$vars['de_prossimefermate'] = 'n&auml;chste Haltestellen';
	$vars['de_stimato'] = 'gesch&auml;tzt';
	$vars['de_nondisp'] = '* nicht in Echtzeit verf&uuml;gbare Daten';
	$vars['de_fermata'] = 'Haltestelle';
	$vars['de_direzione'] = 'Richtung';
	$vars['de_arrivo'] = 'kommt in K&uuml;rze an';
	$vars['de_cerca'] = 'Suchen';
	$vars['de_norisultati'] = 'Kein Ergebnis';
	$vars['de_fermatevicine'] = 'Die n&auml;chsten Haltestellen';
	$vars['de_nuovaricerca'] = 'Versuchen Sie es mit einer neuen Suche oder benutzen Sie die Linienfilter';
	$vars['de_linea'] = 'Linie';
	$vars['de_linkr3gis'] = 'http://www.r3-gis.com/de';
	$vars['de_linkmadeincima'] = 'http://www.madeincima.it/';
	$vars['de_mappe'] = 'karte';
	$vars['de_design'] = 'design';

	$vars['de_condividisuisocial'] = 'Teile BZ Bus auf deine social networks';
	$vars['de_condividi'] = 'Teile';
	$vars['de_sui'] = 'auf';
	$vars['de_social'] = 'social';
	$vars['de_evia'] = 'e via';
	$vars['de_widget'] = 'widget';
	$vars['de_codice'] = 'Source code';
	$vars['de_embed'] = 'Eingebettet';
	$vars['de_link'] = 'Link';
	
	$vars['de_developer'] = 'Bist du ein Entwickler?';
	$vars['de_collabora'] = 'Mach';
	$vars['de_alprogetto'] = 'mit';
	$vars['de_leappdelprogetto'] = 'Die experimentellen Apps der';
	$vars['de_bztraffic'] = 'Gemeinde Bozen';
	
	$vars['de_licenziatosotto'] = 'lizenziert unter';
	$vars['de_pubblicatosu'] = 'abgedruckt in';
	$vars['de_contatto'] = 'Kontakt';
	$vars['de_user_input'] = 'Zur Umfrage!';
	$vars['de_user_input_link'] = 'https://docs.google.com/forms/d/1kdJ7hW-si8heRIfPdFmnRA2UmF1D2aEEapD7lHZ1yI8/viewform ';
?>
