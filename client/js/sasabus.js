Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

var defaultProjection = new OpenLayers.Projection('EPSG:3857');


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function getPresetFromUrl(value){
	return location.search.substring(1)===value;
}
var preConfigMap = {
	p1:{
		zoom:18,
		lon:1241251.0433325,
		lat:5888918.4656567,
	},
	p2:{
		zoom:18,
		lon:1242275.7794428,
		lat:5888727.0753039,
	},
	p4:{
		zoom:18,
		lon:1242236.3628001,
		lat:5888148.1253312,
	},
	p5:{
		zoom:18,
		lon:1242522.4036918,
		lat:5888480.4480549,
	},
	p6:{
		zoom:18,
		lon:1242819.1935406,
		lat:5888359.5230875,
	},
	p7:{
		zoom:18,
		lon:1242853.828269,
		lat:5888584.3562402,
	},
	p8:{
		zoom:18,
		lon:1242238.1510928,
		lat:5889129.8666131,
	},
	p9:{
		zoom:17,
		lon:1243900.0680937,
		lat:5888210.8219807
	},
	p10:{
		zoom:17,
		lon:1240786.4535201,
		lat:5890727.2722709
	},
	p11:{
		zoom:17,
		lon:1243912.0113794,
		lat:5889700.1497033		
	},
	p12:{
		zoom:17,
		lon:1244961.8261896,
		lat:5886861.2307003
	}
}
var epsg25832 = new OpenLayers.Projection('EPSG:25832');
var SASABus = {
    config: {
	city:'',
        r3EndPoint: 'http://realtimebus.tis.bz.it/',
	integreenEndPoint:'ipchannels.integreen-life.bz.it/',
	apiediEndPoint:'http://apiedi.tis.bz.it/apiedi',
	//apiediEndPoint:'http://localhost:8080/apiedi',
	geoserverEndPoint:'http://geodata.integreen-life.bz.it/geoserver/',
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
    stopsLayer: undefined,
    positionLayer: undefined,
    lines: undefined,
    geolocate: undefined,
    locationLayer: undefined,
    activateSelectedThemes: function(activeThemes){
	var me = this;
	var layerMap = {
		walking:[wegeStartPointsLayer,artPoints,routesLayer,zugangLayer],
		bus:[linesLayer,busPositionLayer,stopsLayer],
		carsharing:[carSharingLayer],
		bike:[bikeSharingLayer,provinceBikeNetwork],
		emobility:[echargingLayer],
		carpooling:[carpoolingLayer],
	}
	$.each(layerMap,function(key,value){				//hide all layers which are in non active Themes
		if ($.inArray(key,activeThemes) == -1){
			$.each(value,function(index,object){
				if(object.get())
					if ($.isArray(object.get())){
						$.each(object.get(),function(index,ovalue){
                                                	ovalue.setVisibility(false);
						});
					}
					else if (me.map.getLayer(object.get().id) != null){
						object.get().setVisibility(false);
					}
			});
		}
	});
	var activeLayers=[];
	$('.config').hide();
	$.each(activeThemes,function(index,object){		//choose Layers to activate
		$('#'+object+'-c').show();
		if (object != undefined && object.length>0 && layerMap[object] != undefined){
			$.each(layerMap[object],function(index,value){
				activeLayers = activeLayers.concat(value);		//get Singleton of layer
			});
		}
	});
	$.each(activeLayers,function(index,object){		//add Layers or set to visible if already added
		if (object.get() == null || $.isArray(object.get()))
			return;
		if (me.map.getLayer(object.get().id) == null){
			me.map.addLayer(object.get());
			if (object.populate)
				object.populate();
		}
		object.layer.setVisibility(true);
	});
	me.map.addLayer(me.locationLayer);
	var controlOptions={toggle:true};
        var control = new OpenLayers.Control.SelectFeature(me.map.getLayersByClass("OpenLayers.Layer.Vector") ,controlOptions);//choose Layers which can be interacted with
        me.map.addControl(control);
        control.activate();
	var mapMousePosition = new OpenLayers.Control.MousePosition({
        	displayProjection: defaultProjection
	});
	me.map.addControl(mapMousePosition);
	var callbacks = { 
		keydown: function(evt) {
			if (evt.keyCode == 76 && evt.shiftKey && evt.ctrlKey) {
      				var pixel = new OpenLayers.Pixel(mapMousePosition.lastXy.x, mapMousePosition.lastXy.y)
				var lonLat = me.map.getLonLatFromPixel(pixel);
				window.location.replace("http://bus.meran.eu/alpha/?zoom="+me.map.getZoom()+"&lon="+lonLat.lon+"&lat="+lonLat.lat);
			}
		}
	};
	var control = new OpenLayers.Control();
	var handler = new OpenLayers.Handler.Keyboard(control, callbacks, {});
	handler.activate();
	me.map.addControl(control);
    }, 
    init: function(targetDivId) {
        var me = this;
        me.config.mapDivId = targetDivId;
        var mapOptions = {
            projection: defaultProjection,
            controls: [new OpenLayers.Control.Attribution(), new OpenLayers.Control.Navigation()],
	    fractionalZoom: false,
	    units:'m',
	    center:new OpenLayers.LonLat(1242107.3809149, 5889462.4783187),

        };
        me.map = new OpenLayers.Map(targetDivId, mapOptions);
        var topoMap = new OpenLayers.Layer.TMS('topo', 'http://sdi.provincia.bz.it/geoserver/gwc/service/tms/',{
            'layername': 'WMTS_OF2011_APB-PAB', 
            'type': 'png8',
            visibility: true,
            opacity: 0.75,
            attribution: '',

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
        var osm = new OpenLayers.Layer.OSM("standardosm",null,{
		 numZoomLevels: 18,
		 projection: defaultProjection,
	}); 
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 20,
            externalGraphic: 'images/pin.png',
	    graphicYOffset:-40,
	    graphicXOffset:-20
        });
        me.locationLayer = new OpenLayers.Layer.Vector('Geolocation layer', {
            styleMap: styleMap
        });
        me.map.addLayers([osm,topoMap]);

	var reqP = {
		zoom:parseInt(getParameterByName('zoom')),
		lon:parseFloat(getParameterByName('lon')),
		lat:parseFloat(getParameterByName('lat')),
		
	}
	var keys = Object.keys(preConfigMap);
	$.each(keys,function(index,value){
		if (getPresetFromUrl(value))
			reqP = preConfigMap[value];
	});
	var merano = new OpenLayers.Bounds(662500, 5169000, 667600, 5174000).transform(epsg25832,defaultProjection);				
        me.map.zoomToExtent(merano);
	if (reqP.lon && reqP.lat)
		me.map.panTo(new OpenLayers.LonLat(reqP.lon,reqP.lat));	
	if (me.map.isValidZoomLevel(reqP.zoom))		
		me.map.zoomTo(reqP.zoom);
        var geometry = new OpenLayers.Geometry.Point(reqP.lon,reqP.lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        me.locationLayer.addFeatures([feature]);
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
    routeToLocation : function(whereTo){
	$.ajax({
	        type: 'GET',
        	crossDomain: true,
		url:'http://localhost:8000/api/1.0/gosmore.php?format=geojson&flat=52.215676&flon=5.963946&tlat=52.2573&tlon=6.1799&v=foot',
        	dataType: 'json',
	        jsonp: 'json',
        	success: function(response, status, xhr) {
			console.log(response);
	        },
        	error: function(xhr, status, error) {
			console.log(error);
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
