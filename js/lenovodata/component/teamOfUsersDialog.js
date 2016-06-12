;define('component/teamOfUsersDialog', function(require, exports, module){
	var $ = require('jquery'),
		TeamList = require('component/teamList'),
		AddTeamDialog = require('component/addTeamDialog'),
        TeamTreeDialog = require('component/teamTreeDialog'),
		Tips = require('component/tips'),
		Dialog = require('component/dialog'),
	    ConfirmDialog = require('component/confirmDialog'),
	    SelectTeamDialog = require('component/selectTeamDialog'),
	    Util = require('util'),
		TeamModel = require('model/TeamManager');
    AuthModel = require('model/AuthManager');
	require('i18n');
	var	_ = $.i18n.prop;
    var self;
    function TeamOfUsersDialog(uid, callback) {
        this.uid = uid;
        this.callback = callback;
        this.currTab = 2;
        this.roleVal = "member";
        this.authVal = 2009;
        this.curteamId = null;
        this.curteamName = null;
        this.curteamPath = "";
        this.teamPath = "/";
        this.curteamLevel;
        this._firstLoad = true;
        //删除权限数组
        this.deleteList = [];
        this.manageType=0;
        this.isDomainTeam=false;
        this.curTotal;
        this.cutTeamTotal;//团队id 团队名称 团队路径  团队级别  公共列表 管理类型 0默认 1团队成员管理 2授权管理  是否域团队
        this._init();
    }

	$.extend(TeamOfUsersDialog.prototype, {
        _init: function() {
            var self = this;

            var htmlArr = [];
            htmlArr.push('<div class="team-user-dialog">');
                htmlArr.push('<div id="operate-title" class="team-list-subtitle">' + _("") + '</div>');
                htmlArr.push('<div class="team-list-c" style="display: none;"></div>');
                htmlArr.push('<div class="team-list-d" style="display: none;">' +
                    '<div id="teamMenuDialog" class="teamTree tmenu-active"></div>' +
                    //'<a id="openAddTeamDialog" style="padding: 10px;display: block;border-top: 1px solid black;border-bottom: 1px solid black;">+新建团队</a>' +
                    '<div style="padding-bottom:12px;padding-top:12px;border-top: 1px solid #eaeaea;border-bottom: 1px solid #d2d2d2;font-size: 12px"><div style="margin: 10px;display: inline-block;">'+_("选择团队角色:")+'</div><select id="roleSelect">' +
                    '<option value="member">'+_("团队成员")+'</option>' +
                    '<option value="admin">'+_("团队管理员")+'</option>' +
                    '</select></div>');
                htmlArr.push('</div><div class="team-list-e" style="display: none;"></div>');
            htmlArr.push('</div>');
            self.dialog = new Dialog(_("所属团队"), {mask: true}, function(dialog){
                dialog.append(htmlArr.join('') + '<div class="dialog-button-area">' +
                    '<a id="teamofusers-join" class="dialog-button join_team" style="display: none;">' + _('加入团队') +'</a>' +
                    '<a id="teamofusers-new" class="dialog-button new_folder" style="display: none;">' + _('创建团队') +'</a>' +
                    '<a id="teamofusers-ok" class="dialog-button ok disabled" style="display: none;">' + _('保存设置') +'</a>' +
                    '<a id="teamofusers-save" class="dialog-button save" style="display: none;">' + _('确定') +'</a>' +
                    '<a id="teamofusers-create" class="dialog-button create" style="display: none;">' + _('创建') +'</a>' +
                    '<a id="teamofusers-cancel" class="dialog-button cancel" style="display: none;">' + _('取消') +'</a>' +
                    '<a id="teamofusers-return" class="dialog-button return" style="display: none;">' + _('返回') +'</a></div>');
            });

            self.getTeamList();
            self.bindEvents();

        },
        bindEvents:function(){
            var self = this;
            $(".dialog-button-area").delegate('.abled','click',function(){
                self.deleteRole();
                self.setRoles();
                self.recycle();
                self.callback && self.callback();
                self.dialog.close();
            });
            $("#teamofusers-save").click(function(){
                self.addTeamToList();
            });
            $("#teamofusers-return").click(function(){
                self.currTab == 3?self.getTeamGroupList():self.getTeamList();
            });
            $("#teamofusers-join").click(function(){
                self.getTeamGroupList();
            });
            $("#teamofusers-create").click(function(){
                $(".dialog-button-area #create").trigger('click');
            });
            $("#teamofusers-new").click(function(){
                self.getAddTeamContent();
            });

            $("#teamofusers-cancel").click(function(){
                self.callback && self.callback();
                self.dialog.close();
            });

            $("#roleSelect").change(function(){
                self.roleVal = this.value;
            });
            $("#authSelect").change(function(){
                self.authVal = this.value;
            });
        },
        recycle:function(){
            var self = this;
            self.curteamId = null;
            self.curteamName = null;
            self.curteamPath = "";
            self.teamPath = "/";
            self.deleteList = [];
        },
        switchBtn:function(tabNum){
            var self = this;
            if(tabNum!=3){
                //self.recycle();
            }
            switch(tabNum) {
                case 1:
                    self.dialog.dialog.find('span.title').text('所属团队');
                    $('.team-user-dialog #operate-title').html(_(""));
                    $('.team-user-dialog #operate-title').removeClass('team-list-subtitle-new').addClass("team-list-subtitle");
                    //$('.team-list-c').html("");
                    $('.team-list-c').show();
                    $('.team-list-d').hide();
                    $('.team-list-e').hide();
                    $('#teamofusers-join').show();
                    $('#teamofusers-ok').show();
                    //$('#teamofusers-ok').removeClass("abled").addClass("disabled");
                    $('#teamofusers-cancel').show();
                    $('#teamofusers-return').hide();
                    $('#teamofusers-save').hide();
                    $('#teamofusers-new').hide();
                    $('#teamofusers-create').hide();
                    break;
                case 2:
                    self.currTab = 2;
                    self.dialog.dialog.find('span.title').text(_('加入团队'));
                    $('.team-list-d #teamMenuDialog').html("");
                    $('.team-user-dialog #operate-title').html(_("选择将要加入的团队"));
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
                case 3:
                    self.currTab = 3;
                    self.dialog.dialog.find('span.title').text(_('创建团队'));
                    $('.team-user-dialog #operate-title').html(_(""));
                    $('.team-user-dialog #operate-title').removeClass('team-list-subtitle-new').addClass("team-list-subtitle");
                    $('.team-list-e').html("");
                    $('.team-list-c').hide();
                    $('.team-list-d').hide();
                    $('.team-list-e').show();
                    $('#teamofusers-join').hide();
                    $('#teamofusers-ok').hide();
                    $('#teamofusers-cancel').hide();
                    $('#teamofusers-return').show();
                    $('#teamofusers-save').hide();
                    $('#teamofusers-new').hide();
                    $('#teamofusers-create').show();
                    break;
                default :
                    break;
            }
        },
        close: function() {
            this.dialog.close();
        },
        //获取已加入的团队
        getTeamList:function(){
            var self = this;
            self.switchBtn(1);
            if(self._firstLoad){
                TeamModel.list_direct_belong_to_team(function(ret) {
                    if (ret.code != 200) {
                        Tips.warn(ret.message);
                        return;
                    }
                    self.data = [];
                    for (var i=0, len=ret.data.length; i<len; i++) {
                        self.data.push({"path":ret.data[i].path, "name":Util.resolvePath(ret.data[i].path).name, "role": ret.data[i].role, "dataid": ret.data[i]._id,"isDelete":false});
                    }
                    self._renderList();
                    self._firstLoad = false;
                },self.uid);
            }else{
                self._renderList();
            }
        },
        //获取所有团队列表
        getTeamGroupList:function(){
            var self = this;
            self.switchBtn(2);
            self.tree = new TeamTreeDialog("#teamMenuDialog",function(param,success,error){
                TeamModel.getTeamListById(function(result){
                    success(result);
                },'',false,0,20);
            },{type:1,title:_("所有用户"),authTree:true,min_height:216,max_height:220});
            self.tree.render();
            self.tree.on("teamSelected",function(teamId,teamName,teamPath,teamLevel,isDomain){
                self.curteamId = teamId;
                self.curteamName = teamName;
                self.curteamPath = teamPath.substring(1,teamPath.length);
                self.teamPath = teamPath;
                self.curteamLevel = teamLevel;
                self.isDomainTeam = isDomain;
                if(self.manageType==0)self.manageType = 1;
                $(".page-left .menu-item").removeClass("active");
                //render();
            });
        },
        //获取添加团队组件
        getAddTeamContent:function(){
            var self = this;
            self.switchBtn(3);
            var TeamContext = self.tree.teamTree.tree("getNodeById",self.teamPath);
            new AddTeamDialog({teamPath:self.curteamPath==""?self.curteamPath:"/"+self.curteamPath,callback:function(team){
                teamTree.insertTeamNode(self.curteamPath,team);
                self.getTeamGroupList();
            },TeamContext:TeamContext,isDialog:'.team-list-e',context:self.dialog});
        },
        //
        addTeamToList:function(){
            var self = this;
            //目录树存在点击后teamId不正常赋值的情况，原因是点击区域的问题后续调整一下触发区域
            if(self.curteamId == null){
                Tips.warn(_("未选择团队"));
                return
            }
            var flag = false;
            for(var i = 0;i<self.data.length;i++){
                if(self.data[i].dataid == self.curteamId){
                    flag = true;
                }
            }
            if(!flag){
                self.data.push({"dataid":self.curteamId,"role":self.roleVal,"isNew":true,"isDelete":false,"name":self.curteamName,"path":self.curteamPath});
            }
            self.switchBtn(1);
            if(self.getChangeFlag()){
                $('#teamofusers-ok').removeClass("disabled").addClass("abled");
            }else{
                $('#teamofusers-ok').removeClass("abled").addClass("disabled");
            }
            self._renderList();
        },
        //删除权限
        deleteRole:function(){
            var self = this;
            for(var i = 0;i<self.deleteList.length;i++){
                TeamModel.membership_kickoff(function(ret) {
                    if (ret.code == 200) {
                        Tips.show(ret.message);
                    } else {
                        Tips.warn(ret.message);
                    }
                }, self.deleteList[i], [self.uid]);
            }
        },
        //为批量授权准备数据
        prepareData:function(){
            var self = this;
            var authVals = $('.ld-combox .curtext');
            for(var i = 0;i<self.data.length;i++){
                self.data[i].role = $(authVals[i]).attr('act');
            }
        },
        //获取列表数据是否改动过
        getChangeFlag:function(index,isChanged){
            var self = this;
            if(index){self.data[index].isChanged = isChanged;}
            for(var i = 0;i<self.data.length;i++){
                if(self.data[i].isChanged || self.data[i].isNew){
                    return true;
                }
            }
            return false;
        },
        //批量添加角色
        setRoles:function(){
            var self = this;
            if(!self.getChangeFlag()){return;}
            for(var i = 0;i<self.data.length;i++){
                if(self.data[i].isNew){
                    TeamModel.membership_batch_creat(function(ret){
                        if(ret.code == 200){
                            Tips.show(ret.message);
                        } else {
                            Tips.warn(ret.message);
                        }
                    },self.data[i].dataid,"{'uid':"+self.uid+",'role':'"+self.data[i].role+"'}");
                }else if(!self.data[i].isDelete){
                    TeamModel.set_role(function(ret) {
                        if(ret.code == 200){
                            Tips.show(_('添加成功'));
                        } else {
                            Tips.warn(ret.message);
                        }
                    }, self.data[i].dataid, self.uid, self.data[i].role);
                }
            }
        },
        //渲染列表
        _renderList:function(){
            var self = this;
            //if(!self._firstLoad){return;}
            new TeamList(".team-list-c", self.uid, self.data, function(e, dataid, uids) {
                $('body').data('action','所属团队列表').data('category','subtract').data('content','成员');
                new ConfirmDialog({content: _("真的要从团队中删除当前用户吗？")}, function() {
                    //只要点击了删除按钮就启用保存按钮，没有撤销按钮，只能点击取消按钮
                    $('#teamofusers-ok').removeClass("disabled").addClass("abled");
                    $(e.currentTarget).parent().parent().remove();
                    //添加到删除数组中
                    self.deleteList.push(dataid);
                    for(var i = 0;i<self.data.length;i++){
                        if(self.data[i].dataid == dataid){
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
                self.data[index].role = role;
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
                    return false ;
                }
                return true;
            });
        }

    });

    return TeamOfUsersDialog;
})
