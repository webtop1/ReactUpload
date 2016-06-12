define('lenovodata/model/AccountManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var URL_PREFIX = Util.getApiVersion();
    var errCount = 0;

    /*
     * @brief 账号注册。
     * @param func 回调函数
     * @param user_slug 
     * @param password 
     * @param invitaion_code
     * @param [option] captcha
     * @return 
     */
    exports.signup = function(func, user_slug, password, user_name, invitaion_code, captcha, company, contact, phone, email, website, mobile) {
        var uri = URL_PREFIX + '/account/register';

        var post_data = {
            user_slug: user_slug,
            user_name: user_name,
            password: password,
            promo_code: invitaion_code,
            captcha: captcha,
            company: company, 
            contact:  contact, 
            phone: phone, 
            email: email,
            website: website,
            mobile: mobile

        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户冻结
     * @param func 回调函数
     * @param account_id
     * @return 
     */
    exports.freeze = function(func, account_id) {
        var uri = URL_PREFIX + '/account/freeze/' + account_id;

        var post_data = {
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户信息设置
     * @param func 回调函数
     * @ param accountInfo {
     *     company
     *     contact
     *     email 
     *     phone
     *     website 
     *     mobile
     *     industry 
     *     scale,
     *     second_domain,
     *     first_domain,
     *     name,
     *     name_en,
     * }
     * @return 
     */
    //exports.info_set= function(func, company, contact, email, phone, website, mobile, industry, scale, second_domain, first_domain, name, name_en) {
    exports.info_set= function(func, accountInfo) {
        var uri = URL_PREFIX + '/account/info/set';

        var post_data = accountInfo;
        /*
        var post_data = {
        };

        if (company) post_data.company = company; 
        if (contact) post_data.contact = contact;
        if (email) post_data.email = email;
        if (phone) post_data.phone = phone; 
        if (website) post_data.website = website; 
        if (mobile) post_data.mobile = mobile;
        if (industry) post_data.industry = industry;
        if (scale) post_data.scale = scale;
        if (first_domain) post_data.first_domain = first_domain;
        if (second_domain) post_data.second_level = second_domain;
        if (name) post_data.name = name;
        if (name_en) post_data.name_en = name_en;
        */

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户信息获取
     * @param func 回调函数
     * @param user_id 
     * @return 
     */
    exports.info_get= function(func) {
        var uri = URL_PREFIX + '/account/info/get/';

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户域名设置
     * @param func 回调函数
     * @param user_id 
     * @param one_level 
     * @param second_level
     * @return 
     * @return 
     */
    exports.domain_set= function(func, user_id, one_level, second_level) {
        var uri = URL_PREFIX + '/account/domain/set/' + user_id;

        var post_data = {
            one_level: one_level,
            second_level: second_level
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     * @brief 账户域名获取
     * @param func 回调函数
     * @param user_id 
     * @return 
     */
    exports.domain_get= function(func, user_id) {
        var uri = URL_PREFIX + '/account/domain/get/' + user_id;

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户背景设置
     * @param func 回调函数
     * @param user_id 
     * @param render_template
     * @return 
     */
    exports.render_set= function(func, render_template) {
        var uri = URL_PREFIX + '/account/render/set/';

        var post_data = {
            render_template: render_template 
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户背景获取
     * @param func 回调函数
     * @param user_id 
     * @param render_template 
     * @return 
     */
    exports.render_get= function(func, render_template) {
        var uri = URL_PREFIX + '/account/render/get/';

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户安全设置
     * @param func 回调函数
     * @param account_id 
     * @param password_expire_duration
     * @param password_length
     * @param password_strategy
     * @return 
     */

    exports.SECURITY = {
        SPEC_CHAR : 1, //包含特殊字符
        CAPTICAL : 2,  //包含大写字母
        WEAKNESS : 4   //禁止使用弱密码
    };

    exports.security_set= function(func, password_expire_duration, 
                                                  password_length, password_strategy,isUseall) {
        var uri = URL_PREFIX + '/account/security/set/';

        var post_data = {
            password_expire_duration: password_expire_duration,
            password_length: password_length,
            password_strategy: password_strategy,
            admin_access_enabled:isUseall
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户安全设置获取
     * @param func 回调函数
     * @param account_id 
     * @return 
     */
    exports.security_get= function(func) {
        var uri = URL_PREFIX + '/account/security/get/';

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户限额设置
     * @param func 回调函数
     * @param account_id 
     * @param space
     * @param user_num
     * @return 
     */
    exports.quota_set= function(func, account_id, space, user_num) {
        var uri = URL_PREFIX + '/account/quota/set/' + account_id;

        var post_data = {
            space: {limit: space},
            user_num: {limit: user_num} 
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 账户限额获取
     * @param func 回调函数
     * @param accou_id 
     * @return 
     */
    exports.quota_get= function(func, user_id) {
        var uri = URL_PREFIX + '/account/quota/get/';

        if (user_id) {
            uri += user_id;
        }

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 移交管理员权限给其它用户
     * @param func 回调函数
     * @param user_id 
     * @param admin_slug
     * @param user_num
     * @return 
     */
    exports.admin_set = function(func, user_id, admin_slug) {
        var uri = URL_PREFIX + '/account/admin/set/' + user_id;

        var post_data = {
            admin_slug: admin_slug
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    /*
     * 账户认证配置
     */
    exports.oauth_config = function(func,user_id){
    	var uri = "/oauth/status/"+user_id;
    	var post_data = {account_id:user_id};
    	Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    /***
     * 解除绑定，不用传参数
     */
    exports.oauth_unbind = function(func){
    	var uri = "/oauth/unbind";
    	var post_data = {};
    	Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
	            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
	            func(retVal);
	    });
    }
    /*
     * @brief 邮件模板获取
     * @param func 回调函数
     * @return 
     */
    exports.delivery_mail_get= function(func) {
        var uri = URL_PREFIX + '/account/delivery_mail/get';

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    /*
     * @brief 邮件模板设置
     * @param func 回调函数
     * @param deliveryMailInfo 外链模板信息 
     * @return 
     */
    exports.delivery_mail_set= function(func, deliveryMailInfo) {
        var uri = URL_PREFIX + '/account/delivery_mail/set';

        var post_data = deliveryMailInfo;
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
        
    };
    
    /*
     *@brief 访问设置
     * @param category (ip/device)
     * @param obj_list
     * @parem enable on/off
     * 
     * */
    exports.access_set= function(func, category,obj_list,enable) {
        var uri = URL_PREFIX + '/account/security/restrict/set';
		
		var post_data = {
        	category:category,
        	obj_list:obj_list
        }
		
		if(enable){
			post_data.enable = enable;
		}
        
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
        
    };
    
    /*brief 获取访问设置
     */
    exports.access_get= function(func) {
        var uri = URL_PREFIX + '/account/security/restrict/get';

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /* @brief 获取消息设置
     * @param config_type 配置类型，默认为2：系统级配置0、账户配置1, 用户配置2, 团队配置3
     * @param config_id 配置ID，默认为当前用户uid，
     * @parem name 配置项名称  （都可选）
     */
    exports.get_notice_config =function(func,config_type,name,config_id) {
    	var uri = URL_PREFIX +'/config/get?'
    	var arr =[];
    	if(name){
    		arr.push('name='+name)
    	}
    	if(config_type){
    		arr.push ('config_type='+config_type)
    	}
    	if(config_id){
    		arr.push ('config_id='+config_id)
    	}
    	uri += arr.join('&');
    	
        Util.ajax_json_get(uri, function(xhr, textStatus){
              var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    	
    },
    /* @brief 消息设置
     * @param arr =[{
     * 	config_type:,配置类型，默认为2
     *  config_id:,配置ID，默认为当前用户uid
     *  name:,配置项名称
     *  value:配置项值
     * }]
     */
    exports.set_notice_config=function(func,arr) {
    	var uri = URL_PREFIX +'/config/set?'
    	var post_data = arr;
    	Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    },
    /* @brief 传输设置
     * @param uploadSpeedLimit 上传速度大小限制
     * @param downloadSpeedLimit 下载速度大小限制
     * @param fileRestriction 文件类型限制
     * @param sensitiveWord 敏感词限制
     */
    exports.set_transfer_config=function(func,filter) {
    	var uri = URL_PREFIX +'/transfer/set?'
    	var post_data = filter;
    	Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    },
    /* @brief 传输设置
     */
    exports.get_transfer_config=function(func) {
    	var uri = URL_PREFIX +'/transfer/get?'
    	Util.ajax_json_get(uri, function(xhr, textStatus){
              var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    }
    
});
