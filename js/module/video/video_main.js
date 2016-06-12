/**
 * @fileOverview 音视屏预览
 * @author thliu-pc
 * @version 3.4.1.0
 * @updateDate 2015/9/16
 */
;
define('module/video/video_main', function (require, exports, module) {
    //依赖
    require('module/video/video-js.css');
    require('module/video/video');

    var videoMain = function (options) {
        this.options = options;
    };
    videoMain.prototype = {
        init: function () {
            this.render();
            this.events();
        },
        render: function () {
            var self=this;
            var html = [];
            var isAudio=this.isMp3=/\.mp3|wma/.test(this.options.url);
            if(isAudio){
                var height="30px";
                //ie10,ie9下存在显示问题，故特殊处理
                var browers=/(msie\s|trident.*rv:)([\w.]+)/.exec(navigator.userAgent.toLowerCase());
                if(browers&&browers[2]=="8.0"){
                    var swfUrl=location.protocol + "//" + location.host + "/js/module/video/audio-js.swf";
                    html.push('<a class="icon i-close close" title="' + _("关闭") + '"  style="position: absolute;top: 2px;right: 10px; cursor:pointer; z-index: 100;" ></a>');
                    html.push('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="200" height="20" id="module_audio">');
                    html.push('<param name="movie" value="'+swfUrl+'?mp3='+ this.options.url+'" /> ');
                    html.push('<param name="flashvars" value="autostart=1&autoreplay=1&amp;javascript=on">');
                    html.push('</object>');
                }
                else if(browers&&(browers[2]=="10.0"||browers[2]=="9.0")){
                    height="50px";
                    html.push('<a class="icon i-close close" title="' + _("关闭") + '"  style="position: absolute;top: 5px;right: 10px; cursor:pointer; z-index: 100;" ></a>');
                    html.push(' <audio lang="'+$.cookie('language')+'" id="module_video" class="video-js vjs-default-skin" controls autoplay="autoplay" style="width:300px; height:'+height+' "  src="' + this.options.url + '">');
                    html.push(' </audio>');
                }else　{
                    html.push('<a class="icon i-close close" title="' + _("关闭") + '"  style="position: absolute;top: 5px;right: 10px; cursor:pointer; z-index: 100;" ></a>');
                    html.push(' <audio id="module_video" class="video-js vjs-default-skin" controls autoplay="autoplay" style="width:300px; height:'+height+' "  src="' + this.options.url + '">');
                    html.push(' </audio>');
                }
            }else{
                html.push('<a class="icon i-close close" title="' + _("关闭") + '"  style="position: absolute;top: 10px;right: 10px; cursor:pointer; z-index: 100;" ></a>');
                _V_.options.flash.swf = location.protocol + "//" + location.host + "/js/module/video/video-js.swf";
                html.push('<video id="module_video" lang="'+$.cookie('language')+'" class="video-js vjs-default-skin" controls preload="none" width="640" height="400" data-setup="{}">');
                html.push(' <source src="' + this.options.url + '" type="video/mp4" />')
                html.push('</video>');
            }
            this.options.container.append(html.join(''));
            this.options.container.parent().find(".title-wraper").hide();
            this.options.container.css({"position": "relative"});
            if(isAudio){
               var timer = setTimeout(function(){
                    this.player= document.getElementById("module_audio");
                    if(this.player){
                        this.player.dewset(self.options.url);
                    }
                    clearTimeout(timer);
                },500);
            }else{
                this.player = _V_('module_video');
                var timer=setTimeout(function(){
                    self.player.play();
                    clearTimeout(timer);
                },500);
            }
        },
        events: function () {
            //自定义按钮关闭触发
            var self = this;
            this.options.container.find('.close').on('click', function () {
                self.options.container.parent().find(".i-close").trigger('click');
            });
            var $module_video = $('#module_video');
            //屏蔽右键
            $module_video.bind('contextmenu', function () {
                //return false;
            });
            //全屏
            $module_video.dblclick(function () {
                if (this.player.isFullScreen) {
                    this.player.cancelFullScreen();
                } else {
                    this.player.requestFullScreen();
                }

            });

        },
        destroy: function () {
            if(this.player){
                if(this.player.stop){
                    this.player.stop();
                }
                this.player.destroy();
            }
        }
    };
    module.exports = videoMain;
});
