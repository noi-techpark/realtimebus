var bikeSharingLayer ={
	isCached:true,
	populate: function(){   
                var self = this;
                if (self.brands == undefined)
                        self.getBikeBrands(self.retrieveStations);
	},
	getBikeBrands(callback){
		integreen.getStationDetails('bikesharingFrontEnd/rest/bikes/',{},displayBrands);
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
                                brands[value.type] = true;
                        });
	                $.each(brands,function(index,value){
				if (typeof value == 'function')
                                        return true;
        	                var brandClass= index.replace(/[^a-zA-Z0-9]/g,'_');
        	                $('.bike .biketypes').append('<li class="bikebrand clearfix"><p>'+jsT[lang][index.split("-").join("_")]+'</p><a brand='+index+' href="javascript:void(0)" class="toggler">'
				+'<svg width="55" height="30">'
                                +       '<g>'
                                +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#bb392b" height="24"/>'
                                +               '<circle cx="34" cy="17" r="9" fill="#bb392b" />'
                                +       '</g>'
                                +       'Sorry, your browser does not support inline SVG.'
                                + '</svg>'
                                + '</a></li>');

                	});
			var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
	                $('.bike .deselect-all').text(statusText);
                	$('.bikebrand a.toggler').click(function(e){
                        	var brand = $(this).attr("brand");
	                        brands[brand] = !brands[brand];
				$(this).toggleClass("disabled");
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
		                $('.bike .deselect-all').text(statusText);
                	        bikeSharingLayer.retrieveStations(brands);
	                });
                        $('.bike .deselect-all').click(function(){
	                        var nothingSelected = brands.nothingSelected();
				if (!nothingSelected)
                                        $('.bike .toggler').addClass('disabled');
                                else
                                        $('.bike .toggler').removeClass('disabled');

                                $.each(brands,function(index,value){
					if (typeof(value)!='function')
	                                        brands[index] = nothingSelected;
                                });
				var statusText = !nothingSelected ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
		                $('.bike .deselect-all').text(statusText);
                                bikeSharingLayer.retrieveStations(brands);
                        });
                        if (callback != undefined)
                                callback(brands);

                }
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
                        typeName:'edi:Bikesharing',
                        outputFormat:'text/javascript',
                        format_options: 'callback: getJson'
                };
                if (brandreq != '')
                        params['viewparams']='brand:'+brandreq;
                $.ajax({
                        url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
                        dataType : 'jsonp',
                        crossDomain: true,
                        jsonpCallback : 'getJson',
                        success : function(data) {
                                var features = new OpenLayers.Format.GeoJSON().read(data);
                                bikeSharingLayer.layer.removeAllFeatures();
                                bikeSharingLayer.layer.addFeatures(features);
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
		                var pin= 'images/5_Bike/marker.svg';
				if (!feature.cluster){
					var max = feature.attributes.max_available;
					var now = feature.attributes.value;
					var a = now/max;
					if (a == 0.)
		        	        	pin= 'images/5_Bike/marker_red.svg';
					else if (a < 0.6 && a > 0)
			                	pin= 'images/5_Bike/marker_orange.svg';
					else if (a>=0.6)
		                		pin= 'images/5_Bike/marker_green.svg';
				}
		                return pin;
		        }
		    }
		}));

		var positionsLayer = new OpenLayers.Layer.Vector("bikeStationsLayer", {
			styleMap: styleMap,
			strategies:[new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})]
		});
		positionsLayer.events.on({
		       	"featureselected":function(e){
				if (!e.feature.cluster){
					var station = e.feature.attributes.stationcode;
					$('.modal').hide();
				       	$('.bikesharingstation').show();
					integreen.retrieveData(station,"bikesharingFrontEnd/rest/",getCurrentBikesharingData);
				}
			}
		});
		function getCurrentBikesharingData(details,data){
			var updatedOn = moment(data['number-available'].timestamp).locale(lang).format('lll');
			$('.bikesharingstation .title').html(details.name+"<br/><small>"+updatedOn+"</small>");
              		$('.bikesharingstation #totalAvailable').empty();
			$('.bikesharingstation .legend').empty();
			$('.bike-categorys').empty();
			var config={
				types:[["availability","","Indicates if a vehicle is available for rental","300"]]
			}
                        integreen.getChildStationsData(details.id,"bikesharingFrontEnd/rest/bikes/",displayCurrentState,config);
			function displayCurrentState(bikes){
				if (bikes && bikes.length>0){
					var catHtml;
					var bikesByBrand = getAmountByBrand(bikes);
					$.each(bikesByBrand,function(key,value){
						var cat = key.split("-").join("_");
						if (key=="numberAvailable"){
							radialProgress(document.getElementById('totalAvailable'))
							.diameter(180)
							.value(value.current)
							.maxValue(details.bikes['number-available'])
							.render();
						$('.bikesharingstation #totalAvailable').removeClass("free");
			                        if  (details.bikes['number-available'] == value.current)
                        			        $('.bikesharingstation #totalAvailable').addClass("free");
						}
						else{
							var html ='<div class="clearfix">'
		                                                +'<div id="'+cat+'-container" class="number-available"></div>'
	                                                	+'<span></span>'
        	                                	+'</div>';
							$('.bike-categorys').append(html);
							radialProgress(document.getElementById(cat+'-container'))
							.diameter(78)
							.value(value.current)
							.maxValue(details.bikes[key])
							.render();
							$('#'+cat+'-container').next().text(jsT[lang][cat]);	
							$('#'+cat+'-container').removeClass("free");
					                        if  (value.current == details.bikes[key])
                                					$('#'+cat+'-container').addClass("free");
						}
					});
					$('.bikesharingstation .caption').text(jsT[lang]['freeBikes']);
				}else{
					$('.bikesharingstation .legend').html("<p style='color:#000'>Station out of order</p>");     
				}
			}
			function getAmountByBrand(children){
                                var amountByBrand = {numberAvailable:{current:0}};
                                $.each(children,function(index,value){
                                        var brand = value.detail.type;
                                        if (amountByBrand[brand] == undefined){
                                                amountByBrand[brand]={
                                                        current:0
                                                }
		
                                        }
                                        amountByBrand[brand].total = amountByBrand[brand].total+1;
                                        if (value.newestRecord['availability'].value == 0){
                                                amountByBrand[brand].current=amountByBrand[brand].current +1;
						amountByBrand['numberAvailable']['current']+=1;
					}
                                });
                                return amountByBrand;
                        }

		}
		this.layer = positionsLayer;
		return positionsLayer;
	}
}
