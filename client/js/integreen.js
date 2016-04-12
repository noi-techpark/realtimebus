var defaultConfig = {
	integreenEndPoint:'http://test-mapserver.tis.bz.it:8080/'
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
	getStationDetails : function(frontEnd,config,callback){
		mergeConfig(config);
        	$.ajax({
                	url : defaultConfig.integreenEndPoint + frontEnd + 'get-station-details',
	                dataType : 'json',
        	        crossDomain: true,
                	success : function(data) {
                		callback(data);
        	        }    
	       });  
	},
	retrieveData: function(station,frontEnd,callback,config){
	       	this.getStationDetails(frontEnd,config,filterStation);  
	      	function filterStation(data){
		       	for (i in data){
	        		if (data[i].id == station || data[i].parent == station){
                			integreen.getCurrentData(data[i],frontEnd,callback);
                        	}
			}    
	        }
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
	getChildStationsData : function(station,frontEnd,callback,config){
		var children = [];
		var dtos = [];
	       this.getStationDetails(frontEnd,config,filterStation);  
	       function filterStation(data){
	       		for (i in data){
				if (data[i].parentStation == station)
					children.push(data[i]);
			}
			retrieveRecursivly(children);
		        function retrieveRecursivly(){
				if (children.length <= 0)
					callback(dtos);
				var child = children.pop();
				if (child)
					integreen.retrieveData(child.id,frontEnd,addData);
		       }
		       function addData(details,newestRecord){
				var child = {
					detail:details,
					newestRecord:newestRecord
				}
				dtos.push(child);
				retrieveRecursivly();
			}
		}
	}
}
