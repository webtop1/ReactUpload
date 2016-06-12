;define('component/reqUnlockDialog',function(require,exports,module){
	var $ = require('jquery'),
        Tips = require('component/tips'),
        Dialog = require('component/dialog'),
        FileManager = require('model/FileManager');
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

//请求解锁
	function ReqUnlockDialog (context,param){
		var self = this;
		self.filename = param.name;
		self.path = param.path;
		self.path_type =param.path_type;
		self.from = param.from;
		self.neid = param.neid;
		self._init();
		
		
	}
	
	var template = '<div class="reqUnlockCon">'
		+'<p class="tishi">'+_('文件"{0}"已被  {1} 锁定,要更新文件需请求解锁。','{{file_name}}','{{lock_username}}')+'</p>'
//		+'<p class="tishi">点确定会向加锁用户发送申请解锁邮件</p>'
		+'<p class="title">'+ _('邮件内容') +'</p>'
		+'<p><textarea id="content"></textarea></p>'
//		+'<label><input type="checkbox" />解锁后发邮件通知我</label>'
	+'</div>'
	+'<div class="dialog-button-area"><a id="reqUnlock" class="dialog-button ok">' + _("确定") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") +'</a></div>';
	$.extend(ReqUnlockDialog.prototype,{
		
		_init: function() {
			var self = this;
			
				FileManager.info(function(ret){
					if(ret.code == 200){
						 self.sendEmail = ret.data.lock_email;
						 
						self.dialog = new Dialog(_('请求解锁'), {mask: true},function(dialog, dialog_cb){
							
							var Dom = Mustache.render(template,{file_name:self.filename,lock_username:ret.data.lock_username});
			            	dialog.append(Dom);
			            	
			            	self._render(dialog, dialog_cb);
 						});
					}
				},self.path,self.path_type,self.from,self.neid);
		},
		_render: function(dialog, dialog_cb) {
			var self = this;
			
			dialog.find('#reqUnlock').click(function(){
				var email = self.sendEmail,
				message = $('#content').val(),
				username =  Util.getUserName(),
				filepath =  self.path;
				
            	FileManager.reqUnlock(function(ret){
            		
            		if(ret.data.code == 200 && ret.code == 200){
            			Tips.show(_('请求解锁邮件发送成功'));
            			self.dialog.close();
            		}else{
            			Tips.warn(ret.data.msg);
            		}
            	},email,message,username,filepath,self.path_type,self.from,self.neid);
			});
			

            $('#cancel').click(function(){
                self.dialog.close();
            });
		}
		
	});
	
	return ReqUnlockDialog;
		  
});
