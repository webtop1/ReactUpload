;define('lenovodata/mobile_verification',function(require,exports,module){
	var $ = require('jquery');
	var Util = require('lenovodata/util');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    require('js/gallery/jquery/placeholder/2.0.7/jquery.placeholder.js');
    var UserManager = require('lenovodata/model/UserManager');
    var Tips = require('lenovodata/component/tips');
    
    $(document).ready(function(){
    	
    	Util.focusAndBlurChTtColor('#formMobileCer', '#545454', '#bebec0');
    	$('#verifi-code').focus(function(){$(this).attr('value','')});
    	
    	$('#mobile').text(info.mobile);
    	sendSuccess(info.rest_time);
    	function sendSuccess(restTime){
	            var i = 60-restTime;
	            var oldValue =  _('重新发送');
	            $("#get_verifycode_button").attr("disabled","disabled").addClass('disabled');
	            var intervalId = window.setInterval(function(){
	                if (i>0) {
	                    $("#get_verifycode_button").val(_("重新发送") + "(" + i + "s)");
	                    i--;
	                } else {
	                    $("#get_verifycode_button").val(oldValue);
	                    $("#get_verifycode_button").attr("disabled",false).removeClass('disabled');
	                    window.clearInterval(intervalId);
	                }
	            }, 1000);
            }
    	
    	function errMsg(msg){
        	$('#error').html(msg).show();
    	}
    	function clearMsg(){
        	$('#error').hide();
    	}
    	
    	var oInput = $('#verifi-code');
    	var getCodeBtn = $('#get_verifycode_button');
    	var signinBtn = $('#signin_btn');
    	oInput.focus(function(){
    		$(this).removeClass('err').val('');
    	});
    	//获取验证码
    	getCodeBtn.click(function(){
    		$.ajax( {
                type: 'POST',
                url: '/captcha/loginsms?' + Math.random(),
                async: false,
                dataType: 'json',
                data: {},
                success: function(data) {
                    if (data.status == true) { //成功
                    	clearMsg();
                    	sendSuccess(data.rest_time);
                        Tips.warn('<span>'+ _("验证码已发！")+'</span><p>'+ _("近期手机网络不稳定，<br/>如果没有接收到短信验证码，请重试！")+'</p>');
                    }else if(data.code==4001){ //次数过多
                    	clearMsg();
                    	errMsg(data.msg);
                    } else { 
                    	oInput.addClass('err').css('color','#f85a2a').val(data.msg);
                    }
                }
            });
    	});
      	//确定->登录
    	signinBtn.click(function(){
    		if(!oInput.val()) {
    			oInput.addClass('err').css('color','#f85a2a').val(_('验证码不能为空'));
    			return;
    		}
    		
    		UserManager.signin(_callback,'','','','',oInput.val());
    		function _callback(ret){
    			if (ret.code == 200) {
    				location.href = "/";
    			}else{
    				getCodeBtn.val(_('重新获取')).removeAttr('disabled').removeClass('disabled');
    				oInput.addClass('err').css('color','#f85a2a').val(ret.message);
    			}
    		}
	    		
    	});
    	
    });
    
});
