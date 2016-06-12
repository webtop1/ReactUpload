;define('component/updateTeamAuthDialog', function(require, exports, module){
	var $ = require('jquery'),
		Util = require('util'),
		Dialog = require('component/dialog'),
		AuthModel = require('model/AuthManager'),
		UserModel = require('model/UserManager'),
		Util = require('util'),
		Tips = require('component/tips'),
		AuthCombox = require('component/authCombox');
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    /*
     *    @param fileAttr: 文件属性
     */
    function UpdateTeamAuthDialog(fileAttr, ok_callback) {
        this.fileAttr = fileAttr;
        this.path = fileAttr.path;
        this.action = fileAttr.action || AuthModel.ACTION.DOWNLOAD;
        this._init();
    }

	$.extend(UpdateTeamAuthDialog.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;


            self.dialog = new Dialog(_("修改团队授权"), {mask: true}, function(dialog){
                var authHtml = [];
                authHtml.push('<div id="update-auth-dialog-id">');
                    authHtml.push('<div class="auth-dir">');
                        authHtml.push('<span class="auth-col-title">' + _("授权文件夹") + '</span>');
                        authHtml.push('<span style="width:378px;border:1px #CDD1D2 solid;display:inline-block">');
                        authHtml.push('<span style="width:20px;height:20px;float:left;" class="icon i-folder1"></span>');
                        authHtml.push('<span class="file-name" title="'+Util.getRootDisplayName() + self.path+'">'+Util.getRootDisplayName() + self.path+'</span>');
                        authHtml.push('</span>');
                    authHtml.push('</div>');
                    authHtml.push('<div class="auth-dir">');
                        authHtml.push('<span class="auth-col-title" style="float:left;">' + _("权　　限") + '</span>');
                        authHtml.push('<span class="auth-col" id="authcombox-add-auth" style="float:left; margin-left:12px;"></span>');
                    authHtml.push('</div>');
                authHtml.push('</div>');

                dialog.append(authHtml.join('') + '<div class="dialog-button-area"><a id="auth-dialog-id-ok" class="dialog-button ok">' + _('确定') +'</a> <a id="auth-dialog-id-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');

                 new AuthCombox("#authcombox-add-auth", AuthModel.getAuthPair(self.action), null, function(item) {
                     self.action = item;
                 });

                 $("#auth-dialog-id-ok").click(function() {
                     AuthModel.update(function(ret) {
                        if (ret.code == 200) {
                            //window.location.reload();
                        	self.dialog.fire("evt_close");
                            self.dialog.close();
                        } else {
                            Tips.warn(ret.message);
                        }
                     }, self.fileAttr.id, self.action);
                 });

                 $("#auth-dialog-id-cancel").click(function() {
                         self.dialog.close();
                 });
            });
        }
    });
    return UpdateTeamAuthDialog;
});
