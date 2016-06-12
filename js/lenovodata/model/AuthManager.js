define('lenovodata/model/AuthManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var VERSION = Util.getApiVersion();
    var ROOT = 'databox';
    var URL_PREFIX = VERSION + '/auth';

    /*
     * 权限类型/action
     */
    var ACTION = exports.ACTION = {
        LIST: 'list',
        DELETE: 'delete',
        VIEW: 'view',
        'UPLOAD:DOWNLOAD': 'upload:download',
        'UPLOAD:DOWNLOAD:DELIVERY': 'upload:download:delivery',
        UPLOAD: 'upload',
        'UPLOAD:DELIVERY': 'upload:delivery',
        DOWNLOAD: 'download',
        'DOWNLOAD:DELIVERY': 'download:delivery',
        PREVIEW: 'preview',
        EDIT: 'edit',
        COLLABORATE: 'collaborate'
    };

    var AUTH_CATEGORY = exports.AUTH_CATEGORY = {
        LIST: {item_title: _("无"), item_value: "list"},
        PREVIEW: { item_title: _("预览"), item_value: "preview", privilege_id: "2009" },
        UPLOAD: { item_title: _("上传"), item_value: "upload", privilege_id: "2008" },
        'UPLOAD:DELIVERY': { item_title: _("上传/外链"), item_value: "upload:delivery", privilege_id: "2007" },
        DOWNLOAD: { item_title: _("下载"), item_value: "download", privilege_id: "2006" },
        'DOWNLOAD:DELIVERY': { item_title: _("下载/外链"), item_value: "download:delivery", privilege_id: "2005" },
        /*VIEW: {item_title: _("查看"), item_value: "view"},*/
        'UPLOAD:DOWNLOAD': { item_title: _("上传/下载"), item_value: "upload:download", privilege_id: "2004" },
        'UPLOAD:DOWNLOAD:DELIVERY': { item_title: _("上传/下载/外链"), item_value: "upload:download:delivery", privilege_id: "2003" },
        EDIT: { item_title: _("编辑"), item_value: "edit", privilege_id: "2001" }
        /*COLLABORATE: {item_title: _("协作"), item_value: "collaborate"}*/
    }

    /*
     * 角色/agent_type
     */
    var AGENT_TYPE = exports.AGENT_TYPE = {
        ALL: 'all',
        TEAM: 'team',
        USER: 'user'
    };

    /*
     * @brief 授权创建。
     * @param func 回调函数
     * @param action
     * @param agent_id
     * @param agent_type
     * @return
     */
    exports.create = function(func, path, action, agent_id, agent_type) {
        var uri = URL_PREFIX + '/set/' + ROOT + '/' + path;
        uri = uri.replace('\/\/', '\/');

        var paramErr = true;

        for (var key in ACTION) {
            if (ACTION[key] === action) {
                paramErr = false;
                break;
            }
        }

        if (paramErr) {
            retVal = { code: 900, data: null, message: _('参数错误') };
            func(retVal);
            return retVal;
        }

        for (var key in AGENT_TYPE) {
            if (AGENT_TYPE[key] === agent_type) {
                paramErr = false;
                break;
            }
        }

        if (paramErr) {
            retVal = { code: 900, data: null, message: _('参数错误') };
            func(retVal);
            return retVal;
        }

        var post_data = {
            action: action,
            agent_id: agent_id,
            agent_type: agent_type
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };


    /*
     * @brief 管理授权。
     * @param func 回调函数
     * @param action
     * @param agent_id
     * @param agent_type
     * @return
     */
    exports.auth_batch_create = function(func, path, path_type, prefix_neid, entry_infos) {
        var uri = URL_PREFIX + '/batch_create/' + ROOT + path;
        uri = uri.replace('\/\/', '\/');
        var post_data = {};
        if (path_type) post_data.path_type = path_type;
        if (prefix_neid) post_data.prefix_neid = prefix_neid;
        post_data.entry_infos = "[" + entry_infos + "]";

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 批量授权。
     * @param func 回调函数
     * @param action
     * @param agent_id
     * @param agent_type
     * @return
     */
    exports.batch_user_set = function(func, path, action, agent_ids) {
        var uri = URL_PREFIX + '/batch_set/' + ROOT + '/' + path;
        uri = uri.replace('\/\/', '\/');

        var paramErr = true;

        for (var key in ACTION) {
            if (ACTION[key] === action) {
                paramErr = false;
                break;
            }
        }

        if (paramErr) {
            retVal = { code: 900, data: null, message: _('参数错误') };
            func(retVal);
            return retVal;
        }

        var post_data = {
            action: action,
            agent_ids: agent_ids
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_batch_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 授权更新。
     * @param func 回调函数
     * @param action
     * @return
     */
    exports.update = function(func, auth_entry_id, action) {
        var uri = URL_PREFIX + '/update/' + auth_entry_id;

        var paramErr = true;

        for (var key in ACTION) {
            if (ACTION[key] === action) {
                paramErr = false;
                break;
            }
        }

        if (paramErr) {
            retVal = { code: 900, data: null, message: _('参数错误') };
            func(retVal);
            return retVal;
        }

        var post_data = {
            action: action
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 删除授权
     * @param func 回调函数
     * @param auth_entry_id
     * @return
     */
    exports.del = function(func, auth_entry_id) {
        var uri = URL_PREFIX + '/delete/' + auth_entry_id;

        var post_data = {};

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    /*
     * @brief 批量删除授权
     * @param func 回调函数
     * @param auth_entry_ids
     * @return
     */
    exports.batch_del = function(func, auth_entry_ids) {
        var uri = URL_PREFIX + '/batch_delete';

        var post_data = {
            json: JSON.stringify(auth_entry_ids)
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus, _("删除成功"));
            func(retVal);
        });
    };

    /*
     * @brief 获取授权
     * @param func 回调函数
     * @param agent_id : 取值uid, teamid
     * @param agent_typ: 取值user, type
     * @return
     */
    exports.get = function(func, path, agent_id, agent_type) {

        var uri = URL_PREFIX + '/list_by_object/';
        //      console.log(ROOT,uri)
        //      if (path == "") {
        //          uri = URL_PREFIX + '/get';
        //      }

        uri = uri.replace('\/\/', '\/');

        var param = [];

        for (var key in AGENT_TYPE) {
            if (AGENT_TYPE[key] === agent_type) {
                param.push('agent_type=' + agent_type);
                break;
            }
        }

        if (agent_id) param.push("agent_id=" + agent_id);
        param.push("grant_type=0");

        //        uri += '?' + + param.join('&');

        if (param.length > 1) {
            uri += '?' + param.join('&');
        } else if (param.length == 1) {
            uri += '?' + param[0];
        }

        Util.ajax_json_get(uri, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    //根据授权操作人id查询授权列表
    exports.list_by_operator = function(func, operatorId, grant_type, page) {
        var uri = URL_PREFIX + "/list_by_operator?operator=" + operatorId;
        uri += '&grant_type=' + grant_type;
        uri += '&page_num=' + (page + 1);
        Util.ajax_json_get(uri, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    //根据授权路径查询授权列表
    exports.list_by_resource = function(func, path, path_type, prefix_neid) {
        var uri = URL_PREFIX + "/list_by_resource" + path;
        if (path_type) {
            uri += "?path_type=" + path_type;
        }
        if (prefix_neid) {
            uri += "?prefix_neid=" + prefix_neid;
        }
        Util.ajax_json_get(uri, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    //根据团队id查询所有子级授权列表
    exports.list_subset_resource = function(func, team_id) {
        var uri = URL_PREFIX + "/list_subset_resource?team_id=" + team_id;
        Util.ajax_json_get(uri, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    exports.getContextAction = function(actionObj) {
        var action;
        /*产品逻辑有问题*/
        if (ACTION.LIST in actionObj) {
            action = ACTION.LIST;
        } else if (ACTION.PREVIEW in actionObj) {
            action = ACTION.PREVIEW;
        } else if (ACTION.UPLOAD in actionObj) {
            action = ACTION.UPLOAD;
        } else if (ACTION.DOWNLOAD in actionObj) {
            action = ACTION.DOWNLOAD;
        } else if (ACTION["UPLOAD:DELIVERY"] in actionObj) {
            action = ACTION["UPLOAD:DELIVERY"].replace(/:/g, "-");
        } else if (ACTION["DOWNLOAD:DELIVERY"] in actionObj) {
            action = ACTION["DOWNLOAD:DELIVERY"].replace(/:/g, "-");
        } else if (ACTION["UPLOAD:DOWNLOAD:DELIVERY"] in actionObj) {
            action = ACTION["UPLOAD:DOWNLOAD:DELIVERY"].replace(/:/g, "-");
        } else if (ACTION["UPLOAD:DOWNLOAD"] in actionObj) {
            action = ACTION["UPLOAD:DOWNLOAD"].replace(/:/g, "-");
        } else if (ACTION.EDIT in actionObj) {
            action = ACTION.EDIT;
        }
        return action;
    }

    exports.getAuthTitle = function(item) {
        if (item) {
            var pair = AUTH_CATEGORY[item.toString().toUpperCase()];
            if (pair) {
                return pair.item_title;
            } else {
                return "";
            }
        }
    }

    exports.getAuthPair = function(item) {
        if (item) {
            return AUTH_CATEGORY[item.toString().toUpperCase()];
        }
    };
    /*
     * 批量授权  新增 多级权限授权
     * @func 回调函数
     * @user_auth_list 用户授权列表
     * 2014-08-05 14:24
     */
    exports.batch_set = function(func, user_auth_list) {
        var uri = URL_PREFIX + '/auth/batch_set';
        var post_data = user_auth_list;
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };
    /**
     * 移交授权
     * @param func
     * @param path
     * @param id
     */
    exports.auth_transfer = function(func, from, fromname, to) {
        var uri = URL_PREFIX + "/transfer";
        var post_data = { from: from, frompath: fromname, to: to };
        Util.ajax_json_post(uri, post_data, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    }
    exports.list_by_batch_resource = function(func, paths, grant_type) {
        var uri = URL_PREFIX + "/list_by_batch_resource?entry_infos=" + paths + "&grant_type=" + grant_type + "&agent_type=user";
        Util.ajax_json_get_nowait(uri, function(xhr, textStatus) {
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    }
});
