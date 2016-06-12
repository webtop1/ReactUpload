define('lenovodata/model/StatManager', function(require, exports, module) {
    var Util = require('lenovodata/util');
    var URL_PREFIX = Util.getApiVersion();

    
    exports.space_get = function(func,from,to,statBy) {
        var uri = URL_PREFIX + '/log/capacity?fromDate='+from+"&toDate="+to+"&statBy="+statBy;
        Util.ajax_json_get_nowait(uri,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    exports.active_get = function(func,from,to,statBy) {
        var uri = URL_PREFIX + '/log/user_activity?fromDate='+from+"&toDate="+to+"&statBy="+statBy;
        Util.ajax_json_get_nowait(uri,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    exports.usage_get = function(func) {
        var uri = URL_PREFIX + '/log/quota_usage';
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
});
