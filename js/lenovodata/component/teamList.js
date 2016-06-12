;define('component/teamList', function(require, exports, module){
	var $ = require('jquery'),
	TeamModel = require('model/TeamManager'),
	RoleCombox = require('component/roleCombox');
	require('i18n');
	var	_ = $.i18n.prop;

    function TeamList(container, uid, data, delete_cb, combox_cb,combox_selectCallback) {
		this.container = $.type(container) == 'string' ? $(container) : container;
        //var data = [{"name": "开发部", "role": "member", dataid="1"}, {"name": "市场部", "role": "admin", dataid="2"}]
        this.data = data;
        this.uid = uid;
        this.isListNull = true;
        this.delete_cb = delete_cb;
        this.combox_cb = combox_cb;
        this.combox_selectCallback=combox_selectCallback;
        this._init();
    }

	$.extend(TeamList.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;
            self.rolelistid = "rolelist-" + Math.ceil(Math.random()*10000000000);

            
            var htmlArr = [];
            htmlArr.push('<div class="team-list-container">');
                htmlArr.push('<div class="team-list-list-header">');
                    htmlArr.push('<span class="col1">' + _("名称") + '</span>');
                    htmlArr.push('<span class="col2">' + _("角色") + '</span>');
                htmlArr.push('</div>');
                htmlArr.push('<div id="' + self.rolelistid  + '" class="team-list-container1">');
                htmlArr.push('</div>');
            htmlArr.push('</div>');
            self.container.html('');
            self.container.append(htmlArr.join(''));
            for (var i=0, len=self.data.length; i<len; i++) {
                if(!self.data[i].isDelete){
                    self.appendRoleItem(self.data[i],i);
                    self.isListNull = false;
                }
            }
            if(self.isListNull){
                $('#' + self.rolelistid).append("<p style='text-align:center;line-height:250px;'>"+_("没有加入任何团队")+"</p>");
            }

            $('.team-list-container').delegate('.i-delete', 'click' , function(e) {
                var dataid = $(e.currentTarget).attr("dataid");
                self.delete_cb && (self.delete_cb(e, dataid, [self.uid]));
            });
        },
        _genRoleItem: function(dataItem, i,index) {
            var self = this;
            var htmlArr = [];
            htmlArr.push('<div class="team-list-list-item-container clearfix">');
                htmlArr.push('<span class="col1">');
                    htmlArr.push('<span class="icon i-user6"></span> ');
                    htmlArr.push('<span title="'+ dataItem.path.substring(1)+'">' + dataItem.name + '</span>');
                htmlArr.push('</span>');
                if(Util.isBusiness()||window.LenovoData.user["teamAdmin"][dataItem.dataid]){
                    htmlArr.push('<span class="col3"><a class="icon i-delete" dataid="' + dataItem.dataid + '"></a></span>');
                }else{
                    htmlArr.push('<span class="col3"><a class="icon i-nodelete" dataid="' + dataItem.dataid + '"></a></span>');
                }
                htmlArr.push('<span class="col2" id="rolecombox-' + i + '" index="'+index+'"></span>');
            htmlArr.push('</div>');
            return htmlArr.join('');
        },
        _bindRoleItemEvent: function(dataItem, i) {
            var self = this;
            new RoleCombox("#rolecombox-" + i, RoleCombox.getRolePair(dataItem.role), function(role,index,isChanged) {
                self.combox_cb && (self.combox_cb(dataItem, role,index,isChanged));
            },function(dataItem, role){return self.combox_selectCallback&&self.combox_selectCallback(dataItem,role)});
        },
        appendRoleItem: function(dataItem,index) {
            var self = this;
            var i = Math.ceil(Math.random()*10000000000);
            var html = self._genRoleItem(dataItem, i,index);
            $('#' + self.rolelistid).append(html);
            
            self._bindRoleItemEvent(dataItem, i);

        },
        beforeRoleItem: function(dataItem, i) {
            var self = this;
            var i = Math.ceil(Math.random()*10000000000);
            var html = self._genRoleItem(dataItem, i);
            $('#' + self.rolelistid).before(html);
            self._bindRoleItemEvent(dataItem, i);
        },

    });
    return TeamList;
});
