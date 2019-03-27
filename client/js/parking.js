var myparkings;
var config = {
  types: [["occupied","","","300"]]
};
var parkingLayer = {
  isCached: true,
  retrieveParkingLots : function(){
    var  params = {
      request:'GetFeature',
      typeName:'edi:parking',
      outputFormat:'text/javascript',
      format_options: 'callback: parkingJson'
    };
    $.ajax({
      url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
      dataType : 'jsonp',
      crossDomain: true,
      jsonpCallback : 'parkingJson',
      success : function(data) {
        var features = new OpenLayers.Format.GeoJSON().read(data);
        parkingLayer.layer.removeAllFeatures();
        parkingLayer.layer.addFeatures(features);
      },
      error : function() {
        console.log('problems with data transfer');
      }
    });

  },
  populate: function(){
    var self = this;
    self.retrieveParkingLots();
  },
  get:function(){
    if (this.isCached && this.layer != undefined)
    return this.layer;
    var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
      externalGraphic: '${externalGraphic}',
      graphicWidth: 35,
      graphicYOffset:-35.75,
    },
    {
      context: {
        externalGraphic:function(feature){
          var pin= 'images/7_Parking/Pin.svg';
          if(!feature.cluster){
            var occupacy = feature.attributes.occupacypercentage;
            if(occupacy >= 90){
              pin = 'images/7_Parking/Pin_red.svg';
            }else if(occupacy >= 75){
              pin = 'images/7_Parking/Pin_orange.svg';
            }else{
              pin = 'images/7_Parking/Pin_green.svg';
            }
          }
          return pin;
        }
      }
    }));
    var positionsLayer = new OpenLayers.Layer.Vector("parkingLayer", {
      styleMap: styleMap,
      strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
    });
    positionsLayer.events.on({
      "featureselected":function(e){
        if (!e.feature.cluster){
          var station = e.feature.attributes.stationcode;
          integreen.retrieveData(station,"parkingFrontEnd/rest/",parkingLayer.displayData, config);

        }else{
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

  },
  displayData: function(details, state){
    var html = ''
    $('.modal').hide();
    var updatedOn = moment(state['occupied'].timestamp).locale(lang).format('lll');
    $('.parkinglot-detail .title').html(details.name +"<br/><small>"+updatedOn+"</small>");
    html+='<div class="number-available"></div>';
    html+='<div class="caption">' + jsT[lang].availableParkingSpaces+'</div><hr/>';
    html+='<div class="metadata clearfix">';
    html+='<div class="address">'+details.mainaddress+'</div>';
    html+='<div class="capacity">'+ jsT[lang].capacity +': ' +details.capacity+'</div>';
    html+='<div class="phone">'+jsT[lang].phone + ' ' + details.phonenumber+'</div>';
    if(details.disabledtoiletavailable)
      html+='<div class="disabledtoilet">'+ jsT[lang].disabledtoilet +'</div>';
    if(details.disabledcapacity)
      html+='<div class="disabledcapacity">'+ jsT[lang].disabledcapacity + ': ' + details.disabledcapacity+'</div>';
    if(details.owneroperator)
      html+='<div class="operator">'+ jsT[lang].operator + ': ' +details.owneroperator+'</div>';
    html+='</div>';
    html+='<hr/><a href="javascript:void(0)" class="backtomap ibutton"><div>'+jsT[lang].backtomap+'</div></a><hr/>';
    $('.parkinglot-detail .content').html(html);
    $('.parkinglot-detail').show();
    $('.parkinglot-detail .backtomap.ibutton').click(function(){
      $('.modal').hide();
    });
    if (state['occupied'].value > details.capacity * 0.75){
      $('.parkinglot-detail .number-available').removeClass("free");
    }
    else{
      $('.parkinglot-detail .number-available').addClass("free");
    }
    radialProgress($('.parkinglot-detail .number-available')[0])
    .diameter(180)
    .value(details.capacity-state['occupied'].value)
    .maxValue(details.capacity)
    .render();
  },
  getParkings : function(){
    function displayParkingList(){
      var list = '';
      var newList = '';
      $.each(myparkings,function(index,value){
        list+='<li><a href="#" title="" id="'+value.id+'" class="list-parkings" data-lon="'+ value.longitude +'" data-lat="'+ value.latitude +'">';
        list+='<h4>'+value.name+'</h4>';
        list+='<div class="metadata clearfix">';
        list+='<div class="address">'+value.mainaddress+'</div>';
        list+='</div>';
        list+='</a></li>';
      });
      $(".parking .parking-list").html(list);
      $(".parking-list li a").click(function(){
        integreen.retrieveData($(this).attr('id'), "parkingFrontEnd/rest/",parkingLayer.displayData, config);
        var lonLat = new OpenLayers.LonLat($(this).attr('data-lon'), $(this).attr('data-lat')).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
        SASABus.map.setCenter(lonLat);
        SASABus.map.zoomToExtent(lonLat);
      });
    }
    function loadParkings(url){
      $.ajax({
        type: 'GET',
        crossDomain: true,
        url: url,
        dataType: 'json',
        success: function(response, status, xhr) {
          myparkings = response;
          displayParkingList();
        },
        error: function(xhr, status, error) {
          console.log(error);
        }
      });
    }
    var url = "http://idm-dev-fe.eu-west-1.elasticbeanstalk.com/parking/rest/get-station-details";
    if (myparkings == undefined){
      $(".parking .main-config .toggler").click(function(evt){
        $(this).toggleClass("disabled");
        displayParkingList();
      });
      loadParkings(url);
    }else{
      displayParkingList();
    }
  },
}
