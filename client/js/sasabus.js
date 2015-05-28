Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

var defaultProjection = new OpenLayers.Projection('EPSG:3857');
var jsT= {
	de:{
		altitudep:'Höhenprofil',
		altitude:'Höhenmeter'
	},
	it:{
		altitudep:'Profilo altimetrico',
		altitude:'Altitudine'
	},
	en:{
		altitudep:'Altitude profile',
		altitude:'Altitude'
	}

}
var epsg25832 = new OpenLayers.Projection('EPSG:25832');
var SASABus = {
    config: {
	city:'',
        r3EndPoint: 'http://realtimebus.tis.bz.it/',
	apiediEndPoint:'http://apiedi.tis.bz.it/apiedi',
        busPopupSelector: '#busPopup',
        stopPopupSelector: '#stopPopup',
        rowsLimit: 6,
        mapDivId: null,
        defaultDialogOptions: {},
        pinToDialogDistance: 47,
        pinHeight: 74,
        yOffset: 0,
        xOffset: 20
    },
    
    tpl: {
        busRow: undefined,
        busContent: undefined,
        stopRow: undefined,
        stopContent: undefined
    },

    updateBusTimeout: undefined,
    map: undefined,
    linesLayer: undefined,
    stopsLayer: undefined,
    positionLayer: undefined,
    lines: undefined,
    geolocate: undefined,
    locationLayer: undefined,
    activateSelectedThemes: function(activeThemes){
	var me = this;
	var layerMap = {
		walk:[me.wegeStartPointsLayer,me.artPoints].concat(me.map.getLayersByName("routes")),
		bus:[me.linesLayer,me.positionLayer,me.stopsLayer],
	}
	$.each(layerMap,function(key,value){				//hide all layers which are in non active Themes
		if ($.inArray(key,activeThemes) == -1){
			$.each(value,function(index,object){
				if (me.map.getLayer(object.id) != null){
					object.setVisibility(false);
				}
			});
		}
	});
	var activeLayers=[];
	activeLayers.push(me.locationLayer);
	$('.config').hide();
	$.each(activeThemes,function(index,object){		//choose Layers to activate
		$('#'+object+'-c').show();
		if (object != undefined && object.length>0){
			activeLayers = activeLayers.concat(layerMap[object]);
		}
	});
	$.each(activeLayers,function(index,object){		//add Layers or set to visible if already added
		if (me.map.getLayer(object.id) == null)
			me.map.addLayer(object);
		else
			object.setVisibility(true);
	});
        var control = new OpenLayers.Control.SelectFeature([me.wegeStartPointsLayer,me.positionLayer,me.stopsLayer]);//choose Layers which can be interacted with
        me.map.addControl(control);
        control.activate();
    }, 
    init: function(targetDivId) {
        var me = this;
        //$("<style type='text/css'> .clickable-icon{cursor:hand;} </style>").appendTo("head");
        me.config.mapDivId = targetDivId;
        
        var mapOptions = {
            projection: defaultProjection,
            controls: [new OpenLayers.Control.Attribution(), new OpenLayers.Control.Navigation()],
	    fractionalZoom: false,
	    units:'m',
            resolutions:[156543.033928041,78271.51696402048,39135.75848201023,19567.87924100512,9783.93962050256,4891.96981025128,2445.98490512564,1222.99245256282,611.49622628141,305.7481131407048,152.8740565703525,76.43702828517624,38.21851414258813,19.10925707129406,9.554628535647032,4.777314267823516,2.388657133911758,1.194328566955879,0.5971642834779395,0.29858214173896974,0.14929107086948487],

        };
        me.map = new OpenLayers.Map(targetDivId, mapOptions);
        var topoMap = new OpenLayers.Layer.TMS('topo', 'http://sdi.provincia.bz.it/geoserver/gwc/service/tms/',{
            'layername': 'WMTS_OF2011_APB-PAB', 
            'type': 'png8',
            visibility: true,
            opacity: 0.75,
            attribution: '',
	    numZoomLevels: 18

        });
	function osm_getTileURL(bounds) {
            var res = me.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var limit = Math.pow(2, z);

            if (y < 0 || y >= limit) {
                return OpenLayers.Util.getImagesLocation() + "404.png";
            } else {
                x = ((x % limit) + limit) % limit;
                return this.url + z + "/" + x + "/" + y + "." + this.type;
            }
        }
        var osm = new OpenLayers.Layer.TMS(
                "OSM",
                "http://otile1.mqcdn.com/tiles/1.0.0/map/",
                { type: 'png', getURL: osm_getTileURL,
                  maxResolution: 156543.0339, projection: defaultProjection, numZoomLevels: 19
                }
        ); 
        me.linesLayer = new OpenLayers.Layer.WMS('SASA Linee', me.config.r3EndPoint + 'ogc/wms', {layers: 0, transparent: true,isBaseLayer:false}, {projection:defaultProjection,visibility: true, singleTile: true});
        //if(permalink) attiva le linee del permalink
        
        // if(permalink) map.zoomToExtent(extentDelPermalink);
        // else...
        
	me.routes = [];
        me.stopsLayer = me.getStopsLayer();
	me.wegeStartPointsLayer = me.getWegeStartPoints(); 
        me.positionLayer = me.getBusPositionLayer();
	me.artPoints = me.getArtPoints();
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 20,
            externalGraphic: 'images/pin.png'
        });
        me.locationLayer = new OpenLayers.Layer.Vector('Geolocation layer', {
            styleMap: styleMap
        });
        me.map.addLayers([osm,topoMap]);

        
        var merano = new OpenLayers.Bounds(662500, 5169000, 667600, 5174000).transform(epsg25832,defaultProjection);
        me.map.zoomToExtent(merano);
        me.showLines(['all']);
        
        setTimeout(function() {
            $('#zoomInButton').click(function(event) {
                event.preventDefault();

                me.map.zoomIn();
            });
            $('#zoomOutButton').click(function(event) {
                event.preventDefault();
                
                me.map.zoomOut();
            });
            $('#zoomToMyPosition').click(function(event) {
                event.preventDefault();
                
                me.zoomToCurrentPosition();
            });
            me.stopsLayer.setVisibility(true);
	    $('#switcheroo').click(function(event){
		if (me.map.baseLayer == osm){
			me.map.setBaseLayer(topoMap);
			$('#switcheroo').text('OSM');
		}
		else{
			me.map.setBaseLayer(osm);
			$('#switcheroo').text('EARTH');
		}
	    });

        }, 2500);
    },
    addRouteLayer : function(obj){
	var coordinates=obj.data.route.path.coordinates
	var me = this;
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
	if (obj.displayName.de=='Spurenweg')
		vectorLayer.addFeatures([me.getSpurenEagles()]);
	else if (obj.displayName.de.indexOf('Spring 2015')>0)
		vectorLayer.addFeatures([me.getArtAndNature()]);
	var layers =me.map.getLayersByName("routes");
	if (layers.length>0)
		me.map.removeLayer(layers[0]);
	//me.wegeStartPointsLayer.setVisibility(false); //to remove all start Points on route selection
	me.map.addLayer(vectorLayer);
	me.routes = layers;
	me.map.zoomToExtent(vectorLayer.getDataExtent());
    },
    /*addKMLLayer : function (layer){
		var me = this;
        	var styleMap = new OpenLayers.StyleMap({
        	    strokeColor: '#d35400',
	            strokeWidth: 6,
        	    
	        });
		var route = new OpenLayers.Layer.Vector("KML", {
	        	strategies: [new OpenLayers.Strategy.Fixed()],
	        	protocol: new OpenLayers.Protocol.HTTP({
        	        	url: "kml/"+layer+".kml",
	                	format: new OpenLayers.Format.KML({
        	        	extractStyles: true, 
                	 	extractAttributes: true,
                 		maxDepth: 2
	                	})
            		}),
		    	preFeatureInsert: function(feature) {
        	    		feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),defaultProjection);
            		},
			styleMap: styleMap
			
        	});
		var kmllayers =me.map.getLayersByName("KML");
		if (kmllayers.length>0)
			me.map.removeLayer(kmllayers[0]);
		me.map.addLayer(route);
		me.map.setLayerIndex(route,1);
    },*/
    getArtPoints : function(){
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
	return vectorLayer;
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
    getArtAndNature : function(){
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
    },
    getRoutes : function(){
	var me =this;
	var theme,hike;
	function displayRoutesList(){
		var list = '';
		hike = $("#hike").hasClass("enabled");
		theme = $("#theme").hasClass("enabled");
		var sortedroutes = me.myroutes.sort(function(obj1, obj2) {
			var f = obj1.displayName[lang].toLowerCase();
			var s = obj2.displayName[lang].toLowerCase();
			return ((f < s) ? -1 : ((f > s) ? 1 : 0));;	
		}); 
		$.each(sortedroutes,function(index,value){
			if ((theme == false && value.type=="themenweg")||(hike==false && value.type=="wanderweg"))
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
		$(".walk .routes-list").html(list);
		$(".walk").height($( window ).height()-$("#header").outerHeight());	
		$(".list-route").click(function(){
			var id = $(this).attr("id");
		 	me.getRouteProfile(id);
		});
	}
	function loadRoutes(url){
		$.ajax({
	            type: 'GET',
        	    crossDomain: true,
	            url: url,
        	    dataType: 'json',
	            success: function(response, status, xhr) {
			me.myroutes=response;
			displayRoutesList();	
			$(".main-config .toggler").click(function(evt){
				$(this).toggleClass("enabled");
				displayRoutesList();
			});
	            },
        	    error: function(xhr, status, error) {
                	console.log(error);
	            }
        	});	
	}
	var url = this.config.apiediEndPoint+"/get-routes";
	if (me.myroutes== undefined)
		loadRoutes(url);
	else
		displayRoutesList();
    },	
    getRouteProfile : function(route){
	var me = this;
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
		$('.walk-route .metadata .distance').text((Math.round(obj.data.route.distance)/1000).toString().replace('.',',') +' km');
		$('.walk-route .metadata .drop').text(Math.round(obj.data.route.pos_altitude_difference) +' hm');
		$('.walk-route .metadata .kcal').text(obj.kcal+' kCal');
		drawRouteProfile(obj);
		$('.modal').hide();
		$('.walk-route').show();
		google.setOnLoadCallback(drawRouteProfile(obj));
	};
	$.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.apiediEndPoint+"/get-route?route="+route,
            dataType: 'json',
            success: function(response, status, xhr) {
		displayRouteMetaData(response);
		me.addRouteLayer(response);
            },
            error: function(xhr, status, error) {
                console.log(error);
            }
        });	
    },
    getLines: function(success, failure, scope) {
        var me = this;
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('');
        if(this.lines) return success.call(scope, this.lines);
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'lines?city='+this.config.city,
            //url: this.config.r3EndPoint + 'lines',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response) failure.call(scope, xhr, status, response);
                me.lines = response;
                success.call(scope, me.lines);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getServerTime: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'time',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response || !response.time) failure.call(scope, xhr, status, response);
                success.call(scope, response.time);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getAllLines: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling getAllLines');
        //if(this.lines) return success.call(scope, this.lines);
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            //url: this.config.r3EndPoint + 'lines/all?city='+this.config.city,
            url: this.config.r3EndPoint + 'lines/all',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response) failure.call(scope, xhr, status, response);
                //this.lines = response;
                success.call(scope, response);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getStops: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling getStops');
        if(this.stops) return success.call(scope, this.stops);
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'stops',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response) failure.call(scope, xhr, status, response);
                this.stops = response;
                success.call(scope, this.stops);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getStopsLayer: function() {
	var me =this;
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 6,
            strokeColor: '#000000',
            strokeWidth: 2,
            fillColor: '#FFFFFF'
        });
        var stopsLayer = new OpenLayers.Layer.Vector('stopsLayer', {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.Script({
                url: this.config.r3EndPoint + "stops",
                callbackKey: "jsonp"
            }),
	    preFeatureInsert: function(feature) {
                feature.geometry.transform(epsg25832,defaultProjection);
            },
            styleMap: styleMap,
            minScale:10000,
            visibility: false
        });
	stopsLayer.events.on({
                "featureselected":function(e){
                        me.showStopPopup(e.feature);
                }
        });
        return stopsLayer;
    },
    getWegeStartPoints: function(){
	var me=this;
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
                url: this.config.apiediEndPoint+"/startPoints"
            }),
            styleMap: styleMap,
        });
	positionsLayer.events.on({
		"featureselected":function(e){
			if (!e.feature.cluster){
				var id = e.feature.attributes['id'];
				me.getRouteProfile(id);
			}
		}
	});
	return positionsLayer;
    }, 
    getBusPositionLayer: function() {
        var me = this;
        
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 12,
            externalGraphic: 'images/${hexcolor2}.png'
        });
        
        
        var positionsLayer = new OpenLayers.Layer.Vector("positionLayer", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.Script({
                url: this.config.r3EndPoint + "positions", //TODO: modificare il nome del callback, renderlo più breve
                callbackKey: "jsonp"
            }),
	    preFeatureInsert: function(feature) {
           	feature.geometry.transform(epsg25832,defaultProjection);
            },
            styleMap: styleMap
        });
	positionsLayer.events.on({
                "featureselected":function(e){
                        me.showBusPopup(e.feature);
                }
        });


        positionsLayer.events.register('loadend', positionsLayer, function(e) {
/* NON UTILIZZATO... ci serve?
            var interval = 500 * (14 - map.getZoom()) + 2000; // 11
            if (interval < 1000) { // 2000
                interval = 1000; // 2000
            }
            if (interval > 5000) {
                interval = 5000;
            }
            if (timeout) {
                window.clearTimeout(timeout);
            } */
            // set to 1 s
            var interval = 2500;
            
            if(me.updateBusTimeout) window.clearTimeout(me.updateBusTimeout);
            
            me.updateBusTimeout = window.setTimeout(function() {
                positionsLayer.refresh();
            }, interval);
        });
        return positionsLayer;
    },
    
    //es. SASABus.showLines(['211:1', '211:2', '211:3', '201:1']);
    showLines: function(lines) {
        var visibility = true;
        
        if(!lines || !lines.length) {
            lines = [0];
            visibility = false;
        }
        
        //il cambio visibility va fatto prima oppure dopo a seconda se il layer va acceso o spento
        //questo per evitare chiamate "finte" con layers=0
        if(!visibility) this.linesLayer.setVisibility(visibility);
        this.linesLayer.mergeNewParams({layers: lines});
        if(visibility) this.linesLayer.setVisibility(visibility);
        
        if(lines.length > 0 && lines[0] != 'all') {
            this.positionLayer.protocol.options.params = {lines:lines};
        } else {
            delete this.positionLayer.protocol.options.params;
        }
        if(this.updateBusTimeout) window.clearTimeout(this.updateBusTimeout);
        this.positionLayer.refresh();
        
        if(lines.length > 0 && lines[0] != 'all') {
            this.stopsLayer.protocol.options.params = {lines:lines};
        } else {
            delete this.stopsLayer.protocol.options.params;
        }
        this.stopsLayer.refresh();
    },
    
    showBusPopup: function(feature) {
        var me = this,
            x = feature.geometry.x,
            y = feature.geometry.y,
            lonLat = new OpenLayers.LonLat(x, y),
            pixel = me.map.getPixelFromLonLat(lonLat);
        if(!me.tpl.busRow) {
            var tr = $(me.config.busPopupSelector + ' table tbody tr');
            me.tpl.busRow = tr.clone().wrap('<div>').parent().html();
            tr.remove();
            me.tpl.busContent = $(me.config.busPopupSelector).html();
        }
        var url = me.config.r3EndPoint + feature.attributes.frt_fid + '/stops';
        
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response) {
                if(!response || typeof(response) != 'object' || !response.features || typeof(response.features.length) == 'undefined') {
                    return me.alert('System Error');
                }
                
                me.showTplPopup('bus', feature, response.features, pixel,'.bus-position');

            },
            error: function() {
                return me.alert('System Error');
            }
        });
        
        return false;
    },
    
    showStopPopup: function(feature) {
        var me = this,
            lonLat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y),
            pixel = me.map.getPixelFromLonLat(lonLat);
        
        if(!me.tpl.stopRow) {
            var tr = $(me.config.stopPopupSelector + ' table tbody tr');
            me.tpl.stopRow = tr.clone().wrap('<div>').parent().html();
            tr.remove();
            me.tpl.stopContent = $(me.config.stopPopupSelector).html();
        }
        
        var url = me.config.r3EndPoint + feature.attributes.ort_nr + '.' + feature.attributes.onr_typ_nr + '/buses';
        
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response) {
                if(!response || typeof(response) != 'object' || typeof(response.length) == 'undefined') {
                    return me.alert('System Error');
                }
                return me.showTplPopup('stop', feature, response, pixel,'.stop-position');
            },
            error: function() {
                return me.alert('System Error');
            }
        });
        
        return false;
    },
    
    showTplPopup: function(type, selectedFeature, features, position, type_id) {
        var contentTpl = (type == 'bus') ? this.tpl.busContent : this.tpl.stopContent,
            rowTpl = (type == 'bus') ? this.tpl.busRow : this.tpl.stopRow,
            selector = (type == 'bus') ? this.config.busPopupSelector : this.config.stopPopupSelector,
            content = OpenLayers.String.format(contentTpl, selectedFeature.attributes),
            pixel;
        $(selector).empty().html(content);
       	$('#bus-pop-img').attr('src','images/'+selectedFeature.attributes.hexcolor2+'.png'); 
        if(features.length > 0) {                   
            var rows = [],
                len = (features.length > this.config.rowsLimit) ? this.config.rowsLimit : features.length,
                i, row, number;

            for(i = 0; i < len; i++) {
                row = features[i];
                if(row.geometry && row.properties) row = row.properties;
                number = (i + 1);
                row.odd = (number % 2 == 1) ? 'odd' : '';
                row.last = (number == (len)) ? 'last' : '';
                rows.push(OpenLayers.String.format(rowTpl, row));
            }
            
	    $('.modal').hide();
            $(selector + ' table tbody').append(rows.join());
            $(selector + ' table').show();
            $(selector + ' .noData').hide();
        } else {
            $(selector + ' table').hide();
            $(selector + ' .noData').show();                    
        }
        

        $(type_id).show();
        
    }, 
    
    alert: function(msg) {
        if(typeof(SASABusAlert) == 'function') {
            SASABusAlert.call(null, msg);
        } else {
            alert(msg);
        }
    },
    
    zoomToCurrentPosition: function() {
        if(!this.geolocate) {
            this.geolocate = new OpenLayers.Control.Geolocate({
                bind: true,
                watch: false,
                geolocationOptions: {
                    enableHighAccuracy: true,
                    maximumAge: 3000,
                    timeout: 50000
                }
            });
            this.geolocate.events.register('locationupdated', this, function(e) {
                this.locationLayer.removeAllFeatures();

                var lonLat = new OpenLayers.LonLat(e.point.x, e.point.y);
                if(!this.map.getExtent().containsLonLat(lonLat)) {
                    this.alert('Your position is outside this map');
                }
                
                var geometry = new OpenLayers.Geometry.Point(e.point.x, e.point.y);
                var feature = new OpenLayers.Feature.Vector(geometry);
                this.locationLayer.addFeatures([feature]);
                this.map.panTo(lonLat);
            });
            this.geolocate.events.register('locationfailed', this, function() {
                this.alert('Unable to get your position');
            });
            this.geolocate.events.register('locationuncapable', this, function() {
                this.alert('Geolocation is disabled');
            });
            this.map.addControl(this.geolocate);
        }
        this.geolocate.activate();
    },
    
    showGeoJSON: function(geojson) {
        if(!this.testLayer) {
            this.testLayer = new OpenLayers.Layer.Vector('TEST');
            this.map.addLayers([this.testLayer]);
        }
        
        var format = new OpenLayers.Format.GeoJSON();
        var features4326 = format.read(geojson);
        if(!features4326) return console.log('errore nel parsing...');
        var features = [];
        for(var i = 0; i < features4326.length; i++) {
            var geometry = features4326[i].geometry.transform(new OpenLayers.Projection('EPSG:4326'),defaultProjection);
            features.push(new OpenLayers.Feature.Vector(geometry, features4326[i].attributes));
        }
        this.testLayer.removeAllFeatures();
        this.testLayer.addFeatures(features);
        this.map.zoomToExtent(this.testLayer.getDataExtent());
    },
    
    geocode: function(params, success, failure, scope) {
        var me = this;
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling geocode');
        
        if(typeof(params) == 'string') {
            params = {
                source: 'both',
                query: params
            };
        } else {
            if(!params.source) params.source = 'both';
            else if(params.source != 'google' && params.source != 'stops') {
                return console.log('source param shall be google or stops, '+params.source+' given');
            }
        }
        if(this.lines) {
            var lines = [];
            for(var i = 0; i < this.lines.length; i++) {
                lines.push(this.lines[i].li_nr+':'+this.lines[i].str_li_var);
            }
            params.lines = lines.join(',');
        }
        $.ajax({
            type: 'GET',
            url: me.config.r3EndPoint + 'geocode',
            data: params,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response || typeof(response) != 'object') failure.call(scope, xhr, status, response);
                var results = [];
                for(var i = 0; i < response.length; i++) {
                    var row = response[i];
                    if(row.srid) {
                        var lonLat = new OpenLayers.LonLat(row.lon, row.lat);
                        lonLat.transform(new OpenLayers.Projection(row.srid), defaultProjection);
                        row.lon = lonLat.lon;
                        row.lat = lonLat.lat;
                    }
                    results.push(row);
                }
                success.call(scope, results);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    showLocation: function(lon, lat) {
        try {
            var lonLat = new OpenLayers.LonLat(lon, lat);
        } catch(e) {
            return console.log('invalid lon lat');
        }
        if(!lonLat.lon || !lonLat.lat) return console.log('invalid lon lat');
        
        this.map.setCenter(lonLat, 6);
        var geometry = new OpenLayers.Geometry.Point(lon, lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.locationLayer.removeAllFeatures();
        this.locationLayer.addFeatures([feature]);
    },
    
    zoomToStop: function(ort_nr, onr_typ_nr) {
        var me = this,
            len = this.stopsLayer.features.length,
            i, feature, zoomFeature;
        
        for(i = 0; i < len; i++) {
            feature = me.stopsLayer.features[i];
            if(feature.attributes.ort_nr == ort_nr && feature.attributes.onr_typ_nr == onr_typ_nr ) {
                zoomFeature = feature;
                var lonLat = new OpenLayers.LonLat(zoomFeature.geometry.x, zoomFeature.geometry.y);
                me.map.moveTo(lonLat);
                
                me.showStopPopup(zoomFeature);
            }
        }
    },
    
    addLocation: function(lon, lat) {
        try {
            var lonLat = new OpenLayers.LonLat(lon, lat);
        } catch(e) {
            return console.log('invalid lon lat');
        }
        if(!lonLat.lon || !lonLat.lat) return console.log('invalid lon lat');
        
        var geometry = new OpenLayers.Geometry.Point(lon, lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.locationLayer.addFeatures([feature]);
    },
    
    removeAllLocations: function() {
        this.locationLayer.removeAllFeatures();
    }
};


if(typeof(console) == 'undefined') console = {log: function(){}, trace: function(){}, error: function(){}};
