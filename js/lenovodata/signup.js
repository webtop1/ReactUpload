define('lenovodata/signup', function(require, exports, module) {
    var $ = require('jquery');
    var Util = require('lenovodata/util');
    var i18n = require('i18n');
    require('cookie');
	var Tips = require('component/tips');
    require('js/gallery/jquery/placeholder/2.0.7/jquery.placeholder.js');
    var _ = $.i18n.prop;

    var AccountManager = require('lenovodata/model/AccountManager');

    function errMsg(msg){
        var msgArea = $('#msgArea');
        msgArea.html(msg).show('slow');
    }

    function clearMsg(){
        var msgArea = $('#msgArea');
        msgArea.empty().hide();
    }

    $(document).ready(function() {
    	
    	autoMiddle();
    	
    	$(window).resize(function(){
    		autoMiddle();
    	})
    	//垂直居中
    	function autoMiddle(){
    		var autoH = $(window).height()-$("#head").outerHeight()-$("#foot").outerHeight();
            var minH = parseInt($("#reg_container").css("min-height"));
            autoH = Math.max(autoH,minH);
            $("#reg_container").height(autoH);
    	}
    	
    	
        $('input, textarea').placeholder();

        //获取验证码，存储到img的alt
        /*
        $.ajax( {
            type: 'GET',
            url: '/captcha/create',
            async: false,
            dataType: 'text',
            success: function(data) {
                $('#mail_reg_div').find('img').attr('alt', data);
            }
        });
        */
        
        
        //初始化验证码
        var invitation_code = Util.queryString(location.search)["c"] || $.cookie('promo_code');
        if (!invitation_code) {
        	invitation_code='L4000';
        }

        var maxh = Math.max($(window).height(), $(document.body).height());
        var h = maxh-$('#head').outerHeight()-$('#foot').outerHeight();
        $('#container').height(h-100);
        $('#box').css('margin-top', (h-100-$('#box').height())/2);
        
        $('#verify_code').attr('src', "/captcha/create?" + Math.random());

        //验证码看不清，重新获取
//      $('#change_verify_code').click(function(){
//          $('#verify_code').attr('src', "/captcha/create?" + Math.random());
//      });

        //获取手机验证码
        $('#get_mobile_verifycode').click(function(){
            var mobile = $.trim($("#mail_reg_div").find('#mobile').val());
            var mobile_def = $.trim($("#mail_reg_div").find('#mobile').attr("def"));
            
            var err="";
            if( !mobile || mobile == mobile_def) {
               err=(_('请输入您的手机号'));
            }else if( !Util.validMobile( mobile) ) {
               err=(_('手机号格式不正确'));
            }
            if (err!='') {
            	$("#mobile").parent("li").addClass('error');
            	$("#mobile").prev('.tishi').text(err);
            	return;
            }
            function sendSuccess(){
	            var i = 60;
	            var oldValue =  $("#get_mobile_verifycode").val();
	            $("#get_mobile_verifycode").attr("disabled","disabled").addClass('disabled');
	            var intervalId = window.setInterval(function(){
	                if (i>0) {
	                    $("#get_mobile_verifycode").val(_("重新发送") + "(" + i + "s)");
	                    i--;
	                } else {
	                    $("#get_mobile_verifycode").val(oldValue);
	                    $("#get_mobile_verifycode").attr("disabled",false).removeClass('disabled');
	                    window.clearInterval(intervalId);
	                }
	            }, 1000);
            }
            $.ajax( {
                type: 'POST',
                url: '/captcha/sendSMS?' + Math.random(),
                async: false,
                dataType: 'json',
                data: {mobile: mobile,sms_token:sms_token},
                success: function(data) {
                    if (data.status == true) {
                    	$("#msgArea").css("display","none");
                    	sendSuccess();
                    	$('#mail_reg_div .mobile_msg').remove();
                        Tips.warn('<span>'+ _("验证码已发！")+'</span><p>'+ _("近期手机网络不稳定，<br/>如果没有接收到短信验证码，请重试！")+'</p>');
                    }else if(data.code==4001){
                    	if($('#mail_reg_div .mobile_msg').length==0){
                    		$('#mail_reg_div').append(' <p class="mobile_msg">'+ data.msg+'</p>');
                    	}
                    } else {
                    	$("#mobile").parent("li").addClass('error');
                    	$("#mobile").prev('.tishi').text(data.msg);
                    	$('#mail_reg_div .mobile_msg').remove();
                        //errMsg(data.msg);
                    }
                }
            });
        });


            Util.focusAndBlurChTtColor('#form_register', '#545454', '#bebec0');
      		//IE下初始化颜色异常
				if(/msie/.test(window.navigator.userAgent.toLocaleLowerCase())){
					$('#form_register input:text').css('color','#bebec0');
					$('#form_register input:password').css('color','#bebec0');
				}
      		
      
            $("#form_register .tishi").mousedown(function(){
            	$(this).parent("li").removeClass("error");
            	$(this).next("input").focus();
            	return false;
            	
            });
            $("#form_register input[type!=button]").focus(function(){
            	$(this).parent("li").attr("class","");
            });
            
            /*低版本浏览器,监听tab键*/
//          $("#form_register input").keydown(function(ev){
//          	var event = ev||event;
//          	if(event.keyCode==9){
//          		$(this).parent().next("li").removeClass("error");
//	            	$(this).parent().next("li input").focus();
//          	}
//          });
            
//          $("#mobile_reg").click(tab);
//          $("#mail_reg").click(tab);

            $('#submit_button').click( function(e) {
                    var email = $.trim( $('#mail_reg_div').find('#email').val() ).toLowerCase();
                    var email_def = $.trim( $('#mail_reg_div').find('#email').attr('def') );
                    var username = $.trim( $('#mail_reg_div').find('#username').val() );
                    var username_def = $.trim( $('#mail_reg_div').find('#username').attr('def') );
                    var pwd = $('#mail_reg_div').find('#pwd').val();
                    var pwd_def =  $.trim( $('#mail_reg_div').find('#pwd').attr('def') );
                    var pwd2 = $('#mail_reg_div').find('#pwd2').val();
                    var pwd2_def = $.trim( $('#mail_reg_div').find('#pwd2').attr('def') );
                    var verify = $.trim( $('#mail_reg_div').find('#verify').val() );
                    var verify_def = $.trim( $('#mail_reg_div').find('#verify').attr('def') );
                    var mobile = $.trim( $('#mail_reg_div').find('#mobile').val() );
                    var mobile_def = $.trim( $('#mail_reg_div').find('#mobile').attr('def') );
                    var company = {
                    		value: $.trim( $('#mail_reg_div').find('#company').val() ),
                    		def: $.trim( $('#mail_reg_div').find('#company').attr('def') )
                    }
                    var type="#mail_reg_div";
                    
                    validEmail(email,email_def, type);
                    
                    validPassword1(pwd, pwd_def,type);
                    
                    validPassword2(pwd, pwd2, pwd2_def,type);
                    
                    validCompany(company.value,company.def,type);
                    
                    validUserName(username,username_def,type);
                    
                    validMobile(mobile, mobile_def,type);
                    
                    valid_verify(verify,verify_def,type);
                    
                    var bol=true;
                    $("#mail_reg_div li").each(function(i){
                    	if($("#mail_reg_div li").eq(i).hasClass("error")) {
                    		bol=false;
                    		return;
                    	}
                    })
                    if(bol==false) return;
                    var pd = {
                        user_slug: "email:" + email,
                        user_name: username,
                        password: pwd,
                        invitation_code: invitation_code,
                        captcha: verify,
                        company: company.value, 
                        contact: username, 
                        phone: '', 
                        email: email,
                        website: '',
                        mobile: mobile
                    };
                
                
                if ($("#agree:checked").attr("checked") != "checked") {
                    Tips.warn(_('请阅读并接受《联想企业网盘服务协议》'));
                    return;
                }

                if(pd.user_slug.match("email")){
                	var sel_type="#mail_reg_div";
                }else{
                	var sel_type="#mobile_reg_div";
                }
                
                AccountManager.signup(_callback, pd.user_slug, pd.password, pd.user_name, pd.invitation_code, pd.captcha, pd.company, pd.contact, pd.phone, pd.email, pd.website, pd.mobile);
                
                $(e.currentTarget).attr("disabled", "disabled");
                $(e.currentTarget).val(_("注册中..."));
                
                function _callback(ret){
                    if (ret.code != 200) {
                        $(e.currentTarget).val(_("注册"));
                        $(e.currentTarget).removeAttr("disabled");
                        $('#change_verify_code').trigger("click");
                        if(ret.code=="409")
                        {  if(ret.message.substr(0,11)=='Error #1001')
                        	{$(sel_type).find("#email").parent().addClass("error");
                       	     $(sel_type).find("#email").prev(".tishi").text(ret.message.substr(12));
                        	}
                           if(ret.message.substr(0,11)=='Error #1002')
                            {$(sel_type).find("#mobile").parent().removeClass("yes").addClass("error");
                       	     $(sel_type).find("#mobile").prev(".tishi").text(ret.message.substr(12));
                            }
                        }else {
                        	if((ret.message=="验证码错误") || (ret.message=="incorrect captcha")){
                            	$(sel_type).find("#verify").parent().addClass("error");
                            	$(sel_type).find("#verify").prev(".tishi").text(ret.message);
                            	
                            }else if((ret.message=="邀请码错误") || (ret.message=="invalid invitation code")){
                            	$(sel_type).find("#invitation-code").parent().addClass("error");
                            	$(sel_type).find("#invitation-code").prev(".tishi").text(ret.message);
                            	
                            }else {
                            	Tips.warn(ret.message);
                            }
                        }
                        return;
                    } else {
                        window.location = ret.data.location;
                    }
                }
        });

    });

    function validContact(value,def,type){
    	var err="";
    	if(!value || value == def) {
        	err=(_("联系人不能为空"));
        }
    	if(Util.getBytes(value)>50) {
    		err=(_("长度限制在50个字符以内"));
    	}
    	if(err!='') {
        	$(type).find('#contact').parent("li").addClass('error');
        	$(type).find('#contact').prev('.tishi').text(err);
        }else{
        	$(type).find('#contact').parent("li").removeClass('error').addClass("yes");
        };
    	
    }
    
    function validCompany(value,def,type){
    	var err='';
    	if(!value || value == def) {
        	err=(_("请输入您的企业名称"));
        }
    	if( Util.getBytes(value)>50){
    		err=(_("长度限制在50个字符以内"));
    	}
    	if(err!='') {
        	$(type).find('#company').parent("li").addClass('error');
        	$(type).find('#company').prev('.tishi').text(err);
        }else{
        	$(type).find('#company').parent("li").removeClass('error').addClass("yes");
        };
    }
    
    function validPassword1(pwd, pwd_def,type){
    	var err="";
    	var MIN_PWD = 6;
        var MAX_PWD = 32;
        if( !pwd || pwd == pwd_def) {
            err=(_('请输入您的密码'));
        }else if (/\s/g.test(pwd)){
        	err = (_('密码不允许有空格'))
        }else if((pwd.length < MIN_PWD || pwd.length > MAX_PWD)) {
            err=(_('密码长度为6-32个字符'));
        }
        if (err!='') {
        	$(type).find('#pwd').parent("li").addClass('error');
        	$(type).find('#pwd').parent("li").find('.tishi').text(err);
        }else{
        	$(type).find('#pwd').parent("li").removeClass('error').addClass("yes");
        };
        
    }
    function validPassword2(pwd,pwd2, pwd2_def,type){
    	var err="";
    	var MIN_PWD = 6;
        var MAX_PWD = 32;
        if( !pwd2 || pwd2 == pwd2_def) {
            err=(_('请再次输入您的密码'));
        }else if (/\s/g.test(pwd)){
        	err = (_('密码不允许有空格'))
        }else if ((pwd2.length < MIN_PWD || pwd2.length > MAX_PWD)) {
            err=(_('密码长度为6-32个字符'));
        }else if( pwd != pwd2 ) {
            err=(_('两次输入密码不一致，请重新输入！'));
        }
        if (err!='') {
        	$(type).find('#pwd2').parent("li").addClass('error');
        	$(type).find('#pwd2').parent("li").find('.tishi').text(err);
        }else{
        	$(type).find('#pwd2').parent("li").removeClass('error').addClass("yes");
        };
    }
 
    function validInvitation_code(invitation_code,invitation_code_def,type){
    	var err="";
    	if (!invitation_code || invitation_code == invitation_code_def ||invitation_code=="邀请码不能为空") {
            err=(_("邀请码不能为空"));
        }
    	if (err!='') {
        	$(type).find('#invitation-code').parent("li").addClass('error');
        	$(type).find('#invitation-code').prev('.tishi').text(err);
        }
    	/*
    	else{
        	$(type).find('#invitation-code').parent("li").removeClass('error').addClass("yes");
        };
        */
    }
    
    function validEmail(email, email_def,type) {
    	var err="";
        if( !email || email == email_def) {
        	err=_('请输入您的邮箱');
        }else if(email.length < 6 || email.length > 50){
        	err=_('长度限制在6~50个字符！')
        	
        }else if( !Util.validEmail( email ) ) {
        	err=(_('邮箱格式不正确'));
        }
        if (err!='') {
        	$(type).find('#email').parent("li").addClass('error');
        	$(type).find('#email').prev('.tishi').text(err);
        }else if(type=="#mobile_reg_div"){
        	$(type).find('#email').parent("li").removeClass('error').addClass("yes");
        };
        
    }

    function validMobile(mobile, mobile_def,type) {
    	var err="";
        if( !mobile || mobile == mobile_def) {
            err=(_('请输入您的手机号'));
        }else if( !Util.validMobile( mobile) ) {
            err=(_('手机号格式不正确'));
        }
        if (err!='') {
        	$(type).find('#mobile').parent("li").addClass('error');
        	$(type).find('#mobile').prev('.tishi').text(err);
        }else if(type=="#mail_reg_div"){
        	$(type).find('#mobile').parent("li").removeClass('error').addClass("yes");
        };
        
    }
    function validUserName(username,username_def,type){
    	var err="";
    	if (!username || username == username_def || username=="请输入您的用户名") {
            err=(_("请输入您的用户名"));
        }
    	if(username.length > 50){
        	err=(_("长度限制在50个字符以内"));
        }
    	if(err!='') {
        	$(type).find('#username').parent("li").addClass('error');
        	$(type).find('#username').prev('.tishi').text(err);
        }else{
        	$(type).find('#username').parent("li").removeClass('error').addClass("yes");
        }
    }
    
   function validTelphone(telphone,telphone_def,type){
	   var err ="";
	   if(telphone == telphone_def){
		   err ='';
		   return;
	   }else if(!Util.validPhone(telphone)){
		   err=(_('固定电话格式不正确'));
	   }
	   
	   if (err!='') {
       	$(type).find('#phone').parent("li").addClass('error');
       	$(type).find('#phone').prev('.tishi').text(err);
       }else{
       	$(type).find('#phone').parent("li").removeClass('error').addClass("yes");
       };
   }
   
  function validWebsite (website,website_def,type){
	  var err="";
	  if(!website || website == website_def){
		  err=(_('公司网址不能为空'));
	  }else{
		  var reg = /^(https?:\/\/)?([a-z0-9]+\.)*([a-z0-9\-]+\.[a-z]{2,5}){1,2}$/i;
		  if(!reg.test(website)){
			 err=(_('公司网址格式不正确'));
		  }; 
	  }
	  if (err!='') {
       	$(type).find('#website').parent("li").addClass('error');
       	$(type).find('#website').prev('.tishi').text(err);
       }else{
       	$(type).find('#website').parent("li").removeClass('error').addClass("yes");
       };
  }
  
  function valid_verify(verify,verify_def,type){
	  var err="";
	  if(!verify||verify == verify_def || verify=="请输入验证码"){
      	err=(_("请输入验证码"));
      }
	  if (err!='') {
       	$(type).find('#verify').parent("li").addClass('error');
       	$(type).find('#verify').prev('.tishi').text(err);
       }
	  /*
	  else{
       	$(type).find('#verify').parent("li").removeClass('error').addClass("yes");
       };
       */
  } 

});
