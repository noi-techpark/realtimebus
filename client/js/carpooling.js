var carpoolingLayer = {
  isCached : true,
  retrieveStations : function(hubs,usertype){
    var hubreq='';
    $.each(hubs,function(index,value){
      if (value.active){
        if (hubreq != '')
        hubreq += "\\,";
        hubreq += '\''+index+'\'';
      }
    });
    var  params = {
      request:'GetFeature',
      typeName:'edi:Carpooling',
      outputFormat:'text/javascript',
      format_options: 'callback: jsonCarpooling'
    };
    params['viewparams'] = '';
    if (hubreq!='' && hubreq != undefined)
    params['viewparams']+='hubs:'+hubreq+';';
    if (usertype!='' && usertype != undefined)
    params['viewparams']+='usertypes:'+usertype;
    $.ajax({
      url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
      dataType : 'jsonp',
      crossDomain: true,
      jsonpCallback : 'jsonCarpooling',
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
          var pin= 'images/9_Carpooling/hub_marker.svg';
          if (!feature.cluster){
            if (feature.attributes.stationtype == 'CarpoolingHub')
              pin= 'images/9_Carpooling/hub_marker.svg';
            else{
              switch(feature.attributes.type){
                case 'A': pin='images/9_Carpooling/driver_marker.svg';break;
                case 'P': pin='images/9_Carpooling/passenger_marker.svg';break;
                case 'E': pin='images/9_Carpooling/dandp_marker.svg';break;
              }
            }
          }/*else{
            var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
            vectors.addFeatures(feature.cluster);
            var dataExtent = vectors.getDataExtent();
            SASABus.map.setCenter(feature.geometry.bounds.centerLonLat);
            //SASABus.map.zoomToExtent(dataExtent);
          }*/
          return pin;
        }
      }
    }));
    var positionsLayer = new OpenLayers.Layer.Vector("carpoolingLayer", {
      styleMap: styleMap,
      //strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
    });
    positionsLayer.events.on({
      "featureselected":function(e){
        if (!e.feature.cluster){
	  redrawAllBlueFeatures(e.feature);
          var station = e.feature.attributes.stationcode;
          if (e.feature.attributes.stationtype=='CarpoolingHub'){
            resetAllIcons(e.feature);
            integreen.retrieveData(station,"carpooling/rest/",displayHubsData);
	  }
          if (e.feature.attributes.stationtype=='CarpoolingUser'){
            resetAllIcons(e.feature);
            integreen.retrieveData(station,"carpooling/rest/user/",displayUserData);
          }
        }else{
          displayClusterFeatures(e.feature.cluster);
          var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
          vectors.addFeatures(e.feature.cluster);
          var dataExtent = vectors.getDataExtent();
          SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
          SASABus.map.zoomToExtent(dataExtent);
        }
      }
    });
    this.layer = positionsLayer;
    return this.layer;
    function redrawAllBlueFeatures(feature){	
	var features = feature.layer.features;
	$.each(features,function(index,value){	
          var pin = 'images/9_Carpooling/hub_marker.svg';
          if (!value.cluster){
            if (value.attributes.stationtype == 'CarpoolingHub')
              pin= 'images/9_Carpooling/hub_marker.svg';
            else{
              switch(value.attributes.type){
                case 'A': pin='images/9_Carpooling/driver_marker.svg';break;
                case 'P': pin='images/9_Carpooling/passenger_marker.svg';break;
                case 'E': pin='images/9_Carpooling/dandp_marker.svg';break;
              }
            }
            value.style={
            	externalGraphic:pin,
                graphicWidth: 35,
                graphicYOffset:-35.75
            };
            positionsLayer.drawFeature(value);
          }
	});
    }
    function resetAllIcons(feature){
	var features = feature.layer.features;
	$.each(features,function(index,value){
		if (value.id != feature.id && value.data.stationcode != feature.data.parent && feature.data.stationcode != value.data.parent){
			var pin ="";
            		if (value.attributes.stationtype == 'CarpoolingHub')
		          pin= 'images/9_Carpooling/hub_off_marker.svg';
		        else{
			  switch(value.attributes.type){
                            case 'A': pin='images/9_Carpooling/driver_off_marker.svg';break;
                            case 'P': pin='images/9_Carpooling/passenger_off_marker.svg';break;
                            case 'E': pin='images/9_Carpooling/dandp_off_marker.svg';break;
			  }
			}
			value.style={
				externalGraphic:pin,
				graphicWidth: 35,
			        graphicYOffset:-35.75
			};
			positionsLayer.drawFeature(value);
		}
	});
    }

    function displayClusterFeatures(features){
      $('.modal').hide();
      $('.station .title').html("Choose one");
      var html ="<ul>"
      html+= '</ul>';
      $('.station .content').html(html);
      features.forEach(function(feature,index){
        var featureHtml;
        featureHtml ='<li style="text-align:center;padding:10px;background-color:#009a92;margin-bottom:10px">';
        if (feature.attributes.stationtype=='CarpoolingHub')
        featureHtml+='<a href="javascript:void(0)" class="clusterhub'+feature.attributes.stationcode+'">HUB '+feature.attributes.name+'</a>'
        if (feature.attributes.stationtype=='CarpoolingUser')
        featureHtml+='<a href="javascript:void(0)" class="clusteruser'+feature.attributes.stationcode+'">USER '+feature.attributes.name+'</a>'
        featureHtml+='</li>';
        $('.station .content ul').append(featureHtml);
        $('.station .content ul .clusterhub'+feature.attributes.stationcode).click(function(){
          resetAllIcons(feature);
          integreen.retrieveData(feature.attributes.stationcode,"carpooling/rest/",displayHubsData);
        });
        $('.station .content ul .clusteruser'+feature.attributes.stationcode).click(function(){
          resetAllIcons(feature);
          integreen.retrieveData(feature.attributes.stationcode,"carpooling/rest/user/",displayUserData);
        });
      });
      $('.station').show();
    }
    function displayHubsData(details,state){
      $('.station .title').html(details.hubName[lang]);
      $('.modal').hide();
      var html = "";
      html += '<div class="carpooling-info"><div><img style="width:50px;height:50px" src="images/9_Carpooling/location.svg"/><p>'+details.address[lang]+'<br/>'+details.city[lang]+'</p></div><hr/>';
      integreen.getStationDetails('carpooling/rest/user/',{},function(userDetails){
	var driverCount = 0, passengerCount = 0;
	for (i in userDetails){
          var value = userDetails[i];
          if (value.parentStation == details.id){
            if (value.type=='A' || value.type=='E')
              driverCount++;
            if (value.type=='P' || value.type=='E')
              passengerCount++;
          }
        }
        html += '<div><img style="width:40px;height:40px" src="images/9_Carpooling/driver.svg"/><p>'+jsT[lang].driverRequests+" "+driverCount+'</p></div>';
        html += '<div><img style="width:40px;height:40px" src="images/9_Carpooling/passenger.svg"/><p>'+jsT[lang].passengerRequests+" "+passengerCount+'</p></div>';
        html += '</div><hr/>'
        html +='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a></div>';
        $('.station .content').html(html);
        $('.station .backtomap.ibutton').click(function(){
          $('.modal').hide();
        });
        $('.station').show();
      });
    }
    function displayUserData(details,state){
      var htmlTitle = '<div> <img src="images/9_Carpooling/';
      var personType,personImg;
      if (details.type=='A'||details.type=='E'){
      	personImg = 'driver.svg';
        personType = jsT[lang].driver;
      }
      if (details.type=='P'||details.type=='E'){
        personImg = 'passenger.svg';
        personType==undefined||personType.length==0 ? personType = jsT[lang].passenger : personType += ' / '+jsT[lang].passenger;
      }
      htmlTitle += personImg;
      htmlTitle += '"/><p><strong>'+details.name+'</strong><br/>'+personType+'<br/>';
      var numberOfStars = 0;
      for (numberOfStars; numberOfStars < 5; numberOfStars++){	
        htmlTitle += numberOfStars < Math.round(details.userRating) ? '<img style="width:25px;height:25px" src="images/9_Carpooling/star.svg"/>' : '<img style="width:25px;height:25px" src="images/9_Carpooling/nostar.svg"/>';
      }
      htmlTitle += '</p>';	     
      htmlTitle += '</div>';	     
      $('.station .title').html(htmlTitle);
      $('.modal').hide();
      var html = "";
      html += '<div class="carpooling-info">';
      html += '<div><img src="images/9_Carpooling/location.svg"/><p><strong>'+jsT[lang].startAddressLabel+"</strong><br/>"+details.tripFrom.address+" ("+ details.tripFrom.city+')</p></div>';
      html += '<div><img src="images/Flag.svg"/><p><strong>'+jsT[lang].destinationHubLabel+'</strong><br/>'+details.tripToName[lang]+'</p></div>';
      if (details.pendular)	
      	html += '<div><img src="images/9_Carpooling/pendular.svg"/><strong>'+jsT[lang].pendularLabel+'</strong></div>';
      else
      	html += '<div><img src="images/9_Carpooling/pendular.svg"/><strong>'+jsT[lang].nonPendularLabel+'</strong></div>';
      html += '<div><img src="images/9_Carpooling/times.svg"/><div class="subflex"><strong>'+jsT[lang].arrivalTimeLabel+'</strong><strong>'+jsT[lang].departureTimeLabel+'</strong></div><div class="subflex"><div>'+details.arrival+'</div><div>'+details.departure+'</div></div></div>';
      if (details.additionalProperties && !jQuery.isEmptyObject(details.additionalProperties)){
        html += '<div><img src="images/9_Carpooling/notes.svg"/><strong>Notes</strong><br/>';
        //for (i in details.additionalProperties)
          //html += "<p>"+i+": "+details.additionalProperties[i]+"</p>";
        html += '</div>';
      }    
      html +='</div>';
      html +='<div><a target="_blank" href="https://hub.flootta.com/bzbga/de/board.aspx?id_u='+details.id.replace('carpooling:','')+'" class="ibutton" ><div>Contact person</div></a></div>';
      html +='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>';
      $('.station .content').html(html);
      $('.station .backtomap.ibutton').click(function(){
        $('.modal').hide();
      });
      $('.station').show();
    }
  },
  populate: function(){
    var self = this;
    if (self.hubs == undefined)
    self.getTypes(self.retrieveStations);
  },
  getTypes : function(callback){
    integreen.getStationDetails('carpooling/rest/',{},displayBrands);
    function displayBrands(data){
      var usertype =  "'E'\\,'A'\\,'P'";
      var hubs = {
        nothingSelected : function(){
          var selected = true;
          for (i in hubs){
            if (hubs[i].active === true)
            selected = false;
          }
          return selected;
        }
      };
      $.each(data,function(index,value){
        hubs[value.id] = {
          active:true,
          name:value.name
        };
      });
      $('.carpoolingtypes').empty();
      var hubArray = [];
      for (key in hubs){
	  if (hubs[key].name != 'nothingSelected'){	
	      hubs[key].id=key;
              hubArray.push(hubs[key]);
          }
      }
      hubArray.sort(function(a,b){return a.name > b.name ? 1:-1});
      $.each(hubArray,function(index,value){
        if (typeof value == 'function')
            return true;
        var brandClass= value.id.replace(/[^a-zA-Z0-9]/g,'_');
        $('.carpooling .carpoolingtypes').append('<li class="clearfix carpoolinghub"><p>'+value.name+'</p><a brand='+value.id+' href="javascript:void(0)" class="toggler">'
        +'<svg width="55" height="30">'
        +       '<g>'
        +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#009a92" height="24"/>'
        +               '<circle cx="34" cy="17" r="9" fill="#009a92" />'
        +       '</g>'
        +       'Sorry, your browser does not support inline SVG.'
        + '</svg>'
        + '</a></li>'
      );
    });
    $('.carpooling .carpoolingtypes').append('<hr/>');
    $('.carpooling .carpoolingtypes').append('<li class="clearfix driver"><p>Autista</p><a href="javascript:void(0)" class="toggler">'
    +'<svg width="55" height="30">'
    +       '<g>'
    +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#009a92" height="24"/>'
    +               '<circle cx="34" cy="17" r="9" fill="#009a92" />'
    +       '</g>'
    +       'Sorry, your browser does not support inline SVG.'
    + '</svg>'
    + '</a></li>'
  ).append('<li class="clearfix passenger"><p>Passeggero</p><a href="javascript:void(0)" class="toggler">'
  +'<svg width="55" height="30">'
  +       '<g>'
  +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#009a92" height="24"/>'
  +               '<circle cx="34" cy="17" r="9" fill="#009a92" />'
  +       '</g>'
  +       'Sorry, your browser does not support inline SVG.'
  + '</svg>'
  + '</a></li>'
);
var statusText = hubs.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
$('.carpooling .main-config').append('<a href="javascript:void(0)" class="deselect-all" >'+statusText+'</a>');
$('.carpooling .main-config').append('<hr/>');
integreen.retrieveData("innovie","carpooling/rest/",displayAllData);
function displayAllData(stationData,currentState){
  $('.carpooling .main-config').append(stationData.name);
  $('.carpooling .main-config').append("<ul>");
  $.each(currentState,function(index,newestData){
    $('.carpooling .main-config').append("<li>"+index+' '+newestData.value+"</li>");
  });
  $('.carpooling .main-config').append("</ul>");
}
$('.carpoolinghub a').click(function(e){
  var brand = $(this).attr("brand");
  hubs[brand].active = !hubs[brand].active;
  $(this).toggleClass("disabled");
  var statusText = hubs.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
  $('.carpooling .deselect-all').text(statusText);
  carpoolingLayer.retrieveStations(hubs,usertype);
});
$('.driver a, .passenger a').click(function(e){
  $(this).toggleClass("disabled");
  var driverStatus = !$('.driver a').hasClass("disabled");
  var passengerStatus = !$('.passenger a').hasClass("disabled");
  if (driverStatus==true && passengerStatus==true) usertype = "'E'\\,'A'\\,'P'";
  else if (driverStatus == true) usertype = "'A'\\,'E'";
  else if (passengerStatus == true) usertype ="'P'\\,'E'";
  else usertype ='';
  carpoolingLayer.retrieveStations(hubs,usertype);
});
$('.carpooling .deselect-all').click(function(){
  var nothingSelected = hubs.nothingSelected();
  if (!nothingSelected){
    $('.carpooling .toggler').addClass('disabled');
    usertype = '';
  }
  else{
    $('.carpooling .toggler').removeClass('disabled');
    usertype = "'E'\\,'A'\\,'P'";
  }

  $.each(hubs,function(index,value){
    if (typeof value != 'function')
    hubs[index].active = nothingSelected;
  });
  var statusText = hubs.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
  $('.carpooling .deselect-all').text(statusText);
  carpoolingLayer.retrieveStations(hubs,usertype);
});
if (callback != undefined)
callback(hubs,usertype);
}
}
}
