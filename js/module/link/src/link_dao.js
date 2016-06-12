/**
 * @fileOverview 脚本文件描述
 * @author thliu-pc
 * @version 3.4.1.0
 * @updateDate 2015/9/6
 */
define('module/link/src/link_dao', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');
    var ROOT = 'databox';
    var URL_PREFIX = Util.getApiVersion()+'/delivery';
    /*
     * @brief 创建外链，外链关联的内容为<root>/<path>指定的子树。
     * @param func 回调函数
     * @param path 文件的路径
     * @path_type 路径类型
     * @from 共享者的uid
     * @neid 元数据ID
     * @prefix_neid 当path_type为share_in/share_out的时候有效
     * @mode 权限，有效值为r、w、rw（默认）
     * @password    密码，默认没有密码
     * @expiration  有效期，单位为秒，默认4*3600
     * @description 外链说明
     * @return
     */
    exports.create = function(func, path, path_type, from, neid,prefix_neid, mode, password, expiration, description) {
        var uri = URL_PREFIX + '/create/' + ROOT + '/' + path;
        uri = uri.replace('\/\/','\/');

        var postData = {
            mode: mode,
            password: password,
            expiration: expiration,
            description: description
        };

        if(neid){
            postData.neid = neid;
        }else {
            postData.path_type = path_type;
            postData.from = from;
        }
        if(prefix_neid) {
            postData.prefix_neid = prefix_neid;
        }
        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 删除外链，外链关联的内容为<root>/<path>指定的子树。
     * @param func 回调函数
     * @param path 文件的路径
     * @return
     */
    exports.del = function(func, path) {
        var uri = URL_PREFIX + '/delete/' + ROOT + '/' + path;
        uri = uri.replace('\/\/','\/');

        var postData = {
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量删除外链。
     * @param func 回调函数
     * @param codes
     * @return
     */
    exports.batch_del = function(func, codes) {
        var uri = URL_PREFIX + '/batch_delete/';

        var postData = {
            codes: codes
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 获取外链信息
     * @param func 回调函数
     * @param code
     * @return
     */
    exports.info = function(func, code) {
        var uri = URL_PREFIX + '/info/' + code ;
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 外链认证
     * @param func 回调函数
     * @return
     */
    exports.auth = function(func, code, password) {
        var uri = URL_PREFIX + '/auth/' + code ;

        var postData = {
            password: password
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );

    };

    /*
     * @brief 获取外链，列举当前用户的所有外链信息。
     * @param func 回调函数
     * @return
     */
    exports.list = function(func, include_expired) {
        var uri = URL_PREFIX + '/list' ;
        if(include_expired){
            uri = uri + '?include_expired=true'
        }else{
            uri = uri + '?include_expired=false'
        }
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 获取外链文件/目录的元数据
     * @param func 回调函数
     * @param path 文件的路径
     * code  外链编码
     * relative_path 要查看的内容相对于外链的路径信息
     * token 令牌
     * @return
     */
    exports.metadata = function(func, code, relative_path, token, order_type,sort,offset,limit) {

        if (!code) {
            return {code: 999, data: null, message:_('code不能为空!')};
        }

        var uri = URL_PREFIX + '/metadata/' + code;

        if (relative_path) {
            uri +=  '/' + relative_path;
        }

        var queryString = [];
        if(token){
            queryString.push('token='+token);
        }
        if(order_type){
            queryString.push('orderby='+ order_type);
        }
        if(sort){
            queryString.push('sort='+sort);
        }

        if(offset != undefined){
            queryString.push('offset='+offset);
        }
        if(limit) {
            queryString.push('limit='+limit);
        }
        if (queryString.length>0) {
            uri += '?' + queryString.join("&");
        }
        uri = uri.replace('\/\/','\/');

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 发送邮件通知
     * @param func 回调函数
     * @param link 外链
     * @param emails
     * @param message 消息
     * @param isfolder 外链是否是文件夹
     * @param name 文件名/文件夹名
     * @param path 路径
     * @return
     */
    exports.sendmail= function(func, link, emails, message, isfolder, name, path) {

        var uri = '/mail/sendlink/';

        var postData = {
            link: link,
            email: emails,
            message: message,
            isfolder: isfolder,
            name: name,
            path: path
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    exports.batch_transfer = function(func,delivery_code,from_pathes,to_path,password){
        var uri = URL_PREFIX + '/transfer/'+delivery_code;

        var data = JSON.stringify({
            from:from_pathes,
            to:to_path
        });
        var post_data = {json:data};
        if(password){
            post_data.password = password;
        }
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_batch_result(xhr, textStatus, _("文件转存成功"));
                func(retVal);
            }
        );
    };
    /*
     *查询用户邮箱列表
     *param key 关键字
     * 
     * */
    exports.getUserEmailList = function(func, key, offset, limit) {
        var uri = Util.getApiVersion() + '/user/search?query=' + key + "&offset=" + offset + "&limit=" + limit + "&pattern=head&type=email" ;
    
        Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    

});
