;define('component/roleCombox', function(require, exports, module){
	var $ = require('jquery');
	require('i18n');
	var	_ = $.i18n.prop;

    var ROLE_CATEGORY = {
        MEMBER: {item_title: _("团队成员"), item_value: "member"},
        ADMIN: {item_title: _("团队管理员"), item_value: "admin"}
    }

    function RoleCombox(container, role_category, _callback,_selectCallback) {
		this.container = $.type(container) == 'string' ? $(container) : container;
        this.item_title = role_category ? role_category.item_title : ROLE_CATEGORY.MEMBER.item_title;
        this.item_value = role_category ? role_category.item_value: ROLE_CATEGORY.MEMBER.item_value;
        this._callback = _callback;
        this._selectCallback=_selectCallback;
        this.currentItem= null;
        this.isChanged = false;
        this._init();
    }

    RoleCombox.ROLE_CATEGORY = ROLE_CATEGORY;

    RoleCombox.getRolePair = function(item) {
        if (item) {
           return ROLE_CATEGORY[item.toString().toUpperCase()];
        }
    }

	$.extend(RoleCombox.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;
            var comboxId = "combox-" + Math.ceil((Math.random()*100000000000));
            var comboxIdforJq = "#" + comboxId;
            
            var htmlArr = [];
            htmlArr.push('<div id="' + comboxId + '" class="ld-combox">');
                htmlArr.push('<div><span class="curtext" act="' + self.item_value + '">' + self.item_title + '</span><span class="icon i-expand arrow"></span></div>');
                htmlArr.push('<ul>');
                    for (var key in ROLE_CATEGORY) {
                    htmlArr.push('<li act="' + ROLE_CATEGORY[key].item_value + '">' + ROLE_CATEGORY[key].item_title + '</li>');
                    }
                htmlArr.push('</ul>');
            htmlArr.push('</div>');

            self.container.append(htmlArr.join(''));

            $(comboxIdforJq).mouseleave(function(e){
            	$(comboxIdforJq).css("position","");
                $(e.currentTarget).find("ul").hide();
            });

            $(comboxIdforJq).click(function(e){
                var ul = $(e.currentTarget).find("ul");
                if (ul.css("display") == "none") {
                    ul.css("position", "absolute");
                    ul.css("background", "#FFF");
                    ul.css("left", "-1px");
                    $(comboxIdforJq).css("position", "relative");
                    ul.show();
                } else {
                    ul.css("position", "");
                    ul.css("background", "#FFF");
                    $(comboxIdforJq).css("position", "");
                    ul.hide();
                }
            });

            $(comboxIdforJq + " ul li").click(function(e){
                var item = $(e.currentTarget).attr("act");
                var index = $(e.target).parent().parent().parent().attr("index");
                var text = $(e.currentTarget).html();
                if(self._selectCallback && (self._selectCallback(item))){
                    var $span= $(comboxIdforJq + " span").eq(0);
                    $span.text(text);
                    $span.attr("act", item);
                    self.currentItem = item;
                    self.isChanged = self.item_value == item?false:true;
                }
                self._callback && (self._callback(item,index,self.isChanged));
            });
        },
        getSelectItem: function() {
            var self = this;
            return self.currentItem;
        }
    });

    return RoleCombox;
});
