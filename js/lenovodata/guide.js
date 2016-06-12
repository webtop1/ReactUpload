define('lenovodata/guide', function(require, exports, module){
    var $ = require('jquery'),
        Util = require('util'),
        GuideModel = require('model/GuideManager');
    
    require('i18n');
    var _ = $.i18n.prop;

    exports.guide = function(){
        if(!this.isDone() && Util.isAdmin()){
            doGuide();
        }
    };

    exports.isDone= function() {
        return window.LenovoData.user.first_login === "false";
    }

    function doGuide(){
        var all = $('<div id="mask-div"></div><div id="mask-divContainer"><img id="guideImg"/><br><br><a class="skip"></a><a class="next"></a><a class="start"></a></div><div id="guide-indicator"></div>');
        all.appendTo($('body'));

        var container = $('#mask-divContainer'),
            indicator =$('#guide-indicator'),
            img = container.find('#guideImg'),
            skip = container.find('.skip'),
            start = container.find('.start'),
            next = container.find('.next');

        next.on('click', function(e){
            fsm.next();
        });
        start.on('click', function(e){
            GuideModel.guideDone(function(result){
                if(result.code == 200){
                    location.href = "/";
                }
            });
        });
        skip.on('click', function(){
            location.href = "/";
        });
        //根据窗口变化自适应，更改新手任务上的图片位置
        window.onresize = function(){
        	//如果body的width 大于 width，会有滚动条的偏移，进行修正。
            if ($(document.body).width() - $(window).width() >= 0) {
                fsm.delta = 18;
            }

            //解决IE7的滚动条bug
            var isIE7 = navigator.userAgent.indexOf("IE 7.0") != -1?true:false;
            if (isIE7 && fsm.delta == 0) {
                fsm.delta = 18;
            }
            fsm.render();
        }
        var fsm = {
            state: 1,
            delta:0,
            delta2:18,
            next: function(){
                if(this.state<4){
                    this.state++;
                    this.render();
                }
            },
            naviagte: function(index){
                this.state = state;
                this.render();
            },
            render: function(){
            	var uploadBtnLeft = $(".upload").offset().left;
                var addfolderBtnLeft = $(".addfolder").offset().left;
                var settingBtnLeft = $(".i-user9").offset().left;
                var delta = this.delta;
                var delta2 = this.delta2;
                var position = {
                    '1': {left:uploadBtnLeft - 293 - delta, top: 117},
                    '2': {left:addfolderBtnLeft - 407 - delta2, top: 11},
                    '3': {left:19, top: 113}
                };
                var self = this;

                if(self.state == 3){
                    start.css('display', 'inline-block');
                    next.remove();
                    skip.remove();
                }else if(self.state > 1){
                    skip.remove();
                }
                var url = 'css/theme/default/img/guide_'+ self.state+ '.png';
                preLoadImage(url, function(uri, w, h){
                    img.attr('src', uri);
                    var pos = position[self.state];
                    container.width(w);
                    container.height(h+70);
                    container.css(pos);
                });

                var indi = [];
                for(var i=1; i<4; i++){
                    if(i==self.state){
                        indi.push('<span class="active">&bull;</span>');
                    }else{
                        indi.push('<span>&bull;</span>');
                    }
                }
                indicator.empty().html(indi.join(''));
            }
        };

        fsm.render();

        function preLoadImage(url, callback){
            var img = new Image();
            img.src = url;
            if (img.complete) {
                    callback(url, img.width, img.height);
            } else {
                img.onload = function () {
                    callback(url, img.width, img.height);
                    img.onload = null;
                };
            }
        }
    }

});
