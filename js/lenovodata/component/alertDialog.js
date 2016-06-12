;define('component/alertDialog', function(require, exports, module){
	var $ = require('jquery'),
        EventTarget = require('eventTarget'),
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

    function AlertDialog(message, level, callback,title) {
        this.title =title|| _('提示');
        this.message = message || '';
        this.level = level || '';
        this.callback = callback;
        this._init();
    }

	$.extend(AlertDialog.prototype, EventTarget, {
        _init: function() {
            var self = this;
            self.dialog = new Dialog(self.title, {mask: true}, function(dialog){
                if(self.level == 'warn'){
                    dialog.append('<div class="lui-alertDialog"><div class="cell2"><div class="cell1"></div>' + self.message +  '</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel ok">' + _('关闭') + '</a></div>');
                }else if(self.level == 'info'){
                    dialog.append('<div class="lui-alertDialog"><div class="cell2 info">' + self.message +  '</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel ok">' + _('关闭') + '</a></div>');
                }else{
                    dialog.append('<div class="lui-alertDialog"><div class="cell2"><div class="cell1"></div>' + self.message +  '</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel ok">' + _('关闭') + '</a></div>');
                }
            });

            $('.confirm-cancel').click(function(){
                self.callback && self.callback();
                self.dialog.close();
                self.fire('close');
            });
        }
    });

    return AlertDialog;
});
