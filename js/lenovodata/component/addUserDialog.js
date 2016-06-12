;define('component/addUserDialog', function(require, exports){
	var $ = require('jquery'),
		Validator = require('component/validator'),
		Dialog = require('component/dialog'),
        Tips = require('component/tips'),
        Util = require('util'),
        //ManageAuthDialog = require('component/manageAuthDialog');
		AddUser2TeamGuidDialog = require('component/addUser2TeamGuidDialog'),
        UserModel = require('model/UserManager'),
		TeamModel = require('model/TeamManager');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    /*
     *    @param fileAttr: 文件属性
     */
    function AddUserDialog(context, teamId, callback, opt) {
        this.context = context;
        this.teamId = teamId;
        this._callback = callback;
        this.opt = opt || {};
    	this._init();
    }

    $.extend(AddUserDialog.prototype, {
    	_init: function() {
            var self = this;

            var create_template = '<div id="addUserDialog" class="form"><p><span class="label">' + _("登录名") + '</span><input id="userSlug" type="text" maxlength="50"/> *</p><p><span class="label">' + _("邮箱") + '</span><input id="email" type="text" maxlength="50"/> *</p><p><span class="label">' + _("手机号码") + '</span><input id="phone" type="text"/></p><p><span class="label">' + _("姓名") + '</span><input id="name" maxlength="50" type="text"/> *</p><p><span class="label">' + _("数据中心") + '</span><select id="user_region"></select> *</p><p><span class="label">' + _("个人空间") + '</span><input id="quota" type="text"/>&nbsp;<select class="quotaSelect"><option value="M">MB</option><option value="G">GB</option></select>&nbsp;&nbsp;<span style="color:#888" class="tip">'+_("不能超过企业总空间大小")+'('+Util.formatBytes(window.LenovoData.user.account_info.space.limit)+')'+'</span></p><p><span class="label">' + _("密码") + '</span><input id="password" type="password" maxlength="32" onpaste="return false"/></p><p><span class="label">' + _("重复密码") + '</span><input id="password2" type="password" maxlength="32" onpaste="return false"/></p><p><input type="checkbox" id="mailActive"/><label for="mailActive">' + _("使用激活方式，通过电子邮件发送激活链接，由用户自行设置密码") + '</label></p><p><input type="checkbox" id="changePassword"/><label for="changePassword">' + _("禁止账号修改密码") + '</label></p></div><div class="dialog-button-area"><button id="create" class="dialog-button ok">' + _("创建") + '</button><button id="cancel" class="dialog-button cancel">' + _("取消") + '</button></div>';
            var success_template = '<div id="addUserDialog"><p class="sucess-top">' + _("用户“{{name}}”创建成功") + '</p><hr><p class="sucess-bottom">' + _("你可以进入用户配置向导将用户添加到团队中，并为用户添加文件夹访问权限。<br><br>如果您不需要进行上述操作，请点击“关闭”关闭向导。") + '</p></div><div class="dialog-button-area"><a id="navigate" class="dialog-button">' + _("进入向导") + '</a><a id="close-dialog" class="dialog-button">' + _("关闭") + '</a></div>';
            var dialog = new Dialog(_('创建用户'), self.opt, function(parent, callback){
            	parent.append(create_template);

                var quota = window.LenovoData.user.account_info.default_user_quota;
                
                $('#quota').focus(function(){
                	if($('#quota').val()==0){
                		$('#quota').val('');
                	}
                });
                $('#quota').blur(function(){
                	if($('#quota').val()==''){
                		$('#quota').val('0');
                	}
                });

                $('#quota').val(quota?quota/1024/1024:0);

                var name = $('#name'),
                    email = $('#email'),
                    userSlug = $('#userSlug'),
                    quota = $('#quota'),
                    phone = $('#phone'),
                    password = $('#password'),
                    password2 = $('#password2');
                	
                $('#mailActive').on('click', function(e){
                    if(this.checked){
                        $('#changePassword').get(0).checked = false;
                        password.attr('disabled', true);
                        password2.attr('disabled', true);
                        password.addClass('disabledInput');
                        password2.addClass('disabledInput');
                    }else{
                        password.removeAttr('disabled');
                        password2.removeAttr('disabled');
                        password.removeClass('disabledInput');
                        password2.removeClass('disabledInput');
                    }
                });

                $('#changePassword').on('click', function(e){
                    if(this.checked){
                        $('#mailActive').get(0).checked = false;
                        password.removeAttr('disabled');
                        password2.removeAttr('disabled');
                        password.removeClass('disabledInput');
                        password2.removeClass('disabledInput');
                    }
                });
				var quotaUsed=1024*1024;
                $('.quotaSelect').change(function(){
                	var n=$('.quotaSelect').val();
                	if(n=='G'){
                		quotaUsed=1024*1024*1024;
                	}else{
                		quotaUsed=1024*1024;
                	}
                });

                //动态加载数据中心
                var option = "";
                Region.list(function(ret){
                    if(ret.code==200){
                        for(var i=0;i<ret.data.length;i++){
                            option="<option value="+ret.data[i].id+">"+_(ret.data[i].description)+"</option>";
                            $("#user_region").append(option);
                        }
                    }
                });
            	parent.find('#create').on('click', function(e){
            		var flag = true;

                    if($.trim(userSlug.val()) == ''){
                        dialog.showMessage(_('登录名不能为空'));
                        return;
                    }
                    if($.trim(email.val()) == ''){
                        dialog.showMessage(_('邮箱不能为空'));
                        return;
                    }
                    if(!Util.validEmail(email.val())){
                        dialog.showMessage(_('邮箱地址不符合要求'));
                        return;
                    }
                    if(email.val().length<6 || email.val().length>50){
                        dialog.showMessage(_('邮箱长度限制在6~50个字符'));
                        return;
                    }
                    if($.trim(phone.val()) != '' && !Util.validMobile(phone.val())){
                        dialog.showMessage(_('请输入11位手机号码，如139-XXXX-XXXX'));
                        return;
                    }

                    if($.trim(name.val()) == ''){
                        dialog.showMessage(_('姓名不能为空'));
                        return;
                    }
                    if(Util.getBytes($.trim(name.val()))>50){
                    	dialog.showMessage(_('姓名长度限制在50个字符以内'));
                    	return;
                    }
                    

                    if(!Util.validInput(name,_('姓名不能包括特殊字符'))){
                        return;
                    }

                    if($.trim(quota.val()) == ''){
                        dialog.showMessage(_('空间大小不能为空'));
                        return;
                    }
                    
                    if(/\./g.test(quota.val())||!Util.validNumber(quota.val())){
                    	dialog.showMessage(_('空间大小请输入正确的数字'));
                    	return;
                    }

                    if(password.attr('disabled') == undefined){
                        if($.trim(password.val()).length<6 || $.trim(password.val()).length>32){
                            dialog.showMessage(_('密码长度为6-32个字符'));
                            return;
                        }
                        if(!password2.val()||password2.val().length==0){
                        	dialog.showMessage(_("请输入确认密码"));
                        	return;
                        }
                        if(password.val() != password2.val()){
                            dialog.showMessage(_('两次输入密码不一致，请重新输入！'));
                            return;
                        }
                       
                    }
                    
                    $(e.target).attr('disabled', true).text(_('创建中...'));
                    


            		UserModel.create(function(result){
            			if(result.code == 200){
                            self.uid = result.data.uid;
                            if(self.teamId){
                                TeamModel.membership_create(function(result){
                                    if(result.code == 200){
                                        dialog.close();
                                        self.context && (self.context.reload());
                                        Tips.show(_('用户创建成功'));
                                    }else{
                                    	if(result.message.substr(0,11)=='Error #1001')
                                    	{dialog.showMessage(_(result.message.substr(13)));}
                                        else {dialog.showMessage(_(result.message));}
                                         $(e.target).attr('disabled', true).text(_('创建'));
                                    }
                                }, self.teamId, [self.uid]);
                            }else{
                            	dialog.close();
                                self.context && (self.context.reload());
                                Tips.show(_('用户创建成功'));
                            }
                            
                            /*else{
                                dialog.clearMessage();
                                parent.empty().html(Mustache.render(success_template, {name: name.val()}));
                                callback();
                                
                                $('#navigate').click(function(){
                                    dialog.close();
                                    self._callback && self._callback([self.uid]);
                                    //new ManageAuthDialog([self.uid]);
                                    //new AddUser2TeamGuidDialog(self.uid);
                                });
                                self.context && (self.context.reload());
                            }

                            $("#close-dialog").click(function() {
                                dialog.close();
                            });*/
            			} else {
//                          dialog.showMessage(result.message);
                            if(result.message.substr(0,11)=='Error #1001')
                        	{dialog.showMessage(_(result.message.substr(13)));}
                            else {dialog.showMessage(_(result.message));}
                            $(e.target).removeAttr('disabled').text(_('创建'));
                            return;
                        }
            		},  $.trim(userSlug.val()).toLowerCase(),
            			name.val(),
            			$.trim(email.val()).toLowerCase(),
            			quota.val()*quotaUsed,
                        $.trim(password.val()),
            			phone.val(),
            			$('#changePassword').get(0).checked? false:true,
            			$('#mailActive').get(0).checked ? false:true,
                        $("#user_region").val()
            		);
            	});

                parent.find('#cancel').on('click', function(){
                    dialog.close();
                });

                $('#mailActive').trigger('click');
            });

        }
    });

	return AddUserDialog;
});



