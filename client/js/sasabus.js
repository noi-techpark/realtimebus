Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
var SASABus = {

    config: {
	city:'',
        r3EndPoint: 'http://realtimebus.tis.bz.it/',
        //r3EndPoint: 'http://sasabus.ph.r3-gis/',
        //r3EndPoint: 'http://sasabus.r3-gis/',
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
    
    init: function(targetDivId) {
        var me = this;
        var defaultProjection = new OpenLayers.Projection('EPSG:3857');
	var epsg25832 = new OpenLayers.Projection('EPSG:25832');
        //$("<style type='text/css'> .clickable-icon{cursor:hand;} </style>").appendTo("head");
        
        me.config.mapDivId = targetDivId;
        
        var mapOptions = {
            projection: defaultProjection,
            controls: [new OpenLayers.Control.Attribution(), new OpenLayers.Control.Navigation()],
	    fractionalZoom: false,
	    units:'m',
        };
        me.map = new OpenLayers.Map(targetDivId, mapOptions);
        me.map.addControl(new OpenLayers.Control.LayerSwitcher({'ascending':false}));

        var topoMap = new OpenLayers.Layer.TMS('TOPOMAP', 'http://sdi.provincia.bz.it/geoserver/gwc/service/tms/',{
            'layername': 'cache_of2011', 
            'type': 'png8',
            visibility: true,
            opacity: 0.75,
            attribution: '',
	    tileOrigin:new OpenLayers.LonLat(590000.0,5114000.0).transform(epsg25832,defaultProjection),
	    serverResolutions:[447.99999999999994,223.99999999999997,111.99999999999999,55.99999999999999,27.999999999999996,13.999999999999998,6.999999999999999,2.8,1.4,0.7,0.35,0.175]
        }); 
        me.linesLayer = new OpenLayers.Layer.WMS('SASA Linee', me.config.r3EndPoint + 'ogc/wms', {layers: 0, transparent: true,srs:epsg25832.getCode()}, {projection:epsg25832,visibility: true, singleTile: true});
        //if(permalink) attiva le linee del permalink
        
        // if(permalink) map.zoomToExtent(extentDelPermalink);
        // else...
        
        me.stopsLayer = me.getStopsLayer();
        me.positionLayer = me.getBusPositionLayer();
        
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 20,
            externalGraphic: 'images/pin.png'
        });
        me.locationLayer = new OpenLayers.Layer.Vector('Geolocation layer', {
            styleMap: styleMap
        });

        me.map.addLayers([topoMap]);
        
        var merano = new OpenLayers.Bounds(662500, 5167000, 667600, 5172000).transform(epsg25832,defaultProjection);
        me.map.zoomToExtent(merano);
        var control = new OpenLayers.Control.SelectFeature([me.positionLayer, me.stopsLayer]);
        control.events.register('beforefeaturehighlighted', me, me.handleSelectedFeature);
        me.map.addControl(control);
        control.activate();
        
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
        }, 2500);
    },
    
    setDialogWidth: function(width) {
        this.config.defaultDialogOptions.width = width;
        if(this.tpl.busRow) {
            $(this.config.busPopupSelector).dialog('option', 'width', width);
        }
        if(this.tpl.stopRow) {
            $(this.config.stopPopupSelector).dialog('option', 'width', width);
        }
    },
    
    getLines: function(success, failure, scope) {
        var me = this;
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling getLines');
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
            styleMap: styleMap,
            minScale: 10000,
            visibility: false
        });
