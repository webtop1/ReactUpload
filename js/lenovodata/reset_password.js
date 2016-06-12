define("lenovodata/reset_password", function(require, exports, module) {
        var $ = require('jquery');
        var Util = require('lenovodata/util');
        var i18n = require('i18n');
	    var Tips = require('component/tips');
        var _ = $.i18n.prop;
        var accountManager =  require('lenovodata/model/AccountManager.js');
        require('js/gallery/jquery/placeholder/2.0.7/jquery.placeholder.js');
        $(document).ready(function() {
        	
        	if($("#head").outerHeight() + $("#container").outerHeight() + $("#foot").outerHeight() < $(window).height()){
        		$("#container").height($(window).height() - $("#head").outerHeight() - $("#foot").outerHeight()-100);
        	}
        	
            Util.focusAndBlurChTtColor('#form_reset', '#545454', '#bebec0');
            $('#form_reset').find('input:text,input:password').css('color','#bebec0');
            
	            $('#submit_button').click(function(){
	            	var token = $('#token').val();
	                var password1 = $('#password').val();
	                var password2 = $('#password2').val();
	                if($.trim(token) == ''){
	                	Tips.warn(_('验证码不能为空'));
	                	return;
	                }
	                if (validPassword(password1, password2))
	                {
	                	var password=password1;
	                }
	                
	                var url = Util.getApiVersion()+"/user/password/reset";
	                var postData = {};
	                postData.token = $('#token').val();
	                postData.password = password;
	                Util.ajax_json_post(url, postData, callback);
	           });
	            function callback(xhr, textStatus){
	                
	                if(xhr.status!=200){
	                    data = xhr.responseJSON;
	                    Tips.warn(data.message);
	                }else{
	                    Tips.show(_('操作成功'));
	                    setTimeout(function(){
	                    	location.href='/';
	                    },2000)
	                    
	                }
	            }
                
            //密码的校验
                function validPassword(pwd, pwd2) {
                    if( pwd == '') {
                    	Tips.warn(_('密码不能为空'));
                        return false;
                    }
                    
                    var MIN_PWD = 6;
                    var MAX_PWD = 32;

                    if ((pwd.length < MIN_PWD || pwd.length > MAX_PWD)) {
                    	Tips.warn(_('密码长度必须大于等于6，小于等于32'));
                        return false;
                    }
                    
                    if( pwd2 == '') {
                    	Tips.warn(_('请输入确认密码'));
                        return false;
                    }
                    
                    if ((pwd2.length < MIN_PWD || pwd2.length > MAX_PWD)) {
                    	Tips.warn(_('密码长度必须大于等于6，小于等于32'));
                        return false;
                    }

                    if( pwd != pwd2 ) {
                    	Tips.warn(_('两次输入密码不一致，请重新输入！'));
                        return false;
                    }
                    return true;
                }
        });
});
