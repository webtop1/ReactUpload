;define('component/userInfoDialog', function(require, exports, module){
	var $ = require('jquery'),
		UserModel = require('model/UserManager'),
		Util = require('lenovodata/util'),
        Tips = require('component/tips'),
		Dialog = require('component/dialog');
        Region = require('model/RegionManager');
	require('i18n');
	var	_ = $.i18n.prop;

    /*
     *    @param userAttr: 用户信息
     */
    function UserInfoDialog(userAttr, ok_callback) {
        var self = this;
        self.userAttr = userAttr;
        self.uid = userAttr.uid;
        self.authArr = null; 
        self.ok_callback = ok_callback;
        self._init();
    }

	$.extend(UserInfoDialog.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;


            self.dialog = new Dialog(_("修改用户信息"), {mask: true}, function(dialog){
                var userInfoHtml = [];
                userInfoHtml.push('<div class="user-info-tab">');
                    userInfoHtml.push('<div>');
                        userInfoHtml.push('<ul class="clearfix user-info-header">');
                           userInfoHtml.push('<li><a src="#userinfo">' + _("账户信息") + '</a></li>');
                           userInfoHtml.push('<li id="pwd" style="display:none"><a src="#editpassword" id="password" >' + _("密码") + '</a></li>');
                           userInfoHtml.push('<li><a src="#userspace">' + _("个人空间") + '</a></li>');
                        userInfoHtml.push('</ul>');
                    userInfoHtml.push('</div>');
                    userInfoHtml.push('<div id="userinfo" class="content" style="display:block;">');
                        userInfoHtml.push('<div class="error-info"></div>');
                        userInfoHtml.push('<div><span class="col1 col">' + _("用户类型") + '</span><span id="usertype"></span></div>');
                        userInfoHtml.push('<div><span class="col1 col">' + _("登录名") + '</span><span id="userslug"></span></div>');

                        userInfoHtml.push('<div><span class="col1">' + _("邮箱") + '</span><input type="text" name="email" value="" maxlength="50"/></div>');
                        userInfoHtml.push('<div><span class="col1">' + _("手机号码") + '</span><input type="text" name="mobile" value="" /></div>');
                        userInfoHtml.push('<div><span class="col1">' + _("姓名") + '</span><input type="text" name="username" value="" maxlength="50"/></div>');
                        userInfoHtml.push('<div><span class="col1">' + _("数据中心") + '</span><select id="user_region"></select></div>');


                    userInfoHtml.push('</div>');
                    userInfoHtml.push('<div id="editpassword" class="content">');
                        userInfoHtml.push('<div class="error-info"></div>');
                        userInfoHtml.push('<div><span class="col1">' + _("密　　码") + '</span><input type="password" name="pwd1" value="******" maxlength="32" onpaste="return false"/></div>');
                        userInfoHtml.push('<div><span class="col1">' + _("重复密码") + '</span><input type="password" name="pwd2" value="******" maxlength="32" onpaste="return false"/></div>');
                        userInfoHtml.push('<div style="padding-left:106px"><input type="checkbox" name="forbid"><span>' + _("禁止账户修改密码") + '</span></div>');
                    userInfoHtml.push('</div>');
                    userInfoHtml.push('<div id="userspace" class="content">');
                        userInfoHtml.push('<div class="error-info"></div>');
                        userInfoHtml.push('<div><span id="used-quota"></span></div>');
                        userInfoHtml.push('<div><span class="col1">' + _("个人空间") + '</span><input type="text" name="quota" size="6"> MB</div>');
                    userInfoHtml.push('</div>');
                userInfoHtml.push('</div>');

                dialog.append(userInfoHtml.join('') + '<div class="dialog-button-area"><a id="user-info-ok" class="dialog-button ok">' + _('确定') +'</a> <a id="user-info-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');

                //只有管理员才能修改用户密码
                if (Util.isAdmin()) {
                    $(".user-info-header>li:eq(1)").show();
                }
            });

            UserModel.info_get(function(ret) {
                if (ret.code == 200) {
                    self.userAttr = ret.data;
                    self.from_domain_account=ret.data.from_domain_account;
                    self.userAttr.quota = self.userAttr.quota/1024/1024;
                    self.userAttr.used  = self.userAttr.used == 0 ? 0 : (self.userAttr.used/1024/1024).toFixed(2);
                    var $userInfo=$('#userinfo');
                    if(self.userAttr.from_domain_account){
                    	self.userAttr.from_domain_account =  _("企业认证用户");
                    	$(".user-info-tab").find("li").eq(1).remove();
                        $userInfo.find("input[name='email']").attr("disabled","disabled")
                        $userInfo.find('input[name=mobile]').attr("disabled","disabled")
                        $userInfo.find('input[name=username]').attr("disabled","disabled")
                    	$(".user-info-tab").find('#editpassword').remove();
                    }else{
                    	self.userAttr.from_domain_account = _("本地认证用户");
                    }
                    

                    if (!self.userAttr.email) self.userAttr.email = "";
                    if (!self.userAttr.mobile) self.userAttr.mobile = "";
                    $('#userinfo').find('#usertype').html(self.userAttr.from_domain_account);
                    $('#userinfo').find('#userslug').html(self.userAttr.user_slug);
                    $('#userinfo').find('input[name=email]').val(self.userAttr.email);
                    $('#userinfo').find('input[name=mobile]').val(self.userAttr.mobile);
                    $('#userinfo').find('input[name=username]').val(self.userAttr.user_name);
                    $('#userspace').find('input[name=quota]').val(self.userAttr.quota);
                    $('#used-quota').html(_("当前已用空间 {0} MB,共 {1} MB", self.userAttr.used, self.userAttr.quota));
                    if (self.userAttr.password_changeable == false) {
                        $("#editpassword").find('input[name=forbid]:checkbox').attr('checked', 'checked');
                    }
                    //动态加载数据中心
                    var option = "";
                    Region.list(function(ret){
                        if(ret.code==200){
                            for(var i=0;i<ret.data.length;i++){
                                if(ret.data[i].id == self.userAttr.region_id){
                                    option="<option selected=selected value="+ret.data[i].id+">"+_(ret.data[i].description)+"</option>";
                                }else{
                                    option="<option value="+ret.data[i].id+">"+_(ret.data[i].description)+"</option>";
                                }
                                $("#user_region").append(option);
                            }
                        }
                    });
                    //2016-03-08不在对域用户设置按钮权限，原因用户信息界面隐藏确定按钮无法改变数据中心。
                    //self.setFromDomainAuth();
                }
            }, self.uid);

            $('.user-info-tab a').each(function(i){

                //var elem = $(".user-info-tab a");
                //var contentId = elem.eq(i).attr('src');
                var contentId = $(this).attr('src');

                if (i == 0) {
                    $(this).addClass('selected');
                    $(contentId).show();
                    self.setFromDomainAuth();
                } else {
                    $(this).removeClass('selected');
                    $(contentId).hide();
                }

            });

            $('.user-info-tab a').click(function(e) {

                $('.user-info-tab a').each(function(i){
                    //var elem = $(".user-info-tab a");
                    var contentId = $(this).attr('src');
                    $(this).removeClass('selected');
                    $(contentId).hide();
                });

                $(e.currentTarget).addClass('selected');
                var  contentId = $(e.currentTarget).attr('src');
                $(contentId).show();

               self.setFromDomainAuth();
            });
            
			var _bol = false ,_forbid = false;
        	$("#editpassword input[type=password]").focus(function(){
        		$(this).val('');
        		_bol = true;
        	});
        	$("#editpassword").find('input[name=forbid]:checkbox').change(function(){
        		//$("#editpassword").find('input[type=password]').val('');
        		_forbid = true;
        	});
        	
        	
            $('#user-info-ok').click(function() {
                $('.user-info-tab a').each(function(i){
                    if ($(this).hasClass('selected')) {
                        var contentId = $(this).attr('src');
                        switch(contentId) {
                            case '#userinfo':
                            	var email = $.trim($('#userinfo').find('input[name=email]').val());
                                var mobile = $.trim($('#userinfo').find('input[name=mobile]').val());
                                var username = $.trim($('#userinfo').find('input[name=username]').val());
                                var user_region = $('#user_region').val();
                                if (mobile != "" && !Util.validMobile(mobile)) {
                                    Tips.warn(_("手机号码格式不正确"));
                                    return;
                                }

                                if(!Util.validInput($('#userinfo').find('input[name=username]'),_('用户名不能包括特殊字符'))){
                                    return;
                                }
                                if (username == "") {
                                    Tips.warn(_("姓名不能为空"));
                                    return;
                                }else if(Util.getBytes(username)>50){
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
                                                              
                                
                                UserModel.info_set(function(ret) {
                                    if (ret.code != 200) {
                                        Tips.warn(ret.message);
                                    }
                                    self.ok_callback && (self.ok_callback());
                                }, {user_id:self.uid, user_name: username, mobile: mobile, email: email,region_id:user_region});
                                break;
                            case '#editpassword':

                            		var pwd1 = $.trim($('#editpassword').find('input[name=pwd1]').val());
                                    var pwd2 = $.trim($('#editpassword').find('input[name=pwd2]').val());
                                    var ischecked = !$("#editpassword").find('input[name=forbid]:checkbox').get(0).checked;

                                    if (pwd1 == "") {
                                        Tips.warn(_("密码不能为空"));
                                        return;
                                    }

                                    if (pwd1 != pwd2) {
                                        Tips.warn(_("两次输入密码不一致，请重新输入！"));
                                        return;
                                    }
									if (pwd1 == '******') {
                                        pwd1='';
                                    } 							                                 

                                    UserModel.password_set(function(ret) {
                                        if (ret.code != 200) {
                                            Tips.warn(ret.message);
                                        }
                                    }, self.uid, pwd1, pwd1, ischecked );
                                 
                                break;
                            case '#userspace':
                                var quota = $.trim($('#userspace').find('input[name=quota]').val());

                                if (/[\D]/.test(quota)) {
                                    Tips.warn(_("个人空间大小必须为正整数！"));
                                    return;
                                }

                                if (parseFloat(quota) < parseFloat(self.userAttr.used)) {
                                    Tips.warn(_("个人空间大小必须大于或等于用户已用空间大小！"));
                                    return;
                                }
                                if(quota*1024*1024>window.LenovoData.user.account_info.space.limit){
                                	Tips.warn(_("不能超过企业总空间大小"));
                                	return;
                                }
                                UserModel.quota_set(function(ret) {
                                    if (ret.code != 200) {
                                        Tips.warn(ret.message);
                                    }
                                }, self.uid, quota*1024*1024); 
                                break;
                        }
                        self.dialog.close();
                    }
                });
            });

            $('#user-info-cancel').click(function() {
                self.dialog.close();
            });
        },
        //设置域用户界面权限
        setFromDomainAuth:function(){
            var self=this;
            var $btn=$("#user-info-ok");
            if(self.from_domain_account){
                var $selected = $(".user-info-tab .selected")
                if($selected.attr("src")=="#userspace"){
                    $btn.show();
                }else{
                    $btn.show();
                    //$btn.hide();
                }
            }
        }
    });
    return UserInfoDialog;
});
