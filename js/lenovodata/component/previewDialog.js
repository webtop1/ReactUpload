;define('component/previewDialog', function(require, exports, module){
	var $ = require('jquery'),
		Util = require('util'),
		Dialog = require('component/dialog');
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function PreviewDialog(uri, path , ok_callback) {
        var self = this;
        this.uri = uri;
        this.path = path;
        this._init();
    }

	$.extend(PreviewDialog.prototype, {
        _init: function() {
            var self = this;
            var filename = self.path.substr(self.path.lastIndexOf("/") + 1);
            //self.uri = Util.getStorageUrl() + self.uri;
            //self.uri = encodeURI(self.uri).replace(/#/g,"%23");
            
           window.open(self.uri);

           /*
            self.dialog = new Dialog(_("预览——") + filename, {mask: true}, function(dialog){
                var h = $(window).height() - 30;
                var w = $(window).width() - 10;
                //w = w>800?800:w;
                //h = h>600?600:h;
                var authHtml = [];
                authHtml.push('<div>');
                //authHtml.push('<iframe src="/flexpaper/flexpaperviewer.html?link='+ self.uri + '" id="preview-iframe" width="' + w +'" height="' + h + '" border="none"></iframe>')
                authHtml.push('<iframe src="' + self.uri + '" id="preview-iframe" width="' + w +'" height="' + h + '" border="none"></iframe>')
                authHtml.push('</div>');
                dialog.append(authHtml.join('')); 
            });
           */
        }
    });
    return PreviewDialog;
});
