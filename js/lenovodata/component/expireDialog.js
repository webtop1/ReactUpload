;define('component/expireDialog', function(require, exports){

    var $= require('jquery'),
        i18n = require("i18n"),
        EventTarget = require('eventTarget');
    var _ = $.i18n.prop; 
    if(!window.uuid){
        window.uuid = {};
        window.uuid['z-index'] = 50;
    }
    function ExpireDialog(){
        var uiDialog = $('<div class="lui-dialog expire-dialog"></div>'),
            oper= $('<span class="oper"><a class="expire-close"></a></span>'),
//          msgArea = $('<div class="content-msgArea"></div>'),
            content = $('<div class="content-wraper expire-wraper"></div>');

        this.dialog = uiDialog;
        //计算到期天数
        var account_info = window.LenovoData.user.account_info;

        function GetDateDiff(startDate,endDate){
            var startTime = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()).getTime();
            var endTime = new Date(Date.parse(endDate.substring(0,10).replace(/-/g,   "/"))).getTime();
            var dates = Math.abs((startTime - endTime))/(1000*60*60*24);
            return  dates;
        }
        if(!account_info.etime){
            return;
         }
        var expire_daynum = GetDateDiff(new Date() , account_info.etime);
        if(expire_daynum&&expire_daynum>5)return;
        var template = '<a target="_blank" href="https://yun.lenovo.com"><span>'+_('<i>◆升级</i>为正式版<br/><i>◆享受</i>专属企业服务<br/><i>◆</i>咨询热线：400-898-7968')+'</span></a>';
        content.append(template);
//      uiDialog.append(msgArea);
        uiDialog.append(content);

        //uiDialog.append(content);
        uiDialog.append(oper);
        uiDialog.appendTo($('body')).fadeIn(1000);

        var self = this;
        $('body').on('keydown', function(e){
            if(e.keyCode == 27){
                self.close();
            }
        });
        setPos();
        function setPos(){
//          msgArea.width(uiDialog.width()); //兼容IE7
            uiDialog.css({bottom:"0px",right:'0px'});
            //5秒之后消失
            setTimeout(function(){
            	self.dialog.fadeOut(1000);
            },5000);
        }

        var self = this;
        oper.find('.expire-close').on('click', function(){
            self.close();
        });
    }

    $.extend(ExpireDialog.prototype, EventTarget, {
        close: function(){
            var self = this;
            self.dialog.remove();
            $('body').off('keydown');
        }
    });

    return ExpireDialog;
});
