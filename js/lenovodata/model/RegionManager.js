define('lenovodata/model/RegionManager', function(require, exports, module) {
    var Util = require('lenovodata/util');
    var URL_PREFIX = Util.getApiVersion();

    /*
     * @brief ��ȡ���������б�
     * @param func �ص�����
     * @param user_slug
     * @param password
     * @return
     */
    exports.list = function(func) {
        var uri = URL_PREFIX + '/region/list';
        Util.ajax_json_get(uri,function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

});
