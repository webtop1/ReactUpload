;define("component/copymove",function(require,exports,module){
	var FileModel = require('model/FileManager'),
	    AddFolder = require("component/addfolder"),
	   ConfirmDialog = require("component/confirmDialog");
	require('mustache');
	require('i18n');
	var copymove = function(){
		this.path_type = null;
		this.onlycopy = false;
	}
	copymove.prototype = {
		bindEvent:function(dialog,param,context){		    
			var self = this;
			//判断是否是数组
			if(Object.prototype.toString.call(param)=='[object Array]'){
				for(var i=0,len=param.length;i<len;i++){
					if(self.isOnlycopy(param[i]))
					{
						self.onlycopy = true;
						break;
					}
				}
			}else{
				self.onlycopy = self.isOnlycopy(param);
			}
			var pathes = self.makeForm(param);
	        $('#copy-file').click(function() {
	        	self.copy(dialog,pathes);
	        });
	        $('#move-file').click(function(e) {
	        	self.move(dialog,pathes,context);
	        });
			$("#create-folder").click(function(){
				self.createFolder(dialog);
			});
	        $('#close-dialog').click(function() {
	            self.close(dialog);
	        });
		},
		changePath:function(dialog,realpath, cssAction,dirData){
        	if(realpath === undefined && cssAction === undefined && dirData === undefined){
        		return;
        	}
        	var privilegeId = parseInt(Util.resolvePrivilegeID(cssAction));
        	if(Util.isAdmin()){
        		dirData.access_mode = Util.resolveActionCss('edit');
        		dirData.realpath = '/';
        	}
        	if(dirData && realpath == '/'){
        		if(dirData.path_type == 'self' || (Util.isAdmin()&&dirData.path_type=='ent')){
        			$("#copy-file").addClass('ok').removeClass('disabled');
        			$("#create-folder").addClass('ok').removeClass('disabled');
        		 	dialog.isCopy = true;
        		 	dialog.isCreateFolder = true;
        		 	$("#move-file").addClass('ok').removeClass('disabled');
        		 	dialog.isMove = true;
        		}else{
        			$("#copy-file").removeClass('ok').addClass('disabled');
        			$("#move-file").removeClass('ok').addClass('disabled');
        			$("#create-folder").removeClass('ok').addClass('disabled');
        		 	dialog.isCopy = false;
        		 	dialog.isMove = false;
        		 	dialog.isCreateFolder = false;
        		}
        	}else{
        		 if((dirData.access_mode & 1058) == 1058){
        		 	$("#copy-file").addClass('ok').removeClass('disabled');
        		 	$("#move-file").addClass('ok').removeClass('disabled');
        		 	dialog.isCopy = true;
        		 	dialog.isMove = true;
        		 }else{
        		 	$("#copy-file").removeClass('ok').addClass('disabled');
        		 	$("#move-file").removeClass('ok').addClass('disabled');
	        		dialog.isCopy = false;
	        		dialog.isMove = false;
        		 }
	      		 if((dirData.access_mode & 32) == 32){
        		 	$("#create-folder").addClass('ok').removeClass('disabled');
        		 	dialog.isCreateFolder = true;
        		 }else{
        		 	$("#create-folder").removeClass('ok').addClass('disabled');
        		 	dialog.isCreateFolder = false;
        		 }
        	}
        	this.filterShareIn(dialog);
        	$('.create-folder-li input').select();
		},
		isOnlycopy:function(param){
			var onlycopy = false;
			//根据被选对象参数设置移动复制选项
			if(param.islocked && !param.unlockAdmin)onlycopy = true;//锁定的文件只能复制(非自己加锁的用户)
			if(param.action=="edit"){
				//团队只能复制
				if(param.isTeam)onlycopy = true;
				//企业空间和收到的共享一级目录只能复制
				if(Util.isAdmin()||"self"==param.path_type)return onlycopy;
				if(/share|ent/.test(param.path_type)&&/^\/([^\/]+)$/.test(param.path)){
					onlycopy = true;
				}
			}else{
				//非编辑但具有下载权限的文件(夹)只能复制
				onlycopy = true;
			}
			return onlycopy;
		},
		//不仅仅只是过滤收到的分享
		filterShareIn:function(dialog){
			if(this.onlycopy){
				$("#move-file").removeClass('ok').addClass('disabled');
        		dialog.isMove = false;
			}
		},
		copy:function(dialog,pathes){
			var self = this;
			if(!dialog.isCopy) return;
            var to_path = dialog.getSelectNode();
            var dt = {
            	"root":"databox",
            	"path":to_path.data.path,
				"path_type":to_path.data.path_type,
				"from":to_path.data.from
            };
            if(to_path.data.hasOwnProperty('neid') && parseInt(to_path.data.neid) > 0){
            	dt.neid = to_path.data.neid;
            }
            if(to_path.data.hasOwnProperty('prefix_neid') && parseInt(to_path.data.prefix_neid)>0){
            	dt.prefix_neid = to_path.data.prefix_neid;
            }
            to_path = dt;
            if(!dialog.isCopy) return;
            if(self.checkSameRoot(pathes,to_path)){
            	Tips.warn(_('目标与源文件夹相同，请选择其他文件夹'));
            }else{
            	$('body').data('category','copy');
	            FileModel.batch_copy(function(ret) {
	                if (ret.code == 200) {
	                    Tips.show(ret.message);
	                } else if (ret.code == 500) {
	                    Tips.warn(ret.message.join("<br>"));
	                } else {
	                    Tips.warn(ret.message);
	                }
	            }, pathes, to_path); 
	            dialog.close();
            }
		},
		move:function(dialog,pathes,context){
			var self = this;
			if(!dialog.isMove) return;
            var to_path = dialog.getSelectNode();
            var dt = {
            	"root":"databox",
            	"path":to_path.data.path,
				"path_type":to_path.data.path_type,
				"from":to_path.data.from
            }
            if(to_path.data.hasOwnProperty('neid') && parseInt(to_path.data.neid) > 0){
            	dt.neid = to_path.data.neid;
            }
            if(to_path.data.hasOwnProperty('prefix_neid') && parseInt(to_path.data.prefix_neid)>0){
            	dt.prefix_neid = to_path.data.prefix_neid;
            }
            to_path = dt;
            if(self.checkSameRoot(pathes,to_path)){
            	Tips.warn(_('目标与源文件夹相同，请选择其他文件夹'));
            }else{
            	$('body').data('category','move');
	            FileModel.batch_move(function(ret) {
	                if (ret.code == 200) {
	                    Tips.show(ret.message);
	                    context.reload();
	                }else if(ret.code==412){
	                	new ConfirmDialog({content:ret.message,okBtn:_("继续")},function(){
	                		FileModel.batch_move(function(res) {
	                			if(res.code==200){
	                				Tips.show(res.message);
	                				context.reload();
	                			}else{
	                				Tips.warn(res.message);
	                			}
	                		},pathes,to_path,true);
	                	});
	                }else if (ret.code == 500) {
	                    Tips.warn(ret.message.join("<br>"));
	                } else {
	                    Tips.warn(ret.message);
	                }
	                
	            }, pathes, to_path); 
	
	            dialog.close();
            }
            
		},
		createFolder:function(dialog){
			var self = this;
			if(!dialog.isCreateFolder)return;
			var node = dialog.getSelectNode();
            new AddFolder({reload:function(){},type:node.path_type,from:node.from,prefix_neid:node.prefix_neid},node.path,function(childpath){
                dialog.addFolder(node.id,childpath);
            });
		},
		close:function(dialog){
			dialog.close();
		},
		makeForm:function(param){
			var from = [];
        	if(param.hasOwnProperty('neid')){
        		var dt = {
					"root":"databox", 
					"path":	param.path, 
					"path_type":param.path_type, 
					"from":param.from,
					"rev":""
    			};
        		if(parseInt(param.neid) > 0){
        			dt.neid = param.neid;
        		}
        		if(parseInt(param.prefix_neid) > 0){
        			dt.prefix_neid = param.prefix_neid;
        		}
        		from.push(dt);
        	}else{
        		for(var i in param){
	        		if(param.hasOwnProperty(i)){
	        			var dt = {
							"root":"databox", 
							"path":	param[i].path, 
							"path_type":param[i].path_type, 
							"from":param[i].from,
							"rev":""
	        			};
	        			if(param[i].hasOwnProperty('neid') && parseInt(param[i].neid) > 0){
	        				dt.neid = param[i].neid;
	        			}
	        			if(parseInt(param[i].prefix_neid) > 0){
		        			dt.prefix_neid = param[i].prefix_neid;
		        		}
	        			from.push(dt);
	        		}
	        	}
        	}
        	return from;
		},
		checkSameRoot:function(from,to){
			for(var i in from){
				if(from.hasOwnProperty(i)){
					var tmp = from[i];
					var path = tmp.path.split('/');
					path.pop();
					path = path.join('/');
					path || (path = '/');
					if(path == to.path && tmp.path_type == to.path_type && tmp.from == to.from){
						return true;
					}
				}
			}
			return false;
		}
	}
//	module.exports = new copymove();
return copymove;

});