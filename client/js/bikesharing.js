var bikeSharingLayer ={
	isCached:true,
	populate: function(){   
                var self = this;
                if (self.brands == undefined)
                        self.getBikeBrands(self.retrieveStations);
	},
	getBikeBrands(callback){
		integreen.getStationDetails('Bikesharing-frontend/rest/bikes/',{},displayBrands);
                function displayBrands(data){
                        var brands = {};
                        $.each(data,function(index,value){
                                brands[value.type] = true;
                        });
                        $('.bikesharing .deselect-all').click(function(){
                                $.each(brands,function(index,value){
                                        brands[index] = false;

                                });
                                bikeSharingLayer.retrieveStations(brands);
                        });
                        if (callback != undefined)
                                callback(brands);

                }
	},
	retrieveStations : function(brands){
                $('.biketypes').empty();
                $.each(brands,function(index,value){
                        var brandClass= index.replace(/[^a-zA-Z0-9]/g,'_');
                        if (!value){
                                brandClass+=' inactive' ;
                        }
                        $('.bikesharing .biketypes').append('<li class="bikebrand '+brandClass+'"><a href="javascript:void(0)">'+index+'</a></li>');
                });
                $('.bikebrand').click(function(e){
                        var brand = $(this).text();
                        brands[brand] = !brands[brand];
                        bikeSharingLayer.retrieveStations(brands);
                });
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
				var station = e.feature.attributes.stationcode;
				$('.modal').hide();
			       	$('.bikesharingstation').show();
				integreen.retrieveData(station,"Bikesharing-frontend/rest/",getCurrentBikesharingData);
			}
		});
		function getCurrentBikesharingData(details,data){
			$('.bikesharingstation .title').text(details.name);	
                        integreen.getChildStationsData(details.id,"Bikesharing-frontend/rest/bikes/",displayCurrentState);
			function displayCurrentState(bikes){
				if (bikes && bikes.length>0){
					var catHtml;
					$('.bikesharingstation .legend').empty();
					$.each(bikes,function(key,value){
						if (key=="number available"){
							radialProgress(document.getElementById('totalAvailable'))
							.label(jsT[lang]['freeBikes'])
							.diameter(180)
							.value(currentState[key])
							.maxValue(data.bikes[key])
							.render();
						}
						else{
							var cat = key.replace(/\s/g,"_");
							radialProgress(document.getElementById(cat+'-container'))
							.diameter(78)
							.value(currentState[key])
							.maxValue(data.bikes[key])
							.render();
							$('.bikesharingstation .legend').append("<li class='"+cat+"'>"+jsT[lang][cat]+"</li>");	
						}
					});
				}else{
					$('.bikesharingstation .legend').html("<p style='color:#000'>Station out of order</p>");     
				}
			}
		}
		this.layer = positionsLayer;
		return positionsLayer;
	}
}