/*         stopsLayer.events.register('featuresadded', null, function() {
            console.log('add class...', $('circle[id^="OpenLayers.Geometry.Point"]').length);
            $('circle[id^="OpenLayers.Geometry.Point"]').addClass('clickable-icon');
        }); */
        return stopsLayer;
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
            styleMap: styleMap
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
    
    handleSelectedFeature: function(event) {
        var feature = event.feature;
        
        if(feature.layer.name == 'stopsLayer') {
            this.showStopPopup(feature);
        } else if(feature.layer.name == 'positionLayer') {
            this.showBusPopup(feature);
        }
    },
    
    bindPopupToMapMove: function(selector, originalX, originalY) {
        var me = this;
        
        me.movePopupOnMapMoveFunction = function() {
            if(me._dontClosePopup) return;
            return $(selector).dialog('close');
/*          questa era una prova per far chiudere il popup solo quando il punto esce dalla mappa, ma non funziona molto bene...   */
            var lonLat = new OpenLayers.LonLat(originalX, originalY),
                newPixel = me.map.getPixelFromLonLat(lonLat),
                pixel;
            
            if(me.map.getExtent().containsLonLat(lonLat)) {
                pixel = me.calculatePopupPosition(selector, newPixel);
                $(selector).dialog('option', 'position', [pixel.x, pixel.y]);
            } else {
                $(selector).dialog('close');
            } 
        };

        me.map.events.register('moveend', me, me.movePopupOnMapMoveFunction);
    },
    
    unbindPopupToMapMove: function() {
        this.map.events.unregister('moveend', this, this.movePopupOnMapMoveFunction);
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
            $(me.config.busPopupSelector).dialog($.extend(true, {}, me.config.defaultDialogOptions, {
                autoOpen: false,
                open: function() {
                    me.bindPopupToMapMove(me.config.busPopupSelector);
                },
                close: function() {
                    me.unbindPopupToMapMove();
                }
            }));
        }
        $(me.config.busPopupSelector).dialog('close');
        if($(me.config.stopPopupSelector).is('dialog')) $(me.config.stopPopupSelector).dialog('close');
        
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
                
                me.showTplPopup('bus', feature, response.features, pixel);

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
            $(me.config.stopPopupSelector).dialog($.extend(true, {}, me.config.defaultDialogOptions, {
                autoOpen: false,
                open: function() {
                    me.bindPopupToMapMove(me.config.stopPopupSelector);
                },
                close: function() {
                    me.unbindPopupToMapMove();
                }
            }));
        }
        if($(me.config.busPopupSelector).is('dialog')) $(me.config.busPopupSelector).dialog('close');
        $(me.config.stopPopupSelector).dialog('close');
        
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
                
                return me.showTplPopup('stop', feature, response, pixel);
            },
            error: function() {
                return me.alert('System Error');
            }
        });
        
        return false;
    },
    
    showTplPopup: function(type, selectedFeature, features, position) {
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
            
            $(selector + ' table tbody').append(rows.join());
            $(selector + ' table').show();
            $(selector + ' .noData').hide();
        } else {
            $(selector + ' table').hide();
            $(selector + ' .noData').show();                    
        }
        
        $(selector).dialog('open').hide();

        pixel = this.calculatePopupPosition(selector, position);

        $(selector).dialog('option', 'position', [pixel.x, pixel.y]);
        $(selector).show();
        
        $(selector).dialog('open');
    },
    
    calculatePopupPosition: function(popupSelector, pixel) {
        var mapPosition = $('#'+this.config.mapDivId).position(),
            maxX = mapPosition.left + $('#'+this.config.mapDivId).width(),
            dx, dy, dialogWidth, dialogRightX;
        
        //calcola posizione dialog
        pixel.x = pixel.x - this.config.pinToDialogDistance; //distanza tra punta grafica e dialog
        pixel.y = (pixel.y - $(popupSelector).height() - this.config.pinHeight - this.config.yOffset); // sottrae alla y l'altezza del dialog e l'altezza della punta grafica
        pixel.y = pixel.y-$('#header-mobile').outerHeight();//consider header height and scroll from top 
        dialogWidth = $(popupSelector).width() + 10;
        dialogRightX = pixel.x + dialogWidth;
        
        if(pixel.y < 0) {
            dy = pixel.y;
        }
        if(dialogRightX > (maxX - this.config.xOffset)) {
            dx = - (maxX - dialogRightX - this.config.xOffset);
            pixel.x -= (dialogRightX - maxX + this.config.xOffset);
        }
        
        dx = dx || 0;
        dy = dy || 0;

        if(dx != 0 || dy != 0) {
            this._dontClosePopup = true;
            this.map.pan(dx, dy, {animate: false});
            this._dontClosePopup = false;
        }
        
        pixel.y = pixel.y > this.config.yOffset ? (pixel.y + this.config.yOffset) : this.config.yOffset;
        return pixel;
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
