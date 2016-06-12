;define('component/addUser2TeamGuidDialog', function(require, exports, module){
	var $ = require('jquery'),
		TeamList = require('component/teamList'),
		Dialog = require('component/dialog'),
	    ConfirmDialog = require('component/confirmDialog'),
        Tips = require('component/tips'),
	    SelectTeamDialog = require('component/selectTeamDialog'),
		TeamModel = require('model/TeamManager');
	require('i18n');
	var	_ = $.i18n.prop;

    function AddUser2TeamGuidDialog(uid) {
        this.uid = uid;
        this._init();
    }

	$.extend(AddUser2TeamGuidDialog.prototype, {
        _init: function() {
            var self = this;

            var htmlArr = [];
            htmlArr.push('<div class="team-user-dialog">');
                htmlArr.push('<div class="team-list-subtitle">' + _("所属团队") + '</div>');
                htmlArr.push('<div class="team-list-c" style="height:265px;"></div>');
                htmlArr.push('<div class="team-list-add-link">');
                    htmlArr.push('<span class="icon i-add-sign"></span><span>' + _("加入团队") + '</span>');
                htmlArr.push('</div>');
            htmlArr.push('</div>');
            self.dialog = new Dialog(_("用户配置向导"), {mask: true}, function(dialog){
                dialog.append(htmlArr.join('') + '<div class="dialog-button-area"><a id="teamofusers-next" class="dialog-button ok">' + _('下一步') +'</a><a id="teamofusers-cancel" class="dialog-button cancel">' + _('取消') +'</a></div>');
            });

            TeamModel.list(function(ret) {
                 if (ret.code != 200) {
                    Tips.warn(ret.message);
                    return;
                 }
                 var teamData = [];
                 for (var i=0, len=ret.data.length; i<len; i++) {
                    teamData.push({"name": ret.data[i].name, "role": ret.data[i].role, "dataid": ret.data[i]._id});
                 }
                 new TeamList(".team-list-c", self.uid, teamData, function(e, dataid, uids) {
                        new ConfirmDialog({content: _("真的要从团队中删除当前用户吗？")}, function() {
                            TeamModel.membership_kickoff(function(ret) {
                                Tips.show(ret.message);
                                if (ret.code == 200) {
                                    $(e.currentTarget).parent().parent().remove();
                                }
                            }, dataid, uids);
                        });
                     }, function(dataItem, role) {
                        TeamModel.set_role(function(ret) {
                            if (ret.code != 200) {
                                Tips.warn(ret.message);
                            }
                        }, dataItem.dataid, self.uid, role);
                     });
             }, false, self.uid);

            $("#teamofusers-next").click(function(){
                self.dialog.close();
            });

            $("#teamofusers-cancel").click(function(){
                self.dialog.close();
            });

            $(".team-list-add-link").click(function() {
                new SelectTeamDialog(function(teams) {
                    var teamIds = [];
                    for (var i=0, len=teams.length; i<len; i++) {
                       teamIds.push(teams[i].value); 
                    }
                    TeamModel.batch_join(function(ret) {
                        if (ret.code != 200) {
                            Tips.warn(ret.message);
                        }
                    }, self.uid, teamIds);
                });
            });
        },
        close: function() {
            this.dialog.close();
        }
    });

    return AddUser2TeamGuidDialog;
})
