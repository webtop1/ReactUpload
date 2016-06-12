define('lenovodata/signin', function(require, exports, module) {
    var $ = require('jquery');
//  var Dialog = require('component/dialog');
    var Util = require('lenovodata/util');
    var i18n = require('i18n');
//	var Tips = require('component/tips');
    var _ = $.i18n.prop;
    require('cookie');
    require('js/gallery/jquery/placeholder/2.0.7/jquery.placeholder.js');

    var UserManager = require('lenovodata/model/UserManager');

    $(document).ready(function() {
        //清除本地存储
    	localStorage.clear();
        var lbn = $.cookie('LB_N');
        if(lbn){
            $('#user_slug').val(lbn)
            $('#pwd').focus();
        } else {
            $('#user_slug').focus()
        }

        $('input, textarea').placeholder();

        $('#change_verify_code').click(function(){
            $('#verify_code').attr('src', "/captcha/create/login?_=" + +new Date());
        });

          Util.focusAndBlurChTtColor('#form_login', '#545454', '#bebec0');
      		//IE下初始化颜色异常
			if(/msie/.test(window.navigator.userAgent.toLocaleLowerCase())){
				$('#form_login input:text').css('color','#bebec0');
				$('#form_login input:password').css('color','#bebec0');
			}

        /*
        $('#form_login').find('#pwd').keydown(function(event) {
            //$("#password_error").val('');
            $("#password_error").hide('slow');
        });
        */

        //记录登录错误数, 错误超过3次，弹出验证码div
        var errCount = 0;

//      $('#oldVersion').on('click', function(e){
//          var dia = new Dialog(_('温馨提示'), {mask: true, control: false}, function(content){
//              var template = '<div class="dialog-oldversion">' + _("尊敬的用户：<br>如果您使用或试用联想企业网盘2.0版本的产品(www.vips100.com)，请进入老版本系统进行登录，对您带来的不便敬请谅解。") + '<br><a class="link-button" target="_blank" href="https://www.vips100.com/themes/v1/login.html">'+_('点击进入老版本系统登录页面')+'</a></div><div class="dialog-button-area"><a id="cancel" class="dialog-button ok">' + _("关闭") + '</a></div>';
//              content.append(template);
//
//              content.find('.dialog-button').on('click', function(){
//                  dia.close();
//              });
//          });
//      });

        $('#submit_button').click(function(e){
            var user_slug = $.trim($('#user_slug').val()).toLowerCase();
            var pwd = $.trim( $('#pwd').val());
            var verify = $.trim( $('#verify').val());
            //var autologin = $("#auto_login:checked").attr("checked") == "checked";
            var autologin = $("#auto_login").get(0).checked;
            

            function errMsg(msg){
                var msgArea = $('#msgArea');
                msgArea.html(msg).show('slow');
            }

            if (!user_slug ) {
                errMsg(_('登录名不能为空'));
                $('#user_slug').focus();
                return false;
            }

            if (!pwd ) {
                errMsg(_('密码不能为空'));
                $('#pwd').focus();
                return false;
            }

//          if (!Util.validEmail(user_slug) && !Util.validMobile(user_slug)) {
//              errMsg(_('邮箱格式不正确'));
//              $('#user_slug').focus();
//              return false;
//          }
//
//          if (user_slug.indexOf('@') == -1) {
//             user_slug = "mobile:" + user_slug;
//          } else {
//             user_slug = "email:" + user_slug;
//          }

            $(e.currentTarget).val(_("登录中..."));
            $(e.currentTarget).attr("disabled", "disabled");
            Util.sendDirectlyRequest("登录/注销","登录","-");
            UserManager.signin(_callback, user_slug, pwd, verify, autologin);

            function _callback(ret){
                if(ret.code==402){
                    errMsg(_('请先导入license'));
                    return false;
                }
                if (ret.code == 403) {
                    if(ret.data.code == "bad captcha"){
                        errMsg(_('验证码错误'));
                        $('#verify').focus();
                        $(e.currentTarget).val(_("登录"));
                        $(e.currentTarget).removeAttr("disabled");
                        return false;
                    }else if(ret.data.code == 'device is forbidden'||ret.data.code=='login:system admin cannot login.'|| ret.data.code == 'ip is forbidden' || ret.data.code == 'web is forbidden') {
                    	errMsg(ret.message);
                    	$(e.currentTarget).val(_("登录"));
                        $(e.currentTarget).removeAttr("disabled");
                    }else {
                    	user_slug = ret.data.slug ? ret.data.slug : user_slug;
                    	location.href = "/user/exception/" + user_slug;
                    }
                } else if (ret.code != 200) {
                    if (++errCount >= 3) {
                        //$("#password_error").show('slow');
                        errMsg(_('您输入的密码不正确'));
                        $('#pwd').focus();
                        $("#verify_cody_container").show();
                        $('#verify_code').attr('src', "/captcha/create/login?_=" + +new Date());
                    }
                    $(e.currentTarget).val(_("登录"));
                    $(e.currentTarget).removeAttr("disabled");
                    errMsg(ret.message);
                    $('#pwd').focus();
                    return false;
                } else {
                    //window.location = ret.data.location;
                    $.cookie('LB_N', $('#user_slug').val(),  {expires: 365});
                    
                    //手机认证用户
                    if(ret.data.sms_auth){
                    	location.href ='/user/mobile';
                    	return;
                    }
                   location.href = '/user/login';
                }
            }

            return false;
        });

    });

});
