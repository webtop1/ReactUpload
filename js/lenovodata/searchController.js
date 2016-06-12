;define('lenovodata/searchController', function(require, exports){

	var $ = require('jquery'),
		Dialog = require('component/dialog'),
		Tips = require('component/tips'),
        Util = require('util'),
        FileModel = require('model/FileManager'),
        TeamModel = require('model/TeamManager'),
		UserModel = require('model/UserManager'),
        AuthModel = require('model/AuthManager');

	require('i18n');
	var	_ = $.i18n.prop;

    //全文检索查询
    var FullTextIndex="0";

	function controller(context, type, param,size_start,size_end, time_start, time_end, creator, filetype,desc,exact){
		
		switch(type){
            case 'file':
                fileSearch(context, param,size_start,size_end, time_start, time_end, creator, filetype,desc,exact);
            break;
            case 'user':
                userSearch(context, param);
            break;
            case 'team-user':
                teamUserSearch(context, param, arguments[3]);
            break;
        }
	}

    function fileSearch(context, keyword, size_start,size_end, time_start, time_end, creator, filetype,desc,exact){
        context.filelist.searchFullText(FullTextIndex,keyword,filetype,size_start,size_end, time_start, time_end, creator,desc,exact)
    }

    function userSearch(context, keyword){
        UserModel.list(function(result){

            if(result.code == 200){

                var datas = [];
                for(var i=0, ii=result.data.length; i<ii; i++){
                    var item = result.data[i];
                    var d = {
                    	userAlias: item.user_name + (item.from_domain_account ? '(' + _('企业认证用户')+')' : ''),
                        uid: item.uid,
                        userName: item.user_name,
                        accountId: item.account_id,
                        role: item.role,
                        email: item.email,
                        mobile: item.mobile,
                        isAdmin:item.role=="admin"?true:false,
                        ctime: Util.formatDate(item.ctime, _('yyyy年MM月dd日')+' hh:mm:ss'),
                        frozen: item.status== -1 ?"true":"false",
                        isFrozen:item.status== -1 ?"true":"false",
                        isActive:item.status!= -1 ?"true":"false",
                        isCer: item.from_domain_account
                    }
                    datas.push(d);
                }
                context.totalPage = 1;
                context.renderList(datas);
            }

        }, UserModel.ROLE.MEMBER, keyword);
    }

    function teamUserSearch(context, teamId, keyword){
        
        TeamModel.search(function(result){
            if(result.code == 200){
                var datas = [];
                for(var i=0, len=result.data.length; i<len; i++){
                    var item = result.data[i];
                    var da = {
                        index: i,
                        uid: item.uid,
                        userName: item.user_name,
                        accountId: item.account_id,
                        role: item.role,
                        email: item.email,
                        mobile: item.mobile,
                        teamId:teamId,
                        isAdmin:item.role=='admin'?true:false,
                        ctime: Util.formatDate(item.ctime, _('yyyy年MM月dd日')+' hh:mm:ss'),
                        frozen: item.status== -1 ?true: false,
                        isFrozen: "false",
                        isActive: "false",
                        userAlias: item.user_name + (item.from_domain_account ? '(' + _('企业认证用户')+')' : ''),
                        isCer: item.from_domain_account
                        
                    }
                    datas.push(da);
                }
                context.renderList(datas);
            }
        }, teamId, keyword);
    }


    function teamAuthSearch(context, keyword){
        UserModel.list(function(result){

            if(result.code == 200){

                var datas = [];
                for(var i=0, ii=result.data.length; i<ii; i++){
                    var item = result.data[i];
                    var file = Util.resolvePath(item.path, true);
                    var d = {
                        id: item.id,
                        name: file.name,
                        type: file.type,
                        action: item.action,
                        path: item.path,
                        agentType: item.agent_type,
                        agentName: item.agent_name,
                        agentId: item.agent_id
                    };
                    datas.push(d);
                }
                context.renderList(datas);
            }

        }, UserModel.ROLE.MEMBER, keyword);
    }

	return controller;
});
