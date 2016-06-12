/**
 * @fileOverview 外链设置
 * @author thliu
 * @version 3.4.1.0
 * @updateDate 2015/8/7
 */
;define("js/module/link/src/link_main",function(require,exports,module){
    //依赖
    require("css/theme/default/calendar.css");
    require("js/module/link/css/link.css");
    var underscore =require("underscore");
    var share= require("js/module/link/src/link_share");
    var mail=require("js/module/link/src/link_mail");
    //dom
    var $link_tab={};
    var $link_body_wrapper={};

    function linkMain(options){
        this.options=options;
        this.baseurl=options.baseurl;
        this.wrapper=options.wrapper;
    };

    linkMain.prototype = {
        init:function(){
            var self=this;
            this.wrapper.load(g_origin+'/js/module/link/link_main.html?'+new Date().getTime(),function(){
                self.render();
                self.share=new share(self.options);
                self.share.init();
                self.events();
            });
        },
        events:function(){
            var self=this;
            $link_tab.delegate('li','click',function(){
                self.setTab(this);
                if($(this).index()==1){
                    self.share.saveLinkSet();
                	new mail(self).init();
                }
            });
        },
        render:function(){
            this.wrapper.parent().find(".title-wraper").css({border:"none"});
            $link_tab=$("#link_tab");
            $link_body_wrapper=$("#link_body_wrapper");
            var tmp=underscore.template($("#link_tmp_tab").html());
            $link_tab.html(tmp());
        },

        //tab标签
        setTab:function(e){
            var $this= $(e);
            $this.parent().find("li").removeClass("link_selected");
            $this.addClass("link_selected");
            $link_body_wrapper.find(".link_content").hide().eq($this.index()).show();
        },
        //析构函数，资源回收
        destory:function(){
            this.share.destory();
        }
        
    }
    module.exports=linkMain;
});
