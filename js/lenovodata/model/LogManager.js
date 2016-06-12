define('lenovodata/model/LogManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;

    var Util = require('lenovodata/util');
    var URL_PREFIX = Util.getApiVersion();
    var errCount = 0;

    /*
     * @brief 日志列表
     * @param func 回调函数
     * @fromTime  起始日期
     * @toTime 终止日期
     * @category 操作类型
     * @action 动作
     * @offset 其实页 
     * @limit 显示页数
     * @return 
     */
    exports.list = function(func, fromTime, toTime, category, action, uid, offset, limit) {
        var uri = URL_PREFIX + '/log/get?';

        if (fromTime) {
            uri += '&from_date=' + fromTime;
        }
        if (toTime) {
            uri += '&to_date=' + toTime;
        }
        if (category) {
            uri += '&category=' + category;
        }
        if (action) {
            uri += '&action=' + action;
        }
        if(uid){
            uri += '&operator=' + uid;
        }
        if(offset != undefined){
            uri += '&offset=' + offset;
        }
        if(limit){
            uri += '&limit=' + limit;
        }

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     * @brief 日志导出
     * @param func 回调函数
     * @fromTime  起始日期
     * @toTime 终止日期
     * @category 操作类型
     * @action 动作
     * @offset 其实页 
     * @limit 显示页数
     * @return 
     */
    exports.downlog = function(fromTime, toTime, category, action, uid, offset, limit) {
        var uri = URL_PREFIX + '/log/download?';
		
        if (fromTime) {
            uri += '&from_date=' + fromTime;
        }
        if (toTime) {
            uri += '&to_date=' + toTime;
        }
        if (category) {
            uri += '&category=' + category;
        }
        if (action) {
            uri += '&action=' + action;
        }
        if(uid){
            uri += '&operator=' + uid;
        }
        if(offset != undefined){
            uri += '&offset=' + offset;
        }
        if(limit){
            uri += '&limit=' + limit;
        }

        return uri
    };
    
    
	exports.stat = function(func,name , offset, pageSize,type) {
		offset = offset == 0 ? -1 : offset;
        var uri = URL_PREFIX + '/stat/'+type+"?name="+name+"&offset="+offset+"&pageSize="+pageSize;

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    
});
