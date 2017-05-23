var echargingLayer = {
	isCached:true,
	getTypes : function(callback){
                integreen.getStationDetails('EchargingFrontEnd/rest/plugs/',{},displayBrands);
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
	                });
                	$('.echargingbrand a').click(function(e){
                        	var brand = $(this).attr("brand");
	                        brands[brand] = !brands[brand];
				$(this).toggleClass("disabled");
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
	                        $('.emobility .deselect-all').text(statusText);
        	                echargingLayer.retrieveStations(brands);
                	});
                }
        },
	populate: function(){
		var self = this;
                if (self.brands == undefined)
                        self.getTypes(self.retrieveStations);
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
                        typeName:'edi:Echarging',
                        outputFormat:'text/javascript',
                        format_options: 'callback: jsonCharging'
        	};
		if (brandreq != '')
                        params['viewparams']='brand:'+brandreq;

        	$.ajax({
                	url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
	                dataType : 'jsonp',
        	        crossDomain: true,
                	jsonpCallback : 'jsonCharging',
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
			var updatedOn = moment(state['number-available'].timestamp).locale(lang).format('lll');
			$('.station .title').html(details.name.replace("CU_","")+" ("+details.provider+")<br/><small>"+updatedOn+"</small>");
			if (details.state != 'ACTIVE'){
				$(".content").html('<h3>'+jsT[lang].outOfOrder+'</h3>');
				$('.modal').hide();
				$('.station').show();
				return;
			}
			var html = "";
			html+="<div class='number-available'></div>";
			html+="<div class='caption'>"+jsT[lang].freeCharger+"</div><hr/>";
			if (details.accessInfo && !details.flashInfo)
				html += "<div class='info'><img src='images/8_Echarging/online.svg' width='30px'/><span>"+jsT[lang].chargerOnline+"</span><p>" + details.accessInfo+"</p></div><hr/>";
			else if (details.flashInfo)
				html += "<div class='info'><img src='images/8_Echarging/maintanance.svg' width='30px'/><span>"+details.flashInfo+"</span></div>";
			if (details.paymentInfo)
                                html+='<div><a href="' + details.paymentInfo + '" target="_blank" class="backtomap ibutton" ><div>'+jsT[lang].paymentInfo+'</div></a></div>';
			if (details.reservable)
                                html+='<div><a href="' + details.paymentInfo + '" target="_blank" class="backtomap ibutton" ><div>'+jsT[lang].book+'</div></a></div>';
			html += "</div>";
                        html+='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>';
			integreen.getChildStationsData(details.id,"EchargingFrontEnd/rest/plugs/",displayPlugs);
			function displayPlugs (children){
				$.each(children,function(index,value){
					var plugState = value.newestRecord;
					var plugDetails = value.detail;
					var state = plugState['echarging-plug-status'].value;
					if (state == 1)
						plugColor='#8faf30';
					else if(state == 2 || state == 3)
						plugColor = '#f28e1e';
					else
						plugColor = '#e81c24';
					html += "<div class='plug clearfix'>"
					+"<h4><svg height='20' width='20'><circle cx='10' cy='10' r='10' fill='" + plugColor + "'></circle></svg>" + jsT[lang].charger + " "+(index+1)+"</h4>";
					$.each(value.detail.outlets,function(i,outlet){
						html += "<div class='clearfix outlet'><img src='https://service.aewnet.eu/e-mobility/api/v2/images/outlettypes/"+ outlet.outletTypeCode+"' alt='Plug image not available'/>"
						+"<p>"+outlet.outletTypeCode +" | "
						+ outlet.minCurrent + " - " + outlet.maxCurrent+" A | "
						+ outlet.maxPower +" W </p></div>";
					});
					html += "</div>"
				});
				$('.station .content').html(html);
				if (state['number-available'].value == details.capacity)
					$('.station .number-available').addClass("free");
				radialProgress($('.station .number-available')[0])
                                                 .diameter(180)
                                                 .value(state['number-available'].value)
                                                 .maxValue(details.capacity)
                                                 .render();

				$('.modal').hide();
				$('.station .backtomap.ibutton').click(function(){
					$('.modal').hide();
				});
				$('.station').show();
			}
		}
	}
}
