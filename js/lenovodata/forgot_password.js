define("lenovodata/forgot_password", function(require, exports, module) {
    var $ = require('jquery');
    var Util = require('lenovodata/util');
    var i18n = require('i18n');
	var Tips = require('component/tips');
    var _ = $.i18n.prop;

    $(document).ready(function() {

        var maxh = Math.max($(window).height(), $(document.body).height());
        var h = maxh-$('#head').outerHeight()-$('#foot').outerHeight();
        $('#container').height(h-100);
        $('#box').css('margin-top', (h-100-$('#box').height())/2);

        $("#change_captcha").bind('click',function(){
            $("#captcha_image").attr("src", "/captcha/create?" + Util.random());
        });

        Util.focusAndBlurChTtColor('#form_forgot', '#545454', '#bebec0');

        $('#submit_button').click(function(e){
            var user_slug = $.trim($('#user_slug').val());
            var user_slug_def = $.trim($('#user_slug').attr('def'));
            var type;
            var captcha = ($('#captcha').val() == $('#captcha').attr('def'))?'':$.trim( $('#captcha').val() );

            if ( user_slug == user_slug_def  ||  user_slug=='') {
                Tips.warn(_('登录名不能为空'));
                $("#change_captcha").trigger("click");
                return;
            }

            if(captcha==''){ 
            	Tips.warn(_('验证码不能为空'));
            	return;
            }
            $(e.target).attr('disabled', true).val(_("正在找回密码..."));
            
            type = "email";
            
            var url = "/mail/reset_password";
            var postData = {};
            postData.user_slug = user_slug;
            postData.captcha = captcha;

            Util.ajax_json_post(url, postData, 
                function(xhr, textStatus){
                    data = xhr.responseJSON;
                    $(e.target).val(_("确定")).removeAttr('disabled');
                    if(data.code ==200){
                    	if(type=="email"){
                        	location.href = data.data.location;
                        	return;
                        }else if(type=="mobile"){
                        	location.href = "/user/reset_password";
                        	return;
                        }
                    }else if(data.code==405){
                    	$('#container').hide();
                    	$('#notallowed-update').height($("#container").height()).show();
                    	return;
                    }else if (data.code == 402) {
                    	location.href ="/user/exception/" + postData.user_slug;
                    	return;
                    } else {
                    	Tips.warn(data.msg);
                    	$("#change_captcha").trigger("click");
                    	return;
                    }
            });
        });
    });
    
});
