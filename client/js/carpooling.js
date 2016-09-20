var carpoolingLayer = {
        isCached:true,
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
                        typeName:'edi:carpooling',
                        outputFormat:'text/javascript',
                        format_options: 'callback: json'
                };
                if (brandreq != '')
                        params['viewparams']='brand:'+brandreq;

                $.ajax({
                        url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
                        dataType : 'jsonp',
                        crossDomain: true,
                        jsonpCallback : 'json',
                        success : function(data) {
                                var features = new OpenLayers.Format.GeoJSON().read(data);
                                carpoolingLayer.layer.removeAllFeatures();
                                carpoolingLayer.layer.addFeatures(features);
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
                                var pin= 'images/9_Carpooling/marker.svg';
                                if (!feature.cluster){
                                        var max = feature.attributes.chargingpointscount;
                                        var now = feature.attributes.value;
                                        var a = now/max;
                                        if (a == 0.)
                                                pin= 'images/9_Carpooling/marker_red.svg';
                                        else if (a>0 && a <= 0.6)
                                                pin= 'images/9_Carpooling/marker_orange.svg';
                                        else if (a>=0.6)
                                                pin= 'images/9_Carpooling/marker_green.svg';
                                }
                                return pin;
                        }
                    }
                }));
                var positionsLayer = new OpenLayers.Layer.Vector("carpoolingLayer", {
                        styleMap: styleMap,
                        strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
                });
                positionsLayer.events.on({
                        "featureselected":function(e){
                                if (!e.feature.cluster){
                                        var station = e.feature.attributes.stationcode;
                                        integreen.retrieveData(station,"CarpoolingFrontEnd/rest/",displayData);
                                }
                        }
                });
                this.layer = positionsLayer;
                return positionsLayer;

		function displayData(details,state){
		}
	},
	populate: function(){
                var self = this;
                if (self.brands == undefined)
                        self.getTypes(self.retrieveStations);
        },
	getTypes : function(callback){
                integreen.getStationDetails('ChargeFrontEnd/rest/plugs/',{},displayBrands);
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
                                $.each(value.outlets,function(i,outlet){
                                        if (typeof value != 'function')
                                                brands[outlet.outletTypeCode] = true;
                                });
                        });
                        $('.emobility .deselect-all').click(function(){
                                var nothingSelected = brands.nothingSelected();
                                if (!nothingSelected)
                                        $('.emobility .toggler').addClass('disabled');
                                else
                                        $('.emobility .toggler').removeClass('disabled');

                                $.each(brands,function(index,value){
                                        if (typeof value != 'function')
                                                brands[index] = nothingSelected;
                                });
                                var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
                                $('.emobility .deselect-all').text(statusText);
                                echargingLayer.retrieveStations(brands);
                        });
                        if (callback != undefined)
                                callback(brands);
                        $('.echargingtypes').empty();
                        var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
                        $('.emobility .deselect-all').text(statusText);
                        $.each(brands,function(index,value){
                                if (typeof value == 'function')
                                        return true;
                                var brandClass= index.replace(/[^a-zA-Z0-9]/g,'_');
                                $('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+index+' href="javascript:void(0)" class="toggler">'
                                        +'<svg width="55" height="30">'
                                        +       '<g>'
                                        +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#f2bf00" height="24"/>'
                                        +               '<circle cx="34" cy="17" r="9" fill="#f2bf00" />'
                                        +       '</g>'
                                        +       'Sorry, your browser does not support inline SVG.'
                                        + '</svg>'
                                        + '</a></li>'
                                );
				$('.echargingbrand a').click(function(e){
                                	var brand = $(this).attr("brand");
                        	        brands[brand] = !brands[brand];
                	                $(this).toggleClass("disabled");
        	                        var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
	                                $('.emobility .deselect-all').text(statusText);
                                	echargingLayer.retrieveStations(brands);
                        	});
                	});
		}
	}
}

