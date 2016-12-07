var stopsLayer = {
  isCached : true,
	get : function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var styleMap = new OpenLayers.StyleMap({
			pointRadius: 6,
			strokeColor: '#000000',
			strokeWidth: 2,
			fillColor: '#FFFFFF'
		});
		var positionLayer = new OpenLayers.Layer.Vector('stopsLayer', {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: new OpenLayers.Protocol.Script({
				url: SASABus.config.r3EndPoint + "stops",
				callbackKey: "jsonp"
			}),
			preFeatureInsert: function(feature) {
				feature.geometry.transform(epsg25832,defaultProjection);
			},
			styleMap: styleMap,
			minScale:10000,
		});
		positionLayer.events.on({
			"beforefeatureselected":function(e){
				showStopPopup(e.feature);
			}
		});
		this.layer = positionLayer;
		return this.layer;

		function showStopPopup(feature) {
			lonLat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y),
			pixel = SASABus.map.getPixelFromLonLat(lonLat);

			if(!busPositionLayer.tpl.stopRow) {
				var tr = $(SASABus.config.stopPopupSelector + ' table tbody tr');
				busPositionLayer.tpl.stopRow = tr.clone().wrap('<div>').parent().html();
				tr.remove();
				busPositionLayer.tpl.stopContent = $(SASABus.config.stopPopupSelector).html();
			}

			var url = SASABus.config.r3EndPoint + feature.attributes.ort_nr + '.' + feature.attributes.onr_typ_nr + '/buses';

			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'jsonp',
				crossDomain: true,
				jsonp: 'jsonp',
				success: function(response) {
					if(!response || typeof(response) != 'object' || typeof(response.length) == 'undefined') {
						return SASABus.alert('System Error');
					}
					return busPositionLayer.showTplPopup('stop', feature, response, pixel,'.stop-position');
				},
				error: function() {
					return SASABus.alert('System Error');
				}
			});

			return false;
		}
		function zoomToStop(ort_nr, onr_typ_nr) {
			len = stopsLayer.get().features.length,i, feature, zoomFeature;
			for(i = 0; i < len; i++) {
				feature = stopsLayer.features[i];
				if(feature.attributes.ort_nr == ort_nr && feature.attributes.onr_typ_nr == onr_typ_nr ) {
					zoomFeature = feature;
					var lonLat = new OpenLayers.LonLat(zoomFeature.geometry.x, zoomFeature.geometry.y);
					SASABus.map.moveTo(lonLat);
					showStopPopup(zoomFeature);
				}
			}
		}
	}
}
var busPositionLayer = {
	isCached : true,
	tpl: {
		busRow: undefined,
		busContent: undefined,
		stopRow: undefined,
		stopContent: undefined
	},
	updateBusTimeout:undefined,
	showTplPopup:function(type, selectedFeature, features, position, type_id) {
		var contentTpl = (type == 'bus') ? busPositionLayer.tpl.busContent : busPositionLayer.tpl.stopContent,
		rowTpl = (type == 'bus') ? busPositionLayer.tpl.busRow : busPositionLayer.tpl.stopRow,
		selector = (type == 'bus') ? SASABus.config.busPopupSelector : SASABus.config.stopPopupSelector,
		content = OpenLayers.String.format(contentTpl, selectedFeature.attributes),pixel;
		$(selector).empty().html(content);
		$('#bus-pop-img').attr('src','images/'+selectedFeature.attributes.hexcolor2+'.png');
		if(features.length > 0) {
			var rows = [],
			len = (features.length > SASABus.config.rowsLimit) ? SASABus.config.rowsLimit : features.length,
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
	get : function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var styleMap = new OpenLayers.StyleMap({
			pointRadius: 12,
			externalGraphic: 'images/${hexcolor2}.png'
		});
		var positionsLayer = new OpenLayers.Layer.Vector("positionLayer", {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: new OpenLayers.Protocol.Script({
				url: SASABus.config.r3EndPoint + "positions",
				callbackKey: "jsonp"
			}),
			preFeatureInsert: function(feature) {
				feature.geometry.transform(epsg25832,defaultProjection);
			},
			styleMap: styleMap
		});
		positionsLayer.events.on({
			"beforefeatureselected":function(e){
				showBusPopup(e.feature);
			}
		});
		positionsLayer.events.register('loadend', positionsLayer, function(e) {
			var interval = 2500;
			if(busPositionLayer.updateBusTimeout) window.clearTimeout(busPositionLayer.updateBusTimeout);
			busPositionLayer.updateBusTimeout = window.setTimeout(function() {
				positionsLayer.refresh();
			}, interval);
		});
		this.layer = positionsLayer;
		linesLayer.showLines(['all']);
		return this.layer;

		function showBusPopup(feature) {
			var x = feature.geometry.x,
			y = feature.geometry.y,
			lonLat = new OpenLayers.LonLat(x, y),
			pixel = SASABus.map.getPixelFromLonLat(lonLat);
			if(!busPositionLayer.tpl.busRow) {
				var tr = $(SASABus.config.busPopupSelector + ' table tbody tr');
				busPositionLayer.tpl.busRow = tr.clone().wrap('<div>').parent().html();
				tr.remove();
				busPositionLayer.tpl.busContent = $(SASABus.config.busPopupSelector).html();
			}
			var url = SASABus.config.r3EndPoint + feature.attributes.frt_fid + '/stops';
			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'jsonp',
				crossDomain: true,
				jsonp: 'jsonp',
				success: function(response) {
					if(!response || typeof(response) != 'object' || !response.features || typeof(response.features.length) == 'undefined') {
						return SASABus.alert('System Error');
					}
					showTplPopup('bus', feature, response.features, pixel,'.bus-position');
				},
				error: function() {
					return SASABus.alert('System Error');
				}
			});
			return false;
		}
		function showTplPopup(type, selectedFeature, features, position, type_id) {
			var contentTpl = (type == 'bus') ? busPositionLayer.tpl.busContent : busPositionLayer.tpl.stopContent,
			rowTpl = (type == 'bus') ? busPositionLayer.tpl.busRow : busPositionLayer.tpl.stopRow,
			selector = (type == 'bus') ? SASABus.config.busPopupSelector : SASABus.config.stopPopupSelector,
			content = OpenLayers.String.format(contentTpl, selectedFeature.attributes),pixel;
			$(selector).empty().html(content);
			$('#bus-pop-img').attr('src','images/'+selectedFeature.attributes.hexcolor2+'.png');
			if(features.length > 0) {
				var rows = [],
				len = (features.length > SASABus.config.rowsLimit) ? SASABus.config.rowsLimit : features.length,
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
		}
	}
}
var linesLayer = {
	isCached : true,
	get : function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var positionsLayer = new OpenLayers.Layer.WMS('SASA Linee', SASABus.config.r3EndPoint + 'ogc/wms', {layers: 0, transparent: true,isBaseLayer:false}, {projection:defaultProjection.projCode
			,visibility: true, singleTile: true});
			this.layer = positionsLayer;
			return this.layer;
		},
		getAllLines: function(success, failure, scope) {
			scope = scope || null;
			failure = failure || function() {};
			if(!success) return console.log('success callback is mandatory when calling getAllLines');
			$.ajax({
				type: 'GET',
				crossDomain: true,
				url: SASABus.config.r3EndPoint + 'lines/all',
				dataType: 'jsonp',
				jsonp: 'jsonp',
				success: function(response, status, xhr) {
					if(!response) failure.call(scope, xhr, status, response);
					success.call(scope, response);
				},
				error: function(xhr, status, error) {
					failure.call(scope, xhr, status, error);
				}
			});
		},
		getLines: function(success, failure, scope) {
			scope = scope || null;
			failure = failure || function() {};
			if(!success) return console.log('');
			if(this.lines) return success.call(scope, this.lines);

			$.ajax({
				type: 'GET',
				crossDomain: true,
				url: SASABus.config.r3EndPoint + 'lines?city='+SASABus.config.city,
				dataType: 'jsonp',
				jsonp: 'jsonp',
				success: function(response, status, xhr) {
					if(!response) failure.call(scope, xhr, status, response);
					SASABus.lines = response;
					success.call(scope, SASABus.lines);
				},
				error: function(xhr, status, error) {
					failure.call(scope, xhr, status, error);
				}
			});
		},

		showLines: function(lines) {
			var visibility = true;
			if(!lines || !lines.length) {
				lines = [0];
				visibility = false;
			}
			if(!visibility) linesLayer.get().setVisibility(visibility);
			linesLayer.get().mergeNewParams({layers: lines});
			if(visibility) linesLayer.get().setVisibility(visibility);
			if(lines.length > 0 && lines[0] != 'all') {
				busPositionLayer.get().protocol.options.params = {lines:lines};
			} else {
				delete busPositionLayer.get().protocol.options.params;
			}
			if(this.updateBusTimeout) window.clearTimeout(this.updateBusTimeout);
			busPositionLayer.get().refresh();
			if(lines.length > 0 && lines[0] != 'all') {
				stopsLayer.get().protocol.options.params = {lines:lines};
			} else {
				delete stopsLayer.get().protocol.options.params;
			}
			stopsLayer.get().refresh();
		}
	}
