;define('lenovodata/fileController', function(require, exports){

	var $ = require('jquery'),
		Util = require('util'),
		Dialog = require('component/dialog'),
        Tips = require('component/tips'),
		FileModel = require('model/FileManager'),
        Favorite = require('component/fileManager/favorite_tools.js'),
		AuthModel = require('model/AuthManager'),
		DeliveryModel = require('model/DeliveryManager'),
		ConfirmDialog = require('component/confirmDialog'),
		HistoryDialog = require('component/historyDialog'),
		RenameDialog  = require('component/renameDialog'),
		CleanupDialog  = require('component/cleanupDialog'),
		FileAttrDetail  = require('component/fileAttrDetail'),
		SetAuthDialog  = require('component/setAuthDialog'),
		DeliveryDialog  = require('component/deliveryDialog'),
		DirSelectDialog= require('component/dirSelectDialog'),
		UserTeamAuthList = require("component/userTeamAuthList"),
		AuthDialog = require("component/authDialog"),
		LockDialog = require("component/lockDialog"),
		ReqUnlockDialog = require('component/reqUnlockDialog'),
		AddFolder = require('component/addfolder'),
		CopyMove = require('component/copymove'),
		TransferAuthDialog = require("component/transferauthdialog");
        require('mustache');
	require('i18n');
	require("placeholder");
	var	_ = $.i18n.prop;
    var EventTarget = require('eventTarget');
    
	function controller(context, type, param, token){
		switch(type){
            case 'purge':
                purge(context, param);
            break;
            case 'remove':
            	//limit 100
        		if(param.length>100){
        			Tips.warn(_("批量操作数量不能超过100"));
        			return;
        		}
                remove(context, param);
            break;
            case 'copymove':
            	//limit 100
        		if(param.length>100){
        			Tips.warn(_("批量操作数量不能超过100"));
        			return;
        		}
                copymove(context, param);
            break;
            case 'history':
                history(context, param);
            break;
            case 'recover':
            	//批量还原
            	if( $.type(param) == "array"){
            		for(var i=0; i<param.length; i++){
            			recover(context,param[i])
            		}
            	}else{
            		recover(context, param);
            	}
            break;
            case 'favorite':
                favorite(context, param);
            break;
            case 'cancelFavorite':
                cancelFavorite(context, param);
            break;
            case 'rename':
                rename(context, param);
                break;
            case 'cleanup':
                cleanup(context, param);
            break;
            case 'share':
                share(context, param);
            break;
            case 'rmShare':
                rmShare(context, param);
            break;
            case 'auth':
                auth(context, param);
            break;
            case 'transfer':
                transfer(context, param);
            break;
            case 'exitshare':
                exitshare(context, param);
            break;
            case 'cancelauth':
                cancelauth(context, param);
            break;
            case 'rmAuth':
                rmAuth(context, param);
            break;
            case 'download':
            	//limit 100
        		if(param.length>100){
        			Tips.warn(_("批量操作数量不能超过100"));
        			return;
        		}
                download(context, param, token);
            break;
            case 'attribute':
                attribute(context, param);
            break;
            case 'remarkEdit':
            	remarkEdit(context,param);
            break;
            case 'lock':
            	lock(context,param);
            break;
            case 'unlock':
            	unlock(context,param);
            break;
            case 'reqUnlock':
            	reqUnlock(context,param);
            break;
            case 'addfolder':
            	addfolder(context,param);
            break;
            case 'preview':
                preview(context,param,token);
            case 'label':
                label(context,param,token);
        }
	}

    function _getPathes(param) {
        var pathes = [];
        var obj = {};
        if (Object.prototype.toString.call(param) === "[object Array]") {
            for (var i=0, len=param.length; i<len; i++) {
            	obj = {
            		'neid':param[i].neid,
            		'path':param[i].path,
            		'from':param[i].from,
            		'path_type':param[i].path_type,
            		'prefix_neid':param[i].prefix_neid
            	}
            	pathes.push(obj);
            }
        } else {
            obj = {
            		'neid':param.neid,
            		'path':param.path,
            		'from':param.from,
            		'path_type':param.path_type,
            		'prefix_neid':param.prefix_neid
            	}
            pathes.push(obj);
        }
        
//      pathes.push("");
        return pathes;
    }

    function purge(context, param){
        var pathes = _getPathes(param);
        
        if (pathes.length == 0) {
            Tips.show(_("请选择要彻底删除的文件。"));
            return;
        }
        new ConfirmDialog({title: _("删除确认"), content: _("您确认要彻底删除选中的文件么？")}, _callback);
   
        function _callback() {
            FileModel.batch_purge(function(ret) {
                if (ret.code == 200) {
                    Tips.show(ret.message);
                } else {
                    Tips.warn(ret.message);
                }
                context.reload();
            }, pathes); 
        }

    }

    function remove(context, param){
        var pathes = _getPathes(param);
        if(param.path_type == 'share_out' || (param.path_type == 'self'&& param.isShare) ){
        	_callback();
//      	new ConfirmDialog({title: _("确认"), content: _("删除后其他被共享的用户将无法继续查看该文件！")}, _callback);
        }else{
        	new ConfirmDialog({title: _("删除确认"), content: _("您确认要删除选中的文件么？")}, _callback);
        }
   
        function _callback() {
            FileModel.batch_delete(function(ret) {
                if (ret.code == 200) {
	                context.reload();                	     
                    Tips.show(ret.message);
                }else if(ret.code==412){
                	new ConfirmDialog({title:_("删除确认"),content:ret.message,okBtn:_("继续")},function(){
                		FileModel.batch_delete(function(res) {
			                if (res.code == 200) {				                
				                context.reload();                	     
			                    Tips.show(res.message);
			                }else {
			                    Tips.warn(Object.prototype.toString.call(res.message)=="[object Array]"?ret.message.join("<br>"):ret.message);
			                }
			            }, pathes,true);
                	 });
                } else {
                    Tips.warn(Object.prototype.toString.call(ret.message)=="[object Array]"?ret.message.join("<br>"):ret.message);
                }
            }, pathes); 
        }

    }
    function copymove(context, param){
    	var cm =new CopyMove();
        var dialog = new DirSelectDialog({teamPath:"/",title: _('移动/复制到指定位置'),
                                          buttonContext: '<div class="dialog-button-area"><a id="create-folder" class="dialog-button create-folder disabled"><i class="icon"></i>'+_('新建文件夹')+'</a><a id="move-file" class="dialog-button disabled">' + _('移动') +'</a> <a id="copy-file" class="dialog-button disabled">' + _('复制') + '</a></div>'},
                                          450, 250,/*Util.isAdmin()?true:*/false,true);
        cm.path_type = Object.prototype.toString.call(param) === '[object Array]' ? param[0].path_type : param.path_type;
        dialog.on('changePath',function(realpath, cssAction,dirData){
        	cm.changePath(dialog,realpath,cssAction,dirData);
        });
        cm.bindEvent(dialog,param,context);
    }
	
	var pathNum=0;
	var pathLen;
    function recover(context, param) {
        var path = param.path;
        var path_type = param.path_type;
        var from = param.from;
        var neid = param.neid;
        var rev = param.rev;  
        var prefix_neid = param.prefix_neid;
        if(context.fa.data&&context.fa.data.length){pathLen=context.fa.data.length}

            FileModel.undelete(function(ret) {
                if (ret.code != 200) {
                    Tips.warn(ret.message);
                    return;
                } else {
                	pathNum++;
                	if(pathLen ==pathNum){
                    	Tips.show(ret.message);   
                    	pathNum = 0;
                	}
                    context.reload();
                }
            }, path,path_type,from,neid,prefix_neid);
    }

    function history(context, param) {
        var path = param.path;
        var filename = param.name;
        var neid = param.neid;

        var contents = [];
        Util.sendBuridPointRequest();
        FileModel.revisions(function(ret) {
            if (ret.code != 200) {
                Tips.warn(ret.message);
                return;
            }
            var len = ret.data.length;
            for (var i = len - 1; i>=0; i--) {
                var file = ret.data[i];
                var curVer;
                (i == len-1)? (curVer =true):(curVer = false);
                var version=file.version.toUpperCase();
                contents.push({neid:neid,version: version, rev: file.rev, path: file.path, user: file.user, revop:FileModel.REVISIONS_OP[file.op], modified: Util.formatDate(file.modified, 'yyyy.MM.dd'),curVer:curVer});
            }
            
            var dialog = new HistoryDialog({title: filename, content: contents}, function(op, path,neid,rev) {
                if (op == "restore") {
                	$('body').data('category','historyrecover').data('action','历史版本画面恢复').data('content','文件');
                    FileModel.restore(function(ret) {
                        if (ret.code != 200) {
                            Tips.warn(ret.message);
                            return;
                        } else {
                            Tips.show(ret.message);
                        }
                        context.reload();
                        dialog.close();
                    }, path,'','',neid,rev,param.prefix_neid);
                } else if (op == "download") {
                    var uri = FileModel.downloadLink(path,'','',neid,'','',rev);
                    Util.sendDirectlyRequest('历史版本','历史版本画面下载','文件');
                    $('#download-iframe').attr('src', uri + '&rev=' + rev);
                }
            });

            dialog.on('close', function(){
            });
        }, path,'','',param.neid); 
    }

    //创建收藏操作
    function favorite(context, param){
        if(param.length > 1){
            for(var i = 0,len = context.filelist.data.length;i<len;i++){
                for(var j = 0,lg = param.length;j<lg;j++){
                    if(param[j].neid == context.filelist.metaData[i].neid && !param[j].is_bookmark && !param[j].isdelete){
                        FileModel.setFavorite(function(ret) {
                            if (ret.code == 200) {
                                context.reload();
                                Tips.show(_("收藏成功"));
                            }else {
                                Tips.warn(ret.message);
                            }
                        }, context.filelist.metaData[i]);
                    }
                }
            }
        }else{
            var currParam;
            for(var i = 0,len = context.filelist.metaData.length;i<len;i++){
                if(param.neid == context.filelist.metaData[i].neid){
                    currParam = context.filelist.metaData[i];
                }
            }
            FileModel.setFavorite(function(ret) {
                if (ret.code == 200) {
                    context.reload();
                    Tips.show(_("收藏成功"));
                }else {
                    Tips.warn(ret.message);
                }

            }, currParam);
        }
    }
    //取消收藏操作
    function cancelFavorite(context, param){
        FileModel.removeFavorite(function(ret) {
            if (ret.code == 200) {
                context.reload();
                Tips.show(_("已取消收藏"));
            }else {
                Tips.warn(ret.message);
            }
        }, param);
    }

    //暂时取消此功能
    //收藏页面文件跳转回原路径方法
    //function cancelFavorite(context, param){
    //    Favorite.changePathFile();
    //}

    function rename(context, param) {
        var oldfilename = param.name;
        var reneid = param.neid;
        var path_type = 'ent';
        var path_from = param.from;
		var from_prefix_neid = to_prefix_neid = param.prefix_neid;
        var title;
        
        if (param.isfolder) {
            title = _("将文件夹重命名为");
        } else {
            title = _("将文件重命名为");
        }
        
        renamefn();
       
		function renamefn() {
			var dialog = new RenameDialog(oldfilename, title,  _callback,context); 
	        function _callback(newfilename,cur) {
	            if (newfilename == "") {
	                if (param.isfolder) {
	                    Tips.warn(_("文件夹名不能为空"));
	                } else {
	                    Tips.warn(_("文件名不能为空"));
	                }
	                return;
	            }
	
	            if (oldfilename == newfilename) {
	         	    cur.find('.file-name').show();
	        	    $('.edit-name').remove();
	                return;
	            }
	
	            if (!Util.validFilename(newfilename)) {
	                return;
	            }
	
	            var path = param.path;
	            var i = path.lastIndexOf("/");
	            path = path.substr(0, i+1);
	            var from_path =  param.path;
	            var path_type =  param.path_type;
	            var to_path = path + newfilename;
	
	            FileModel.move(function(ret) {
	                if (ret.code == 200) {
	                	context.reload();
	                    Tips.show(ret.message);
	                }else if(ret.code==412){
	                	new ConfirmDialog({content:ret.message,okBtn:_("继续")},function(){
	                		FileModel.move(function(ret) {
				                if (ret.code == 200) {
				                	context.reload();
				                    Tips.show(ret.message);
				                }else {
				                    Tips.warn(ret.message);
				                }				                
				            }, from_path,path_type,path_from,reneid,from_prefix_neid, to_path,path_type,path_from,to_prefix_neid,true); 
	                	});
	                } else {
	                    Tips.warn(ret.message);
	                }
	                
	            }, from_path,path_type,path_from,reneid,from_prefix_neid, to_path,path_type,path_from,to_prefix_neid);          
	        }
		}
        
    }
    
    function cleanup(context, param) {

        var dialog = new CleanupDialog(context,param);

    }

    function download(context, param, token) {
    	Util.sendBuridPointRequest();
        var uri = "about:blank";

        if(param.dataUrl || (param[0] && param[0].dataUrl)){
            uri = (param.dataUrl || param[0].dataUrl) +'?token='+ token;
            uri = encodeURI(uri).replace(/#/g,"%23");
            $('#download-iframe').attr('src', uri);
            return;
        }

        function confirmDownload(fn){
            var dg = new Dialog(_('提示'), function(context){
                var template = '<div class="dialog-oldversion">' + _("加密文件需要使用客户端才能解密，如果您还未下载客户端请安装客户端。") + '<br><a class="link-button" target="_blank" href="/client/windows/bin/LenovoBox.zip">'+_('下载Windows客户端')+'</a><br><br></div><div class="dialog-button-area"><a id="cancel" class="dialog-button ok">' + _("继续") + '</a><a id="cancel" class="dialog-button cancel">' + _("关闭") + '</a></div>';
                context.append(template);
                context.find('.ok').on('click', function(){
                    fn();
                });
                context.find('.cancel').on('click', function(){
                    dg.close();
                });
            });
        }
		//打包下载
        if (Object.prototype.toString.call(param) === "[object Array]" || param.isfolder) { 
        	if(param.isfolder) { 
        		param = new Array(param);//把单个目录转成数组
        	}
            if (param.length > 1) {
                var pathes = _getPathes(param);
                uri = FileModel.archives(pathes, param[0].dataUrl, token,param[0].path_type,param[0].from,param[0].neid); 
				
                setUri();
            } else if (param.length == 1){
                var fileObj = param[0];
                if (fileObj.isfolder) {
                    uri = FileModel.archives([fileObj.path], fileObj.dataUrl,token,fileObj.path_type,fileObj.from,fileObj.neid);
                    setUri();
                } else {
                    if(/\.lock$/.test(fileObj.path)){
                        confirmDownload(function(){
                            uri = FileModel.downloadLink(fileObj.path, fileObj.dataUrl, token);
                            setUri();
                        });
                    }else{
                        uri = FileModel.downloadLink(fileObj.path, fileObj.dataUrl, token);
                        setUri();
                    }
                }
            }
        }
        //单个文件下载
        else {
            if(/\.lock$/.test(param.path)){
                confirmDownload(function(){
                    uri = FileModel.downloadLink(param.path,param.path_type, param.from,param.neid, param.dataUrl, token);
                    setUri();
                });
            }else{
                uri = FileModel.downloadLink(param.path,param.path_type, param.from,param.neid,param.dataUrl, token);
                setUri();
            }
        }

        function setUri(){
	    var session_id = $.cookie("X-LENOVO-SESS-ID");
            if (uri.indexOf('?') != -1) {
            	if(param.rev)
                uri += '&rev=' + param.rev;
            } else {
                uri += '?rev=' + param.rev +'&neid='+param.neid;
                uri = uri.replace('\/\/','\/');
            }
            
            if(uri.indexOf("account_id")==-1&&uri.indexOf("uid")==-1){
            	uri = Util._generateURLStr(uri);
            }
            var postform = document.createElement("form");
            var actionurl = uri.substr(0,uri.indexOf("?")).replace(/%/g,"%25").replace(/#/g,"%23");
            var query = Util.queryString(uri.substring(uri.indexOf('?')) );
            postform.action = actionurl + '?path_type='+query.path_type+"&X-LENOVO-SESS-ID=" + session_id;
            if(/^share/.test(query.path_type)){
            	//判断是否根目录
            	if(!actionurl[actionurl.indexOf('/archives/databox/')+18]){
            		Tips.warn(_('我的共享根目录下不支持打包下载'));
            		return;
            	}
            	postform.action +="&from="+context.currentData.from;
            	postform.action +="&prefix_neid="+context.currentData.prefix_neid;
            }
            postform.enctype="application/x-www-form-urlencoded";
            postform.method = "post";
            postform.target = "download-iframe";
            if(param.length){
                for(i=0;i<param.length;i++){
                	var input = document.createElement("input");
                	input.type = "hidden";
                	input.name = "files[]";
                	input.value = param[i].path;
                	
                	postform.appendChild(input);
                }
                document.body.appendChild(postform);  
                postform.submit();
                document.body.removeChild(postform);
            }else{
            	 $('#download-iframe').attr('src',  uri);
            }
                
        }
    }

    function attribute(context, param,onOff) {
        if (param.isfolder) {
            FileModel.info(function(ret) {
            	
                if (ret.code != 200) {
                    Tips.warn(_("很抱歉，您的操作失败了，建议您重试一下！"));
                    return;
                }
                param.dirNum = ret.data.dir_num;
                param.fileNum = ret.data.file_num;
                param.size = ret.data.size;
                
                var template = '<p><span>'+ _('大　　小') +'：</span><span>'+param.size+'</span></p>'+
        						'<p><span>'+ _('包　　含') +'：</span><span>'+param.fileNum+_('个文件，')+ param.dirNum+ _('个文件夹') +'</span>'+
        						'</p>';
                if($('.infoAuth .attribute').find('.i-arrow2').length == 1){
                	$('.infoAuth .foldermore').show().html(template);
               		$('.infoAuth .attribute').find('span').text(_('收起'));
                	$('.infoAuth .attribute').find('i').removeClass('i-arrow2').addClass('i-arrow4');	
                }else{
                	$('.infoAuth .foldermore').empty().hide();
            	 	$('.infoAuth .attribute').find('span').text(_('更多'));
                	$('.infoAuth .attribute').find('i').removeClass('i-arrow4').addClass('i-arrow2');
                }
                
               
//              new FileAttrDetail({data:param, isFolder: true}, function(){});
            }, param.path,param.path_type,param.from,param.neid);
        } else {
//          new FileAttrDetail({data:param, isFolder: true}, function(){});
        }
                    
        Util.sendBuridPointRequest();
    }

    function auth(context, param) {
        var obj = null;
        if (Object.prototype.toString.call(param) === "[object Array]") {
             obj = param[0];
        } else {
             obj = param;
        }
        new AuthDialog(obj,function(){context.reload();});
    }

    function rmAuth(context, param) {
        var ids = [];
        if (Object.prototype.toString.call(param) === "[object Array]") {
            for (var i=0, len=param.length; i<len; i++) {
                ids.push({'neid':param[i].neid,'grant_type':0})
            }
        } else {
            ids.push({'neid':param.neid,'grant_type':0});
        }
        if(ids.length==0){
        	Tips.warn(_("请选择需要删除的授权！"));
        	return;
        }
        new ConfirmDialog({content: _("要删除选中的授权么？")}, function() {
            AuthModel.batch_del(function(ret) {
                if (ret.code == 200) {
                    Tips.show(ret.message);
                } else if (ret.code == 500) {
                    Tips.warn(ret.message.join("<br>"));
                    return;
                } else {
                    Tips.warn(ret.message);
                    return;
                }
                context.reload();
            }, ids);
        });
    }

    function share(context, param) {
        var obj = null;
        if (Object.prototype.toString.call(param) === "[object Array]") {
             obj = param[0];
        } else {
             obj = param;
        }
            if (!obj.isfolder&&Util.getPrivatePrivilege(obj.cssAction).canUpload&&!Util.getPrivatePrivilege(obj.cssAction).canPreview&&!Util.getPrivatePrivilege(obj.cssAction).canDownload) {
                Tips.warn(_("上传外链的权限，不能创建文件的外链！"));
            } else {
                require.async('link',function(linkMain){
                    var linkInstance;
                    var d=new Dialog(_('外链分享'),{minHeight:420,minWidth:486},function(content){
                        obj.wrapper=content;
                        linkInstance = new linkMain(obj);
                        linkInstance.init();
                    });
                    d.on('close',function(){
                        linkInstance.destory();
                        context.reload();
                    });
            })
            }
        }

    function rmShare(context, param) {
        var codes = [];
        if (Object.prototype.toString.call(param) === "[object Array]") {
            for (var i=0, len=param.length; i<len; i++) {
                codes.push(param[i].deliveryCode);
            }
        } else {
            codes.push(param.deliveryCode);
        }
        new ConfirmDialog({title:_("确认取消外链"),content: '<p style="text-align:center">'+_("您确认要取消外链么？")+'</p>'}, function() {
            DeliveryModel.batch_del(function(ret) {
                if (ret.code == 200) {
                    Tips.show(ret.message);
                    $(".file-attr-select").css("display","none");
                } else if (ret.code == 500) {
                    Tips.warn(ret.message.join("<br>"));
                    return;
                } else {
                    Tips.warn(ret.message);
                    return;
                }
                context.reload();
            }, codes);
        });
    }
    
    function remarkEdit(context,param){
    	var editDialog = new Dialog(_("备注编辑"),function(parent){
    		parent.append("<div style='background:#FFFFFF;'><textarea style='margin:10px 20px;padding:5px;width:298px;height:150px;resize:none;' placeholder='"+_("最多可输入50个汉字或100个字符")+"' maxlength=100></textarea></div><div class='dialog-button-area'><a class='dialog-button ok'>"+_("确定")+"</a><a class='dialog-button cancel'>"+_("取消")+"</a></div>");
    		if(param.desc){
    			$("textarea",parent).val(param.desc);
    		}else{
    			$("textarea").placeholder();
    		}	
    		parent.find(".ok").on("click",function(){
    			var desc = $.trim($("textarea").val());
    			if(desc&&desc==param.desc||(!desc&&!param.desc)){
    				editDialog.close();
    				return;
    			}
    			if(Util.getBytes(desc)>100){
    				Tips.warn(_("最多可输入50个汉字或100个字符"));
    				return;
    			}
    			var postData = {
    				path:param.path,
    				neid:param.neid,
    				desc : desc,
        			field:'desc'
    			}
    			FileModel.info_set(function(result){
    				if(result.code==200){
    					editDialog.close();
    					param.desc = desc;
    					//$(".fileAttribute .remark").attr("title",desc).text(desc);
    					context.fa.render(param.isfolder?"folder":"file",param);
    					Tips.show(_("备注设置成功"));
    				}else{
    					editDialog.close();
    					Tips.warn(result.data.message);
    				}
    			},postData);			
    		});
    		parent.find(".cancel").on("click",function(){
    			editDialog.close();
    		});
    	});
    	
    }

    function lock(context,param){
    	new LockDialog(context,param);
    }
    
    function unlock(context,param){
    	Util.sendBuridPointRequest();
    	FileModel.unLock(param.path,'',param.from,param.neid,function(ret){
    		if(ret.code == 200){
    			Tips.show(_('解锁成功'));
    			context.reload();
    		}else{
    			Tips.warn(ret.message);
    		}
    	})
    }
    
    function reqUnlock(context,param){
    	var reqUnlock = new ReqUnlockDialog(context,param);
    }
    function transfer(context,param){
    	var dialog = new TransferAuthDialog(0,param,function(){
    		context.reload();
    	});
    }
    function exitshare(context,param){
    	var dialog = new ConfirmDialog({content:_("确认退出这个文件夹？</br>退出之后将无法继续查看该文件夹")},function(){	
    		AuthModel.batch_del(function(result){
    			if(result.code==200){
    				Tips.show(_("成功退出共享"));
    				context.reload();
    			}
    		},[{neid:param.neid,grant_type:1,agent_type:'user',agent_id:Util.getUserID()}]);
    	});
    }
    function cancelauth(context,param){
    	var dialog = new ConfirmDialog({content:_("确认取消这个文件夹的共享？</br>取消后其他被共享的用户将无法继续查看该文件夹")},function(){	
    		AuthModel.batch_del(function(result){
    			if(result.code==200){
    				Tips.show(_("取消共享成功"));
    				context.reload();
    			}
    		},[{neid:param.neid,grant_type:Util.getPathType()=='ent'?0:1}]);
    	});
    }
    function addfolder(context,param){
    	new AddFolder(context,param);
    }
    function preview(context,current,data){
    	if(!current.mimeType) return;
        if(current.mimeType.indexOf('image')!= -1){
            previewImage(context, current, data);
        }else if(current.mimeType.indexOf('doc')!= -1 || 
                 current.mimeType.indexOf('pdf')!= -1 ||
                 current.mimeType.indexOf('ppt')!= -1 ){
                 	if(current.dataUrl){
                 		window.open(FileModel.deliveryPreview(current.previewUrl,current.path_type,current.deliveryCode,current.token));
                 	}
            window.open(FileModel.preview(current.path, current.rev));
        }
        function previewImage(context, current, data){
        	var mask = document.createElement("div");
	    	mask.className = "lui-mask";
	    	mask.style.zIndex = "70";
	    	mask.id = "lui-mask-iframe";
	    	document.body.appendChild(mask);
	    	var preview_dialog = $("<div id='web_iframediv' style='position:absolute;top:5%;left:10%;height:90%;width:80%;z-index:900;min-width:1000px;'></div>");
	    	window.previewData = data;
	    	var iframe = document.createElement("iframe");
	    	if(context.mark == "sigleDelivery"){
	    		iframe.src ="/thumbs.html?path="+encodeURIComponent(context.path)+'&path_type='+context.path_type + '&mark=' +context.mark+ '&delivery_token=' + encodeURIComponent(current.token)+ '&cur='+current.name;
	    	}
	    	else if(current.isDelivery){
	    		iframe.src = "/thumbs.html?path=/"+encodeURIComponent(context.path)+'&path_type='+context.path_type+ '&delivery_token='+ encodeURIComponent(current.token)+"&isDelivery=true&offset=0&limit=50&cur="+ encodeURIComponent(current.name);
	    	}else{
	    		iframe.src = "/thumbs.html?path=/"+encodeURIComponent(context.path)+'&path_type='+context.path_type+"&offset=0&limit=50&cur="+ encodeURIComponent(current.name);
	    	}
	    	
	    	$(iframe).attr("width","100%").attr("height","100%").attr("frameborder","no").attr("scrolling","no");
	    	
	    	preview_dialog.append($(iframe));
	    	$('body').append(preview_dialog);
        }
    }
    function label(context,param){
        var d=new Dialog(_('添加/编辑标签'),{minHeight:420,minWidth:486},function(content){
            require.async(['module/label/src/label_main'],function(label){
                param.wrapper=content;
                var lab= new label(param);
                lab.init();
            })
        });
        d.on('close',function(){

        });
    }
	return controller;
});
