define('lenovodata/model/TeamManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var URL_PREFIX = Util.getApiVersion()+'/team';
    var ROOT = 'databox';
    
    /*
     * @brief 创建团队
     * @param func 回调函数
     * @param teamObj {
     *     name 团队名称
     *     path TeamFolder(该参数默认为team的name)
     *     quota 团队空间
     *     member_limit 用户上限
     * }
     * @return
     */
    exports.create = function(func, teamObj) {
        var uri = URL_PREFIX + '/create';

        /*
        var postData = {
            name: name 
        };
        */
        var postData = teamObj;
        postData.root = ROOT;      
        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 删除团队 
     * @param func 回调函数
     * @param teamId 团队ID
     * @return
     */
    exports.del = function(func, teamId) {

        var uri = URL_PREFIX + '/delete/' + teamId;
        var postData = {};

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     *根据用户名获取团队列表 
     * param func 回调函数
     * param uid 用户id
     */
	exports.getTeamListByUser = function(func){
    	var uri = URL_PREFIX + '/list_by_user/';
    	
        Util.ajax_json_get(uri,function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    /*
     * 根据teamId获取团队列表
     * param func 回调函数
     * param teamId 
     * param with_member 是否返回成员
     * param num_each_page 每页显示条目
     * param page_num 请求的页码
     */
    exports.getTeamListById = function(func,teamId,with_member,page_num,num_each_page){
    	var uri = URL_PREFIX + '/list_by_id/';
    	if(teamId){
    		uri +=teamId;
    	}
    	if(!with_member){
    		uri +="?with_member=false";
    	}else{
    		uri +="?with_member=true";
    	}
    	if(!page_num)
        	uri+="&page_num=0";
    	else
    		uri+="&page_num="+page_num;
        if(num_each_page)
        	uri+="&num_each_page="+num_each_page;
        
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                //域账号登录名不显示域
				var len = retVal.data.content.length
                if(len>0){
                	for(var i=0;i<len;i++){
                		if(retVal.data.content[i].from_domain_account&&retVal.data.content[i].slug){
                			retVal.data.content[i].slug = retVal.data.content[i].slug.split('@')[0];
                		}
//              		console.log(retVal.data.content[i].slug)
                	}
                }
                func(retVal);
            }
        );
        
    };

    /**
     * 用户直属团队
     * @func回调函数
     * @uid用户id
     */
    exports.list_direct_belong_to_team = function(func,request_uid){
    	var uri = URL_PREFIX + "/list_direct_belong_to_team?request_uid="+request_uid;
    	Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
 
     /*
     * @brief 加入团队
     * @param func 回调函数
     * @param teamId 团队ID
     * @param uids 
     * @return 
     */
    exports.membership_create = function(func, teamId, uids) {

        var uri = URL_PREFIX + '/membership/create/' + teamId;

        var postData = {
            uids: uids
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
     /*
     * @brief 添加用户到团队
     * @param func 回调函数
     * @param teamId 团队ID
     * @param user_infos[]={"uid":1026, "role":"member"}
     * @return 
     */
    exports.membership_batch_creat = function(func, teamId, user_infos) {

        var uri = URL_PREFIX + '/membership/batch_create/' + teamId;
		var postData = {};
        uri += "?user_infos=["+user_infos+"]";

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };   

    /*
     * @brief 批量加入团队
     * @param func 回调函数
     * @param uid 
     * @param teamIds
     * @return 
     */
    exports.batch_join= function(func, uid, teamIds) {

        var uri = URL_PREFIX + '/membership/join';

        var postData = {
            user_id: uid,
            team_ids:teamIds
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     * @brief 移出团队
     * @param func 回调函数
     * @param teamId 团队ID
     * @param uids 
     * @return 
     */
    exports.membership_kickoff = function(func, teamId, uids) {

        var uri = URL_PREFIX + '/membership/kickoff/' + teamId;

        var postData = {
            uids: uids
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 获取团队成员
     * @param func 回调函数
     * @param teamId 团队ID
     * @return 
     */
    exports.membership_get = function(func, teamId,page_num,num_each_page) {
        var uri = URL_PREFIX + '/membership/get/' + teamId;
        if(!page_num){
        	uri += "?page_num=0";
        }else{
        	uri += "?page_num="+page_num;
        }
        if(num_each_page){
        	uri += "&num_each_page="+num_each_page;
        }
        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };
    
    /*
     * @brief 搜索团队成员
     * @param func 回调函数
     * @param isAdmin 如果是普通用户，则根据is_admin，返回他管理的团队，或者是所在的团队。如果是账户管理员，则返回该账户下所有的团队。
     * @param userid 
     * @return
     */
    exports.search = function(func, teamId, query) {

        var uri = URL_PREFIX + '/membership/search/';

        if (teamId !== undefined) {
            uri += teamId;
        }

        uri += '?query=' + query

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 获取团队信息
     * @param func 回调函数
     * @param teamId 团队ID
     * @return 
     */    
    exports.info_get = function(func, teamId) {

        var uri = URL_PREFIX + '/info/get/' + teamId;

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 设置团队信息
     * @param func 回调函数
     * @param teamId 团队ID
     * @param teamObj {
     *     name 团队名称
     *     path TeamFolder(该参数默认为team的name)
     *     quota 团队空间
     *     member_limit 用户上限
     *     description 备注
     * }
     * @return 
     */
    exports.info_set = function(func, teamId, teamObj) {

        var uri = URL_PREFIX + '/info/set/' + teamId;

        /*
        var postData = {
            name: name 
        };
        */
        var postData = teamObj;
        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };


    /*
     * @brief 设置团队管理员
     * @param func 回调函数
     * @param teamId 团队ID
     * @param uid 
     * @return 
     */
    var _admin_set = exports.admin_set = function(func, teamId, uid) {

        var uri = URL_PREFIX + '/admin/set/' + teamId;

        var postData = {
            admin_uid: uid
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 取消团队管理员
     * @param func 回调函数
     * @param teamId 团队ID
     * @param uid 
     * @return 
     */
    var _admin_unset = exports.admin_unset = function(func, teamId, uid) {

        var uri = URL_PREFIX + '/admin/unset/' + teamId;

        var postData = {
            admin_uid: uid
        };

        Util.ajax_json_post(uri, postData, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };


    /**
     * 按照名称查找用户和团队
     * @func回调函数
     * @keyword关键字
     * @page_num页数
     * @num_each_page每页显示条数
     */
    exports.searchUserTeamByName = function(func,keyword,page_num,num_each_page){
    	var uri =  Util.getApiVersion()+"/user_team/search?keyword="+keyword+"&page_num="+page_num+"&num_each_page="+num_each_page;
    	Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    
    exports.set_role = function(func, teamId, uid, role) {
        if (role == 'member') {
            _admin_unset(func, teamId, uid);
        } else {
            _admin_set(func, teamId, uid);
        }
    }


});
