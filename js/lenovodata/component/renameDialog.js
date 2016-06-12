;define('component/renameDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog');
	    ConfirmDialog = require('component/confirmDialog');
	    Util = require('lenovodata/util');
	require('i18n');
	var	_ = $.i18n.prop;

    /*
     * @callback: 
     * }
     */
    function RenameDialog(oldfilename, title, callback, context) {
        this.callback = callback;
        this.oldfilename = oldfilename;
        this.title = title;
        this.context = context;
        this._init();
    }

	$.extend(RenameDialog.prototype, {
        _init: function() {
            var self = this;
//          self.dialog = new Dialog(_("重命名"), {mask: true}, function(dialog){
//              dialog.append('<div style="background:#FFF;padding:20px;vertical-algin:middle;font-size:14px;">' + self.title + '&nbsp;:&nbsp;<input type="text" style="width:240px;" value="'+ self.oldfilename + '" id="rename-input" maxlength="250"/></div><div class="dialog-button-area"><a id="rename-ok" class="dialog-button ok">' + _('确定') +'</a><a id="rename-close" class="dialog-button cancel">' + _('取消') +'</a></div>');
//          });
			var cur = self.context.node.find('.item-selected .filelist-icon');
			self.context.node.find('.item-selected').addClass('item-rename');
			cur.find('.file-name').hide();
			
			
			if(cur.find('.edit-input').length<1){
				cur.append('<div class="edit-name edit-input"><input id="rename-input" class="rename-input" type="text" value="'+ self.oldfilename +'" maxlength="250" ><span class="icon sure"></span><span class="icon cancel"></span></div>');
        	}			

            cur.find('input').select();

            var index = self.oldfilename.lastIndexOf(".");
            var sure = cur.find('.sure');
            var cancel = cur.find('.cancel'); 

            //高亮文件名，不包括文件后缀
            if (index != -1) {
                $('#rename-input').selectRange(0,index);
                //考虑更改文件后缀名
                var sss = self.oldfilename.substr(index)+"$";
				if(/\)/.test(sss)){
					sss=sss.replace(')',"\\)");
				}
				if(/\[/.test(sss)){
					sss=sss.replace('[',"\\[");
				}
				if(/\{/.test(sss)){
					sss=sss.replace('{',"\\{");
				}                
                var extensionReg = new RegExp("."+sss);
                
            }

            sure.click(function() {
            	 editName()
               self.context.node.find('.item-selected').removeClass('item-rename');
            });
            
            function editName(){
            	var newfilename = $.trim($('#rename-input').val());
                 if(index!=-1&&!extensionReg.test(newfilename)){
                 		new ConfirmDialog({content:_("如果改变文件扩展名，可能会导致文件不可用。<br/>确实要更改吗？")},function(){
                 			self.callback(newfilename);
                 		});
                 }else{
                 	 self.callback(newfilename,cur);
                 }
            }
            $('#rename-input').on("keypress",function(ev){
	       	   if(ev.keyCode==13){
	       	   	  editName();
	       	   }
	       	});
           
			
			
            cancel.click(function() {
                cur.find('.file-name').show();
                cur.find('.edit-name').remove();
                self.context.node.find('.item-selected').removeClass('item-rename');
            });
        }
    });

    return RenameDialog;
});
