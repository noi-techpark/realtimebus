var carSharingLayer = {
	isCached:true,
	populate: function(){   
                var self = this;
		var  params = {
		        request:'GetFeature',
		        typeName:'edi:Carsharing',
		        outputFormat:'text/javascript',
		        format_options: 'callback: carJson'
		};
		$.ajax({
			url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
			dataType : 'jsonp',
			crossDomain: true,
			jsonpCallback : 'carJson',
			success : function(data) {
				var features = new OpenLayers.Format.GeoJSON().read(data);
				self.layer.addFeatures(features);
			},
			error : function() {
				console.log('problems with data transfer');
			}		
		});
                
	},
 	get:function(){
		if (this.isCached && this.layer != undefined)
			return this.layer;
		var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
			externalGraphic: '${externalGraphic}',
			graphicWidth: 35,
			graphicYOffset:-35.75,
		},{
			context: {
				externalGraphic:function(feature){
		        		var pin= 'images/6_Car_sharing/marker.svg';
					if (!feature.cluster){
						var max = feature.attributes.parking;
						var now = feature.attributes.value;
						var a = now/max;
						if (a == 0.)
			        			pin= 'images/6_Car_sharing/marker_red.svg';
						else if (a>0 && a <= 0.6)
				        		pin= 'images/6_Car_sharing/marker_orange.svg';
						else if (a>=0.6)	
				        		pin= 'images/6_Car_sharing/marker_green.svg';
					}
				        return pin;
				}
			}
		}));

		var positionsLayer = new OpenLayers.Layer.Vector("carStationsLayer", {
			strategies: [new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})],
			styleMap: styleMap,
		});
		positionsLayer.events.on({
	       		"featureselected":function(e){
				if (!e.feature.cluster){
					var station = e.feature.attributes.stationcode;
					integreen.retrieveData(station,"carsharingFrontEnd/rest/",getCarsharingStation);
				}
			}
		});
		function getCarsharingStation(details,current){
			radialProgress($(".carsharingstation .number-available")[0])
				.diameter(180)
				.value(current['number available'].value)
				.maxValue(details.availableVehicles)
				.render();
			integreen.getChildStationsData(details.id,"carsharingFrontEnd/rest/cars/",displayCarsharingData);
			function getAmountByBrand(children){
				var amountByBrand = {};
				$.each(children,function(index,value){
					var brand = value.detail.brand;
					if (amountByBrand[brand] == undefined){
						amountByBrand[brand]={
							total: 0,
							current:0
						}
					}
					amountByBrand[brand].total = amountByBrand[brand].total+1;		
					if (value.newestRecord['vehicle availability'].value == 0)
						amountByBrand[brand].current=amountByBrand[brand].current +1;
				});	
				return amountByBrand;
			}
			function displayCarsharingData(children){
				var numbersByBrand = getAmountByBrand(children)
				$('.carsharingstation .car-categorys').empty();
				$('.carsharingstation .legend').empty();
				$('.modal').hide();
	       			$('.carsharingstation').show();
				for (brand in numbersByBrand){
					var brandClass= brand.replace(/[^a-zA-Z0-9]/g,'_');
					$('.carsharingstation .car-categorys').append("<div class='"+brandClass+"'></div>");
					radialProgress($('.carsharingstation .car-categorys .'+brandClass)[0])
		                		 .diameter(76)
			                         .value(numbersByBrand[brand].current)
				                 .maxValue(numbersByBrand[brand].total)
				                 .render();
		        		$('.carsharingstation .legend').append("<li class='"+brandClass+"'>"+brand+"</li>");
				}
				$('.carsharingstation .title').text(details.name);	
				$('.carsharingstation .caption').text(jsT[lang]['freeCars']);	
			}
		};
		this.layer = positionsLayer;
		return this.layer;
	}
}
