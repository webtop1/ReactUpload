;
define('component/manageTeamDialog', function(require, exports) {
    var $ = require('jquery'),
        Validator = require('component/validator'),
        Dialog = require('component/dialog'),
        ConfirmDialog = require('component/confirmDialog'),
        FileModel = require('model/FileManager'),
        Tips = require('component/tips'),
        Util = require('util'),
        TeamTree = require('component/teamTree'),
        TeamModel = require('model/TeamManager');

    require('i18n');
    var _ = $.i18n.prop;
    require('mustache');

    function ManageTeamDialog(context, teamId, teamFolder, func) {
        this.context = context;
        this.teamId = teamId;
        this.teamFolder = teamFolder;
        this.func = func;
        this.current = {};
        this._init();
    }

    $.extend(ManageTeamDialog.prototype, {
        _init: function() {
            var self = this;

            var sQuota = $("#manageTeamDialog span.spaceQuota"),
                uQuota = $("#manageTeamDialog span.userQuota");
            //根据teamId从context中取出当前团队所有信息
            for(var i = 0;i<self.context.children.length;i++){
                if(self.teamId == self.context.children[i]._id){
                    self.current = self.context.children[i];
                }
            }
            if (self.current.path) {
                userQuota = self.current.member_limit;
                spaceQuota = self.current.quota / 1024 / 1024;
            } else {
                userQuota = Util.getUserAccountNumQuota();
                spaceQuota = Util.getUserSpaceQuota() / 1024 / 1024;
            }


            TeamModel.info_get(function(result) {
                if (result.code == 200) {
                    self.data = {};
                    self.data.type = result.data.from_domain_account ? _("域团队") : _("本地团队");
                    self.data.name = result.data.name;
                    self.data.quota = result.data.quota ? (result.data.quota / 1024 / 1024) : 0;
                    self.data.spaceQuota = spaceQuota;
                    self.data.user_limit = userQuota;
                    self.data.member_limit = result.data.member_limit == -1 ? Util.getUserAccountNumQuota() : result.data.member_limit;
                    self.data.description = result.data.description;
                    self.from_domain_account = result.data.from_domain_account;
                    render();
                }
            }, self.teamId);

            function render() {
                var html = [];
                html.push('<div id="manageTeamDialog" class="form"><p><span class="label">' + _("团队类型") + '</span>{{type}}</p>');
                html.push('<p><span class="label">' + _("团队名称") + '</span>');
                if (self.from_domain_account) {
                    html.push('<span id="name" >{{name}}<span/></p>');
                } else {
                    html.push('<input id="name" type="text" value="{{name}}"/></p>');
                }

                html.push('<p><span class="label">' + _("团队空间") + '</span><input id="quota" type="text" value="{{quota}}"/>&nbsp;MB&nbsp;');
                html.push('<span class="spaceQuota">' + _("(上限为{{spaceQuota}}MB)") + '</span></p>');
                html.push('<p><span class="label">' + _("团队人数上限") + '</span>');
                html.push('<input id="userlimit" type="text" value="{{member_limit}}"/>&nbsp;&nbsp;');
                html.push('<span class="userQuota">' + _("(团队成员最大上限为{{user_limit}})") + '</span></p>');
                html.push('<p><span class="label">' + _("备注") + '</span><textarea id="remark" maxlength="250">{{description}}</textarea></p></div>');
                html.push('<div class="dialog-button-area">');
                html.push('<a id="create" class="dialog-button ok">' + _("确定") + '</a>');
                html.push('<a id="cancel" class="dialog-button cancel">' + _("取消") + '</a></div>');
                step2_template = '<div id="manageTeamDialog"><p class="sucess-top">' + _("团队设置成功") + '</p></div>' +
                    '<div class="dialog-button-area"><a id="cancel" class="dialog-button cancel">' + _("关闭") + '</a></div>';
                var dialog = new Dialog(_('团队设置'), function(parent) {
                    parent.append(Mustache.render(html.join(""), self.data));

                    if (!Util.isAdmin()) {
                        $('#del-team').remove();
                    }

                    parent.find('#create').on('click', function() {

                        var quota = $('#quota').val();
                        var userlimit = $('#userlimit').val();
                        var remark = $('#remark').val();
                        var name = $('#name').val();

                        if (quota == "") {
                            dialog.showMessage('[' + _('团队空间') + ']' + _('不能为空'));
                            return;
                        }
                        if (name.length > 25) {
                            dialog.showMessage(_('最多可以输入25个字符'));
                            return;
                        }
                        if (!/^\d+$/.test(quota)) {
                            dialog.showMessage(_('请输入正整数') + '[' + _('团队空间') + ']');
                            return;
                        }
                        if (userlimit == "") {
                            dialog.showMessage('[' + _('团队人数上限') + ']' + _('不能为空'));
                            return;
                        }
                        if (userlimit != "" && !/^\d+$/.test(userlimit)) {
                            dialog.showMessage(_('请输入正确的数字') + '[' + _('团队人数上限') + ']');
                            return;
                        }
                        if (userlimit == "0") {
                            dialog.showMessage('[' + _('团队人数上限') + ']' + _('不能为0'));
                            return;
                        }
                        if (remark.length > 250) {
                            dialog.showMessage('[' + _('备注') + ']' + _('超过了250个字符'));
                            return;
                        }
                        $('body').data('category', 'teamSetting').data('action', '功能区内按钮').data('content', '团队');

                        var params = {
                            name: (self.context.path ? self.context.path : '') + '/' + $('#name').val(),
                            quota: Util.scientificToString($('#quota').val() * 1024 * 1024),
                            member_limit: $.trim($('#userlimit').val()),
                            description: $('#remark').val()
                        };
                        if (self.from_domain_account) {
                            delete params.name;
                        }

                        TeamModel.info_set(function(result) {
                            if (result.code == 200) {
                                dialog.close();
                                self.func(result.data);
                                Tips.show(_("团队设置成功"));
                            } else {
                                Tips.warn(result.message);
                                return;
                            }
                        }, self.teamId, params);
                    });

                    parent.delegate('#cancel', 'click', function() {
                        dialog.close();
                    });

                });
            }

        }

    });

    return ManageTeamDialog;
});
