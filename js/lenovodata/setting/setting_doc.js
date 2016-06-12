/**
 * Created by Administrator on 2015/11/25.
 * 文档设置
 */
;define(function(require,exports,module){
    var $ = require('jquery');
    var Util = require('lenovodata/util');
    var AccountManager = require('lenovodata/model/AccountManager');
    var Tips = require('component/tips');
    var i18n = require('i18n');
    var _ = $.i18n.prop;

    function DocSetting(options){

    };

    DocSetting.prototype = {
        init:function(){
            var self = this;
            self.render();
            self.events();//初始化事件
            self.getLimitConfig();
            //根据窗口变化自适应，更改布局
            window.onresize = function(){
                self.resize();
            }
        },
        //事件初始化
        events:function(){
            $(".doc_limit_flag").change(function(){
                $("#doc_version_submit").removeClass("button_submit_disabled");
                $("#doc_version_submit").addClass("button_submit");
                $("#doc_version_submit").removeAttr("disabled");
                $("#doc_version_cancel").show();
            });
            //提交
            $("#doc_version_submit").click(function(){
                var params = [{
                    config_type: 1,
                    config_id:Util.getAccountId(),
                    name: 'name_entry_version_limit_enable',//是否开启文件版本数限制
                    value: ($("#doc_number_limit").val()==""&&$("#doc_days_limit").val()=="")?false:true
                },{
                    config_type: 1,
                    config_id:Util.getAccountId(),
                    name: 'name_entry_version_limit_number',//文件版本个数限制
                    value: $("#doc_number_limit").val()
                }, {
                    config_type: 1,
                    config_id:Util.getAccountId(),
                    name: 'name_entry_version_limit_days',//文件版本天数限制
                    value: $("#doc_days_limit").val()
                }];
                Util.setNoticeConfig(params,function(ret){
                    if (ret.code == 200) {
                        Tips.show(_("设置成功"));
                        window.location.reload()
                    } else {
                        Tips.warn(ret.message);
                    }
                });
            });
            //取消
            $("#doc_version_cancel").click(function(){
                window.location.reload()
            });
        },
        //渲染
        render:function(){
            var maxh = Math.max($(window).height(), $(document.body).height());
            var h = maxh-$('#head').outerHeight()-$('#foot').outerHeight();
            var h2 = $('.page-body2').height();
            h>h2?h:h=h2;
            $('.page-body2').height(h);
            for(var i=30;i>0;i--){
                var opt = "<option  value='"+i+"'>"+i+"</option>";
                $("#doc_number_limit").append(opt);
            }

            for(var i=365;i>0;i--){
                var opt = "<option  value='"+i+"'>"+i+"</option>";
                $("#doc_days_limit").append(opt);
            }

        },
        //获取当前的限制，如果为空则显示默认
        getLimitConfig:function(){
            //获取文件版本个数限制
            AccountManager.get_notice_config(function(ret){
                if (ret.code == 200) {
                    if(ret.data.length>0){
                        $("#doc_number_limit").val(ret.data[0].value);
                    }
                }else{
                    Tips.warn(ret.message);
                }
            },"1","name_entry_version_limit_number",Util.getAccountId());
            //获取文件版本天数限制
            AccountManager.get_notice_config(function(ret){
                if (ret.code == 200) {
                    if(ret.data.length>0){
                        $("#doc_days_limit").val(ret.data[0].value);
                    }
                }else{
                    Tips.warn(ret.message);
                }
            },"1","name_entry_version_limit_days",Util.getAccountId());
        },

        //页面自适应
        resize:function(){

        },
        //析构函数，资源回收
        destory:function(){

        }

    }
    module.exports=DocSetting;
});