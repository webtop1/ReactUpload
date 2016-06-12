define('lenovodata/model/NoticeManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var VERSION = Util.getApiVersion();
    var URL_PREFIX = VERSION + '/notice';

    /*
     * @brief 创建通知。
     * @param title 
     * @param body 
     * @return 
     */
    exports.create = function(func, title, body) {
        var uri = URL_PREFIX + '/create';
    
        var post_data = {
            title: title, 
            body: body 
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 删除通知
     * @param notice_id
     * @return 
     */
    exports.del = function(func, notice_id) {
        var uri = URL_PREFIX + '/delete/' + notice_id;
    
        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 列表
     * @param notice_id
     * @return 
     */
    exports.list = function(func, limit, offset) {
        var uri = URL_PREFIX + '/list';
    
        var queryString = [];
        queryString.push('limit=' + parseInt(limit));
        queryString.push('offset=' + parseInt(offset));

        if (queryString.length>0) {
            uri += '?' + queryString.join('&');
        }

        Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
        
    };

    exports.pull = function(func, limit, offset, sort) {
        var uri = URL_PREFIX + '/pull';
    
        var queryString = [];
        if(limit){
            queryString.push('limit=' + parseInt(limit));
        }
        if(offset!=undefined){
            queryString.push('offset=' + parseInt(offset));
        }
        if(sort){
            queryString.push('sort=' + sort);
        }

        if (queryString.length>0) {
            uri += '?' + queryString.join('&');
        }

        Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
        
    };

    /*
     * @brief 修改通知
     * @param notice_id
     * @param content
     * @return 
     */
    exports.update = function(func, notice_id, title, body) {
        var uri = URL_PREFIX + '/update/' + notice_id;
    
        var post_data = {
            title: title, 
            body: body 
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 通知置顶
     * @param notice_id
     * @param content
     * @return 
     */
    exports.top = function(func, notice_id, index) {
        var uri = URL_PREFIX + '/top/' + notice_id;
    
        var post_data = {
            Top_index: index
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 通知设为以读
     * @param notice_id
     * @return 
     */
    exports.viewed = function(func, notice_id) {
        var uri = URL_PREFIX + '/viewed/' + notice_id;
    
        Util.ajax_json_post_nowait(uri, {}, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

});
