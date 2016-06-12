;define('component/dialog', function(require, exports){

    var $= require('jquery'),
        EventTarget = require('eventTarget');

    if(!window.uuid){
        window.uuid = {};
        window.uuid['z-index'] = 50;
    }
    if(!window.maskid){
        window.maskid = {};
        window.maskid['z-index'] = 40;
    }
    function Dialog(title, config, func){
        var fn, cfg;
        if(arguments.length == 2){
            cfg={};
            fn=arguments[1];
        }else{
            cfg=arguments[1];
            fn=arguments[2];
        }
        var DEFAULT = {
            mask: true,
            control: false
        };
        this.cfg = $.extend(DEFAULT, cfg);

        var id="dialog-"+parseInt(Math.random()*10000);
        var uiDialog = $('<div class="lui-dialog" id="'+id+'"></div>'),
            titleEle = $('<div class="title-wraper"><span class="title"></span></div>'),
            oper= $('<span class="oper"><a class="icon i-close"></a></span>'),
            msgArea = $('<div class="content-msgArea"></div>'),
            content = $('<div class="content-wraper"></div>'),
            mask = $('<div class="lui-mask"></div>'),
            uiDialogMin = $('<div class="lui-min-dialog"><span class="min-dialog-wraper"></span><span class="recover"><span class="icon i-max"></span></span></div>');

        this.dialog = uiDialog;
        this.mask = mask;

        titleEle.find('.title').text(title)
        uiDialog.append(titleEle);
        uiDialog.append(msgArea);
        uiDialog.append(content);
        titleEle.append(oper);
        if(this.cfg.control){
            oper.prepend('<a class="icon i-min"></a>');
        }
        if(this.cfg.mask){
             mask.appendTo($('body'));
        }
        if(this.cfg.minWidth) {
        	uiDialog.css('width',this.cfg.minWidth);
        }
        if(this.cfg.minHeight){
            uiDialog.css('height',this.cfg.minHeight);
        }
        if(this.cfg.conPadding){
        	uiDialog.find('.content-wraper').css('padding',this.cfg.conPadding);
        }
        uiDialog.appendTo($('body')).fadeIn(1000);

		function Dialog( dragId , moveId ){
            var mousePos = {x:0,y:0};
			var instace = {} ;
            var $dialog=$("#"+id);
			instace.dragElement  =$dialog.find(".title-wraper");	//	允许执行 拖拽操作 的元素
			instace.moveElement  = $dialog;	//	拖拽操作时，移动的元素
			instace.mouseOffsetLeft = 0;			//	拖拽操作时，移动元素的起始 X 点
			instace.mouseOffsetTop = 0;			//	拖拽操作时，移动元素的起始 Y 点
			instace.dragElement.bind('mousedown',function(e){
				var e = e || window.event;
				var target = $(e.target);
				if(target.hasClass('i-close')) {
					self.fire("tclose");
            		self.close();
            		return;
				}
				e.preventDefault();
				instace.mouseOffsetLeft = e.pageX - instace.moveElement.offset().left;
				instace.mouseOffsetTop  = e.pageY - instace.moveElement.offset().top ;
                instace.dragElement.bind('mousemove',function(e){
                    startDrag(e);
                });
				return false;
			});

            instace.dragElement.bind('mouseup',function(e){
                endDrag(e);
            });

            function startDrag (e){
                var e = window.event || e;
                mousePos.x = e.clientX;
                mousePos.y = e.clientY;
                var maxX = $(window).width() -  instace.moveElement.width();
                var maxY = $(window).height() - instace.moveElement.height();
                if(window.console){
                    console.log("maxX:"+maxX+" maxY:"+maxY);
                }
                instace.moveElement.css({left:Math.min( Math.max( ( mousePos.x - instace.mouseOffsetLeft) , 0 ) , maxX),top:Math.min( Math.max( ( mousePos.y - instace.mouseOffsetTop ) , 0 ) , maxY)});
            }

            function endDrag(e){
                instace.dragElement.unbind('mousemove');
            }
			return instace;
		}

        var self = this;
        $('body').on('keydown', function(e){
            if(e.keyCode == 27){
                self.close();
            }
        });

        fn(content, function(){
            setPos();
        });

        setPos();
		
		//拖拽元素
		Dialog();

		//	弹出框自动居中
        function setPos(){
            var host = $(window),
                w = host.width(),
                h = host.height(),
                tw = uiDialog.outerWidth(),
                th = uiDialog.outerHeight(),
                tleft, ttop;
            tleft = (w-tw)/2;
            ttop = (h-th)/2;
            titleEle.width(uiDialog.width()); //兼容IE7
            msgArea.width(uiDialog.width()); //兼容IE7
            uiDialog.css({left: tleft, top: ttop});
            if($('.lui-mask').length>0){
                uiDialog.css('z-index', window.uuid['z-index']);
                window.uuid['z-index']+=10;
                mask.css('z-index', window.maskid['z-index']);
                window.maskid['z-index']+=10;
            }
        }
        //	侦听浏览器窗口大小变化
		window.onresize = setPos;
		
        var self = this;
        oper.find('.i-min').on('click', function(){
            self.hide(true);
           
            var mind = $(uiDialogMin);
            mind.appendTo($('body')).fadeIn();
            var container = mind.find('.min-dialog-wraper');
            self.fire('min', container);

            self.minDialog = mind;

            mind.find('.i-max').on('click', function(){
                self.show();
            });

        });
        oper.find('.i-close').on('click', function(e){
        	self.fire("tclose");
            self.close();
        });
    }

    $.extend(Dialog.prototype, EventTarget, {
        hide: function(flag){
            var self = this;

            if(self.mask){
                self.mask.fadeOut(600);
            }
            if(self.dialog){
                if(flag){
                    self.dialog.css('visibility', 'hidden');
                    self.fire('hide');
                }else{
                    self.dialog.fadeOut(1000);
                }
            }
        },
        show: function(){
            var self = this;
            if(self.minDialog){
                self.minDialog.fadeOut(500, function(){
                    self.minDialog.remove();
                });
            }
            if(self.mask){
                self.mask.fadeIn(600);
            }
            if(self.dialog){
                var visi = self.dialog.css('visibility');
                if(visi == 'hidden'){
                    self.dialog.css('visibility', 'visible')
                }
                self.dialog.fadeIn(1000);
                self.fire('show');
            }
        },
        close: function(){
            var self = this;
            var bool = self.syncFire('close');
            if(bool) return;
            if (window.fileList) {
                window.fileList.reload();
            }
            if (window.listManager) {
                window.listManager.reload();
            }

            self.dialog.remove();

            if(self.mask){
                self.mask.fadeOut(800, function(){
                    self.mask.remove();
                });
            }
            $('body').off('keydown');
        },

        showMessage: function(msg){
            var self = this;
            self.dialog.find('.content-msgArea').html(msg).stop(false,true).slideDown('slow');
             var timer=setTimeout(function(){
            	self.dialog.find('.content-msgArea').empty().stop(false,true).slideUp('slow');
            },3000)           
        },

        clearMessage: function(msg){
            var self = this;
            self.dialog.find('.content-msgArea').empty().hide();
        }
    });

    return Dialog;
});
