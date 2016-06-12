;define('component/authList', function(require, exports, module){
	var $ = require('jquery'),
	Util = require('util'),
	ConfirmDialog = require('component/confirmDialog'),
	AuthModel = require('model/AuthManager'),
	Tips = require('component/tips'),
	AuthCombox = require('component/authCombox');
	require('i18n');
	var	_ = $.i18n.prop;

    function AuthList(container, uids, data, delete_cb, combox_cb,combox_selectCallback) {
		this.container = $.type(container) == 'string' ? $(container) : container;
        this.data = data;
        this.uids = uids;
        this.isListNull = true;
        this.delete_cb = delete_cb;
        this.combox_cb = combox_cb;
        this.combox_selectCallback=combox_selectCallback;
        this._init();
    }

	$.extend(AuthList.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;
            self.authlistid = "authlist-" + Math.ceil(Math.random()*10000000000);


            var htmlArr = [];
            htmlArr.push('<div class="auth-list-container">');
                htmlArr.push('<div class="auth-list-header">');
                    htmlArr.push('<span class="auth-list-header-col1">' + _("文件夹") + '</span>');
                    htmlArr.push('<span class="auth-list-header-col2">' + _("权限") + '</span>');
                htmlArr.push('</div>');
                htmlArr.push('<div class="auth-list-item-container lui-auth-list" id="' + self.authlistid + '">');
                htmlArr.push('</div>');
            htmlArr.push('</div>');
            self.container.html('');
            self.container.append(htmlArr.join(''));
            self._renderList();
            $('.auth-list-container').delegate('.i-delete', 'click' , function(e) {
                var authid = $(e.currentTarget).attr("authid");
                self.delete_cb && (self.delete_cb(e, authid));
            });
        },
        _genAuthItem: function(auth, i) {
            var self = this;
            var authHtml = [];
            authHtml.push('<div class="auth-list-item">');
                authHtml.push('<span class="icon i-folder1"></span>');
                authHtml.push('<span class="auth-list-item-col1" title="'+auth.path+'">' +auth.path + '</span>');
                authHtml.push('<span class="auth-list-item-col2"">');
                authHtml.push('<a class="icon i-delete" authid="' + auth.id + '"></a></span>');
                authHtml.push('<span id="authcombox' + i +  '" index="'+i+'" class="auth-list-item-col3"></span>');
            authHtml.push('</div>');

            return authHtml.join('');
        },
        _bindAuthItemEvent: function(auth, i) {
            var self = this;
            new AuthCombox("#authcombox" + i, AuthModel.getAuthPair(auth.privilege_name), null, function(role,index,isChanged) {
                self.combox_cb && (self.combox_cb(auth, role,index,isChanged));
            },function(dataItem, role){return self.combox_selectCallback&&self.combox_selectCallback(dataItem,role)});
        },
        _processData: function(auth) {
            var self = this;
            var isExists = false;
            for(var i=0, len=self.data.length; i<len; i++) {
                if (self.data[i].path == auth.path) {
                    self.data[i].action = auth.action;
                    isExists = true;
                    break;
                }
            }

            if (!isExists) {
               self.data.push(auth);
            }
        },
        _renderList: function() {
            var self = this;
            $('#' + self.authlistid).empty();
            for(var i=0, len=self.data.length; i<len; i++) {
                if(!self.data[i].isDelete){
                    var html = self._genAuthItem(self.data[i], i);
                    $('#' + self.authlistid).append(html);
                    self._bindAuthItemEvent(self.data[i], i);
                    self.isListNull = false;
                }
            }

            if(self.isListNull){
                $('#' + self.authlistid).append("<p style='text-align:center;line-height:200px;'>"+_("没有任何授权")+"</p>");
            }

        },
        appendAuthItem: function(auth) {
            var self = this;
            self._processData(auth);
            self._renderList();
        },
        beforeAuthItem: function(auth, i) {
            var self = this;
            self._processData(auth);
            self._renderList();
        }
    });
    return AuthList;
});
