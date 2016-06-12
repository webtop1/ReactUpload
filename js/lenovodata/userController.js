;define('lenovodata/userController', function(require, exports){

	var $ = require('jquery'),
		Dialog = require('component/dialog'),
		Tips = require('component/tips'),
		AuthModel = require('model/AuthManager'),
		UserModel = require('model/UserManager'),
		TeamManager = require('model/TeamManager'),
		ConfirmDialog = require('component/confirmDialog'),
		ManageAuthDialog = require('component/manageAuthDialog'),
		UserInfoDialog = require('component/userInfoDialog'),
		DirSelectDialog= require('component/dirSelectDialog'),
		TeamOfUsersDialog = require('component/teamOfUsersDialog'),
		AuthOfUsersDialog = require('component/authOfUsersDialog'),
        AddUserDialog = require('component/addUserDialog'),
        ImportUserDialog = require('component/importUserDialog'),
        AdminTransferDialog = require("component/transfer/transfer_dialog"),
        TransferSpaceDialog =  require("component/transferspacedialog"),
		UserTeamAuthList = require("component/userTeamAuthList");
	require('i18n');
	var	_ = $.i18n.prop;

	function controller(context, type, param){

		switch(type){
            case 'auth':
                auth(context, param);
            break;
            case 'frozen':
                frozen(context, param);
            break;
            case 'activate':
                activate(context, param);
            break;
            case 'delete':
                del(context, param);
            break;
            case 'edit':
                edit(context, param);
            break;
            case 'teamlist':
                teamlist(context, param);
            break;
            case 'authlist':
                authlist(context, param);
            break;
            case 'create':
                create(context, param);
            break;
            case 'import':
                importUser(context, param);
            break;
            case 'mobileCer':
            	mobileCer(context,param);
            break;
            case "transfer":
                transfer(context,param);
                break;
        }
	}

    function auth(context, param) {
        if (Object.prototype.toString.call(param) === "[object Array]") {
            if (param.length == 0) {
                Tips.warn(_("请选择要批量授权的账户"));
                return;
            }

            if (param.length == 1) {
                var path = "";
                AuthModel.get(function(ret) {
                    if (ret.code == null) {
                    Tips.warn(_("很抱歉，您的操作失败了，建议您重试一下！"));
                    return;
                    }
                    new ManageAuthDialog([param[0].uid], ret.data);
                }, path, param.uid, AuthModel.AGENT_TYPE.USER);
            } else {
                var uids = [];
                for (var i=0, len=param.length; i<len; i++) {
                    uids.push(param[i].uid);
                }
                new ManageAuthDialog(uids);
            }
        } else {
            var path = "";
            AuthModel.get(function(ret) {
                if (ret.code == null) {
                Tips.warn(_("很抱歉，您的操作失败了，建议您重试一下！"));
                return;
                }
                new ManageAuthDialog([param.uid], ret.data);
            }, path, param.uid, AuthModel.AGENT_TYPE.USER);
        }
    }
    function activate(context, param) {
        var uids = [];
        if (Object.prototype.toString.call(param) === "[object Array]") {
            if (param.length == 0) {
                Tips.warn(_("请选择要激活的账户"));
                return;
            }

            for (var i=0, len=param.length; i<len; i++) {
            	if(param[i].frozen=="true")
                    uids.push(param[i].uid);
            }
        } else {
            uids.push(param.uid);
        }
        if(uids.length==0){
        	Tips.warn(_("请选择要激活的账户"));
            return;
        }
        new ConfirmDialog({content: _("确认要激活选中的用户吗？")}, function() {
            UserModel.batch_activate(function(ret) {
                if (ret.code == 200) {
                    context.reload();
                    Tips.show(_("激活成功"));
                } else {
                    Tips.warn(ret.message);
                }
            }, uids);
        });
    }

    function frozen(context, param) {
        var uids = [];
        if (Object.prototype.toString.call(param) === "[object Array]") {
            if (param.length == 0) {
                Tips.warn(_("请选择要冻结的账户"));
                return;
            }

            for (var i=0, len=param.length; i<len; i++) {
                uids.push(param[i].uid);
            }
        } else {
            uids.push(param.uid);
        }
        new ConfirmDialog({content: _("冻结账户操作会使该账户无法登陆网盘，<br />但其个人空间中的数据和团队权限仍然保留。<br />您确定要冻结该账户吗？")}, function() {
            UserModel.batch_freeze(function(ret) {
                if (ret.code == 200) {
                    context.reload();
                    Tips.show(ret.message);
                } else {
                    Tips.warn(ret.message.join("<br/>"));
                }
            }, uids);
        });
    }

    function del(context, param) {
        var uids = [];
        if (Object.prototype.toString.call(param) === "[object Array]") {
            if (param.length == 0) {
                Tips.warn(_("请选择要删除的账户"));
                return;
            }
            for (var i=0, len=param.length; i<len; i++) {
                uids.push(param[i].uid);
            }
        } else {
            uids.push(param.uid);    
        }
        
        if(param.length==1){
        	new ConfirmDialog({content:_('删除用户会删除其所属的个人空间数据，并取消授予的权限。您可以将该用户个人空间移交给其他用户，或者直接删除用户数据。'),okBtn:_('直接删除'),flags:true},function(){
	        	delUser();
	        },null,function(){
	        	new TransferSpaceDialog(uids[0],function(){
	        		delUser();
	        	});
	        });
        }else if(param.length>1){
        	new ConfirmDialog({content:_('删除用户会删除其所属的个人空间数据，并取消授予的权限，确定要删除该用户吗？')},function(){
	        	delUser();
	        });
        }
        
        function delUser()
        {
        	UserModel.batch_del(function(ret) {
	            if (ret.code == 200) {
	                Tips.show(ret.message);
	            } else if(ret.code==203){
	            	var result = ret.data,users = [];
	            	$(result).each(function(i,value){
	            		var obj = value.user;
	            		obj.hasshare = value.hasshare;
	            		obj.index = i;
	            		users.push(obj);
	            	});
	            	new TransferAuthDialog(uids.length==1?1:2,users,function(){context.reload();});
	            }else{
	                Tips.warn(ret.message.join("<br/>"));
	            }
	            context.reload();
	        }, uids);
        }
        //个人空间数据移交
    }

    function edit(context, param) {
        new UserInfoDialog(param[0], function() {
            context.reload();
        });
    }

    function create(context, teamId) {   	
	    new AddUserDialog(context, teamId, function(uidArr) {
	        var mad = new ManageAuthDialog(uidArr);
	        mad.dialog.on('close', function(){
	            context && (context.reload());
	        });
	    });
    }

    function importUser(context, param){
        var iud = new ImportUserDialog();
        iud.on('close', function(){
            context.reload();
        });
    }

    function teamlist(context, param){
        var uid = null;
        if (Object.prototype.toString.call(param) === "[object Array]") {
            uid = param[0].uid;
        } else {
            uid = param.uid;
        }
        Util.sendDirectlyRequest('用户/团队',$('body').data('action')+'查看','-');
        new TeamOfUsersDialog(uid, function() {
           context.reload();
       });
    }
    function authlist(context, param){
        var uid = null;
        if (Object.prototype.toString.call(param) === "[object Array]") {
            uid = param[0].uid;
        } else {
            uid = param.uid;
        }
        Util.sendDirectlyRequest('用户/团队',$('body').data('action')+'查看','-');
        new AuthOfUsersDialog(uid, function() {
           context.reload();
       });
    }

    function mobileCer(context, param) {
        var obj={};
        var create_template = '<div class="dialog-button-area"><a id="create" class="dialog-button ok">' + _("确定") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") +'</a></div>';
        var smsAuthDialog = new Dialog(_("手机验证"),function(parent,callback){
        	obj.authTree = true;
        	obj.title = _("所有用户及团队");
        	obj.userTeamListTitle = _("团队及成员");
        	obj.authListTitle = _("已添加");
        	obj.mark = 1;
        	var userTeamAuthList = new UserTeamAuthList(parent,1,obj);

        	parent.append(create_template);
        	
        	parent.find("#cancel").click(function(e){
        		smsAuthDialog.close();
        	});
        	userTeamAuthList.on('render', function(){
            	callback();
            });
           		
          parent.find('#create').on('click', function(e){
          	var arr = userTeamAuthList.getSelectedItem(),entry_infos=[],arrUid=[],arrTeamid=[],all=false;

          	for(var i=0;i<arr.length; i++){
          		var item = arr[i],str_arr = [];
          		
          		//去掉数组里面非直接量对象即函数的元素
                if(Object.prototype.toString.call(item)=="[object Function]")
                	continue;
                if(item.agent_type=="all"){
                	all = true;
                }else if (item.agent_type=="team"){
                	arrTeamid.push(item.agent_id);
                }else {
                	arrUid.push(item.agent_id);
                }
            }

            if(all!=true && arrTeamid.length ==0 && arrUid.length == 0){
            	//Tips.warn(_("请选择要添加手机验证的用户！"));
            	smsAuthDialog.close();
            	return;
            }
           
            var post_data = {
            	user_ids:arrUid,
            	team_ids:arrTeamid,
            		 all:all,
            		 action:'enable'
            }
            UserModel.smsAuthSet(function(ret){
            	if(ret.code == 200){
            		Tips.show(_('设置成功'));
            		smsAuthDialog.close();
            	} else {
            		Tips.warn(ret.massage);
            	}
            },post_data);
	     });
      });
        
    }

    /**
     * 共享移交
     * @param context
     * @param param
     */
    function transfer(context,param){
        new AdminTransferDialog(context,param).init();
    }
	return controller;
});
