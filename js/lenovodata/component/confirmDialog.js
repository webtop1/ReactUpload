;define('component/confirmDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog');
	require('i18n');
	var	_ = $.i18n.prop;
    /*
     * @param context {
     *    title: 对话框标题 
     *    content: 内容 
     * }
     * @ok_callback: 
     */

    function ConfirmDialog(context, ok_callback, cancel_callback, other_callback) {
        this.context = context;
        this.context.title || (this.context.title = _('确认'));
        this.context.content || (this.context.content = '');
        this.context.flags || (this.context.flags = false);
        this.context.okBtn || (this.context.okBtn = _('确定'));
        this.context.otherBtn || (this.context.otherBtn = _('移交'));
        this.context.canBtn || (this.context.canBtn = _('取消'));
        this.ok_callback = ok_callback;
        this.cancel_callback = cancel_callback;
        this.other_callback = other_callback;
        this._init();
    }

	$.extend(ConfirmDialog.prototype, {
        _init: function() {
            var self = this;
            self.dialog = new Dialog(self.context.title, {mask: true}, function(dialog){
                dialog.append(
                 '<div class="confirmCon">' + self.context.content +  '</div>'+
                 '<div class="dialog-button-area confirmBtn">'+
	                 '<a class="dialog-button confirm-ok ok">' + self.context.okBtn +'</a>'+
	                 '<a class="dialog-button confirm-'+ self.context.flags +' cancel">' + self.context.otherBtn +'</a>'+
	                 ' <a class="dialog-button confirm-cancel cancel">' + self.context.canBtn + '</a>'+
                 '</div>');
            });

            $('.confirm-ok').click(function() {
                self.ok_callback();
                self.dialog.close();
            });
            
            $('.confirm-true').click(function() {
            	self.dialog.close();
                self.other_callback();
            });

            $('.confirm-cancel').click(function() {
                self.cancel_callback && (self.cancel_callback());
                self.dialog.close();
            });
        }
    });

    return ConfirmDialog;
});
