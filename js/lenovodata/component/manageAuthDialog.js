;define('component/manageAuthDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog'),
		ConfirmDialog = require('component/confirmDialog'),
        AddDirAuthDialog = require('component/addDirAuthDialog'),
		AuthList = require('component/authList'),
		AuthModel = require('model/AuthManager');
	require('i18n');
	var	_ = $.i18n.prop;

    /*
     */
    function ManageAuthDialog(uids, authArr, userType, ok_callback) {
        var self = this;
        self.uids = uids;
        self.authArr = authArr || ([]); 
        self.userType = userType || AuthModel.AGENT_TYPE.USER; 
        self.ok_callback = ok_callback;
        self._init();
    }

	$.extend(ManageAuthDialog.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;


            self.dialog = new Dialog(_("授权管理"), {mask: true}, function(dialog){
                var authHtml = [];
                authHtml.push('<div class="manage-auth-dialog">');
                    authHtml.push('<div class="manage-auth-dialog-subtitle">' + _("权限列表(所选用户如果对该目录已经有权限，则会更新该用户的访问权限)") + '</div>');
                    authHtml.push('<div class="container"></div>');
                authHtml.push('</div>');

                dialog.append(authHtml.join('') + '<div class="dialog-button-area"><a id="manage-auth-dialog-id-ok" class="dialog-button ok">' + _('确定') +'</a> <a id="manage-auth-dialog-id-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');

                self.authList = new AuthList(".container", self.uids, self.authArr, self.userType, function(uids, authList, userType) {
                    new AddDirAuthDialog(uids, authList, userType);
                });

            });

            $('#manage-auth-dialog-id-cancel').click(function() {
                self.dialog.close();
            });

            $('#manage-auth-dialog-id-ok').click(function() {
                self.dialog.close();
            });
        }
    });
    return ManageAuthDialog;
});
