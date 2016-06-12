;define('component/sLanguageBox', function(require, exports, module){
	var $ = require('jquery'),Util = require("util");
    require('mustache');
	require('i18n');
	var	_ = $.i18n.prop;
    var language = { 
        zh: {url: "/language/set/zh", cls: "i-chinese", title:"简体中文"}
      , en: {url: "/language/set/en", cls: "i-english", title: "English"}};

    function SLanguageBox(container, lang,_callback) {
		this.container = $.type(container) == 'string' ? $(container) : container;
        this._callback = _callback;
        this.lang = lang;
        this._init();
    }
	$.extend(SLanguageBox.prototype, {
        _init: function() {
            var self = this;
            var languageT1  ='<span class="zh"><a  href="{{zh.url}}">{{zh.title}}</a></span>'
                +'<span class="en"><a  href="{{en.url}}">{{en.title}}</a></span>';
            var output = Mustache.render(languageT1,  language); 
            self.container.append(output);
            self.container.find("a").on("click", function(){
    	         Util.sendDirectlyRequest("多语言","切换语言","-");
            });
        }
    });
    return SLanguageBox;
});
