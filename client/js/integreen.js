var defaultConfig = {
	integreenEndPoint:'http://ipchannels.integreen-life.bz.it/'
}
function mergeConfig(config){
	if (config){
		var keys = Object.keys(config);
		for (i in keys){
			defaultConfig[keys[i]] = config[keys[i]];
		}
	}	
}
var integreen = {
	retrieveData: function(station,frontEnd,callback,config){
		mergeConfig(config);
        	$.ajax({
                	url : defaultConfig.integreenEndPoint + frontEnd + 'get-station-details',
	                dataType : 'json',
        	        crossDomain: true,
                	success : function(data) {
	                        for (i in data){
        	                        if (data[i].id == station || data[i].parent == station){
                	                        integreen.getCurrentData(data[i],frontEnd,callback);
                        	        }    
	                        }    
        	        }    
	       });  
	},	
	getCurrentData: function(stationDetails,frontEnd,callback,config){
		mergeConfig(config);
        	var currentState = {};
        	$.ajax({url:defaultConfig.integreenEndPoint + frontEnd + 'get-data-types?station='+stationDetails.id,success: function(datatypes){
                	getData(datatypes);
	        }});
        	function getData(types){
                	if (types.length==0){
                        	callback(stationDetails,currentState);
	                        return;
        	        }
                	var type = types.pop()[0];
	                var params ={station:stationDetails.id,type:type};
        	        $.ajax({
                	        url : defaultConfig.integreenEndPoint + frontEnd + 'get-newest-record?'+$.param(params),
                        	dataType : 'json',
	                        crossDomain: true,
        	                success : function(result) {
					if (result.value != undefined)
	                	                currentState[type] = result;
                        	        getData(types);
	                        }
        	        });
	        }
	},
	getChildStationsData : function(station,url,callback,config){
		var children = [];
		var dtos = [];
        	$.ajax({
                	url : defaultConfig.integreenEndPoint + url + 'get-station-details',
	                dataType : 'json',
        	        crossDomain: true,
                	success : function(data) {
				for (i in data){
					if (data[i].parentStation == station)
						children.push(data[i]);
				}
				retrieveRecursivly(children);
				
        	        }    
	       });  
	       function retrieveRecursivly(){
			if (children.length <= 0)
				callback(dtos);
			var child = children.pop();
			if (child)
				integreen.retrieveData(child.id,url,addData);
		};
	       function addData(details,newestRecord){
			var child = {
				detail:details,
				newestRecord:newestRecord
			}
			dtos.push(child);
			retrieveRecursivly();
		};
	
	}
}
