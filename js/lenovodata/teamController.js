;define('lenovodata/teamController', function(require, exports){

	var $ = require('jquery'),
		Dialog = require('component/dialog'),
		Tips = require('component/tips'),
		Util = require('util'),
		AddDirAuthDialog = require('component/addDirAuthDialog'),
		ConfirmDialog = require('component/confirmDialog'),
		AuthModel = require('model/AuthManager'),
		FileModel = require('model/FileManager'),
		TeamModel = require('model/TeamManager'),
		TeamTree = require('component/teamTree'),
		AddTeamDialog = require('component/addTeamDialog');

	require('i18n');
	var	_ = $.i18n.prop;

	function controller(context, type, param){
		switch(type){
            case 'create':
                create(context, param);
                break;
            case 'auth':
                auth(context, param);
                break;
            case 'kickoff':
                kickoff(context, param);
                break;
            case 'delTeam':
                delTeam(context, param);
                break;
            break;
        }
	}

	function kickoff(context, param) {
        var self = this;
        var uids = [];
        if (Object.prototype.toString.call(param) === "[object Array]") {
            if (param.length == 0) {
                Tips.warn(_("请选择要移出的用户！"));
                return;
            }

            for (var i=0, len=param.length; i<len; i++) {
                if (Util.isTeamLeader() && Util.getUserID() == param[i].uid) {
                    Tips.warn(_("不能移出自己"));
                    return;
                }
                uids.push(param[i].uid);
            }
        } else {
            if (Util.isTeamLeader() && Util.getUserID() == param.uid) {
                Tips.warn(_("不能移出自己"));
                return;
            }
            uids.push(param.uid);
        }

        new ConfirmDialog({content:'<div class="confirm-rmUser">'+ _("确认要移除选中的用户吗？")+'</div>'}, function() {
            TeamModel.membership_kickoff(function(ret) {
                if (ret.code == 200) {
                    Tips.show(_("移除成功"));
                    context.reload();
                }
            }, param[0].teamId, uids);
        });
    }

	function create(context, param) {
        var self = this;
        var TeamContext = teamTree.teamTree.tree("getNodeById",param['path']);
        var dialog = new AddTeamDialog({teamPath:param['path'],callback:function(team){
        	param['teamTree'].insertTeamNode(param['path'],team);
        },TeamContext:TeamContext});
        dialog.on('close', function(){
            //param['teamTree'].render();
        });
    }

    function auth(context, param) {
        new AddDirAuthDialog(param.teamPath, undefined,  AuthModel.AGENT_TYPE.TEAM, "/"+param.teamName, function() 
        {
            context.reload();        
        });
    }

    function delTeam(context, param) {
        new ConfirmDialog({title:_('删除'),content: _("是否删除团队空间及空间中的数据？")}, function() {
            TeamModel.del(function(ret) {
                if (ret.code != 200) {
                    Tips.warn(ret.message);
                    return;
                }
				context.gotoParentLevel(param.teamPath);//调用列表的返回父级方法
            }, param.teamId); 
        });
    }
    

    return controller;
});
