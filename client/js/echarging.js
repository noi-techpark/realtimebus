var echargingLayer = {
	isCached:true,
	getTypes : function(callback){
                integreen.getStationDetails('EchargingFrontEnd/rest/plugs/',{},displayBrands);
                function displayBrands(data){
                        var brands = {};
                        $.each(data,function(index,value){
                                brands[value.plugType] = true;
                        });
                        $('.echarging .deselect-all').click(function(){
                                $.each(brands,function(index,value){
                                        brands[index] = false;
                                });
                                echargingLayer.retrieveStations(brands);
                        });
                        if (callback != undefined)
                                callback(brands);
                }
        },
	populate: function(){
		var self = this;
                if (self.brands == undefined)
                        self.getTypes(self.retrieveStations);
	},	
	retrieveStations : function(brands){
		$('.echargingtypes').empty();
		$.each(brands,function(index,value){
                        var brandClass= index.replace(/[^a-zA-Z0-9]/g,'_');
                        if (!value){
                                brandClass+=' inactive' ;
                        }
                        $('.echarging .echargingtypes').append('<li class="echargingbrand '+brandClass+'"><a href="javascript:void(0)">'+index+'</a></li>');
                });
                $('.echargingbrand').click(function(e){
                        var brand = $(this).text();
                        brands[brand] = !brands[brand];
                        echargingLayer.retrieveStations(brands);
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
                        typeName:'edi:Echarging',
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
                               	echargingLayer.layer.removeAllFeatures();
                	        echargingLayer.layer.addFeatures(features);
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
	                        var pin= 'images/8_Echarging/marker.svg';
				if (!feature.cluster){
	        	                var max = feature.attributes.chargingpointscount;
        	        	        var now = feature.attributes.value;
                	        	var a = now/max;
	                	        if (a == 0.)
        	                	        pin= 'images/8_Echarging/marker_red.svg';
	                	        else if (a>0 && a <= 0.6)
        	                	        pin= 'images/8_Echarging/marker_orange.svg';
	        	                else if (a>=0.6)
        	        	                pin= 'images/8_Echarging/marker_green.svg';
				}
                	        return pin;
	                }
        	    }
	        }));

	        var positionsLayer = new OpenLayers.Layer.Vector("echargingLayer", {
        	        styleMap: styleMap,
			strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
	        });
        	positionsLayer.events.on({
                	"featureselected":function(e){
				if (!e.feature.cluster){
        	                	var station = e.feature.attributes.stationcode;
					integreen.retrieveData(station,"EchargingFrontEnd/rest/",displayData);
				}
	                }
	        });
	        this.layer = positionsLayer;
        	return positionsLayer;

		function displayData(details,state){		
			var updatedOn = moment(state['number available'].timestamp).locale(lang).format('lll');
			$('.station .title').html(details.name.replace("CU_","")+" ("+details.provider+")<br/><small>"+updatedOn+"</small>");
			if (details.state != 'ACTIVE'){
				$(".content").html('<h3>This charging station is temporary out of order </h3>');	
				$('.modal').hide();
				$('.station').show();
				return;
			}
			var html = "";
			integreen.getChildStationsData(details.id,"EchargingFrontEnd/rest/plugs/",displayPlugs);
			function displayPlugs (children){
				$.each(children,function(index,value){
					var plugState = value.newestRecord;
					var plugDetails = value.detail;
					var state = plugState['e-charging plugs availability status'].value;
					if (state == 1)	
						plugColor='#8faf30';
					else if(state == 2 || state == 3)
						plugColor = '#f28e1e';
					else
						plugColor = '#e81c24';
					html += "<div class='plug' style='width:" + 100/details.capacity + "%'>" 
					+"<img style='display:block;margin:auto' src='https://service.aewnet.eu/e-mobility/api/v2/images/outlettypes/Type2Mennekes?hexColor="+ encodeURIComponent(plugColor) +"' alt='Plug image not available'/>"
					+"<h4 style='text-align:center;color:" + plugColor + "'>" + jsT[lang]['chargingStates'][state] + "</h4>"
					+"<p>"+plugDetails.plugType +"<br/>"
					+ plugDetails.minCurrent +" - "+plugDetails.maxCurrent+" A<br/>"
					+ plugDetails.maxPower +" W </p>"
					+"</div>"
				});
				$('.station .content').html(html);
				$('.modal').hide();
				$('.station').show();
			}
		}
	}
}
