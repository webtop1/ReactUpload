define('lenovodata/model/FileManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var ROOT = 'databox';
    var URL_PREFIX = Util.getApiVersion();

    var STORAGE_URL = Util.getStorageUrl();

    /*
     * @brief 获取文件/目录的元数据。
     * @param func 回调函数
     * @param path 目录或文件的路径
     * @param path_type 路径类型   ent:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param file_limit 返回结果的条数 	默认10000
     * @param with_seed 是否带文件seed 	true/false,默认false
     * @param list 是否是列目录，默认值为true
     * @param [option] offset 请求的偏移量，从0开始
     * @param [option] limit 请求的偏移量，从0开始
     * @param [option] include_deleted 指明是否返回目录下已经删除的子项，默认值为false。
     * @param [option] rev 指定文件的特定版本。
     * @param [option] hash 调用/metadata列举目录时，服务器会根据目录包括的子项(单层)生成一个hash 值，
     *             后续对该目录再次调用/metadata，hash值可以使服务器能够返回304（未修改)，
     *             而不需要重新传输并未发生变化的元数据列表（可能非常大）。
     *             当path指向的是文件，或list参数设置为false，则该参数被忽略。
     * @param [option] orderby 排序字段 （mtime, name, type, size) , 默认是mtime
     * @param [option] sort    排序方式 	asc/desc,默认desc
     * @return 
     */
    var ORDERBY = exports.ORDERBY = {
        MTIME: "mtime",
        NAME: "name",
        TYPE: "updator",
        SIZE: "size"
    }
    var ORDERNAME = exports.ORDERNAME = {
            mtime:'创建时间',
            name:'名称',
            type:'更新者',
            size:'大小'
        }
    var SORT = exports.SORT = {
        ASC: "asc",
        DESC: "desc"
    }

    var CONTENT_TYPE = exports.CONTENT_TYPE= {
        DIR: "dir",
        FILE: "file"
    }

    var request_id = null;
    exports.metadata = function(func, path, filter) {
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

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    exports.metadata_path_info_no_wait = function(func,neid,path_type){
    	var uri = URL_PREFIX + '/path_info?neid='+neid+'&path_type='+path_type;
    	Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
	exports.metadata_no_wait = function(func, path, filter) {
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

        Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 获取文件的信息
     * @param path 目录或文件的路径
     * @param path_type 路径类型   en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @return 
     */
    exports.info = function(func, path, path_type, from, neid) {

        var uri = URL_PREFIX + '/info/' + ROOT + path;
        
        uri += "?neid=" + neid +"&path_type=" + path_type;
        if(from){
            uri += "&from=" + from;
        }

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
     /*
     * @brief 设置定期清理
     * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param desc 文件或者文件夹描述
     * @param clean_mode 设置文件夹清理模式：auto：自动清理，time:到期清理，period:周期清理
     * @param clean_arg  auto：10天，30天，90天；time：2014-8-12；period:m-1 / w-1 / d-1
     * @param field 操作的字段 	"desc" or "clean"，如果是desc，则表示这次设置的信息是备注，忽略定期清理，如果是clean，表示只设置定期清理，为空则同时设置
       @param   infoData = {path, path_type, from, neid, desc, clean_mode, clean_arg, field}
     * @return
     */
    exports.info_set = function(func, infoData) {
        var uri = URL_PREFIX + '/info_set/' + ROOT + infoData.path +'?a';
        var post_data ={};
        
        if(infoData.neid){
       		post_data.neid = infoData.neid;
        }else {
	       	post_data.path_type = infoData.path_type;
	       	post_data.from = infoData.from; 
        }
        infoData.field && (post_data.field = infoData.field);
		if(!infoData.clean_arg || infoData.clean_arg){
			post_data.clean_arg= infoData.clean_arg
		}
		if(!infoData.clean_mode || infoData.clean_mode){
			post_data.clean_mode= infoData.clean_mode
		}
		
        if(infoData.field=='desc'){
        	if(!infoData.desc){
        		post_data.desc = "";
        	}else{
        		post_data.desc = infoData.desc;
        	}
        }
        
        Util.ajax_json_post(uri,post_data,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };     
    
    /*
     * @brief 对文件名/目录名进行搜索，搜索范围为<root>/<path>指定的子树。
     * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param file_limit 搜索返回的最大数量限值，隐含值为1000
     * @param type 文件类型
     * @param content_type 	内容类型 	file/dir
     * @param time_start && time_end 时间范围
     * @param size_start && size_end 文件大小范围
     * @param creator 创建者
     * @param desc 是否包含备注
     * @param orderby 排序字段 （mtime, name, type, size)
     * @param sort    排序方式 	asc/desc
     * @param query 查询的子串，长度至少为3个字符
     * @param include_deleted 指明是否对已删除的项进行搜索
     * @return 
     */
    exports.search = function(func, path, path_type, from, neid,offset,file_limit, type, query,include_deleted, size_start, size_end, time_start, time_end,creator, desc,prefixNeid) {
        var uri = URL_PREFIX + '/search/' + ROOT + path;
        uri = uri.replace('\/\/','\/');
    
        if (query === undefined) {
            return {code: 999, data: null, message:_('查询字符串,不能为空!')};
        }
        uri += "?query=" + query;
        
		if (neid){
			uri += "&neid=" + neid;
			uri += "&prefix_neid=" + prefixNeid;
		}
		
		if (path_type) uri += "&path_type=" + path_type;
        if (from) uri += "&from=" + from;
		
        
		if(offset) uri +="&offset=" + offset;
        if (file_limit) uri += "&limit=" + file_limit;
        uri += "&include_deleted=" + include_deleted;
        if (size_start) uri += "&size_start=" + size_start;
        if (size_end) uri += "&size_end=" + size_end;
        if (time_start) uri += "&time_start=" + time_start;
        if (time_end) uri += "&time_end=" + time_end;
        if (creator) uri += "&creator=" + creator;
        if (type) uri += "&type=" + type;
        if (desc) uri += "&desc=" + desc;

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };


    /*
     * @brief 全文检索，搜索范围为<root>/<path>指定的子树。
     * @param func 回调函数
     * @param path 文件的路径
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param file_limit 搜索返回的最大数量限值，隐含值为1000
     * @param type 文件类型
     * @param content_type 	内容类型 	file/dir
     * @param time_start && time_end 时间范围
     * @param size_start && size_end 文件大小范围
     * @param creator 创建者
     * @param desc 是否包含备注
     * @param orderby 排序字段 （mtime, name, type, size)
     * @param sort    排序方式 	asc/desc
     * @param query 查询的子串，长度至少为3个字符
     * @param include_deleted 指明是否对已删除的项进行搜索
     * @return
     */
    exports.searchByFulltext = function(func, path, path_type, from, neid,offset,file_limit, type, query,include_deleted, size_start, size_end, time_start, time_end,creator, desc,exact,prefixNeid,FullTextIndex) {
        var uri = URL_PREFIX + '/search_fulltext/' + ROOT + path;
        uri = uri.replace('\/\/','\/');

        if (query === undefined) {
            return {code: 999, data: null, message:_('查询字符串,不能为空!')};
        }
        uri += "?query=" + query;

        if (neid){
            uri += "&neid=" + neid;
            uri += "&prefix_neid=" + prefixNeid;
        }

        if (path_type) uri += "&path_type=" + path_type;
        if (from) uri += "&from=" + from;


        if(offset) uri +="&offset=" + offset;
       // if (file_limit) uri += "&limit=" + file_limit;
        uri += "&include_deleted=" + include_deleted;
        if (size_start) uri += "&size_start=" + size_start;
        if (size_end) uri += "&size_end=" + size_end;
        if (time_start) uri += "&time_start=" + time_start;
        if (time_end) uri += "&time_end=" + time_end;
        if (creator) uri += "&creator=" + creator;
        if (type) uri += "&type=" + type;
        if (desc) uri += "&with_desc=" + desc;
        if (exact) uri += "&is_exact=" + exact;
        if(FullTextIndex)uri += "&next_index=" + FullTextIndex;
        uri+="&limit=15";

        var testData={
             code:200,
            "next_index":100,
            "entrys":[{
                    "access_mode": "2011",
                    "authable": false,
                    "bytes": 0,
                    "creator": "abc",
                    "updator": "me",
                    "delivery_code": null,
                    "hash": "a741de28d9534ac4",
                    "is_deleted": false,
                    "is_dir": false,
                    "is_shared": null,
                    "modified": "2015-05-07T00:18:42+08:00",
                    "nsid": "1000d",
                    "path": "/test/addzdfdf<em>中文</em>测试",
                    "path_type": "share_in",
                    "prefix_neid": "1200",
                    "from": "2342",
                    "is_team": false,
                    "neid": "1202",
                    "context":"<em>中国</em>在全世界的影响力越来越大"
                }
            ]
        };
//        func(testData);
       Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * 文件编辑锁定
     * @param func 回调函数
     * @param path 文件的路径
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param time 	倒计时，以秒为单位 	如:1234,-1表示无期限
     * @return
     * */
	exports.lock = function(path, path_type, from,prefix_neid, neid,time,func){
		var uri = URL_PREFIX + '/lock/'+ ROOT + path ;
		
		uri += "?neid=" + neid;
		if (path_type) uri += "&path_type=" + path_type;
    	if (from) uri += "&from=" + from;
    	if (prefix_neid) uri += "&prefix_neid=" + prefix_neid;
		
		if (time) uri += "&time=" + time;
    
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
        });
       
	}
	/*
	 * 文件编辑解锁
	 * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
	 * @return 
	 * */
	exports.unLock = function(path, path_type, from, neid,func){
		var uri = URL_PREFIX + '/unlock/'+ ROOT + path;
		
		if (neid){
			uri += "?neid=" + neid;
		}else{
			if (path_type) uri += "?path_type=" + path_type;
        	if (from) uri += "&from=" + from;
		}
    
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
        });
       
	} 
	
	
	/*
	 *请求解锁-（发送邮件）
	 * param email 加锁用户的邮箱
	 * param message 发送邮件的内容 
	 * username 请求用户的用户名
	 * filepath 请求解锁文件的路径
	 * */
	exports.reqUnlock = function(func,email,message,username,filepath,path_type,from,neid){
		var uri = '/mail/requnlock/';
		var postData = {
			email:email,
			message:message,
			user_name:username,
			path:filepath,
			path_type:path_type,
			from:from,
			neid:neid
		};
		Util.ajax_json_post(uri,postData,function(xhr,textStatus){
			var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
		});
	}
	
    /*
     * @brief 获取文件的版本列表，服务器仅保存30天内的版本。
     *        每个版本有唯一的rev值，使用/restore接口和rev值，可以将文件恢复到历史版本。
     * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param rev_limit 指定返回的版本数量限值，默认值为10，最大值为1000。
     *                  如果文件的版本数超过了限制值，服务器返回406(Not Acceptable)。
     * @return 
     */

    var REVISIONS_OP = exports.REVISIONS_OP = {
        create: _("创建"),
        restore: _("恢复"),
        undelete: _("还原"),
        update: _("更新"),
        rename:_("重命名"),
        move:_('移动'),
        "delete": _("删除")
    }

    exports.revisions = function(func, path, path_type, from, neid, rev_limit) {
        var uri = URL_PREFIX + '/revisions/' + ROOT + '/' + path;
        uri = uri.replace('\/\/','\/');
            
        if (neid){
			uri += "?neid=" + neid;
		}else{
			if (path_type) uri += "?path_type=" + path_type;
        	if (from) uri += "&from=" + from;
		}

        if (rev_limit) uri += "&rev_limit=" + rev_limit;
        uri += "&t=" + Math.random();


        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 将一个文件恢复到历史版本。
     * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param rev 指定需要恢复的历史版本
     * @return 
     */
    exports.restore = function(func, path, path_type, from, neid, rev,prefix_neid) {
        var uri = URL_PREFIX + '/restore/' + ROOT + '/' + path;
        uri = uri.replace('\/\/','\/');
        var post_data = {};
        
        if (neid){
			post_data.neid = neid;
		}else{
			if (path_type)post_data.path_type = path_type; 
        	if (from)post_data.from = from; 
		}    
    	
    	post_data.rev=rev; 
    	if(path_type=="share_in"||path_type=="share_out"){
    		post_data.prefix_neid = prefix_neid;
    	}

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };


 

    
    

    /*
     * @brief 创建下载链接
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @param url 外链下载url
     * @return 
     */
    exports.downloadLink = function(path, path_type, from, neid, url, token) {
        var uri = "";
		
        if (url) {
            uri = url + '&token=' + token;
        } else {
            uri = URL_PREFIX + '/dl_router/' + ROOT + '/' + path+'?';
           
			if (path_type) uri += "path_type=" + path_type;
        	if (from) uri += "&from=" + from;
			if(neid) uri += "&neid=" + neid;
        }
        uri = uri.replace('\/\/','\/');
        uri = encodeURI(uri);
		uri = uri.replace(/#/g, '%23');
        return uri;
    };

    /*
     * @brief 创建文件/目录的archive包，提供用于下载的链接。
     * @param pathes 文件的路径 
     * @return 
     */
    exports.archives = function(pathes, url, token,path_type,from,neid,prefix_neid) {
        var uri = "";
        if($.type(pathes[0]) =='string'){
        	  var index = pathes[0].lastIndexOf("/");
        }else {
        	  var index = pathes[0].path.lastIndexOf("/");
        }
      
        var pathroot;
        if (index==0) {
            pathroot = "/";
        } else {
        	if($.type(pathes[0]) =='string'){
        		pathroot =  pathes[0].substr(0, index);
        	}else {
        		pathroot =  pathes[0].path.substr(0, index);
        	}
            
        }

        token = token?token:"";
        if (url) {
            //外链打包下载
            uri = url + "/archives/?token="+ token +'&';
        } else {
            uri = URL_PREFIX + '/archives/' + ROOT + '/' + pathroot +  '/?token='+ token +'&path_type='+path_type+'&';
            
        }
        if(from =='0' || from){
        	uri +='from='+from +"&";
        }
        if(neid){
        	uri += 'neid='+neid+'&';
        }
       
        var files = [];
        for (var i=0,len=pathes.length; i<len; i++) {
            files.push("files[]=" + encodeURIComponent(pathes[i]));
        }
        files.push("account_id="+window.LenovoData.user.account_info._id);
        files.push("uid="+window.LenovoData.user.user_info.uid);
        files.push("X-LENOVO-SESS-ID="+$.cookie("X-LENOVO-SESS-ID"));
        uri = uri + files.join('&');
        
        var storageUrl = STORAGE_URL;
        if(/box.lenovo.com/.test(STORAGE_URL)) {
        	storageUrl = "https://content-box.vips100.com";
        }
        uri = uri.replace('\/\/','\/');
        uri = storageUrl + uri.replace('\/\/','\/');
        
        return uri
    };

    /*
     * @brief 获取文件预览URL
     * @param func 回调函数
     * @param path 文件的路径 
     * @param render 渲染的类型， 有效值为html5和flash
     * @return 
     */
    exports.preview = function(path, rev,path_type,from,neid,fileType) {
        var type="doc";
        if(Util.isVideo(fileType)){
            type="av";
        }
        var uri = URL_PREFIX +  '/preview_router?type='+type+'&root='+ ROOT + '&path=' + Util.getMyEncodeURI(path) + '&path_type='+path_type +'&from'+from +'&neid='+neid+'&';
        uri += "rev="+rev;
        uri = uri.replace('\/\/','\/');
        return uri;
    };

    /*
     * @brief 获取图像文件的缩略图URL
     * @param func 回调函数
     * @param path 文件的路径 
     * @param width 缩略图的宽
     * @param height 缩略图的高
     * @param isDelivery 是否为外链预览 true:false (可选)
     * @param deliveryCode 外链的deliveryCode (可选)
     * @param token 外链加密的密码  (可选)
     * @param previewUrl 外链预览url (可选)
     * @return 
     */
    exports.thumbnails = function(storage_url,path, path_type,from,neid,width, height, hash,rev,isDelivery,deliveryCode,token, previewUrl) {
        var uri = URL_PREFIX +  '/preview_router?type=pic&root='+ ROOT + '&path=';

		//外链图片预览入口
	 	if(isDelivery){
            previewUrl = Util.getMyEncodeURI(previewUrl);
            uri = previewUrl+ '&path_type='+ path_type+ "&delivery_code=" + deliveryCode + "&delivery_token=" + token;
		} else {
	            uri += Util.getMyEncodeURI(path);
	        }

		uri += '&path_type='+ path_type +'&from='+from+'&neid='+ neid +'&width='+ width + "&height=" + height + "&hash=" + hash+"&rev="+rev;
	        return uri;
    };
    
	/*
	  * @brief 单个外链图片文件预览地址
	  *
	  */
	exports.sigleThumbnails = function(path,path_type, width, height, hash,rev,deliveryCode,token){
                var uri = URL_PREFIX +  '/preview_router?type=pic&root='+ ROOT + '&path=' + encodeURI(path);
			uri = uri.replace('\/\/','\/');
			uri +='&path_type='+path_type+ '&w='+ width + "&h=" + height + "&hash=" + hash+"&rev="+rev +"&delivery_code=" + deliveryCode + "&delivery_token=" + token;
		
		return  STORAGE_URL + uri;
	}
	

    /*
     * @brief 复制文件或目录。
     * @param func 回调函数
     * @param from_path 	文件路径
     * @param from_path_type 	路径类型 	ent:企业,self:个人,share:分享 
     * @param from_from 	共享者的uid 	如:1343
     * @param from_neid 	元数据ID，upath与neid不可同时为空，同时出现时优先使用neid
     * @param to_path 	文件路径 
     * @param to_path_type 	路径类型 	ent:企业,self:个人,share:分享
     * @param to_from 	共享者的uid 	如:1343
     * @return 
     */
    exports.copy = function(func, from_path, from_path_type, from_from, from_neid, to_path, to_path_type, to_from) {
        var uri = URL_PREFIX + '/fileops/copy';
    
        var post_data = {
            root: ROOT,
            from_path: from_path, 
            to_path: to_path,
            to_path_type: to_path_type, 
            to_from: to_from 
        };
        
        if (from_neid){
			post_data.from_neid = from_neid;
		}else{
			if (from_path_type)post_data.from_path_type = from_path_type; 
        	if (from_from)post_data.from_from = from_from; 
		}

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量复制文件或目录。
     * @param func 回调函数
     * @param from_pathes 源路径
     * @param to_path 目标路径
     * @return 
     */
    exports.batch_copy = function(func, from_pathes, to_path) {
        var uri = URL_PREFIX + '/fileops/batch_copy';
    
        var data = JSON.stringify({
            from:from_pathes,
            to:to_path
        });
        var post_data = {json:data};
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_batch_result(xhr, textStatus, _("文件复制成功"));
                func(retVal);
            }
        );
    };

    /*
     * @brief 创建目录。
     * @param func 回调函数
     * @param path 文件路径 
     * @return 
     */
    exports.create_folder = function(func, path, path_type, from, neid,prefix_neid) {
        var uri = URL_PREFIX + '/fileops/create_folder/' + ROOT + path;
        uri = uri.replace('\/\/','\/');
    
        var post_data = {};
        if (neid){
			post_data.neid = neid;
		}else{
			if (path_type)post_data.path_type = path_type; 
        	if (from)post_data.from = from; 
		}
        if(/^share/.test(path_type))post_data.prefix_neid = prefix_neid;
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     * @brief 找回已删除目录。
     * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @return 
     */
    exports.undelete = function(func, path, path_type, from, neid,prefix_neid) {
        var uri = URL_PREFIX + '/fileops/undelete/' + ROOT + '/' + path;
        uri = uri.replace('\/\/','\/');
    
        var post_data = {};
        
        if (neid){
			post_data.neid = neid;
		}else{
			post_data.path_type = path_type; 
        	post_data.from = from; 
		}
		if(path_type=="share_in"||path_type=="share_out"){
        	post_data.prefix_neid = prefix_neid;
        }
		
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus, _('目录还原成功!'));
                func(retVal);
            }
        );
    };

    /*
     * @brief 删除文件/目录。
     * @param func 回调函数
     * @param path 文件的路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @return 
     */
    exports.del = function(func, path, path_type, from, neid,ignore_share) {
        var uri = URL_PREFIX + '/fileops/delete/' + ROOT + '/' + path;
        uri = uri.replace('\/\/','\/');
    
        var post_data = {};
        
        if (neid){
			post_data.neid = neid;
		}else{
			if (path_type)post_data.path_type = path_type; 
        	if (from)post_data.from = from; 
		}
        if(ignore_share)post_data.ignore_share = true;
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量删除文件/目录。
     * @param func 回调函数
     * @param pathes(数组) 文件路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @return 
     */
    exports.batch_delete = function(func, pathes,ignore_share) {
        var uri = URL_PREFIX + '/fileops/batch_delete';
    	
    	var json = {}
    	    json.pathes=[];
		
    	for(var i=0;i<pathes.length;i++){
    		var obj = {};
    		obj.root = 'databox';
    		obj.neid = pathes[i].neid;
    		obj.path = Util.getMyEncodeURI(pathes[i].path);
    		obj.from = pathes[i].from;
    		obj.path_type = pathes[i].path_type;
    		obj.prefix_neid = pathes[i].prefix_neid;
    		json.pathes.push(obj);
    	}
    	if(ignore_share)json.ignore_share = true;
        var post_data = {'json': JSON.stringify(json)};
        

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_batch_result(xhr, textStatus, _("删除成功"));
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量彻底清理已删除文件/目录。
     * @param func 回调函数
     * @param pathes(数组) 文件路径 
     * @param path_type 	路径类型 	en:企业,self:个人,share:分享
     * @param from 共享者的uid 如:1343
     * @param neid 元数据ID 如:12343
     * @return 
     */
    exports.batch_purge= function(func, pathes) {
        var uri = URL_PREFIX + '/fileops/batch_purge';
    
        var json = {}
    	    json.pathes=[];
		
    	for(var i=0;i<pathes.length;i++){
    		var obj = {};
    		obj.root = 'databox';
    		obj.neid = pathes[i].neid;
    		obj.path = Util.getMyEncodeURI(pathes[i].path);
    		obj.from = pathes[i].from;
    		obj.path_type = pathes[i].path_type;
    		json.pathes.push(obj);
    	}
    	
        var post_data = 'json = '+JSON.stringify(json);
        
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus, _("文件彻底删除成功"));
                func(retVal);
            }
        );
    };

    /*
     * @brief （新建收藏）
     * @param func 回调函数
     * @param obj 参数集合
     * @return 
     */
    exports.setFavorite = function(func,obj) {
        var uri = URL_PREFIX + '/user/bookmark/create';
        obj.path = encodeURIComponent(obj.path);
        var json = {
            uid: Util.getUserID(),
            type : "1",
            neid: obj.neid,
            title: "",
            snapshot:obj
        };
        var post_data = 'json = '+JSON.stringify(json);
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief （查询收藏内容）
     * @param func 回调函数
     * @param obj 参数集合
     * @return
     */
    exports.getFavorite = function(obj,func) {
        var uri = URL_PREFIX + '/user/bookmark/list?order='+obj.sort+'&n=50&p='+obj.p;
        Util.ajax_json_get(uri,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                //var res = {};
                //res.code = retVal.code;
                //res.message = retVal.message;
                //res.data = [];
                for(var i = 0,len = retVal.data.length;i<len;i++){
                //    if(retVal.data[i].snapshot){
                        retVal.data[i].snapshot.id = retVal.data[i].id
                //        res.data[res.data.length] = retVal.data[i];
                //    }
                }
                func(retVal);
            }
        );
    };

    /*
     * @brief （移除收藏内容）
     * @param func 回调函数
     * @param obj 参数集合
     * @return
     */
    exports.removeFavorite = function(func,obj) {
        var uri = URL_PREFIX + '/user/bookmark/delete';
        if(obj.length){
            for(var i = 0,len = obj.length;i<len;i++){
                if(i == 0){
                    uri += "?id=" + obj[i].bookmark_id;
                }else{
                    uri += "," + obj[i].bookmark_id;
                }
            }
        }else{
            uri += "?id=" + obj.bookmark_id;
        }

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    /*
     * @brief （更新收藏内容）
     * @param func 回调函数
     * @param obj 参数集合
     * @return
     */
    exports.updateFavorite = function(func,obj) {
        var uri = URL_PREFIX + '/user/bookmark/update';
        var json = {
            id:obj.id,
            uid: obj.uid,
            type : obj.type,
            neid: obj.neid,
            title:obj.title,
            snapshot:obj.snapshot
        };
        var post_data = 'json = '+JSON.stringify(json);
        Util.ajax_json_post(uri, post_data,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief （重命名）
     * @param func 回调函数
     * @param from_path 源路径
     * @param to_path   目标路径
     * @return
     */
    exports.move = function(func, from_path, from_path_type, from_from, from_neid,from_prefix_neid, to_path, to_path_type, to_from,to_prefix_neid,ignore_share) {
        var uri = URL_PREFIX + '/fileops/move';

        var post_data = {
            root: ROOT,
            from_path: from_path,
            from_path_type : from_path_type,
            from_from: from_from,
            from_neid: from_neid,
            from_prefix_neid:from_prefix_neid,
            to_path: to_path,
            to_path_type: to_path_type,
            to_from: to_from,
            to_prefix_neid:to_prefix_neid
        };
        if(ignore_share)post_data.ignore_share = true;
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量移动文件/目录。
     * @param func 回调函数
     * @param from_pathes (数组) 源路径
     * @param to_path   目标路径
     * @return 
     */
    exports.batch_move= function(func, from_pathes,to_path,ignore_share) {
        var uri = URL_PREFIX + '/fileops/batch_move';
    
        var data = {
            from:from_pathes,
            to:to_path
        };
        if(ignore_share)data.ignore_share = true;
        var post_data = {json:JSON.stringify(data)};
        
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_batch_result(xhr, textStatus, _("文件移动成功"));
                func(retVal);
            }
        );
    };  
    /*
	 * 获取外链预览的URL
	 * @param path 外链文件的路径
	 * @param delivery_code
	 * */
	exports.deliveryPreview = function(url,delivery_code,token){
		var url = url +'&delivery_code='+delivery_code+ '&delivery_token=' +token;
		return url;
	}
	
	/**
     * 个人空间数据移交
     * @param func
     * @param dest_id 目标ID
     * @param src_id 被删除ID
     */
    exports.space_transfer = function(func,infoDate){
    	var uri = URL_PREFIX + '/transfer';
    	var post_data = {
    		dest_id:infoDate.dest_id,
    		src_id:infoDate.src_id
    	};
    	Util.ajax_json_post(uri,post_data,function(xhr,textStatus){
    		var retVal = Util.ajax_json_process_normal_result(xhr,textStatus);
    		func(retVal);
    	});
    }

    /**
     * 个人空间数据移交
     * @param func
     * @param dest_id 目标ID
     * @param src_id 被删除ID
     */
    exports.getVedioStat = function(func,neid,hash){
        var uri = URL_PREFIX + '/av_stat';
            uri+="?neid="+neid+"&hash="+hash;
        Util.ajax_json_get(uri,function(xhr,textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr,textStatus);
            func(retVal);
        });
    }
	
	
});
