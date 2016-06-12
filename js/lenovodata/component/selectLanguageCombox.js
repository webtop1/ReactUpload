;define('component/selectLanguageCombox', function(require, exports, module){
	var $ = require('jquery');
    require('mustache');
	require('i18n');
	var	_ = $.i18n.prop;

    var language = { 
        zh: {url: "/language/set/zh", cls: "i-chinese", title:"简体中文"}
      , en: {url: "/language/set/en", cls: "i-english", title: "English"}};

    function SelectLanguageCombox(container, lang,_callback) {
		this.container = $.type(container) == 'string' ? $(container) : container;
        this._callback = _callback;
        this.lang = lang;
        this._init();
    }

	$.extend(SelectLanguageCombox.prototype, {
        _init: function() {
            var self = this;

//          var languageT = '<div style="cursor:pointer"><span class="icon {{cls}}"></span><span>{{title}}</span><span class="icon i-dropdown"></span></div>';
            var languageT = '<div class="cur" style="cursor:pointer"><span class="lang">{{title}}</span><span class="icon i-dropdown"></span></div>';
            var output = Mustache.render(languageT, language[self.lang]); 

            var languageT1  = '<ul>'
                +'<li><span class="zh"><a onclick="setLanguage();" href="{{zh.url}}">{{zh.title}}</a></span></li>'
                +'<li><span class="en"><a onclick="setLanguage();" href="{{en.url}}">{{en.title}}</a></span></li>'
            +'</ul>';
            output += Mustache.render(languageT1, language); 

            self.container.append(output);

            self.container.mouseover(function(e){
                var ul = $(e.currentTarget).find("ul");
                if (ul.css("display") == "none") {
                    self.container.css("position", "relative");
                    ul.show();
                }
            });

            self.container.mouseout(function(e){
                $(e.currentTarget).find("ul").hide();
            });
        }
    });
    return SelectLanguageCombox;
});
