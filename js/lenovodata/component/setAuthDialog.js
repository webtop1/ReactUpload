;define('component/setAuthDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog'),
		Tips = require('component/tips'),
		AuthModel = require('model/AuthManager'),
		UserModel = require('model/UserManager'),
	    ConfirmDialog = require('component/confirmDialog'),
		AddAuthDialog = require('component/addAuthDialog'),
		Util = require('util'),
        EventTarget = require('eventTarget'),
		AuthCombox = require('component/authCombox');
        
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    /*
     *    @param fileAttr: 文件属性
     */
    function SetAuthDialog(fileAttr, ok_callback) {
        var self = this;
        self.fileAttr = fileAttr;

        self.path = fileAttr.path;

        self.authArr = null; 
        self.ok_callback = ok_callback;
        self._init();
        /*AuthModel.get(function(ret) {
            if (ret.code == null) {
            Tips.warn(_("很抱歉，您的操作失败了，建议您重试一下！"));
            return;
            }
            self.authArr = ret.data;
            
        }, self.path);*/
    }

	$.extend(SetAuthDialog.prototype, EventTarget, {
        _render: function(dialog, dialog_cb) {
            var self = this;
            var authHtml = [];
            authHtml.push('<div id="auth-dialog-id">');
                authHtml.push('<div class="auth-dir">');
                    authHtml.push('<span class="auth-col-title">' + _("授权文件夹") + '</span>');
                    authHtml.push('<span style="width:378px;border:1px #CDD1D2 solid;display:inline-block;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;margin-left: 8px;" title="' + Util.getRootDisplayName() + self.path + '">');
                    authHtml.push('<span style="width:20px;height:20px" class="icon i-folder1"></span>');
                    authHtml.push(Util.getRootDisplayName() + self.path);
                    authHtml.push('</span>');
                authHtml.push('</div>');
                
                authHtml.push('<div class="auth-user-list lui-auth-list">');
                    authHtml.push('<span class="auth-col-title">' + _("授权记录") + '</span>');
                    /* 按照all,team,user排序*/
                    self.authArr.sort(function(a, b) {
                        if (a.agent_type == b.agent_type) return 0;
                        if (a.agent_type == "all") return -1;
                        if (b.agent_type == "all") return 1;
                        if (a.agent_type == "team" && b.agent_type == "user") return -1;
                        if (a.agent_type == "user" && b.agent_type == "team") return 1;
                    });
                    for (var i=0, len=self.authArr.length; i<len; i++) {
                        var icon = 'icon ';
                        switch(self.authArr[i].agent_type) {
                            case AuthModel.AGENT_TYPE.TEAM:
                                icon +=  'i-user6';
                                break;
                            case AuthModel.AGENT_TYPE.ALL:
                                self.authArr[i].agent_name = _("所有用户");
                                icon += 'i-user7';
                                break;
                            case AuthModel.AGENT_TYPE.USER:
                                icon += 'i-user';
                                break;
                        }
                        authHtml.push('<li class="clearfix" style="line-height:20px;margin:6px 0 0 11px; font-size:12px;">');
                            authHtml.push('<span class="' + icon + '"></span>');
                            authHtml.push('<span style="width: 19px;height: 19px; float:left; padding-left:5px;">');
                            authHtml.push('<span style="width:200px;text-overflow:ellipsis;overflow:hidden;display:inline-block;white-space:nowrap;vertical-align:middle;" title="'+self.authArr[i].agent_name+'">' + self.authArr[i].agent_name + '</span>');
                            authHtml.push('</span>');
                            authHtml.push('<span style="float:right;padding:0 10px 0px 5px;"><a class="icon i-delete" authid="' + self.authArr[i].id + '"></a></span>');
                            authHtml.push('<div id="authcombox' + i +  '" style="float:right;"></div>');
                        authHtml.push('</li>');
                    }
                authHtml.push('</div>');

                authHtml.push('<div class="auth-dir">');
                    
                    if (self.fileAttr.teamId) {
                    //authHtml.push('<input id="add-unregister-user" type="text" style="line-height:24px;border: 1px #CDD1D2 solid;"/>');
                    //authHtml.push('<input id="add-unregister-user-btn" type="button" style="width:53px; height:28px;border: 1px #fefefe solid;" value="' + _("添加") +'">');
                    }
                    authHtml.push('<input type="button" id="add-auth-id" style="width:78px; height:28px;border: 1px #fefefe solid; margin-left: 64px; background:#cfcfcf; border:none;" value="' + _("添加授权") +'">');
                authHtml.push('</div>');
            authHtml.push('</div>');

            dialog.append(authHtml.join('') + '<div class="dialog-button-area"><a id="auth-dialog-id-ok" class="dialog-button ok">' + _('确定') +'</a> <a id="auth-dialog-id-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');

            for (var i=0, len=self.authArr.length; i<len; i++) {
                new AuthCombox("#authcombox" + i, AuthModel.getAuthPair(self.authArr[i].action), self.authArr[i], function(item, data) {
                    var authData = data;
                    AuthModel.update(function(ret) {
                        if (ret.code != 200) {
                            Tips.warn(ret.message);
                            return;
                        }
                    }, authData.id, item);
                });
            }

            $('#auth-dialog-id').delegate('.i-delete', 'click' , function(e) {
                var authid = $(e.currentTarget).attr("authid");

                new ConfirmDialog({content: _("真的要删除当前用户的授权吗？")}, function() {
                    AuthModel.batch_del(function(ret) {
                        if (ret.code == 200) {
                            $(e.currentTarget).parent().parent().remove();
                            Tips.show(ret.message);
                            self.ok_callback && (self.ok_callback());
                        } else if (ret.code == 500) {
                            Tips.warn(ret.message.join("<br"));
                        } else {
                            Tips.warn(ret.message);
                        }
                    }, [authid]);
                });
            });

            $('#add-unregister-user-btn').click(function(){
                var email = $.trim($("#add-unregister-user").val()); 

                if (email == "") {
                    Tips.warn(_("Email不能为空!"));
                    return;
                }

                if (!Util.validEmail(email)) {
                    Tips.warn(_("Email格式不正确!"));
                    return;
                }

                if (!self.fileAttr.teamId) {
                    Tips.warn(_("该文件夹不属于任何组，不能创建新用户！"));
                    return;
                }

                UserModel.create_join_team(function(ret) {
                    if (ret.code != 200) return;
                    self.ok_callback && (self.ok_callback());
                }, email, self.fileAttr.teamId);
            });

            $('#add-auth-id').click(function(){
                self.dialog.close();
                new AddAuthDialog(self.fileAttr, function() {
                    new SetAuthDialog(self.fileAttr, self.ok_callback);
                });
            });

            $('#auth-dialog-id-cancel').click(function() {
                self.ok_callback && (self.ok_callback());
                self.dialog.close();
            });

            $('#auth-dialog-id-ok').click(function() {
                self.ok_callback && (self.ok_callback());
                self.dialog.close();
            });

            dialog_cb();
        },
        _init: function() {
            var self = this;
            var output = null;
            var title = null;

            self.dialog = new Dialog(_("设置授权"), {mask: true}, function(dialog, dialog_cb){
                AuthModel.get(function(ret) {
                    if (ret.code == null) {
                    Tips.warn(_("很抱歉，您的操作失败了，建议您重试一下！"));
                    return;
                    }
                    self.authArr = ret.data;
                    self._render(dialog, dialog_cb);
                }, self.path);
            });
        }
    });
    return SetAuthDialog;
});
