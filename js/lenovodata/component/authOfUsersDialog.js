;define('component/authOfUsersDialog', function(require, exports, module){
	var $ = require('jquery'),
		AuthList = require('component/authList'),
        CopyMoveTree = require('component/copyMoveFileTree'),
		Tips = require('component/tips'),
		Dialog = require('component/dialog'),
	    ConfirmDialog = require('component/confirmDialog'),
        AddFolder = require("component/addfolder"),
	    Util = require('util'),
		TeamModel = require('model/TeamManager'),
		AuthModel = require('model/AuthManager');
	require('i18n');
	var	_ = $.i18n.prop;
    // var self;
    function AuthOfUsersDialog(uid, callback) {
        this.uid = uid;
        this.userType = AuthModel.AGENT_TYPE.USER;
        this.callback = callback;
        this.currTab = 2;
        this.dirVal = "/";
        this.authVal = 2009;
        this.curteamId;
        this.curteamName;
        this.curteamPath = "/";
        this.isCreateFolder = true;
        //删除权限数组
        this.deleteList = [];
        this.publist;
        this.manageType=0;
        this._init();
    }

	$.extend(AuthOfUsersDialog.prototype, {
        _init: function() {
            var self = this;

            var htmlArr = [];
            htmlArr.push('<div class="team-user-dialog">');
                htmlArr.push('<div id="operate-title" class="team-list-subtitle">' + _("") + '</div>');
                htmlArr.push('<div class="team-list-c" style="display: none;"></div>');
                htmlArr.push('<div class="team-list-d" style="display: none;">' +
                    '<div id="teamMenuDialog" class="teamTree tmenu-active"></div>'+
                    //'<a id="createFolder" style="padding: 10px;display: block;border-top: 1px solid black;border-bottom: 1px solid black;">+新建文件夹</a>' +
                    '<div style="padding-bottom:12px;padding-top:12px;border-top: 1px solid #eaeaea;border-bottom: 1px solid #d2d2d2;"><div style="margin: 10px;display: inline-block;">'+_("选择权限级别:")+'</div><select id="authSelect">' +
                    '<option value="2009">'+_("预览")+'</option>' +
                    '<option value="2008">'+_("上传")+'</option>' +
                    '<option value="2007">'+_("上传/外链")+'</option>' +
                    '<option value="2006">'+_("下载")+'</option>' +
                    '<option value="2005">'+_("下载/外链")+'</option>' +
                    '<option value="2004">'+_("上传/下载")+'</option>' +
                    '<option value="2003">'+_("上传/下载/外链")+'</option>' +
                    '<option value="2001">'+_("编辑")+'</option>' +
                    '</select>' +
                    '</div></div>');
            htmlArr.push('<div class="team-list-e" style="display: none;"></div>');
            htmlArr.push('</div>');
            self.dialog = new Dialog(_("所属团队"), {mask: true}, function(dialog){
                dialog.append(htmlArr.join('') + '<div class="dialog-button-area">' +
                    '<a id="teamofusers-join" class="dialog-button join_team" style="display: none;">' + _('添加新授权') +'</a>' +
                    '<a id="teamofusers-new" class="dialog-button new_folder" style="display: none;">' + _('新建文件夹') +'</a>' +
                    '<a id="teamofusers-ok" class="dialog-button ok disabled" style="display: none;">' + _('保存设置') +'</a>' +
                    '<a id="teamofusers-save" class="dialog-button save" style="display: none;">' + _('确定') +'</a>' +
                    '<a id="teamofusers-create" class="dialog-button create" style="display: none;">' + _('创建') +'</a>' +
                    '<a id="teamofusers-cancel" class="dialog-button cancel" style="display: none;">' + _('取消') +'</a>' +
                    '<a id="teamofusers-return" class="dialog-button return" style="display: none;">' + _('返回') +'</a></div>');
            });

            self.getTeamList();
            self.bindEvents();

        },
        //绑定事件
        bindEvents:function(){
            var self = this;
            //
            $(".dialog-button-area").delegate('.abled','click',function(){
                self.deleteAuth();
                self.setAuths();
                self.callback && self.callback();
                self.dialog.close();
            });
            $("#teamofusers-save").click(function(){
                self.addAuthToList();
            });
            $("#teamofusers-return").click(function(){
                self.getTeamList();
            });
            $("#teamofusers-join").click(function(){
                self.getTeamGroupList();
            });
            $("#teamofusers-new").click(function(){
                self.createFolder(self);
            });
            //取消按钮
            $("#teamofusers-cancel").click(function(){
                self.callback && self.callback();
                self.dialog.close();
            });
            $("#authSelect").change(function(){
                self.authVal = this.value;
            });
        },
        getAuth:function(type){
            var auth = {
                "2009":"preview",
                "2008":"upload",
                "2007":"upload:delivery",
                "2006":"download",
                "2005":"download:delivery",
                "2004":"upload:download",
                "2003":"upload:download:delivery",
                "2001":"edit",
            }
            return auth[type];
        },
        switchBtn:function(tabNum){
            var self = this;
            switch(tabNum) {
                case 1:
                    self.dialog.dialog.find('span.title').text(_('授权信息'));
                    $('.team-user-dialog #operate-title').html(_(""));
                    $('.team-user-dialog #operate-title').removeClass('team-list-subtitle-new').addClass("team-list-subtitle");
                    $('.team-list-c').html("");
                    $('.team-list-c').show();
                    $('.team-list-d').hide();
                    $('.team-list-e').hide();
                    $('#teamofusers-join').show();
                    $('#teamofusers-ok').show();
                    $('#teamofusers-ok').removeClass("abled").addClass("disabled");
                    $('#teamofusers-cancel').show();
                    $('#teamofusers-return').hide();
                    $('#teamofusers-save').hide();
                    $('#teamofusers-new').hide();
                    $('#teamofusers-create').hide();
                    break;
                case 2:
                    self.currTab = 2;
                    self.dialog.dialog.find('span.title').text(_('添加新授权'));
                    $('.team-list-d #teamMenuDialog').html("");
                    $('.team-user-dialog #operate-title').html(_("选择将要授权的文件夹"));
                    $('.team-user-dialog #operate-title').removeClass('team-list-subtitle').addClass("team-list-subtitle-new");
                    $('.team-list-c').hide();
                    $('.team-list-d').show();
                    $('.team-list-e').hide();
                    $('#teamofusers-join').hide();
                    $('#teamofusers-ok').hide();
                    $('#teamofusers-cancel').hide();
                    $('#teamofusers-return').show();
                    $('#teamofusers-save').show();
                    $('#teamofusers-new').show();
                    $('#teamofusers-create').hide();
                    break;
                default :
                    break;
            }
        },
        close: function() {
            this.dialog.close();
        },
        recycle:function(){
            var self = this;
            self.dirVal = "/";
            self.authVal = "2009";
            self.deleteList = [];
        },
        //获取已授权的文件
        getTeamList:function(){
            var self = this;
            self.switchBtn(1);
            AuthModel.get(function (ret) {
                if (ret.code != 200) {
                    Tips.warn(ret.message);
                    return;
                }
                self.data = ret.data;
                //增加 值是否改变的 状态标识 isChanged
                for(var i = 0;i<self.data.length;i++){
                    self.data[i].isChanged = false;
                    self.data[i].isDelete = false;
                }
                self._renderList();
            },'/', self.uid,self.userType);
        },
        //获取所有文件夹列表
        getTeamGroupList:function(){
            var self = this;
            self.switchBtn(2);
            self.ft = new CopyMoveTree('#teamMenuDialog', {path_type:'ent'},{width:"465px", min_height:192, max_height:192,autoOpen:true, teamName:"/",authOfUserDialog:true});
            self.ft.on('changePath',function(realpath, cssAction,dirData){
                self.dirVal = realpath;
            });
            self.ft._loadData("/");
        },
        //调用新建文件夹控件
        createFolder:function(dialog){
            var self = this;
            if(!dialog.isCreateFolder)return;
            var node = dialog.getSelectNode();
            new AddFolder({reload:function(){},type:node.path_type,from:node.from,prefix_neid:node.prefix_neid},node.path,function(childpath){
                dialog.addFolder(node.id,childpath);
            });
        },
        //成功新建文件夹后往tree中添加相应节点
        addFolder:function(parentId,childPath){
            var self = this;
            var parentPath = parentId,
                childPath = childPath?childPath.replace('\/\/','\/'):"/";
            return self.ft.insertDir(parentPath,childPath);
        },
        //获取相应选中的文件夹
        getSelectNode:function(){
            var self = this;
            return self.ft.getSelectNode();
        },
        //新增授权
        addAuthToList:function(){
            var self = this;
            var flag = false;
            for(var i = 0;i<self.data.length;i++){
                if(self.data[i].path == self.dirVal){
                    flag = true;
                }
            }
            if(!flag){
                self.data.push({"path":self.dirVal,"privilege_id":self.authVal,"privilege_name":self.getAuth(self.authVal),"isNew":true,"isDelete":false,"isChange":false,});
            }
            self.switchBtn(1);
            if(self.getChangeFlag()){
                $('#teamofusers-ok').removeClass("disabled").addClass("abled");
            }else{
                $('#teamofusers-ok').removeClass("abled").addClass("disabled");
            }
            self._renderList();
        },
        //为批量授权准备数据
        prepareData:function(){
            var self = this;
            var authVals = $('.ld-combox .curtext');
            for(var i = 0;i<self.data.length;i++){
                self.data[i].privilege_id = AuthModel.getAuthPair($(authVals[i]).attr('act')).privilege_id;
                self.data[i].privilege_name = AuthModel.getAuthPair($(authVals[i]).attr('act')).item_value;
            }
        },
        //获取列表数据是否改动过
        getChangeFlag:function(index,isChanged){
            var self = this;
            if(index){self.data[index].isChanged = isChanged;}
            for(var i = 0;i<self.data.length;i++){
                if(self.data[i].isChanged || self.data[i].isNew || self.data[i].isDelete){
                    return true;
                }
            }
            return false;
        },
        //批量授权
        setAuths:function(){
            var self = this;
            //self.prepareData();
            if(!self.getChangeFlag()){return;}
            for(var i = 0;i<self.data.length;i++){
                if(self.data[i].isNew || self.data[i].isChanged){
                    AuthModel.auth_batch_create(function(ret){
                        if(ret.code == 200){
                            Tips.show(_('授权成功'));
                        } else {
                            Tips.warn(ret.message);
                        }
                    },self.data[i].path,"ent","",'{"agent_id":'+self.uid+',"agent_type":"user","privilege_id":"'+self.data[i].privilege_id+'"}');
                }
            }
        },
        deleteAuth:function(){
            var self = this;
            for(var i = 0;i<self.deleteList.length;i++){
                AuthModel.batch_del(function(ret) {
                    if (ret.code == 200) {
                        Tips.show(ret.message);
                    } else if (ret.code == 500) {
                        Tips.warn(ret.message.join("<br"));
                    } else {
                        Tips.warn(ret.message);
                    }
                }, [{'auth_id':self.deleteList[i]}]);
            }
        },
        _renderList:function(){
            var self =this;
            new AuthList(".team-list-c", self.uid,self.data, function(e, authid) {
                if (Util.isTeamLeader() && Util.getUserID() == self.uid) {
                    Tips.warn(_("不能移出自己"));
                    return;
                }
                new ConfirmDialog({content: _("真的要删除当前用户的访问权限么？")}, function() {
                    $('#teamofusers-ok').removeClass("disabled").addClass("abled");
                    $(e.currentTarget).parent().parent().remove();
                    //添加到删除数组中
                    self.deleteList.push(authid);
                    for(var i = 0;i<self.data.length;i++){
                        if(self.data[i].id == authid){
                            self.data[i].isDelete = true;
                        }
                    }
                    self._renderList();
                });
            }, function(dataItem, role,index,isChanged) {
                if (Util.isTeamLeader() && Util.getUserID() == self.uid) {
                    Tips.warn(_("不能改变自己的角色"));
                    return ;
                }
                //当前登录用户不是团队管理员
                if(!Util.isBusiness()&&!window.LenovoData.user["teamAdmin"][dataItem.dataid]){
                    Tips.warn(_("当前登录用户不是团队管理员"));
                    return false;
                }
                $('body').data('action','所属团队列表').data('category','update').data('content','成员角色');
                self.data[index].privilege_id = AuthModel.getAuthPair(role).privilege_id;
                self.data[index].privilege_name = AuthModel.getAuthPair(role).item_value;
                if(self.getChangeFlag(index,isChanged)){
                    $('#teamofusers-ok').removeClass("disabled").addClass("abled");
                }else{
                    $('#teamofusers-ok').removeClass("abled").addClass("disabled");
                }

            },function(dataItem, role){
                //当前登录用户不是团队管理员
                if(!Util.isBusiness()&&!window.LenovoData.user["teamAdmin"][dataItem.dataid]){
                    return false;
                }
                if (Util.isTeamLeader() && Util.getUserID() == self.uid) {
                    return false;
                }
                return true;
            });
        }
    });

    return AuthOfUsersDialog;
})
