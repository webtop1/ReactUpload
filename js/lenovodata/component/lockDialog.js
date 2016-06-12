;define('component/lockDialog',function(require,exports,module){
	var $ = require('jquery'),
        Tips = require('component/tips'),
        Dialog = require('component/dialog'),
        FileManager = require('model/FileManager');
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

	function LockDialog (context,param){
		var self = this;
		self.filename = param.name;
		self.path = param.path;
		self.neid = param.neid;
		self.path_type =  param.path_type;
		self.prefix_neid =  param.prefix_neid;
		self.context = context;
		self._init();
		
	}
	
	var template = '<div class="lockConWrapper">'
		+'<p class="tishi">'+_('您将锁定文件"{0}",锁定后将阻止其他人更新文件内容。','{{name}}') +'</p>'
		+'<label><input type="checkbox" id="setLockTime"> '+ _("为这个锁定设置一个过期时间") +'</label>'
		+'<p class="title">'+_('持续时长')+'</p>'
		+'<p><select disabled="disabled" id="selectTime">'
			+'<option value="-1">'+_('无限制')+'</option>'
			+'<option value="900">'+_('15分钟')+'</option>'
			+'<option value="1800">'+_('半小时')+'</option>'
			+'<option value="3600">'+_('1小时')+'</option>'
			+'<option value="86400">'+_('1天')+'</option>'
			+'<option value="604800 ">'+_('1周')+'</option>'
			+'<option value="2592000 ">'+_('1个月')+'</option>'
		+'</select></p>'
	+'</div>'
	+'<div class="dialog-button-area"><a id="addLock" class="dialog-button ok">' + _("确定") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") +'</a></div>';
	$.extend(LockDialog.prototype,{
		
		_init: function() {
			var self = this;
			
            self.dialog = new Dialog(_('锁定文件'), {mask: true},function(dialog, dialog_cb){
            	var Dom = Mustache.render(template,{name:self.filename});
            	dialog.append(Dom);
            	self._render(dialog, dialog_cb);

            });
		},
		_render: function(dialog, dialog_cb) {
			var self = this;
			$('#setLockTime').change(function() {
				if($('#setLockTime')[0].checked){
					$('#selectTime').removeAttr('disabled');
				}else{
					$('#selectTime').attr('disabled','disabled');
				}
			});
			
			$("#addLock").click(function() {
				var time = $('#selectTime').val();
				Util.sendBuridPointRequest();
	            FileManager.lock(self.path,self.path_type,'',self.prefix_neid, self.neid, time,function(ret){
	            	if(ret.code == 200){
	            		Tips.show(_('文件锁定成功'));
	            		self.dialog.close();
	            		
	            		self.context.reload();
	            	}else{
	            		Tips.warn(ret.message);
	            	}
	            })
            
            //self.ok_callback && (self.ok_callback());
                
            });


            $('#cancel').click(function(){
                self.dialog.close();
            });
		}
		
	});
	
	return LockDialog;
		  
});
