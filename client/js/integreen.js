var config = {
	integreenEndPoint:'http://ipchannels.integreen-life.bz.it/',
	frontEnd:'',
	callback: function(){
		console.err("Declare a callback function to display Data");
	},
}

var integreen = {
	retrieveData: function(station,frontEnd,callback){
		config.frontEnd=frontEnd;
		config.callback=callback;
        	$.ajax({
                	url : config.integreenEndPoint + config.frontEnd + 'get-station-details',
	                dataType : 'json',
        	        crossDomain: true,
                	success : function(data) {
	                        for (i in data){
        	                        if (data[i].id == station || data[i].parent == station){
                	                        integreen.getCurrentData(data[i]);
                        	        }    
	                        }    
        	        }    
	       });  
	},	
	getCurrentData: function(stationDetails){
        	var currentState = {};
        	$.ajax({url:config.integreenEndPoint + config.frontEnd + 'get-data-types?station='+stationDetails.id,success: function(datatypes){
                	getData(datatypes);
	        }});
        	function getData(types){
                	if (types.length==0){
                        	config.callback(stationDetails,currentState);
	                        return;
        	        }
                	var type = types.pop()[0];
	                var params ={station:stationDetails.id,name:type,seconds:600};
        	        $.ajax({
                	        url : config.integreenEndPoint + config.frontEnd + 'get-records?'+$.param(params),
                        	dataType : 'json',
	                        crossDomain: true,
        	                success : function(result) {
                	                currentState[type] = result[result.length-1].value;
                        	        getData(types);
	                        }
        	        });
	        }
	},
}
