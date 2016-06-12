/**
 * @�ļ���ǩ
 * @author thliu-pc
 * @version 3.4.1.0
 * @updateDate 2015/11/18
 */
;define("module/label/src/label_main",function(require,exports,module){

    require("module/label/css/label.css");

    function labelMain(options){
        for(var o in options){
            this[o]=options[o];
        }
    }
    labelMain.prototype={
        init:function(){
            var self=this;
            this.render(function(){
                if(!self.$label_add_wrapper){
                    self.$label_add_wrapper=$("#label_add_wrapper");
                }
                self.events();
            });
        },
        events:function(){
            var self=this;
            //��ӱ�ǩ
            self.$label_add_input=$("#label_add_input");
            self.$label_add_input.keydown(function(e){
                self.addLabel(e);
            })
            //�Ƴ���ǩ
            self.$label_add_wrapper.delegate('i','click',function(){
               self.removeLabel(this);
            })

        },
        /**
         *
         * @param afterRender ��Ⱦ֮��
         */
        render:function(afterRender){
            this.wrapper.load(g_origin+'/js/module/label/label_main.html',function(){
                afterRender&&afterRender.call();
            })
        },
        /**
         * ��ӱ�ǩ
         * @param event
         */
        addLabel:function(event){
            var self=this;
            if(event.keyCode==13){
                var $span=$("<span>");
                $span.append(self.$label_add_input.val());
                $span.append("<i></i>");
                self.$label_add_wrapper.append($span);
                self.$label_add_input.val("")
            }
        },
        /**
         * �Ƴ���ǩ
         * @param obj
         */
        removeLabel:function(obj){
            $(obj).parent().remove();
        },
        onResize:function(){

        }
    };
    module.exports=labelMain;
});