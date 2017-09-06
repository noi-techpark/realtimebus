var myparkings;
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
    //integreen.retrieveData(station,"parking/rest/",displayData);
    $('.modal').hide();
    $('.parkingLot').show();
    $('.parkingLot .title').html("Hallo");
    $('.parkingLot .content').html('<a href="javascript:void(0)" class="backtomap ibutton"><div>'+jsT[lang].backtomap+'</div></a><hr/>');
    $('.parkingLot .content .backtomap.ibutton').click(function(){
      $('.modal').hide();
    });

  }
            }
    });
    this.layer = positionsLayer;
    return this.layer;

    function displayData(details, state){

    }
  },
  getParkings : function(){
    function displayParkingList(){
      var list = '';
      var newList = '';
      $.each(myparkings,function(index,value){
        list+='<li><a href="#" title="" id="'+value.id+'" class="list-parkings">';
        list+='<h4>'+value.name+'</h4>';
        list+='<div class="metadata clearfix">';
        list+='<div class="address">'+value.mainaddress+'</div>';
        list+='</div>';
        list+='</a></li>';
      });
      $(".parking .parking-list").html(list);
      $(".parking-list li a").click(function(){
        var id = $(this).attr("id");
        $.each(myparkings, function(index, value){
          if(value.id === id){
            newList+='<li><a href="#" title="" id="'+value.id+'" class="list-parkings">';
            newList+='<h4>'+value.name+'</h4>';
            newList+='<div class="metadata clearfix">';
            newList+='<div class="address">'+value.mainaddress+'</div>';
            newList+='<div class="capacity">Capacity: '+value.capacity+'</div>';
            newList+='<div class="phone">Phone: '+value.phonenumber+'</div>';
            newList+='</div>';
            newList+='</a></li>';
          }
        });
        $(".parking .parking-list").html(newList);
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
