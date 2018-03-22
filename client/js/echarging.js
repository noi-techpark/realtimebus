var echargingLayer = {
	isCached:true,
	getTypes : function(callback){
		var details;
		integreen.getStationDetails('EchargingFrontEnd/rest/',{},getChargingDetails);
		function getChargingDetails(data){
			details = data;
			integreen.getStationDetails('EchargingFrontEnd/rest/plugs/',{},displayBrands);
		}
		function displayBrands(data){
			var brands = {
				nothingSelected : function(){
					var selected = true;
					for (i in brands){
						if (brands[i]==true)
						selected = false;
					}
					return selected;
				}
			};
			var provider = {};
			var accessType = {};
			$.each(data,function(index,value){
				$.each(value.outlets,function(i,outlet){
					if (typeof value != 'function')
					brands[outlet.outletTypeCode] = true;
				});
			});
			$.each(details,function(index,value){
				if (value.provider)
				provider[value.provider] = true;
				if (value.accessType)
				accessType[value.accessType] = true;
			});
			$('.emobility .deselect-all').click(function(){
				var nothingSelected = brands.nothingSelected();
				if (!nothingSelected)
				$('.emobility .toggler').addClass('disabled');
				else
				$('.emobility .toggler').removeClass('disabled');
				Object.keys(accessType).forEach(function(v){accessType[v] = nothingSelected});
				Object.keys(provider).forEach(function(v){provider[v] = nothingSelected});

				$.each(brands,function(index,value){
					if (typeof value != 'function')
					brands[index] = nothingSelected;
				});
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.emobility .deselect-all').text(statusText);
				echargingLayer.retrieveStations(brands,provider,accessType);
			});
			if (callback != undefined)
			callback(brands,provider,accessType);
			$('.echargingtypes').empty();
			$('.emobility .echargingtypes').append('<li class="type-header">Plugtypes</li><hr/>');
			var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
			$('.emobility .deselect-all').text(statusText);
			var svg = '<svg width="55" height="30">'
				+       '<g>'
				+               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#f2bf00" height="24"/>'
				+               '<circle cx="34" cy="17" r="9" fill="#f2bf00" />'
				+       '</g>'
				+       'Sorry, your browser does not support inline SVG.'
				+ '</svg>';
			$.each(brands,function(index,value){
				if (typeof value == 'function')
				return true;
				$('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+escape(index)+' href="javascript:void(0)" class="toggler">'+ svg + '</a></li>');
			});
			$('.emobility .echargingtypes').append('<li class="type-header">Provider</li><hr/>');
			$.each(provider,function(index,value){
				console.log(index);
				$('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+escape(index)+' href="javascript:void(0)" class="toggler">'+ svg + '</a></li>');
			});
			$('.emobility .echargingtypes').append('<li class="type-header">AccessType</li><hr/>');
			$.each(accessType,function(index,value){
				$('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+escape(index)+' href="javascript:void(0)" class="toggler">'+ svg + '</a></li>');
			});
			$('.echargingbrand a').click(function(e){
				var brand = unescape($(this).attr("brand"));
				if (brand in brands)
					brands[brand] = !brands[brand];
				else if (brand in provider)
					provider[brand] = !provider[brand];
				else if (brand in accessType)
					accessType[brand] = !accessType[brand];
				$(this).toggleClass("disabled");
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.emobility .deselect-all').text(statusText);
				echargingLayer.retrieveStations(brands,provider,accessType);
			});
	}
},
populate: function(){
	var self = this;
	if (self.brands == undefined)
	self.getTypes(self.retrieveStations);
},
retrieveStations : function(brands,provider,accessType){
	function adaptToGeoserver(brands){
		var brandreq='\'undefined\'';
		if (brands)
		$.each(brands,function(index,value){
			if (value){
				if (brandreq != '')
				brandreq += "\\,";
				brandreq += '\''+index+'\'';
			}
		});
		return brandreq;
	}
	var brandreq = adaptToGeoserver(brands);
	var providerArray = adaptToGeoserver(provider);
	var accessTypeArray = adaptToGeoserver(accessType);
	var  params = {
		request:'GetFeature',
		typeName:'edi:Echarging',
		outputFormat:'text/javascript',
		format_options: 'callback: jsonCharging'
	};
	if (brandreq != '')
	params['viewparams']='brand:'+brandreq+';provider:'+providerArray+';accessTypes:'+accessTypeArray+';';

	$.ajax({
		url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
		dataType : 'jsonp',
		crossDomain: true,
		jsonpCallback : 'jsonCharging',
		success : function(data) {
			var features = new OpenLayers.Format.GeoJSON().read(data);
			echargingLayer.layer.removeAllFeatures();
			echargingLayer.layer.addFeatures(features);
		},
		error : function() {
			console.log('problems with data transfer');
		}
	});
},
get: function(){
	if (this.isCached && this.layer != undefined)
	return this.layer;
	var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
		externalGraphic: '${externalGraphic}',
		graphicWidth: 35,
		graphicYOffset:-35.75,
	},{
		context: {
			externalGraphic:function(feature){
				var pin= 'images/8_Echarging/marker.svg';
				if (!feature.cluster){
					var max = feature.attributes.chargingpointscount;
					var now = feature.attributes.value;
					var a = now/max;
					if (a == 0.)
					pin= 'images/8_Echarging/marker_red.svg';
					else if (a>0 && a <= 0.6)
					pin= 'images/8_Echarging/marker_orange.svg';
					else if (a>=0.6)
					pin= 'images/8_Echarging/marker_green.svg';
				}
				return pin;
			}
		}
	}));

	var positionsLayer = new OpenLayers.Layer.Vector("echargingLayer", {
		styleMap: styleMap,
		strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
	});
	positionsLayer.events.on({
		"featureselected":function(e){
			if (!e.feature.cluster){
				var station = e.feature.attributes.stationcode;
				integreen.retrieveData(station,"EchargingFrontEnd/rest/",displayData);
			}
			else{
				var cluster = e.feature.cluster;
				var allTheSame = true;
				var firstElement = cluster[0];
				for(i=1;i<cluster.length;i++){
					if (firstElement.geometry.x != cluster[i].geometry.x || firstElement.geometry.y != cluster[i].geometry.y){
						allTheSame = false;
						break;
					}
				}
				if (!allTheSame){
					var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
					vectors.addFeatures(cluster);
					var dataExtent = vectors.getDataExtent();
					SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
					SASABus.map.zoomToExtent(dataExtent);
				}else
					displayFeatureInfo(cluster);
			}
		}
	});
	function displayFeatureInfo(cluster){
		$('.station .title').html('Found multiple charging points');
		var html = '<div class="info"><ul></ul></div>'
		$('.station .content').html(html);
		cluster.forEach(function(value,index){
			var id = value.id;
			$('.station .content .info ul').append('<li><a href="javascript:void(0)" class="echargingpointd'+id+'">'+value.attributes.stationname+'</a></li>');

			$('.station .content ul .echargingpointd'+id).click(function(){
				integreen.retrieveData(value.attributes.stationcode,"EchargingFrontEnd/rest/",displayData);
			});

		});
		$('.station').show();

	}
	this.layer = positionsLayer;
	return positionsLayer;

	function displayData(details,state){
		var updatedOn = moment(state['number-available'].timestamp).locale(lang).format('lll');
		$('.station .title').html("<small>Station name: </small>"+details.name.replace("CU_","")+"<br/><small>Operator:</small> "+details.provider+"<br/><small>"+updatedOn+"</small>");
		if (details.state == 'FAULT' || details.state == 'UNAVAILABLE'){
			$(".content").html('<h3>'+jsT[lang].outOfOrder+'</h3><div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>');
			$('.station .backtomap.ibutton').click(function(){
				$('.modal').hide();
			});
			$('.modal').hide();
			$('.station').show();
			return;
		}
		var html = "";
		html+="<div class='number-available'></div>";
		html+="<div class='caption'>"+jsT[lang].freeCharger+"</div><hr/>";
		if (details.address)
		html+='<div class="info address"><a title="Routing by Google" href="https://maps.google.com?saddr=Current+Location&mode=driving&daddr='+details.latitude+","+details.longitude+'" target="_blank">'+details.address+"</a></div>";
		if (details.accessType)
		html+='<div class="info">'+details.accessType+'</div>';
		if (details.categories && details.categories.length>0)
		html+='<div class="info">'+details.categories.join(', ')+'</div>';
		if (details.accessInfo && !details.flashInfo)
		html += "<div class='info'><img src='images/8_Echarging/online.svg' width='30px'/><span>"+jsT[lang].chargerOnline+"</span><p>" + details.accessInfo+"</p></div><hr/>";
		else if (details.flashInfo)
		html += "<div class='info'><img src='images/8_Echarging/maintanance.svg' width='30px'/><span>"+details.flashInfo+"</span></div>";
		if (details.paymentInfo)
		html+='<div><a href="' + details.paymentInfo + '" target="_blank" class="backtomap ibutton" ><div>'+jsT[lang].paymentInfo+'</div></a></div>';
		if (details.reservable)
		html+='<div><a href="' + details.paymentInfo + '" target="_blank" class="backtomap ibutton" ><div>'+jsT[lang].book+'</div></a></div>';
		html += "</div>";
		html+='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>';
		integreen.getChildStationsData(details.id,"EchargingFrontEnd/rest/plugs/",displayPlugs);
		function displayPlugs (children){
			$.each(children,function(index,value){
				var plugState = value.newestRecord;
				var plugDetails = value.detail;
				var state = plugState['echarging-plug-status'].value;
				if (state == 1)
				plugColor='#8faf30';
				else if(state == 2 || state == 3)
				plugColor = '#f28e1e';
				else
				plugColor = '#e81c24';
				html += "<div class='plug clearfix'>"
				+"<h4><svg height='20' width='20'><circle cx='10' cy='10' r='10' fill='" + plugColor + "'></circle></svg>" + jsT[lang].charger + " "+(index+1)+"</h4>";
				$.each(value.detail.outlets,function(i,outlet){
					html += "<div class='clearfix outlet'><img src='http://service.aewnet.eu/e-mobility/api/v2/images/outlettypes/"+ outlet.outletTypeCode+"' alt='Plug image not available'/>"
					+"<p>"+outlet.outletTypeCode +" | "
					+ outlet.minCurrent + " - " + outlet.maxCurrent+" A | "
					+ outlet.maxPower +" W </p></div>";
				});
				html += "</div>"
			});
			$('.station .content').html(html);
			if (state['number-available'].value == details.capacity)
			$('.station .number-available').addClass("free");
			radialProgress($('.station .number-available')[0])
			.diameter(180)
			.value(state['number-available'].value)
			.maxValue(details.capacity)
			.render();

			$('.modal').hide();
			$('.station .backtomap.ibutton').click(function(){
				$('.modal').hide();
			});
			$('.station').show();
		}
	}
}
}
