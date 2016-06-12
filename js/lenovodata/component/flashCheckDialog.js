;define('component/flashCheckDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog');
	require('i18n');
	var	_ = $.i18n.prop;
    function flashCheckDialog() {
    }
	$.extend(flashCheckDialog.prototype, {
        checkFlash:function(){
        	var hasFlash=0; //是否安装了flash
			var flashVersion=0;   //flash版本
			try{
				if(document.all){
					var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash'); 
					if(swf) {
						hasFlash=1;
					}
				}else{
					if (navigator.plugins && navigator.plugins.length > 0){
						var swf=navigator.plugins["Shockwave Flash"];
						if (swf){
							hasFlash=1;
						}
					}
				}
			}catch(ex){hasFlash=0;}
			if(hasFlash == 0){this.unFlashEvent();}
			if(document.getElementById("upload_button")){
	       		$(window).resize(function(){
	       			$(".uploadButton").css("left",Util.getElementXPos(document.getElementById("upload_button"))).show();
	       		});
	       		$(".uploadButton").css("left",Util.getElementXPos(document.getElementById("upload_button"))).show();
       		}
			return hasFlash == 1 ? true : false;
       },
       unFlashEvent:function(){
       		var self = this;
       		
       		$(".uploadButton").unbind('click').click(function(){
       			self.show();
       		});
       		$("#uploadButton").unbind('click').click(function(){
       			self.show();
       		});
       		$("body").undelegate('#delivery-copy','click').delegate('#delivery-copy','click',function(){
       			self.show();
       		});
       		$('.uploadButton2').unbind('click').click(function(){
       			self.show();
       		});
       },
       show:function(){
       		var dialog = new Dialog(_('提示'), {mask: true,minWidth:500}, function(dialog){
            	dialog.append('<div class="lui-alertDialog" style="width:500px"><div class="cell2"><div class="cell1"></div>要使用该功能，您需要安装Flash插件, 猛击<a target="_blank" style="color:#2A7EF9;" href="http://get.adobe.com/cn/flashplayer/">这里</a>安装</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel cancel">' + _('关闭') + '</a></div>');
       		});
            $('.confirm-cancel').click(function(){
                dialog.close();
            });
       }
    });
    return new flashCheckDialog();
});
