/**
 * @fileOverview 收藏操作工具类
 * @author litong
 * @version 3.6.0.1
 * @updateDate 2015/11/26
 */
;define("component/fileManager/favorite_tools",function(require,exports,module){
    var $ = require("jquery"),
        FileModel = require('model/FileManager.js'),
        Tips=require('tips'),
        Util = require('lenovodata/util'),
        ConfirmDialog = require("component/confirmDialog"),
        _ = $.i18n.prop;
    require("mustache");

    /**
     *  收藏页面存储的metaData模型（举例）
     *  "access_mode": 2047,
        "authable": true,
        "bytes": 0,
        "creator": "我",
        "creator_uid": 27,
        "delivery_code": "14c1b495468abb481cb7062967a225a0",
        "desc": "",
        "from": "",
        "from_name": "",
        "hash": "",
        "is_deleted": false,
        "is_dir": true,
        "is_shared": true,
        "is_team": true,
        "modified": "2015-11-19T10:16:07 08:00",
        "neid": 135,
        "nsid": "1",
        "path": "/test",
        "path_type": "ent",
        "prefix_neid": "",
        "result": "success",
        "share_to_personal": false,
        "size": "0 bytes",
        "updator": "我",
        "updator_uid": 27
     */

    /**
     * 查询收藏
     * @param fileList
     */
    exports.getItem = function(fileList,func) {
        var filter = {}
        filter.p = fileList.pageN;
        filter.sort = fileList.sort;
            FileModel.getFavorite(filter,function (result) {
                if (result.code == 200) {
                        //成功后获取到metaData数据放到data中
                        var data = result.data, datas = [];
                        fileList.favoriteData = data;
                    if(data.length<50){
                        fileList.reachEnd = true;
                    }
                        //fileList.totalSize = result.data.total_size;
                        for (var i = 0, ii = data.length; i < ii; i++) {
                            //拿到每个收藏文件的快照
                            var item = data[i].snapshot;
                            item.modified = data[i].ctime;
                            //初始化数据
                            var d = fileList._adapt(item);
                            //收藏页面数据处理，将paty_type放到path_type_old中，更改原paty_type为favorite供收藏使用
                            d.path_type_old = "favorite";
                            d.bookmark_id = item.id;
                            d.is_bookmark = false;//收藏页面默认不显示收藏标志
                            //d.updator = _(d.updator);//因为是快照，所以内容无法改变。
                            datas.push(d);
                        }
                        //if (path != '') {
                        //    file = Util.resolvePath(data.path, data.is_dir);
                        //    self.parentData = data;
                        //}
                    //fileList.render(datas);
                    if (func) func(datas);
                    } else {
                        if (error) error();
                    }
            });
    };
    /**
     * 更新收藏
     * @param item 本行数据
     * @param fileList的上下文
     * @param 回调函数
     */
    exports.updateItem = function(item,fileList,func) {
        fileList.currItem = item;
        //先请求这个文件最新的数据
        FileModel.metadata(function (result) {
            if (result.code == 200) {
                var data = result.data, datas = [];
                data.content = [];//对于文件夹的收藏在请求最新数据时去掉里面的content内容
                item.snapshot = data;
                //成功获取文件最新内容后执行收藏更新操作
                FileModel.updateFavorite(function (result) {
                    if (result.code == 200) {
                        var d = fileList._adapt(result.data.snapshot);
                        d.path_type_old = d.path_type;
                        d.path_type = "favorite";
                        d.id = result.data.id;
                        d.is_bookmark = false;//收藏页面默认不显示收藏标志
                        result.data.snapshot = d;
                        //成功获取文件后执行回调
                        func(result);
                    }
                },item);
            } else if(result.code == 404){
                  //文件不存在时弹窗提示
                new ConfirmDialog({title:_("原文件已被更改"),content:_("您选择的文件/文件夹已不存在，您确定删除吗？")},function(){
                    FileModel.removeFavorite(function(ret) {
                        if (ret.code == 200) {
                            fileList.reload();
                            Tips.show(_("此条收藏已被删除！"));
                        }else {
                            Tips.warn(ret.message);
                        }
                    }, fileList.currItem);
                },function(){
                    //alert("不删除~~~~");
                });
            }else {
                if (error) error();
            }
        }, '/a', item);
    }

    /**
     * 收藏页面点击文件夹跳转
     * @param 跳转路径
     */
    exports.changePath = function(path_type) {
        if(path_type == "ent"){
            window.location = "/";
        }else if(path_type == "share_in"){
            window.location = "/folder/shared";
        }else if(path_type == "share_out"){
            window.location = "/folder/myshare";
        }else{
            window.location = "/folder/self";
        }
    }

    /**
     * 收藏页面点击文件跳转
     * @param 跳转路径
     */
    exports.changePathFile = function(path_type) {
        alert();
    }

    exports.metadata = function(filter, self, func) {
        var ROOT = 'databox';
        var URL_PREFIX = Util.getApiVersion();

        var ORDERBY = {
            MTIME: "mtime",
            NAME: "name",
            TYPE: "updator",
            SIZE: "size"
        }
        var ORDERNAME = {
            mtime:'创建时间',
            name:'名称',
            type:'更新者',
            size:'大小'
        }
        var SORT = {
            ASC: "asc",
            DESC: "desc"
        }

        var CONTENT_TYPE = {
            DIR: "dir",
            FILE: "file"
        }

        //获取文件/目录的元数据d的URI
        var uri = URL_PREFIX + '/metadata/' + ROOT + path;
        uri = uri.replace('\/\/','\/');
        if (!filter) filter = {};
        var queryString = [];
        if (filter.neid){
            queryString.push('neid=' + filter.neid);
        }else{
            if (filter.path_type)  queryString.push('path_type=' + filter.path_type);
        }
        if(filter.from) queryString.push('from=' + filter.from);
        if(filter.prefix_neid) queryString.push('prefix_neid=' + filter.prefix_neid);
        if (!filter.include_deleted) (filter.include_deleted = 'false');

        //uri += 'include_deleted=' + filter.include_deleted;
        queryString.push('include_deleted=' + filter.include_deleted);

        if (filter.list)  queryString.push('list=' + filter.list);
        if (filter.hash)  queryString.push('hash=' + filter.hash);
        if (filter.rev)   queryString.push('rev=' + filter.rev);
        if (filter.limit) queryString.push('limit=' + filter.limit);
        filter.offset = filter.offset ? filter.offset : 0;
        queryString.push('offset=' + filter.offset);
        if (filter.sort) queryString.push('sort=' + filter.sort);

        var paramErr = true;

        for (var key in ORDERBY) {
            if (ORDERBY[key] === filter.orderby) {
                paramErr = false;
                break;
            }
        }

        if (!paramErr) queryString.push('orderby=' + ORDERBY[key]);

        paramErr = true;

        for (var key in CONTENT_TYPE) {
            if (CONTENT_TYPE[key] === filter.content_type) {
                paramErr = false;
                break;
            }
        }

        if (!paramErr) queryString.push('content_type=' + CONTENT_TYPE[key]);

        if (queryString.length>0) {
            uri += '?' + queryString.join("&");
        }

        ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                if(retVal.code != 200){
                    filter.bookmark_id = filter.id;
                    new ConfirmDialog({title:_("原文件已被更改"),content:_("您选择的文件/文件夹已不存在，您确定删除吗？")},function(){
                        FileModel.removeFavorite(function(ret) {
                            if (ret.code == 200) {
                                self.reload();
                                Tips.show(_("此条收藏已被删除！"));
                            }else {
                                Tips.warn(ret.message);
                            }
                        }, filter);
                    },function(){
                        //alert("不删除~~~~");
                    });
                }
                func(retVal);
            }
        );
    };

    function ajax_json_get_nowait (url, callback,async) {
        url = encodeURI(url);
        url = url.replace(/\+/g, '%2B');
        url = url.replace(/#/g, '%23');
        if (url.indexOf('?') == -1) {
            url += "?_=" + (+new Date());
        } else {
            url += "&_=" + (+new Date());
        }
        url = Util._generateURLStr(url);
        $.ajax({
            type: 'GET',
            url: url,
            async: async||false,
            dataType: 'json',
            complete: function() {
                callback.apply(this, arguments);
            }
        });
    }

    function _generateURLStr (url){
        var account_id_add = Util.getAccountId(),uid_add = Util.getUserID();
        if(uid_add&&account_id_add){
            if(url.indexOf('?') == -1){
                url +="?account_id="+account_id_add;
            }else{
                url +="&account_id="+account_id_add;
            }
            url +="&uid="+uid_add;
        }
        return url;
    }


});