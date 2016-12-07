function detectDevice(){
	var devices = new Array('ipad','iphone','ipod','android','blackberry','windows phone','IEMobile','Opera Mini');
	var deviceName, windowMin, windowMax, orientation;
	devices.forEach(function(item) { // Se non funziona in tutti i browser usare ciclo for
		var regex = new RegExp(item,"i");
		var deviceCheck = regex.test(navigator.userAgent.toLowerCase());
		if(deviceCheck == true){
			deviceName = item;
		}
	});
	if($(window).height() < $(window).width()){
		windowMin = $(window).height();
		windowMax = $(window).width();
		orientation = 'landscape';
	} else {
		windowMax = $(window).height();
		windowMin = $(window).width();
		orientation = 'portrait';
	}
	if(!deviceName){
		deviceName = 'desktop';
		deviceCat = 'desktop';
	}
	else {
		if(windowMin < 672){ //cambiare valore?
			deviceCat = 'smartphone';
		} else {
			deviceCat = 'tablet';
		}
	}

	var deviceRatio = window.devicePixelRatio;
	var device = new Array(deviceCat,deviceName,windowMin,windowMax,orientation,deviceRatio); // deviceCat 0 - deviceName 1 - windowMin 2 - windowMax 3 - orientation 4 - deviceRatio 5
	return device;
}
