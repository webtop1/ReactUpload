;define('component/addAuthDialog', function(require, exports, module){
	var $ = require('jquery'),
        Util = require('util'),
		Tips = require('component/tips'),
		Dialog = require('component/dialog'),
        Mask = require('component/mask'),
		AuthModel = require('model/AuthManager'),
		UserModel = require('model/UserManager'),
		AuthCombox = require('component/authCombox'),
        AddUserDialog = require('component/addUserDialog'),
        SelectUserCore = require('component/selectUserCore');
		Wait = require('component/wait');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    /*
     *    @param fileAttr: 文件属性
     */
    function AddAuthDialog(fileAttr, ok_callback) {
        var self = this;
        this.fileAttr = fileAttr;
        this.path = this.fileAttr.path;
        this.userList = null;
        this.ok_callback = ok_callback;
        this.action = AuthModel.ACTION.PREVIEW;
        this._init();
    }

	$.extend(AddAuthDialog.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;

            var auth_conainter_id = "auth-conainter" + Math.ceil((Math.random()*100000000000));

            self.dialog = new Dialog(_("添加授权"), {mask: true}, function(dialog){
                var authHtml = [];
                authHtml.push('<div id="add-auth-dialog-id">');
                    if (!self.fileAttr.team && Util.isAdmin()) {
                    authHtml.push('<div style="margin-top:15px;">');
                        authHtml.push('<input type="radio" name="auth-select" checked="checked" value="all" id="rd1" style="margin-right:12px;">');
                        authHtml.push('<label for="rd1">'+_("公共(所有成员可以访问)")+'</label>');
                    authHtml.push('</div>');
                    }
                    if (self.fileAttr.team) {
                    authHtml.push('<div style="margin-top:15px;">');
                        authHtml.push('<input type="radio" name="auth-select" value="team" id="rd2" style="margin-right:12px;">');
                        authHtml.push('<label for="rd2">'+_('对团队 "{0}" 的所有成员授权', self.fileAttr.team)+'</label>');
                    authHtml.push('</div>');
                    }
                    authHtml.push('<div style="margin-top:15px;">');
                        authHtml.push('<input type="radio"  name="auth-select" value="user" id="rd3" style="margin-right:12px;"/>');
                        authHtml.push('<label for="rd3">'+_('对指定用户授权')+'</label>');
                    authHtml.push('</div>');
                    authHtml.push('<div id="auth-spec-user-list-container" style="margin-top:15px;display:none;">');
                        authHtml.push('<div id="auth-spec-user-list"></div><!--<a id="addUserBtn" class="addUserBtn">创建用户</a>--></div>');
                        authHtml.push('<div style="margin-top:15px;"><span style="float:left">' + _("权限") + '</span><span id="' + auth_conainter_id +'" style="margin-left:12px;float:left"></span>');
                    authHtml.push('</div>');
                authHtml.push('</div>');

                dialog.append(authHtml.join('') + '<div class="dialog-button-area"><a id="add-auth-dialog-id-ok" class="dialog-button ok">' + _('确定') +'</a> <a id="add-auth-dialog-id-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');
            });

            new AuthCombox("#"+auth_conainter_id, null, null, function(action) {
                self.action = action;
            });

            $('#auth-user-list-search').keyup(function(e) {
                var query = $.trim($('#auth-user-list-search').val());
                if (query == "") {
                    self._insertUserList(self.userList);
                    return;
                }
                var result = [];
                for (var i=0,len=self.userList.length; i<len; i++) {
                   if (self.userList[i].user_name.indexOf(query) != -1) {
                       result.push(self.userList[i]) 
                   }
                }

                self._insertUserList(result);
            });

            $('#add-auth-dialog-id').find('input').click(function() {
                var Elem = $(this);
                if (Elem.attr("type") == "radio" && 
                    Elem.attr("value") == "user" && $("#auth-spec-user-list-container").css('display') == 'none') {

                    $("#auth-spec-user-list-container").show();
                    var no = $("#auth-spec-user-list");
                    no.empty();
                    self.suc = new SelectUserCore(no, self.fileAttr.teamId);

                    $('#addUserBtn').on('click', function(){
                        var mask = new Mask(self.dialog.dialog);
                        var ud = new AddUserDialog(null, null, function(){

                        }, {mask: false});
                    });

                } else if (Elem.attr("value") != "user" && Elem.attr("type") == "radio") {
                    $("#auth-spec-user-list-container").hide();
                }
            });


            $('#add-auth-dialog-id-cancel').click(function() {
                self.dialog.close();
            });

            $('#add-auth-dialog-id-ok').click(function() {
                var authType = $('#add-auth-dialog-id input:radio:checked').attr("value");
                var agentType = null;
                var ids = null;
            
                switch(authType){
                    case "user":
                        var arr = self.suc.getSelectedItem();
                        var uids=[];
                        for(var i=0; i<arr.length; i++){
                            uids.push(arr[i].uid);
                        }
                        AuthModel.batch_user_set(_create, self.path, self.action, uids);  
                        break;
                    case "team":
                        var teamId = self.fileAttr.teamId;
                        AuthModel.create(_create, self.path, self.action, teamId, AuthModel.AGENT_TYPE.TEAM);  
                    break;
                    case "all":
                        AuthModel.create(_create, self.path, self.action, null, AuthModel.AGENT_TYPE.ALL);  
                    break;
                }
                
                function _create(ret) {
                    if (ret.code == 200) {
                        //Tips.show(ret.message);
                        self.dialog.close();
                        self.ok_callback();
                    } else if (ret.code == 500){
                        Tips.warn(ret.message.join("<br/>"));
                    } else {
                    	if(ret.message == ''){
                    		Tips.warn(_('您的操作失败了，请稍后重试'));
                    		return;
                    	}
                        Tips.warn(ret.message);
                    }
                }
            });
        },

        _insertUserList: function(userList) {
            var htmlArr = [];
            $("#auth-spec-user-list").empty();
            for (var i=0, len=userList.length; i<len;i++) {
                htmlArr.push('<div style="float:left;width:140px;padding:2px 2px;"><input type="checkbox" value="' + userList[i].uid + '"><span class="icon i-all-portrait" style="margin-left:5px;"></span><span style="float:right;width:100px;text-overflow:ellipsis;overflow:hidden;">' + userList[i].user_name + '</span></div>');
            }
            $("#auth-spec-user-list").append(htmlArr.join(''));
        }
    });
    return AddAuthDialog;
});
