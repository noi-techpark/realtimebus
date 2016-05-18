var myroutes;
var routesLayer = {
	isCached : false,
	get :function (){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
		this.layer = SASABus.map.getLayersByName("routes");
		return this.layer;
	}
}
var zugangLayer = {
	isCached : false,
	get :function (){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
		this.layer = SASABus.map.getLayersByName("zugang");
		return this.layer;
	}
}
var artPoints = {
	isCached: true,
	get : function(){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
		var styleMap = new OpenLayers.StyleMap({
                	externalGraphic: 'images/Themenwege/parcours_bueste.svg',
                        graphicWidth: 35,
                        graphicYOffset:-35.75
                });
                var point = new OpenLayers.Geometry.Point(1242010.4917555, 5888330.0435492);
                var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
                var vectorLayer = new OpenLayers.Layer.Vector("artLayer",{
                	styleMap:styleMap
                });
                vectorLayer.addFeatures([pointFeature]);
                vectorLayer.events.on({
                	"featureselected":function(e){
                        	$(".modal").hide();
                                $("#artModal").show();
                        }
                });
		this.layer = vectorLayer;
                return this.layer;		
	}
}
var wegeStartPointsLayer = {
	isCached : true,
	get : function(){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
        	var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
            		externalGraphic: '${externalGraphic}',
            		graphicWidth: 35,
            		graphicYOffset:-35.75,
        	},{
            		context: {
                		externalGraphic:function(feature){
                        		var pin= 'images/4_Piedi/Pin.svg';
		                        if (feature.cluster){
        		                        if (feature.cluster.length>5)
                		                        pin = 'images/4_Piedi/Pin_5+.png';
                        		        else
                                		        pin = 'images/4_Piedi/Pin_'+feature.cluster.length+'.png';
		                        }
        		                return pin;
                		}
	            	}
        	}));
        	var positionsLayer = new OpenLayers.Layer.Vector("wegeStartPointsLayer", {
            		strategies: [new OpenLayers.Strategy.Fixed(),new OpenLayers.Strategy.Cluster({distance: 40,threshold: 3})],
            		protocol: new OpenLayers.Protocol.Script({
                		url: SASABus.config.apiediEndPoint+"/startPoints"
            		}),
            		styleMap: styleMap,
        	});
        	positionsLayer.events.on({
                	"featureselected":function(e){
                        	if (!e.feature.cluster){
                                	var id = e.feature.attributes['id'];
	                                wegeStartPointsLayer.getRouteProfile(id);
        	                }
                	},
                	"featureunselected":function(e){
                        	if (!e.feature.cluster){
                                	var id = e.feature.attributes['id'];
                                	wegeStartPointsLayer.getRouteProfile(id);
	                        }
        	        }
	        });
		this.layer = positionsLayer;
                return this.layer;
				
		function getArtAndNature(){
        		var styleMap = {
            			externalGraphic: 'images/Themenwege/parcours_kunst.svg',
            			graphicWidth: 35,
            			graphicYOffset:-35.75
        		};
        		var a4 = new OpenLayers.Geometry.Point(1242745.4729163,5888025.5994863);
        		var a10 = new OpenLayers.Geometry.Point(1242530.8030306,5888901.4926254);
        		var a11 = new OpenLayers.Geometry.Point(1242887.9016938,5888797.5916185);
		        var a12 = new OpenLayers.Geometry.Point(1243162.2935862,5888651.4276554);
		        var a9 = new OpenLayers.Geometry.Point(1243393.9933282,5888649.0389983);
		        var a8 = new OpenLayers.Geometry.Point(1243370.1067568,5888601.2658556);
		        var a7 = new OpenLayers.Geometry.Point(1243225.5930002,5888277.602814);
		        var a6 = new OpenLayers.Geometry.Point(1242826.8587081307,5888218.633061022);
		        var a5 = new OpenLayers.Geometry.Point(1242808.7723304,5888164.1416001);
		        var a3 = new OpenLayers.Geometry.Point(1242740.6956021278,5888173.696228666);
		        var a13 = new OpenLayers.Geometry.Point(1242629.6230453,5888385.092385);
		        var aan = new OpenLayers.Geometry.MultiPoint([a3,a4,a5,a6,a7,a8,a9,a10,a11,a12]);
		        var pointFeature = new OpenLayers.Feature.Vector(aan, null, styleMap);
		        return pointFeature;
		}
	},
	getTappeinerZugang : function(){
        	var zugangMap = new OpenLayers.StyleMap({
               		strokeColor: 'orange',
               		strokeWidth: 5,
        	});
        	var route = new OpenLayers.Layer.Vector("zugang", {
               		strategies: [new OpenLayers.Strategy.Fixed()],
               		protocol: new OpenLayers.Protocol.HTTP({
                       		url: "kml/tappzu.kml",
                       		format: new OpenLayers.Format.KML({
                               		extractStyles: true,
                               		extractAttributes: true,
                               		maxDepth: 2
                       		})
               		}),
               		preFeatureInsert: function(feature) {
                       		feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),defaultProjection);
               		},
               		styleMap: zugangMap
        	});
        	return route;
    	},
	getSpurenEagles : function(){
        	var styleMap = {
			externalGraphic: 'images/Themenwege/parcours_adler.svg',
		        graphicWidth: 35,
		        graphicYOffset:-35.75
		};
		var a1 = new OpenLayers.Geometry.Point(1242547.1976388, 5888946.4435471);
		var a2 = new OpenLayers.Geometry.Point(1242807.5612664, 5888848.5086046);
		var a3 = new OpenLayers.Geometry.Point(1242830.2535091, 5888830.5936761);
		var a4 = new OpenLayers.Geometry.Point(1242940.1317373, 5888761.3226192);
		var a5 = new OpenLayers.Geometry.Point(1243299.6246359, 5888601.2825912);
		var a6 = new OpenLayers.Geometry.Point(1243254.2457289, 5888547.5322271);
		var adler = new OpenLayers.Geometry.MultiPoint([a1,a2,a3,a4,a5,a6]);
		var pointFeature = new OpenLayers.Feature.Vector(adler, null, styleMap);
		return pointFeature;
	},
	getArtPoints :function(){
	        var styleMap = new OpenLayers.StyleMap({
			externalGraphic: 'images/Themenwege/parcours_bueste.svg',
        		graphicWidth: 35,
		        graphicYOffset:-35.75
		});
		var point = new OpenLayers.Geometry.Point(1242010.4917555, 5888330.0435492);
		var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
		var vectorLayer = new OpenLayers.Layer.Vector("artLayer",{
                	styleMap:styleMap
		});
		vectorLayer.addFeatures([pointFeature]);
		vectorLayer.events.on({
			"featureselected":function(e){
	                	$(".modal").hide();
                        	$("#artModal").show();
	                }
        	});
        	return vectorLayer;
    	},
	getRoutes: function(){
        		var theme,hike;
        		function displayRoutesList(){
        	        	var list = '';
	                	hike = $("#hike").hasClass("disabled");
                		theme = $("#theme").hasClass("disabled");
                		var sortedroutes = myroutes.sort(function(obj1, obj2) {
        	                	var f = obj1.displayName[lang].toLowerCase();
	                        	var s = obj2.displayName[lang].toLowerCase();
	                        	return ((f < s) ? -1 : ((f > s) ? 1 : 0));;
        	        	});
                		$.each(sortedroutes,function(index,value){
        	                	if ((theme != false && value.type=="themenweg")||(hike != false && value.type=="wanderweg"))
	                                	return true;
	                        	list+='<a href="#" title=""  id="'+value.id+'"class="list-route"><li>';
        	        	        list+='<h4>'+value.displayName[lang]+'</h4>';
                		        list+='<div class="metadata clearfix">';
        	                	list+='<div class="time">'+moment.duration(value.data,'seconds').humanize()+'</div>';
		                        list+='<div class="distance">'+(Math.round(value.distance)/1000).toString().replace('.',',')+' km </div>';
        	                	list+='<div class="drop">'+Math.round(value.altitude)+' hm </div>';
                		        list+='<div class="kcal"> '+value.kcal+' kCal</div>';
                	        	list+='</div>';
		                        list+='</li></a>';
	        	        });
                		$(".walking .routes-list").html(list);
	        	        $(".walking").height($( window ).height()-$("#header").outerHeight());
        		        $(".list-route").click(function(){
	                	        var id = $(this).attr("id");
                        		wegeStartPointsLayer.getRouteProfile(id);
	                	});
        		}
        		function loadRoutes(url){
                		$.ajax({
        	            		type: 'GET',
	                    		crossDomain: true,
                    			url: url,
		        	            dataType: 'json',
                			    success: function(response, status, xhr) {
				                    myroutes = response;
	                        		    displayRoutesList();
        	            	           },
	                    		   error: function(xhr, status, error) {
                        	   		console.log(error);
                    			   }
                		});
        		}
		        var url = SASABus.config.apiediEndPoint+"/get-routes";
       			if (myroutes== undefined){
                  		$(".walking .main-config .toggler").click(function(evt){
                         		$(this).toggleClass("disabled");
	                        	displayRoutesList();
        	        	});
		                loadRoutes(url);
			}
        		else
                		displayRoutesList();
	},
	addRouteLayer : function(obj){
		var coordinates=obj.data.route.path.coordinates
		var pointList = [];
		$.each(coordinates,function(index,value){
        		var point = new OpenLayers.Geometry.Point(value.coordinate[0],value.coordinate[1]);
        		pointList.push(point);
		});
		var styleMap = {
        		strokeColor: '#d35400',
        		strokeWidth: 6,
		};
		var lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList),null,styleMap);
		var vectorLayer = new OpenLayers.Layer.Vector("routes");
		vectorLayer.addFeatures([lineFeature]);
		var zugang = SASABus.map.getLayersByName("zugang");
		removeLayers(zugang);
		if (obj.displayName.de=='Spurenweg')
        		vectorLayer.addFeatures([wegeStartPointsLayer.getSpurenEagles()]);
		else if (obj.displayName.de.indexOf('Spring 2015')>=0)
        		vectorLayer.addFeatures([wegeStartPointsLayer.getArtAndNature()]);
		else if (obj.displayName.de.indexOf('Tappeiner')>=0)
        		SASABus.map.addLayer(wegeStartPointsLayer.getTappeinerZugang());
		var layers =SASABus.map.getLayersByName("routes");
		removeLayers(layers);
		SASABus.map.addLayer(vectorLayer);
		SASABus.map.zoomToExtent(vectorLayer.getDataExtent());
		function removeLayers(layers){
        		$.each(layers,function(index,layer){
				SASABus.map.removeLayer(layer);
				layer.removeAllFeatures();
			});
		}
	},
	getRouteProfile : function(route){
		$.ajax({
    			type: 'GET',
    			crossDomain: true,
    			url: SASABus.config.apiediEndPoint+"/get-route?route="+route,
    			dataType: 'json',
    			success: function(response, status, xhr) {
        			displayRouteMetaData(response);
        			wegeStartPointsLayer.addRouteLayer(response);
    			},
    			error: function(xhr, status, error) {
        			console.log(error);
    			}
		});

		function drawRoutProfileAsArea(obj){
          		var visualization = new google.visualization.AreaChart(document.getElementById('highChart'));
          		visualization.draw(dataTable,options);
		}
		function drawRouteProfile(obj){
        		var chart = new google.visualization.LineChart(document.getElementById('highChart'));
        		var options = {
          			title: jsT[lang].altitudep,
          			curveType: 'function',
          			legend: { position: 'bottom' },
          			width:'100%',
          			height: '100%',
          			backgroundColor:'none',
          			vAxis: {
            				gridlines: {
                				color: 'transparent'
            				}
          			},
          			hAxis: {
            				ticks:'none',
            				gridlines: {
                				color: 'transparent'
            				}
          			},
          			colors:['#ce5400']
        		};
        		var dataArray =[['Distance',jsT[lang].altitude]];
        		$.each(obj.data.route.altitude_profile,function(index,value){
                		var valueArray = [];
                		valueArray[0] = value.distance;
                		valueArray[1] = value.altitude;
                		dataArray.push(valueArray);
        		});
        		var data = google.visualization.arrayToDataTable(dataArray);
        		chart.draw(data,options);
		}
		function displayRouteMetaData(obj){
        		$('.walk-route .title').html("<h3>"+obj.displayName[lang]+"</h3>");
        		$('.walk-route .metadata .time').text(moment.duration(obj.data.route.time,'seconds').humanize());
        		$('.walk-route .metadata .distance').text((Math.round(obj.data.route.distance)/1000).toString().replace('.',',') +' km');//obj.data.route.altitude_profile[obj.data.route.altitude_profile.length-1].distance
        		$('.walk-route .metadata .drop').text(Math.round(obj.data.route.pos_altitude_difference) +' hm');
        		$('.walk-route .metadata .kcal').text(obj.kcal+' kCal');
        		$('.walk-route a.more').attr('href',obj.url);
        		drawRouteProfile(obj);
        		$('.modal').hide();
        		$('.walk-route').show();
        		google.setOnLoadCallback(drawRouteProfile(obj));
		};
	}
}
