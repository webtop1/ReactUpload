;define('component/eventTemplateTool', function(require, exports,module){
	var eventTemplateTool = function(){};
	var $ = require('jquery');
	var AuthModel = require('lenovodata/model/AuthManager');
	var Util = require('lenovodata/util');
	require('i18n');
	require('mustache');
	var	_ = $.i18n.prop;
	eventTemplateTool.prototype = {
		getTemplate:function(data){
			this.resolveAuth(data);
			var eventType = parseInt(data.eventType);
			if((eventType > 1000 && eventType < 2000) || (eventType > 10000)){
				var data = this.metaTool(data);
			}else if(eventType > 2000 && eventType < 3000){
				var data = this.userTool(data);
			}else if(eventType > 3000 && eventType < 4000){
				var data = this.teamTool(data);
			}else if(eventType > 4000 && eventType < 5000){
				var data = this.authShareTool(data);
			}else if(eventType > 5000 && eventType < 6000){
				var data = this.otherTool(data);
			}else if(eventType > 6000 && eventType < 7000){
				var data = this.linkTool(data);
			}
			return this.specialDesc(data);
		},
		//1000~2000
		metaTool:function(data){
			switch(parseInt(data.eventType)){
				case 1001:
					data.op_user = data.userName;  //在所有动态中用到
					data.event_title = Mustache.render(_("新建了一个文件夹 “{{&target}}”"),{
						userName:data.userName,
						target:this.getLastName(data.target[0].path)
					});
//					data.event_desc = Mustache.render(_("新建了一个文件夹 {{&target}} "),{
//						userName:data.userName,
//						target:"<a>"+this.getLastName(data.target[0].path)+"</a>"
//					});
					data.event_path = {
						path:this.getLastName(data.target[0].path),
						pathname:this.getLongPath(data.target[0].path)
					}
					break;
				case 1002:
					data.op_user = data.userName;
					data.event_desc = _("上传了一个文件");
					data.event_file = this.createFileList(data.target);
					break;
				case 1003:
					data.op_user = data.userName;
					data.event_path = {
						op:_("下载了文件夹"),
						path:this.getLastName(data.target[0].path),
						pathname:this.getLongPath(data.target[0].path)
					}
					break;
				case 1004:
					data.op_user = data.userName;
					data.event_desc = _("下载了一个文件");
					data.event_file = this.createFileList(data.target);
					break;
				case 1005:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("打包下载了{{fileNum}}个项"),data);
					data.event_file = this.createFileList(data.target);
					break;
				case 1006:
					data.op_user = data.userName;
					data.event_desc = _("打包下载文件夹");
				case 1007:
					data.op_user = data.userName;
					data.event_desc = _("删除了文件夹");
					break;
				case 1008:
					data.op_user = data.userName;
					data.event_desc = _('删除文件');
					break;
				case 1009:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_('删除了{{fileNum}}个项'),data);
					data.event_show_list = this.createShowFileList(data.target);
					break;
				case 1010:
				case 1011:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_('重命名  {{&from}} 为  {{&target}}'),{
						from:this.getLastName(data.from[0].path),
						target:this.getLastName(data.target[0].path)
					});
					break;
				case 1012:
				case 1012001:
				case 1013:
				case 1013001:
					data.op_user = data.userName;
					if(!this.isTarget(data.eventType)){
						data.event_desc = _('移动')+" "+this.getLastName(data.target[0].path);
					}
					if(this.isTarget(data.eventType)){
						data.event_desc = _('增加')+" "+this.getLastName(data.target[0].path);
					}
					break;
				case 1014:
				case 1014001:
					data.op_user = data.userName;
					if(!this.isTarget(data.eventType)){
						data.event_desc = Mustache.render(_('移动了{{fileNum}}个项'),data);
						data.event_show_list = this.createShowFileList(data.from);
					}
					if(this.isTarget(data.eventType)){
						data.event_desc = Mustache.render(_('增加了{{fileNum}}个项'),data);
						data.event_show_list = this.createShowFileList(data.target);
					}
					break;
				case 1015:
				case 1015001:
				case 1016:
				case 1016001:
					data.op_user = data.userName;
					if(!this.isTarget(data.eventType)){
						data.event_desc = _('复制')+" "+this.getLastName(data.target[0].path);
						data.event_show_list = this.createShowFileList(data.from);
					}
					if( this.isTarget(data.eventType)){
						data.event_desc = _('增加')+" "+this.getLastName(data.target[0].path);
						data.event_show_list = this.createShowFileList(data.target);
					}
					break;
				case 1017:
				case 1017001:
					data.op_user = data.userName;
					if(!this.isTarget(data.eventType)){
						data.event_desc = Mustache.render(_('复制了{{fileNum}}个项'),data);
						data.event_show_list = this.createShowFileList(data.from);
					}
					if(this.isTarget(data.eventType)){
						data.event_desc = Mustache.render(_('增加了{{fileNum}}个项'),data);
						data.event_show_list = this.createShowFileList(data.target);
					}
					break;
				case 1018:
					data.op_user = data.userName;
					data.event_desc = _("预览了文件");
					break;
				case 1019:
					data.op_user = data.userName;
					data.event_desc = _("更新了文件");
					data.event_file = this.createFileList(data.target);
					break;
				case 1020:
					data.op_user = data.userName;
					data.event_desc = _("恢复了文件");
					data.event_file = this.createFileList(data.target);
					break;
				case 1021:
					data.op_user = data.userName;
					if(data.target.hasOwnProperty(0) && data.target[0].isFolder === 'true'){
						data.event_desc = _("还原了文件夹");
					}else{
						data.event_desc = _("还原了文件");
					}
					data.event_file = this.createFileList(data.target);
					break;
				case 1022:
				case 1023:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{&target}}”增加了备注"),{
						target:this.getLastName(data.target[0].path)
					});
					data.event_mark = data.mark;
					break;
				case 1024:
				case 1025:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{&target}}”修改了备注"),{
						target:this.getLastName(data.target[0].path)
					});
					data.event_mark = data.mark;
					break;
				case 1026:
				case 1027:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{&target}}”删除了备注"),{
						target:this.getLastName(data.target[0].path)
					});
					break;
				case 1028:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{&target}}”设置了定期清理"),{
						target:this.getLastName(data.target[0].path)
					});
					break;
				case 1029:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{&target}}”取消了定期清理"),{
						target:this.getLastName(data.target[0].path)
					});
					break;
				case 1030:
					data.op_user = data.userName;
					data.event_desc = _("锁定文件");
					break;
				case 1031:
					data.op_user = data.userName;
					data.event_desc = _("解锁文件");
					break;
				case 1032:
					data.op_user = data.userName;
					data.event_desc = _("请求解锁文件");
					data.event_file = this.createFileList(data.target);
					break;
				case 1033:
					data.op_user = data.userName;
					data.event_desc = _("彻底删除了");
					data.event_show_list = this.createShowFileList(data.target);
					break;
				case 1034:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("彻底删除了{{fileNum}}个项"),data);
					data.event_show_list = this.createShowFileList(data.target);
					break;
				case 1035:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("还原了{{fileNum}}项"),data);
					data.event_file = this.createFileList(data.target);
					break;
				case 1037:
					data.iconType = 'pan';
					data.uid = 0;
					data.event_desc = Mustache.render(_('系统 自动清理了“{{&target}}”'),{
						target:this.getLastName(data.target[0].path)
					});
					break;
				default:
					data.event_desc = data.eventType+"还没建立数据";
					break;
			}
			return data;
		},
		//2000~3000
		userTool:function(data){
			return data;
		},
		//3000~4000
		teamTool:function(data){
			switch(parseInt(data.eventType)){
				case 3001:
					data.event_path = {
						op:_("创建了"),
						path:this.getLastName(data.target[0].path),
						pathname:this.getLongPath(data.target[0].path)
					};
					break;
				case 3002:
					data.op_user = data.userName;
					data.folderIconType = 'folder_team';
					data.event_desc = Mustache.render(_("删除了“{{&target}}”"),{
						target:this.getLastName(data.target[0].path)
					});
					break;
				case 3003:
					data.op_user = data.targetUserName;
					data.op_user_tab = data.targetUserName;
					data.event_desc = Mustache.render(_("{{targetUserName}}加入 “{{teamName}}”"),{
						targetUserName:data.targetUserName,
						teamName:data.teamName
					});
					break;
				case 3004:
					data.folderIconType = 'folder_team';
					data.op_user = data.targetUserName;
					data.op_user_tab = data.targetUserName;
					data.event_desc = Mustache.render(_("{{targetUserName}}离开 “{{teamName}}”"),{
						targetUserName:data.targetUserName,
						teamName:data.teamName
					});
					break;
				case 3005:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("更新“{{teamName}}”的用户数为 {{numsOrSpaceSize}}"),data);
					break;
				case 3006:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("更新“{{teamName}}”的空间为{{numsOrSpaceSize}}"),{
						teamName:data.teamName,
						numsOrSpaceSize:Util.formatBytes(data.numsOrSpaceSize)
					});
					break;
				case 3007:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("更新“{{teamName}}”的备注 "),data);
					data.event_mark = data.mark;
					break;
				case 3008:
					data.op_user = data.targetUserName;
					data.op_user_tab = data.targetUserName;
					data.event_desc = Mustache.render(_('{{targetUserName}} 成为 “{{teamName}}” 团队管理员'),data);
					break;
				case 3009:
					data.folderIconType = 'folder_team';
					data.op_user = data.targetUserName;
					data.op_user_tab = data.targetUserName;
					data.event_desc = Mustache.render(_('{{targetUserName}} 被移除 “{{teamName}}” 团队管理员'),data);
					break;
			}
			return data;
		},
		//4000~5000
		authShareTool:function(data){
			switch(parseInt(data.eventType)){
    			case 4001:
    				data.op_user = data.targetUserName;
    				data.op_user_tab = data.targetUserName;
    				data.event_desc = Mustache.render(_("{{targetUserName}} 获得了 “{{&path}}” 权限: {{&newPrivilege}}"),{
    						targetUserName:data.targetUserName,
    						path:this.getLastName(data.target[0].path),
    						newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4002:
    				data.op_user = Mustache.render('“{{targetUserName}}”',data);
    				data.op_user_tab = Mustache.render('“{{targetUserName}}”',data);
//  				data.event_desc = Mustache.render(_("“{{targetUserName}}” 获得了 {{&path}} 权限: {{&newPrivilege}}"),{
//  					targetUserName:data.targetUserName,
//  					path:this.getLastName(data.path),
//  					newPrivilege:data.newPrivilege
//  				});
    				break;
    			case 4003:
    				data.event_desc = Mustache.render(_("所有人 获得了 {{&path}} 权限:{{&newPrivilege}}"),{
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4004:
    				data.op_user = data.targetUserName;
    				data.op_user_tab = data.targetUserName;
    				data.event_desc = Mustache.render(_("{{targetUserName}} 在 {{&path}} 的权限更改为 {{&newPrivilege}}"),{
    					targetUserName:data.targetUserName,
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4005:
    				data.op_user = Mustache.render('“{{targetUserName}}”',data);
    				data.op_user_tab = Mustache.render('“{{targetUserName}}”',data);
    				data.event_desc = Mustache.render(_('“{{targetUserName}}”的权限由{{&oldPrivilege}} 更改为 {{&newPrivilege}}'),data);
    				break;
    			case 4006:
    				data.event_desc = Mustache.render(_('所有用户 在  {{&path}} 的权限由{{&oldPrivilege}} 更改为{{&newPrivilege}}'),{
    					path:this.getLastName(data.target[0].path),
    					oldPrivilege:data.oldPrivilege,
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4007:
    				data.folderIconType = 'folder_team';
    				data.op_user = data.targetUserName;
    				data.op_user_tab = data.targetUserName;
    				data.event_desc = Mustache.render(_("{{targetUserName}}在 {{&path}} 的权限: {{&newPrivilege}} 被取消"),{
    					targetUserName:data.targetUserName,
    					path:this.getLastName(data.target[0].path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4008:
	  				data.folderIconType = 'folder_team';
    				data.op_user = Mustache.render(_("“{{teamName}}”"),data);
    				data.op_user_tab = Mustache.render(_("“{{teamName}}”"),data);
    				data.event_desc = Mustache.render(_("“{{teamName}}”在 {{&path}} 的权限: {{&newPrivilege}} 被取消"),{
    					teamName:data.teamName,
    					path:data.target[0].path,
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4009:
	  				data.folderIconType = 'folder_team';
    				data.event_desc = Mustache.render(_("所有用户 在 {{&path}} 的权限: {{&newPrivilege}} 被取消"),{
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4010:
    				data.op_user = data.targetUserName;
    				data.op_user_tab = data.targetUserName;
    				data.event_desc = Mustache.render(_("{{targetUserName}} 加入共享 {{&path}} 权限：{{&newPrivilege}}"),{
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege,
    					targetUserName:data.targetUserName
    				});
    				break;
    			case 4011:
    				data.folderIconType = 'folder_share';
    				data.op_user = data.userName;
    				data.event_desc = Mustache.render(_("取消对您的共享  {{&path}} 权限：{{&newPrivilege}}"),{
    					path:this.getLastName(data.target[0].path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4012:
    				data.op_user = data.targetUserName;
    				data.op_user_tab = data.targetUserName;
    				data.event_desc = Mustache.render(_("{{targetUserName}} 在 {{&path}}的权限由{{&oldPrivilege}} 改为  {{&newPrivilege}}"),{
    					targetUserName:data.targetUserName,
    					path:this.getLastName(data.path),
    					oldPrivilege:data.oldPrivilege,
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4013:
    				data.folderIconType = 'folder_share';
    				data.op_user = data.userName;
    				data.event_desc = Mustache.render(_("{{userName}} 退出 {{&path}} 的共享"),{
    					userName:data.userName,
    					path:this.getLastName(data.target[0].path)
    				});
    				break;
    			case 4014:
    				data.op_user = data.userName;
    				data.event_desc = Mustache.render(_('移交 {{&path}} 的共享管理给{{targetUserName}}'),{
    					path:this.getLastName(data.path),
    					targetUserName:data.targetUserName
    				});
    				break;
    			case 4015:
    				data.folderIconType = 'folder_share';
    				data.op_user = data.userName;
    				data.event_desc = Mustache.render(_("取消 {{&path}} 的对外共享"),{
    					path:this.getLastName(data.path)
    				});
    				break;
    			case 4016:
    				data.op_user = Mustache.render(_("“{{targetUserName}}”"),data);
    				data.op_user_tab = Mustache.render(_("“{{targetUserName}}”"),data);
    				data.event_desc = Mustache.render(_("“{{targetUserName}}”加入共享 {{&path}} 权限:{{&newPrivilege}}"),{
    					targetUserName:data.targetUserName,
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4017:
    				data.event_desc = Mustache.render(_("所有用户 加入共享“{{&path}}” 权限:{{&newPrivilege}}"),{
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4018:
    				data.folderIconType = 'folder_share';
    				data.op_user = data.userName;
    				data.event_desc = Mustache.render(_("取消对“{{targetUserName}}”的共享 {{&path}} 权限：{{&newPrivilege}}"),{
    					targetUserName:data.targetUserName,
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4019:
    				data.op_user = data.targetUserName;
    				data.op_user_tab = Mustache.render(_("“{{targetUserName}}”"),data);
    				data.event_desc = Mustache.render(_("{{targetUserName}} 在{{&path}} 的权限由{{&oldPrivilege}} 改为 {{&newPrivilege}}"),{
    					targetUserName:data.targetUserName,
    					path:this.getLastName(data.path),
    					oldPrivilege:data.oldPrivilege,
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4020:
    				data.op_user = data.userName;
    				data.event_desc = Mustache.render(_("取消对 所有用户 的共享 “{{&path}}” 权限：{{&newPrivilege}}"),{
    					path:this.getLastName(data.path),
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			case 4021:
    				data.event_desc = Mustache.render(_("所有用户 在“{{&path}}”的权限由“{{&oldPrivilege}}” 改为 “{{&newPrivilege}}”"),{
    					path:this.getLastName(data.path),
    					oldPrivilege:data.oldPrivilege,
    					newPrivilege:data.newPrivilege
    				});
    				break;
    			default:
    				data.event_desc = data.eventType+"还没有建立模板";
    				break;
    		}
			return data;
		},
		//5000~6000
		otherTool:function(data){
			switch(parseInt(data.eventType)){
				case 5001:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("发布公告 “{{noticeTitle}}”"),data);
					data.event_notice = {
						content:data.noticeContext
					}
					break;
				case 5002:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("更新公告 “{{noticeTitle}}”"),data);
					data.event_notice = {
						content:data.noticeContext
					}
					break;
				case 5003:
				case 5004:
				case 5005:
				case 5006:
				case 5007:
				case 5008:
				case 5009:
				case 5010:
				case 5011:
				case 5012:
				case 5013:
					break;
				default:
    				data.event_desc = data.eventType+"还没有建立模板";
    				break;
			}
			return data;
		},
		//6000~7000
		linkTool:function(data){
			switch(parseInt(data.eventType)){
				case 6001:
					data.op_user = data.userName;
					data.event_delivery = {
						filename:this.getLastName(data.target[0].path),
						url:this.createDelivery(data.deliveryCode)
					}
					data.event_desc = Mustache.render(_("为“{{filename}}”生成外链"),data.event_delivery);
					break;
				case 6002:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{filename}}”取消外链"),{filename:this.getLastName(data.path)});
					break;
				case 6003:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{filename}}”生成云附件"),{filename:this.getLastName(data.path)});
					break;
				case 6004:
				case 6005:
				case 6006:
				case 6007:
					break;
				case 6008:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{filename}}”生成邮件附件"),{filename:this.getLastName(data.path)});
					break;
				case 6009:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{filename}}”取消云附件"),{filename:this.getLastName(data.path)});
					break;
				case 6010:
					data.op_user = data.userName;
					data.event_desc = Mustache.render(_("为“{{filename}}”取消邮件附件"),{filename:this.getLastName(data.path)});
					break;
				default:
					data.event_desc = data.eventType+"还没有建立模板";
    				break;
			}
			return data;
		},
		createDelivery:function(code){
			return '/link/view/'+code;
		},
		createFileList:function(target){
			var event_file = [];
			for(var i in target){
				if(target.hasOwnProperty(i)){
					var t = target[i].path.split('.');
					t = t.length == 1 ? '':t.pop();
					if(target[i].isFolder == 'true'){
						t = 'folder';
					}
					event_file.push({
						type:Util.typeIcon(t),
						isFolder:t == 'folder' ? true:false,
						filename:target[i].path.split('/').pop(),
						neid:target[i].neid,
						path:target[i].path
					});
				}
			}
			return event_file;
		},
		createShowFileList:function(target){
			var param = [];
			for(var i=0;i<2;i++){
				if(target.hasOwnProperty(i)){
					var dt = target[i].path.split('/').pop();
					param.push(dt);
				}
			}
			if(target.length > 2){
				param.push('...');
			}
			return param;
		},
		
		isTarget:function(eventType){
			return eventType > 10000;
		},
		getLastName:function(path){
			if(path){
				return path.split('/').pop();
			}
			return '';
		},
		getLongPath:function(path){
			var _path = '';
			var pathType = Util.getPathType();
			switch(pathType){
				case 'ent':
					_path = _("企业空间")+path;
					break;
				case 'self':
					_path = _('个人文件')+path;
					break;
				case 'share_out':
					_path = _('我的共享')+path;
					break;
				case 'share_in':
					_path = _('收到的共享')+path;
					break;
			}
			return _path;
		},
		specialDesc:function(data){
			data.event_desc = data.title;
			if(!data.op_user_tab){
				data.op_user_tab = '';
			}else{
				data.op_user_tab += ' ';
			}
			return data;
		},
		resolveAuth:function(data){
    		data.oldPrivilege = AuthModel.getAuthTitle(data.oldPrivilege);
            data.newPrivilege = AuthModel.getAuthTitle(data.newPrivilege);
    	}
	}
	module.exports = new eventTemplateTool();
});