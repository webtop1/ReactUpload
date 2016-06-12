;define('component/addTeamDialog', function(require, exports){
	var $ = require('jquery'),
		Validator = require('component/validator'),
		Dialog = require('component/dialog'),
        TeamModel = require('model/TeamManager'),
        TeamMenu = require('component/teamMenu'),
        AccountModel = require('model/AccountManager'),        
        Tips = require('component/tips'),
		Util = require('util'),
        Mask = require('component/mask'),
        EventTarget = require('eventTarget');


        
	require('i18n');
	var	_ = $.i18n.prop;
    var self;
    require('mustache');

    function AddTeamDialog(options) {
    	this.path = options.teamPath;//团队目录树路径
    	this.callback = options.callback;
    	this.TeamContext = options.TeamContext;
        this.context = options.context;
        //设置是否需要新建对话框
        this.isDialog = $.type(options.isDialog)=="string"?$(options.isDialog):options.isDialog;
        self = this;
    	this._init();
    }

    $.extend(AddTeamDialog.prototype, EventTarget, {
    	_init: function() {
            self.step1_template = '<div id="addTeamDialog" class="form"><p><span class="label">' + _("团队名称") + '</span><input id="name" type="text" maxlength="25"/></p><p><span class="label">' + _("团队空间") + '</span><input id="quota" type="text"/>&nbsp;MB&nbsp;<span class="spaceQuota">' + _("(上限为{{quota}}MB)") + '</span></p><p><span class="label">' + _("团队人数上限") + '</span><input id="userlimit" type="text"/>&nbsp;&nbsp;<span class="userQuota">' + _("(团队成员最大上限为{{user_limit}})") + '</span></p><p><span class="label txarealabl">' + _("备注") + '</span><textarea id="remark" maxlength="250"></textarea></p></div><div class="dialog-button-area" style="display: {{isDialog}}"><a id="create" class="dialog-button ok">' + _("创建") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") + '</a></div>';
            self.step2_template = '<div id="addTeamDialog" class="form"><p><span class="label">' + _("团队名称") + '</span><input id="name" type="text" maxlength="25"/></p><p><span class="label">' + _("团队空间") + '</span><input id="quota" type="text"/>&nbsp;MB&nbsp;<span class="spaceQuota">' + _("(上限为{{quota}}MB)") + '</span></p><p><span class="label">' + _("团队人数上限") + '</span><input id="userlimit" type="text"/>&nbsp;&nbsp;<span class="userQuota">' + _("(团队成员最大上限为{{user_limit}})") + '</span></p><p><span class="label txarealabl">' + _("备注") + '</span><textarea id="remark" maxlength="250"></textarea></p></div>';
               //step2_template = '<div id="addTeamDialog"><p class="sucess-top">' + _("团队“{{name}}”创建成功") + '</p><hr><p class="sucess-bottom">' + _("团队包含“成员列表”和“授权列表”两个试图，分别用于管理团队成员和团队成员的批量授权管理。") + '</p></div><div class="dialog-button-area"><a id="cancel-1" class="dialog-button">' + _("关闭") + '</a></div>';

            var path;
            if(!self.isDialog){
                self.dialog = new Dialog(_('创建团队'),self._callBack);
            }else{
                self.dialog = self.context;
                self._callBack(self.isDialog);
            }

//          $('#nolimit').trigger('click');
        },
        _callBack:function(parent){
            var sQuota = $("#addTeamDialog span.spaceQuota"),
                uQuota = $("#addTeamDialog span.userQuota"),
                space={};

            if(!self.isDialog){
                space.isDialog = 'block';
            }else{
                space.isDialog = 'none';
            }
            if(self.TeamContext){
                space.user_limit = self.TeamContext.member_limit;
                space.quota = self.TeamContext.quota/1024/1024;
            }else{
                space.user_limit = Util.getUserAccountNumQuota();
                space.quota = Util.getUserAccountSpaceQuota()/1024/1024;
            }

            parent.append(Mustache.render(self.step1_template, space));
//              $('#nolimit').on('click', function(e){
//                  if(this.checked){
//                      $('#userlimit').attr('disabled', true);
//                  }else{
//                      $('#userlimit').removeAttr('disabled');
//                  }
//              });

            parent.find('#create').on('click', function(){

                var name = $.trim($('#name').val());
                var quota = $.trim($('#quota').val());
                var userlimit = $.trim($('#userlimit').val());
                var remark = $('#remark').val();

                if(name == ""){
                    self.dialog.showMessage('['+_('团队名称')+']' +_('不能为空'));
                    return;
                }

                if (/[\/:*?"<>|\\]|^[.]|[.]$/.test(name)) {
                    Tips.warn(_('名称不能包括下列任何字符') + ' : \\/:*?"<>|' + _(' 或以 . 开头和结尾！') );
                    return false;
                }

                if(quota == ""){
                    self.dialog.showMessage('['+_('团队空间')+']'+_('不能为空'));
                    return;
                }

                if(!/^\d+$/.test(quota)){
                    self.dialog.showMessage(_('请输入正整数')+'['+_('团队空间')+']');
                    return;
                }
//                  if((quota=quota.replace(/^0+/,""))=='')
//                  {
//                  	dialog.showMessage('['+_('团队空间')+']'+_('不能为零'));
//                  	return;
//                  }
                if($("#userlimit").attr("disabled")!="disabled"){
                    if(userlimit == ""){
                        self.dialog.showMessage('['+_('团队人数上限')+']'+_('不能为空'));
                        return;
                    }
                    if(userlimit != "" && !/^\d+$/.test(userlimit)){
                        self.dialog.showMessage(_('请输入正整数')+'['+_('团队人数上限')+']');
                        return;
                    }
                    if((userlimit=userlimit.replace(/^0+/,""))=='')
                    {
                        self.dialog.showMessage('['+_('团队人数上限')+']'+_('不能为零'));
                        return;
                    }
                }

                if(remark.length > 250){
                    self.dialog.showMessage('['+_('备注')+']'+_('超过了250个字符'));
                    return;
                }
                var strName=self.path+"/" + name;
                if(strName.length>255){
                    self.dialog.showMessage(_('团队路径过长'));
                    return;
                }
                var limit = $.trim($('#userlimit').val());
//                  if($('#nolimit').get(0).checked){
//                      limit = -1;
//                  }


                var mask = new Mask(self.dialog.dialog);
                $('body').data('category','add').data('action','功能区内按钮').data('content','团队');

                TeamModel.create(function(result){

                    if(result.code == 200){
                        Tips.show(_('团队创建成功'));
                        //parent.empty().html(Mustache.render(step2_template, {name: name}));
                        if(!self.isDialog){
                            self.dialog.close();
                            mask.close();
                            self.callback(result.data);
                            self.fire('close', true);
                            $('.allUser').removeClass('allCur');
                        }else{
                            mask.close();
                            self.callback(result.data);
                        }
                    } else {
                        Tips.warn(result.message);
                        mask.close();
                    }
                },{
                    name: strName,
                    quota: Util.scientificToString($('#quota').val() * 1024 * 1024),
                    member_limit: limit.toString(),
                    description: remark

                });
            });

            parent.find('#cancel').on('click', function(){
                self.dialog.close();
            });

        }
    });

	return AddTeamDialog;
});
