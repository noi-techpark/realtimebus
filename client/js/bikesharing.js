var bikeSharingLayer ={
	isCached:true,
	populate: function(){   
                var self = this;
		var  params = {
                                request:'GetFeature',
                                typeName:'edi:Bikesharing',
                                outputFormat:'text/javascript',
                                format_options: 'callback: getJson'
                };
                $.ajax({
                        url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
                        dataType : 'jsonp',
                        crossDomain: true,
                        jsonpCallback : 'getJson',
                        success : function(data) {
                                var features = new OpenLayers.Format.GeoJSON().read(data);
                                self.layer.addFeatures(features);
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
				getBikesharingDetails(station);
			}
		});
		function getCurrentBikesharingData(data){
			var me = this;
			var currentState = {	
			};
			$.ajax({url:SASABus.config.integreenEndPoint+'/bikesharingFrontEnd/rest/get-data-types?station='+data.id,success: function(datatypes){
				getData(datatypes);
			}});
			function getData(types){
				if (types.length==0){
					displayCurrentState();
					return;
				}
				var type = types.pop()[0];
				var params ={station:data.id,name:type,seconds:600};
				$.ajax({
					url :SASABus.config.integreenEndPoint+'/bikesharingFrontEnd/rest/get-records?'+$.param(params),
					dataType : 'json',
				      	crossDomain: true,
					success : function(result) {
						currentState[type] = result[result.length-1].value;
						getData(types);
					}
				});
			}
			function displayCurrentState(){
				$('.bikesharingstation .title').text(data.name);	
				var catHtml;
				$('.bikesharingstation .legend').empty();
				$.each(currentState,function(key,value){
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
				$('.modal').hide();
			       	$('.bikesharingstation').show();
			}
		}
		function getBikesharingDetails(station){
			var me = this;	
			$.ajax({
				url : SASABus.config.integreenEndPoint+'/bikesharingFrontEnd/rest/get-station-details',
				dataType : 'json',
			       	crossDomain: true,
				success : function(data) {
					for (i in data){
						if (data[i].id == station){
							getCurrentBikesharingData(data[i]);
						}
					}
				}
			});
		 }
		this.layer = positionsLayer;
		return positionsLayer;
	}
}
