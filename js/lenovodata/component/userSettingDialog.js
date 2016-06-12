;define('component/userSettingDialog', function(require, exports, module){
	var $ = require('jquery'),
		UserModel = require('model/UserManager'),
		Util = require('util'),
		Tips = require('component/tips'),
		Dialog = require('component/dialog');
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');
    
    if(/^mobile:\d{11}$/.test(LenovoData.user.user_info.user_slug)){
		var userSettingTemplate = '<div class="{{role}}"><div><span class="col-title">' + _("登录邮箱") + '</span><span>{{email}}</span></div> <div><span class="col-title">' + _("手机号") 
		                        + '</span><span>{{mobile}}</span><span><input type="text" id="mobile" value="{{mobile}}" style="display:none;"/></span></div><div><span class="col-title">' + _("用户名") 
		                        + '</span><span>{{username}}<a class="icon i-edit" sid="username"></a></span><span><input type="text" id="username" value="{{username}}" style="display:none;" maxlength="50"/></span></div><div class="disabled-{{password_changeable}}"><span class="col-title">' + _("旧密码") 
		                        + '</span><span><input type="password" id="old-pwd" value="" maxlength="32"/></div></span><div class="disabled-{{password_changeable}}"><span class="col-title">' + _("新密码") 
		                        + '</span><span><input type="password" id="new-pwd" value="" maxlength="32" onpaste="return false"/></span></div><div class="disabled-{{password_changeable}}"><span class="col-title">' + _("重新输入密码") + '</span><span><input type="password" id="new-pwd2" value="" maxlength="32" onpaste="return false"/></span></div>'
		                        +'<div class="forbidden-{{password_changeable}}"><span>'+_("禁止修改密码，请联系管理员")+'</span></div>'
		                        +'</div>';
	}else{
		var userSettingTemplate = '<div class="{{role}}"><div><span class="col-title">' + _("登录名") + '</span><span>{{userSlug}}</span></div><div><span class="col-title">' + _("邮箱") + '</span><span>{{email}}<a class="icon i-edit" sid="email"></a></span><span><input type="text" id="email" value="{{email}}" style="display:none;" maxlength="50" /></span></div> <div><span class="col-title">' + _("手机号")
		                        + '</span><span>{{mobile}}<a class="icon i-edit" sid="mobile"></a></span><span><input type="text" id="mobile" value="{{mobile}}" style="display:none;"/></span></div><div><span class="col-title">' + _("姓名") 
		                        + '</span><span>{{username}}<a class="icon i-edit" sid="username"></a></span><span><input type="text" id="username" value="{{username}}" style="display:none;" maxlength="50"/></span></div><div class="disabled-{{password_changeable}}"><span class="col-title">' + _("旧密码") 
		                        + '</span><span><input type="password" id="old-pwd" value="" maxlength="32"/></div></span><div class="disabled-{{password_changeable}}"><span class="col-title">' + _("新密码") 
		                        + '</span><span><input type="password" id="new-pwd" value="" maxlength="32" onpaste="return false"/></span></div><div class="disabled-{{password_changeable}}"><span class="col-title">' + _("重新输入密码") 
		                        + '</span><span><input type="password" id="new-pwd2" value="" maxlength="32" onpaste="return false"/></span></div>'
		                        + '<div class="forbidden-{{password_changeable}}"><span>'+_("禁止修改密码，请联系管理员")+'</span></div>'
		                        +'</div>';
	}
    function UserSettingDialog(data, ok_callback) {
        var self = this;
        this.data= data;
        this.ok_callback = ok_callback;
        self._init();
    }

	$.extend(UserSettingDialog.prototype, {
        _render: function(dialog, dialog_cb) {
            var self = this;
            var output = Mustache.render(userSettingTemplate, self.data);

            var html=[];
            html.push('<div class="user-setting-dialog">' + output + '</div>');
            html.push('<div class="dialog-button-area">');
            if(!self.data.from_domain_account){
                html.push('<a id="user-setting-ok" class="dialog-button ok">' + _('确定') +'</a>');
            }
            html.push(' <a id="user-setting-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');
            dialog.append(html.join(" "));
            if(self.data.from_domain_account){
                dialog.find(".i-edit").hide();
            }

            if(!self.data.password_changeable||self.data.from_domain_account){
            	dialog.find("input[type='password']").attr("disabled","disabled");
            }
            $("#user-setting-ok").click(function() {
                var userInfo = {};
                var email = $.trim($("#email").val());
                var mobile = $.trim($("#mobile").val());
                var user_name = $.trim($("#username").val());
                var old_pwd = $.trim($("#old-pwd").val());
                var new_pwd = $.trim($("#new-pwd").val());
                var new_pwd2 = $.trim($("#new-pwd2").val());
                
                if(self.data.mobile!=''){
	                if(mobile =='')
	                {
	                	Tips.warn(_("手机号不能为空"));
	                	return;
	                }
	                if (mobile && !Util.validMobile(mobile)) {
	                    Tips.warn(_("手机号格式不正确"));
	                    return;
	                }
                }else{
                   if (mobile && !Util.validMobile(mobile)) {
                        Tips.warn(_("手机号格式不正确"));
                        return;
                    } 
                }
                if(!Util.validInput($("#username"),_('用户名不能包括特殊字符'))){
                    return;
                }
                if (!user_name) {
                    Tips.warn(_("姓名不能为空"));
                    return;
                }else if(Util.getBytes(user_name)>50){
                	Tips.warn(_("姓名长度限制在50个字符以内"));
                	return;
                }
                
                
                if(email ==''){
                	Tips.warn(_("邮箱不能为空"));
                	return;
                }
                if (email && !Util.validEmail(email) && !Util.validMobile(email)) {
                    Tips.warn(_("邮箱格式不正确"));
                    return;
                }
                
                //if(!/^mobile:\d{11}/.test(LenovoData.user.user_info.user_slug)&&$('#mobile').css('display')!="none")
                userInfo.email = email;
                userInfo.mobile = mobile;
                userInfo.user_name = user_name;
                if (old_pwd || new_pwd || new_pwd2) {
	                if (old_pwd == "") {
	                    Tips.warn(_("请输入旧密码"));
	                    return;
	                }
	                
	                if (new_pwd == "") {
	                    Tips.warn(_("新密码不能为空"));
	                    return;
	                }
	                
	                if(old_pwd == new_pwd){
	                	Tips.warn(_("与原密码一致，请重试"));
	                	return;
	                }
	                
	                if(new_pwd2 == ""){
	                	Tips.warn(_("请重新输入密码"));
	                	return;
	                }
	                if (new_pwd != new_pwd2) {
	                    Tips.warn(_("两次输入密码不一致，请重新输入！"));
	                    return;
	                }
	
	                if (new_pwd.length>32 || new_pwd.length<6) {
	                    Tips.warn(_("密码长度6-32个字符之间"));
	                    return;
	                }
                }
                userInfo.old_password = old_pwd;
                userInfo.password = new_pwd;
                
                $('body').data('category','useredit').data('action','修改设置').data('content','用户');
                UserModel.info_set(function(ret) {
                    if (ret.code == 200) {
                        if (userInfo.password) {
                            UserModel.password_set(function(ret1) {
                                if (ret1.code == 200) {
                                    self.dialog.close();
                                } else {
                                    Tips.warn(ret1.message);
                                }
                            }, undefined, userInfo.password, userInfo.old_password); 
                         } else {
                            self.dialog.close();
                         }
                        UserModel.changeSessionInfo(function(result){
                        	$('.user-name').html(result.data.user_name);
                        },ret.data.user_name);
                    } else {
                        Tips.warn(ret.message);
                    }
                }, userInfo);
            });

            $("#user-setting-cancel").click(function() {
                self.dialog.close();
            });

            $(".user-setting-dialog").find(".i-edit").click(function(e) { 
                var id = "#" + $(e.currentTarget).attr("sid");
                $(e.currentTarget).parent().hide();
                $(id).show();
            })

            dialog_cb();
        },

        _init: function() {
            var self = this;
            self.dialog = new Dialog(_("用户设置"), {mask: true}, function(dialog, dialog_cb){
                UserModel.info_get(function(ret) {
                    if (ret.code == 200) {
                        self.data = {};
                        self.data.userSlug = ret.data.user_slug;
                        self.data.email = ret.data.email;
                        self.data.mobile = ret.data.mobile;
                        self.data.username = ret.data.user_name;
                        self.data.from_domain_account = ret.data.from_domain_account;
                        self.data.password_changeable = Util.isAdmin()?true:ret.data.password_changeable;
                        self.data.role = window.LenovoData.user.user_role;
                        self._render(dialog, dialog_cb);
                    }
                });
            });
        }
    });



    return UserSettingDialog;
});
