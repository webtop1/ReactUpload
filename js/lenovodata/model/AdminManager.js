define('lenovodata/model/AdminManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');
    /**
     * log tool function
     * @param str
     */
    var log=function(str){
        var isDebug=(location.search.indexOf("debug")>-1?true:false);
        if(isDebug&&console&&console.log){
            console.log(str);
        }
    };
    /**
     * 添加管理员
     * @param params :[{ uid: 27,role: 1},{},...]
     * @param callback
     */
    exports.add=function(params,callback){
        log("start add roleId...");
        var uri = "/v2/role/batch_add";
        var paramsStr="entries="+JSON.stringify(params);
        Util.ajax_json_post(uri, paramsStr, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                callback(retVal);
            }
        );
    };
    /**
     * 删除管理员
     * @param params :[{ uid: 27,role: 1},{},...]
     * @param callback
     */
    exports.del=function (params,callback){
        log("start delele admin  ...");
        var uri = "/v2/role/batch_delete";
        var paramsStr="entries="+JSON.stringify(params);
        Util.ajax_json_post(uri, paramsStr, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                callback(retVal);
            }
        );
    };
    /**
     * 查询管理员数据
     * @param params {roleId:1}
     * @param callback
     */
    exports.loadRoleData=function(params,callback){
        log("start loadRoleData roleId :"+params.roleId);
        var uri = '/v2/role/list?role='+params.roleId;
        Util.ajax_json_get(uri,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                callback(retVal);
            }
        );
    };
});
