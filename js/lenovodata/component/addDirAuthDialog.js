;define('component/addDirAuthDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog'),
		DirSelectDialog = require('component/dirSelectDialog'),
		AddFolder = require("component/addfolder"),
		FileController = require("lenovodata/fileController"),
        Tips = require('component/tips');
	require('i18n');
	var	_ = $.i18n.prop;
    function AddDirAuthDialog(teamPath, parentDialog, userType, teamName, ok_callback) {
        var self = this;
        self.teamPath = teamPath;
        self.parentDialog = parentDialog;
        self.userType = userType ;
        self.teamName = teamName; 
        self.ok_callback = ok_callback;
        self._init();
    }
	$.extend(AddDirAuthDialog.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;
            self.dialog = new DirSelectDialog({
            	     teamPath:self.teamPath,
            	     teamName: self.teamName, 
            	        title: _('添加文件夹访问权限'),
            	buttonContext: '<div class="add-dir-auth-dialog-div" id="auth-create-dir"><span class="add-sign">+</span><span class="create-dir">'+_('添加文件夹')+'</span></div><div class="dialog-button-area"><a id="add-auth-ok-btn" class="dialog-button ok">' + _('添加') + '</a> <a id="cancel-dialog" class="dialog-button cancel">' + _('取消') +'</a></div>'}, 450, 200);
             $('#auth-create-dir').click(function() {
	                var node = self.dialog.getSelectNode();
	                new AddFolder(window.publist,node.realpath,function(childpath){
	                    self.dialog.insertDir(node.realpath,childpath);
	                });               
             });
            $('#add-auth-ok-btn').click(function() {
                 self.authPath = self.dialog.getSelectDir();
                 if (!self.authPath) {
                	 self.authPath = "/"; 
                	 Tips.warn(_("根目录禁止授权，请选择其它文件夹"));
                	 return;
                 }
                 self.dialog.close();
                 new FileController(window.publist,"auth",{path:self.authPath});
            });
            $('#cancel-dialog').click(function() {
                self.dialog.close();
            });
        }
    });
    return AddDirAuthDialog;
});
