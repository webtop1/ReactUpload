define('lenovodata/model/AclManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');
    var VERSION = Util.getApiVersion();
    var URL_PREFIX = VERSION;

    /*
     * @brief 授权创建。
     * @param repository
     * @param path
     * @param action
     * @param agents
     * @return 
     */
    exports.create = function(repository, path, action, agents) {
        var uri = URL_PREFIX + '/acl/create';
    
        var post_data = {
            repository: repository,
            path: path,
            action: action,
            agents: agents
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            }
        );
        return retVal;
    };

    /*
     * @brief 删除授权
     * @param acl_id
     * @return 
     */
    exports.del = function(acl_id) {
        var uri = URL_PREFIX + '/acl/delete/' + acl_id;
    
        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            }
        );
        return retVal;
    };
});
