;define('component/authCombox', function(require, exports, module){
	var $ = require('jquery'),
	    Util = require('util'),
        Combox = require('component/combox'),
        AuthModel = require('model/AuthManager');
	require('i18n');
	var	_ = $.i18n.prop;

    var AUTH_CATEGORY = AuthModel.AUTH_CATEGORY;

    function AuthCombox(container, auth_category, data, _callback,_selectCallback) {
		this.container = $.type(container) == 'string' ? $(container) : container;
        this.item_title = auth_category ? auth_category.item_title : AUTH_CATEGORY.PREVIEW.item_title;
        this.item_value = auth_category ? auth_category.item_value: AUTH_CATEGORY.PREVIEW.item_value;
        this._callback = _callback;
        this._selectCallback=_selectCallback;
        this.data = data;
        this.isChanged = false;
        this.currentItem= null;
        this._init();
    }

    AuthCombox.AUTH_CATEGORY = AUTH_CATEGORY;

	$.extend(AuthCombox.prototype, {
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
                    for (var key in AUTH_CATEGORY) {
                        //权限下拉框不显示无
                        if(key !="LIST"){
                            htmlArr.push('<li act="' + AUTH_CATEGORY[key].item_value + '">' + AUTH_CATEGORY[key].item_title + '</li>');
                        }
                    }
                htmlArr.push('</ul>');
            htmlArr.push('</div>');

            self.container.append(htmlArr.join(''));

            $(comboxIdforJq).mouseleave(function(e){
            	 $(this).find("ul").hide();
            });
            $(comboxIdforJq).find("ul").mouseleave(function(e){
                $(e.currentTarget).hide();
            });

            $(comboxIdforJq).click(function(e){
                var ul = $(e.currentTarget).find("ul");
                if (ul.css("display") == "none") {
                    
                    var height_ul = ul.height();
                    var ypos_ul = Util.getElementYPos(document.getElementById(comboxId))+22;
                    var xpos_ul = Util.getElementXPos(document.getElementById(comboxId))+1;
                    var pageHeight = Util.getTotalHeight(); 
                    var scrollHeight = $('.lui-auth-list').scrollTop();
                    //$(comboxIdforJq).css("position", "relative");
                    ul.css({position: "fixed", "background": "#FFF", left:xpos_ul, top:ypos_ul-scrollHeight,width:$(this).width()});
                    if((height_ul+ypos_ul-scrollHeight)>pageHeight){
                    	ul.css({top:ypos_ul-scrollHeight-height_ul});
                    }
                    ul.show();
                } else {
                    ul.removeAttr("position");
                    ul.css("background", "#FFF");
                    $(comboxIdforJq).removeAttr("position");
                    ul.hide();
                }
            });

            $(comboxIdforJq + " ul li").click(function(e){
                    var item = $(e.currentTarget).attr("act");
                    var index = $(e.target).parent().parent().parent().attr("index");
                    var text = $(e.currentTarget).html();
                    if(self._selectCallback && (self._selectCallback(item))){
                        $(comboxIdforJq).find(".curtext").html(text);
                        $(comboxIdforJq).find(".curtext").attr("act", item);
                        self.currentItem = item;
                        self.isChanged = self.item_value == item?false:true;
                    }
                    self._callback && (self._callback(item,index,self.isChanged));
            });

            /*
            var inCombox = null;
            $(comboxIdforJq + " ul").mouseout(function(e){
                if (inCombox == null) {
                    inCombox = $(e.currentTarget).html();
                    return;
                } else if (inCombox != $(e.currentTarget).html()) {
                    $(e.currentTarget).hide();
                }
            });
            */

        },
        getSelectItem: function() {
            var self = this;
            return self.currentItem;
        }
    });
    return AuthCombox;
});
