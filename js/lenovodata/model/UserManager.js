define('lenovodata/model/UserManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;

    var Util = require('lenovodata/util');
    var URL_PREFIX = Util.getApiVersion();

    var ROLE = exports.ROLE = {
        ALL: '1',
        MEMBER: '1',
        ADMIN: '7'
    }

    /*
     * @brief 用户登录。
     * @param func 回调函数
     * @param user_slug 
     * @param password 
     * @param [option] captcha
     * @param [option] autologin
     * @param [option] rem_pwd 记住密码
     * @return 
     */
    exports.signin = function(func, user_slug, password, captcha, autologin,rem_pwd) {
        var uri = URL_PREFIX + '/user/login';

        var retVal = {code: null, data: null, message: Util.unknownErrMessage};
		var post_data = {
	            user_slug: user_slug,
	            password: password,
	            captcha: captcha
	        };
	        if(autologin){
	        	post_data.auto_login = autologin;
	        }
	        if(rem_pwd){
	        	post_data.rem_pwd = rem_pwd;
	        }
        
        Util.ajax_json_post_nowait(uri, post_data, function(xhr, textStatus){
                var data = xhr.responseJSON?xhr.responseJSON:{message: Util.unknownErrMessage};
                switch(xhr.status) {
                    case 200:
                        retVal = {code:200, data:data, message:data.message };
                        break;
                    case 401:
                        retVal = {code:xhr.status, data:data, message:data.message };
                        break;
                    case 400:
                    case 402:
                    case 403:
                    case 404:
                    case 409:
                    case 503:
                        retVal = {code:xhr.status, data:data, message:data.message };
                        break;
                    default:
                        break;
                }

                func(retVal);
            }
        );
    };

    /*
     * @brief 用户退出登录
     * @param func 回调函数
     * @return 
     */
    exports.signout = function(func) {
        var uri = URL_PREFIX + '/user/logout';

        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 创建用户
     * @param func 回调函数
     * @param user_slug 
     * @param password 
     * @param password_changeable
     * @param email
     * @param mobile
     * @param quota
     * @param user_name
     * @param active 
     * @return 
     */
    exports.create = function(func, user_slug, user_name, email, quota, password, mobile, password_changeable, active,region_id) {
        var uri = URL_PREFIX + '/user/create';

        var post_data = {
            user_slug: user_slug,
            user_name: user_name,
            email: email,
            quota: quota,
            region_id:region_id
        };

        if (password) post_data.password = password;

        if (mobile) post_data.mobile = mobile;

        post_data.password_changeable = password_changeable;

        post_data.active = active;

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 创建用户并加入团队
     * @param func 回调函数
     * @param email 
     * @param team_id 
     * @return 
     */
    exports.create_join_team = function(func, email, team_id) {
        var uri = URL_PREFIX + '/user/team_create';

        var post_data = {
            t_email: email,
            team_id: team_id
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 用户基本信息设置
     * @param func 回调函数
     * @param user_id
     * @param userInfo
     * @return 
     */
    exports.info_set = function(func, userInfo) {
        var uri = URL_PREFIX + '/user/info/set/';

        if (userInfo.user_id) {
            uri += userInfo.user_id;
        }
        var post_data = {};
        if (userInfo.email) {
            post_data.new_email = userInfo.email;
        }
        if(userInfo.mobile){
        	post_data.new_mobile = userInfo.mobile;
        }else{
        	post_data.new_mobile = "empty";
        }
        if(userInfo.user_name){
        	post_data.new_user_name = userInfo.user_name;
        }
        if(userInfo.region_id){
            post_data.new_region_id = userInfo.region_id;
        }
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus, _("用户设置成功"));
                func(retVal);
            }
        );
    };
    /*
     * 获取用户quota
     */
    exports.quota = function(func) {
        this.info_get(function(ret) {
            if (ret.code == 200) {
                func({quota: ret.data.quota, used: ret.data.used});
            }
        });
    }

    /*
     * @brief 用户基本信息获取
     * @param func 回调函数
     * @param user_id
     * @param user_name
     * @return 
     */
    exports.info_get = function(func, user_id) {
        var uri = URL_PREFIX + '/user/info/get/';
        if (user_id) {
            uri += user_id;
        }

        Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                //域账号登录名不显示域
                retVal.data.user_slug = retVal.data.from_domain_account? retVal.data.user_slug.split('@')[0]: retVal.data.user_slug;
                
                func(retVal);
            }
        );
    };

    /*
     * @brief 用户列表
     * @param func 回调函数
     * @role  all/member/admin
     * @keyword 搜索关键字
     * @return 
     */
    exports.list = function(func, role, keyword) {
        var uri = URL_PREFIX + '/user/list';

        if (!role) {
            role = '1';
        } 

        uri += '?role=' + role;

        if (keyword) {
            uri += '&keyword=' + keyword;
        }
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
        
    };
    /* 团队成员和授权时候调用
     * 分页查询
     * ***/
    exports.list_for_pages = function(func, page_num, num_each_page,role,keyword) {
        var uri = URL_PREFIX + '/user/list_for_pages';
        if(!role){
        	role='1';
        }
        uri += '?role=' + role;
       
        if (!page_num) {
            uri += "&page_num=0";
        }else{
        	uri += "&page_num="+page_num;
        }

        if (num_each_page) {
            uri += '&num_each_page=' + num_each_page;
        }

        if(keyword){
        	uri += '&keyword='+keyword;
        }
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                //域账号登录名不显示域
				var len = retVal.data.content.length
                if(len>0){
                	for(var i=0;i<len;i++){
                		if(retVal.data.content[i].from_domain_account){
                			retVal.data.content[i].user_slug = retVal.data.content[i].user_slug.split('@')[0];
                		}
                	}
                }
				
                func(retVal);
            }
        );
        
    };
    /*
     * @brief 用户冻结
     * @param func 回调函数
     * @param user_id
     * @return 
     */
    exports.freeze = function(func, user_id) {
        var uri = URL_PREFIX + '/user/freeze/' + user_id;

        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量用户冻结
     * @param func 回调函数
     * @param user_ids
     * @return 
     */
    exports.batch_freeze = function(func, user_ids) {
        var uri = URL_PREFIX + '/user/batch_freeze';

        var post_data = {
            uids: user_ids
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_user_batch_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 用户激活
     * @param func 回调函数
     * @param user_id
     * @return 
     */
    exports.activate = function(func, user_id) {
        var uri = URL_PREFIX + '/user/activate/' + user_id;

        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量用户激活
     * @param func 回调函数
     * @param user_ids
     * @return 
     */
    exports.batch_activate = function(func, user_ids) {
        var uri = URL_PREFIX + '/user/batch_activate';

        var post_data = {
            uids: user_ids
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_user_batch_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 批量用户删除
     * @param func 回调函数
     * @param user_ids
     * @force 是否强制删除（true/false默认false） 可选
     * @return 
     */
    exports.batch_del = function(func, user_ids,force) {
        var uri = URL_PREFIX + '/user/batch_delete';

        var post_data = {
            uids: user_ids
        };
        if(force){
        	post_data.force = true;
        }
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_user_batch_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 用户删除
     * @param func 回调函数
     * @param user_id
     * @return 
     */
    exports.del = function(func, user_id) {
        var uri = URL_PREFIX + '/user/delete/' + user_id;

        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 用户重置密码
     * @param func 回调函数
     * @param user_id
     * @param password
     * @return 
     */
    exports.password_set = function(func, user_id , password, old_password , password_changeable) {
        var uri = URL_PREFIX + '/user/password/set/';
        if (user_id) {
            uri += user_id;
        }
		
		if(password){
	        var post_data = {
	            old_password: old_password,
	            password: password
	        };			
		}else{
	        var post_data = {
	        };				
		}


        if (password_changeable !== undefined ) post_data.password_changeable = password_changeable;

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 用户空间配额分配
     * @param func 回调函数
     * @param user_id
     * @param quota 
     * @return 
     */
    exports.quota_set = function(func, user_id, quota) {
        var uri = URL_PREFIX + '/user/quota/set/' + user_id;

        var post_data = {
            quota: quota
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     * @brief 改变用户名时更改session信息
     * @func 回调函数
     * @user_name 用户名
     */
    exports.changeSessionInfo = function(func,user_name,quota){
    	var uri = '/user/changeSessionInfo';
    	var post_data = {
    		user_name:user_name,
    		quota:quota
    	};
    	Util.ajax_json_post_nowait(uri,post_data,function(xhr,textStatus){
        	var ret = Util.ajax_json_process_normal_result(xhr, textStatus);
        	func(ret);
        });  	
    }
    /*
     * brief 获取用户邮箱列表
     *param key
     * 
     * */
	exports.getUserEmailList = function(func, key) {
        var uri = URL_PREFIX + '/user/search?query=' + key + "&pattern=head&type=email" ;
    
        Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*设置短信认证接口
     * param post_data {
     * 		user_ids:[],(可选)
     * 		teasm_ids:[],(可选)
     * 		all:true/false,(可选)
     * 		action:enable/disable,(可选)
     * 		account_swutch: enable/disable(可选)
     * 	}
     */
    exports.smsAuthSet = function(func,post_data) {
    	var uri = URL_PREFIX +'/sms/auth_set/';
 
 		var post_data = post_data;
    	Util.ajax_json_post(uri,post_data,function(xhr,textStatus){
    		 var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
             func(retVal);
    	})
    };
    
    /*获取登录手机验证用户
     */
    exports.smsAuthGet = function(func){
    	var uri = URL_PREFIX +'/sms/auth_get';
    	Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    exports.suggestion = function(func,prefix){
    	var uri = URL_PREFIX +"/suggestion?prefix="+prefix;
    	Util.ajax_json_get_nowait(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    }
    
    
});
