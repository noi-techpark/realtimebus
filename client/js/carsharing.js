var carSharingLayer = {
	isCached:true,
	getCarBrands : function(callback){
		integreen.getStationDetails('carsharingFrontEnd/rest/cars/',{},displayBrands);
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
			$.each(data,function(index,value){
				brands[value.brand] = true;
			});
			$('.cartypes').empty();
				$.each(brands,function(index,value){
				if (typeof value == 'function')
					return true;
				var brandClass= index.replace(/[^a-zA-Z0-9]/g,'_');
				$('.carsharing .cartypes').append('<li class="clearfix"><p>' + index + '</p><a href="javascript:void(0)" brand="'+index+'" class="statuswidget toggler">'
                	        +'<svg width="55" height="30">'
                        	+	'<g>'
	                        +       	'<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#8aaa30" height="24"/>'
        	                +               '<circle cx="34" cy="17" r="9" fill="#8aaa30" />'
                	        +       '</g>'
                        	+       'Sorry, your browser does not support inline SVG.'
	                        + '</svg>'
				+ '</a></li>');
			});
			var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
			$('.carsharing .deselect-all').text(statusText);
			$('.carsharing .toggler').click(function(e){
				var brand = $(this).attr('brand');
				brands[brand] = !brands[brand];
				$(this).toggleClass('disabled');
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.carsharing .deselect-all').text(statusText);
				carSharingLayer.retrieveStations(brands);
			});
			$('.carsharing .deselect-all').click(function(){
				var nothingSelected = brands.nothingSelected();
				if (!nothingSelected)
					$('.carsharing .toggler').addClass('disabled');
				else
					$('.carsharing .toggler').removeClass('disabled');
				$.each(brands,function(index,value){
					if (typeof(value)!='function')
	                	        	brands[index] = nothingSelected;
        	                });
				var statusText = !nothingSelected ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.carsharing .deselect-all').text(statusText);
				carSharingLayer.retrieveStations(brands);
			});
			if (callback != undefined)
				callback(brands);
		}
	},
	populate: function(){
                var self = this;
		if (self.brands == undefined)
			self.getCarBrands(self.retrieveStations);
	},
	retrieveStations : function(brands){
		var brandreq='';
		$.each(brands,function(index,value){
			if (value){
				if (brandreq != '')
					brandreq += "\\,";
				brandreq += '\''+index+'\'';
			}
		});
		var  params = {
			request:'GetFeature',
			typeName:'edi:Carsharing',
			outputFormat:'text/javascript',
			format_options: 'callback: carJson'
		};
		if (brandreq != '')
			params['viewparams']='brand:'+brandreq;
		$.ajax({
			url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
			dataType : 'jsonp',
			crossDomain: true,
			jsonpCallback : 'carJson',
			success : function(data) {
				var features = new OpenLayers.Format.GeoJSON().read(data);
				carSharingLayer.layer.removeAllFeatures();
				carSharingLayer.layer.addFeatures(features);
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
			var updatedOn = moment(current['number-available'].timestamp).locale(lang).format('lll');
			$('.carsharingstation>.walk-container>.number-available').removeClass("free");
                        if  (current['number-available'].value == details.availableVehicles)
				$('.carsharingstation>.walk-container>.number-available').addClass("free");

			radialProgress($(".carsharingstation .number-available")[0])
				.diameter(180)
				.value(current['number-available'].value)
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
					if (value.newestRecord['availability'].value == 0)
						amountByBrand[brand].current=amountByBrand[brand].current +1;
				});
				return amountByBrand;
			}
			function displayCarsharingData(children){
				var numbersByBrand = getAmountByBrand(children);
				$('.carsharingstation .car-categorys').empty();
				$('.carsharingstation .legend').empty();
				$('.modal').hide();
	       			$('.carsharingstation').show();
				for (brand in numbersByBrand){
					var brandClass= brand.replace(/[^a-zA-Z0-9]/g,'_');
		        		$('.carsharingstation .legend').append("<li class='car-categorys number-available clearfix'><div class='"+brandClass+"'></div><span>"+brand+"</span></li>");
					$('.car-categorys .'+brandClass).removeClass("free");
					if (numbersByBrand[brand].current === numbersByBrand[brand].total)
						$('.car-categorys .' + brandClass).addClass("free");
					radialProgress($('.car-categorys.number-available .'+brandClass)[0])
		                		 .diameter(76)
			                         .value(numbersByBrand[brand].current)
				                 .maxValue(numbersByBrand[brand].total)
				                 .render();
				}
				$('.carsharingstation .title').html(details.name+"<br/><small>"+updatedOn+"</small>");
				$('.carsharingstation .caption').text(jsT[lang]['freeCars']);
			}
		};
		this.layer = positionsLayer;
		return this.layer;
	}
}
