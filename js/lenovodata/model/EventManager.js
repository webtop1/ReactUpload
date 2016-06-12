define('lenovodata/model/EventManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var URL_PREFIX = Util.getApiVersion()+'/event';
    var EventManager = function(){
    	
    }
    EventManager.prototype = {
    	list:function(func,postData){
    		var uri =  URL_PREFIX+"/pull";
	        Util.ajax_json_post(uri,postData, function(xhr, textStatus){
	                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
	                if(retVal.data.hasOwnProperty('total')){
	                	retVal.total = retVal.data.total;
	                }
	                if(!retVal.data.hasOwnProperty('event')){
	                	retVal.data.event = [];
	                	retVal.total = 0;
	                }
	                func(retVal);
	            }
	        );
    	},
    	list_no_wait:function(func,postData){
    		var uri =  URL_PREFIX+"/pull";
	        Util.ajax_json_post_nowait(uri,postData, function(xhr, textStatus){
	                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
	                if(retVal.data.hasOwnProperty('total')){
	                	retVal.total = retVal.data.total;
	                }
	                if(!retVal.data.hasOwnProperty('event')){
	                	retVal.data.event = [];
	                	retVal.total = 0;
	                }
	                func(retVal);
	            }
	        );
    	},
    	hasNew:function(func,postData){
    		var uri =  URL_PREFIX+"/unread/count";
    		Util.ajax_json_post_nowait(uri,postData, function(xhr, textStatus){
	                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
	               	var hasNew = false;
	               	var count = 0;
	               	if(retVal.code == 200 && retVal.data.hasOwnProperty('count') && parseInt(retVal.data.count) > 0){
	               		hasNew = true;
	               		count = parseInt(retVal.data.count);
	               	}
	                func({hasNew:hasNew,count:count});
	            }
	        );
    }
    
    	
    	
    }
    module.exports = EventManager;
});
