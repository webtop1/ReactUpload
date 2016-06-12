;define('touch/HammerCarousel', function(require, exports, module){
	var $=require('jquery');
	
	var ele;
    var paneIndex=0, pos, translate,cur;
    var initScale=1;
	var transform = {};
	var move_x=0;
	var move_y=0;
	var Max_X;
	var Max_Y;
	var oW=window.innerWidth;
	var oH=window.innerHeight;
	
    
    function dirProp(direction, hProp, vProp) {
        return (direction & Hammer.DIRECTION_ALL) ? hProp : vProp
    }
    function HammerCarousel(container, direction , icur) {
    	var self = this;
        self.container = container;
        self.direction = direction;
		ele = document.querySelector(".wrapper");
        self.panes = Array.prototype.slice.call(ele.children, 0);

        cur = icur;

        self.hammer = new Hammer.Manager(self.container);
        self.hammer.add(new Hammer.Pan({ direction: self.direction, threshold: 10 }));
        self.hammer.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([self.hammer.get('pan')]);
        self.hammer.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
        self.hammer.add(new Hammer.Tap({event: 'singletap'}));
        self.hammer.get('doubletap').recognizeWith('singletap');
        self.hammer.get('singletap').requireFailure('doubletap');
        self.hammer.on("panleft panright panend pancancel", Hammer.bindFn(self.onPan, self));
        self.hammer.on("panstart panmove panend transform", Hammer.bindFn(self.onPanMove, self));
        self.hammer.on("panend", Hammer.bindFn(self.onPanEnd, self));
        self.hammer.on("pinchstart pinchmove pinchend", Hammer.bindFn(self.onPinch, self));
        self.hammer.on("doubletap", Hammer.bindFn(self.onDoubleTap, self));
        self.hammer.on("singletap", Hammer.bindFn(self.onTap, self));
        

        self.init(cur);
        self.resetElement();
        
		window.onresize=function(){
			oW=window.innerWidth;
			oH=window.innerHeight;	
			self.resize(cur);
		}
    }

	$.extend(HammerCarousel.prototype, {
		init : function(showIndex){
			//默认
			var self = this; 
			if(paneIndex == self.panes.length){
	        	paneIndex = 0;
	        }
    		showIndex = Math.max(0, Math.min(showIndex, self.panes.length - 1));
    		pos = (oW / 100) * (((paneIndex - showIndex) * 100));
    		if(self.direction & Hammer.DIRECTION_ALL) {
                    translate = ['translate(' + pos + 'px, 0)',
                		'scale(1, 1)'];
                } else {
                    translate = ['translate( 0,' + pos + 'px)',
                		'scale(1, 1)'];
             }
             
             translate = translate.join(" ");
             self.panes[paneIndex].style.transform = translate;
	         self.panes[paneIndex].style.oTransform = translate;
	         self.panes[paneIndex].style.msTransform = translate;
	         self.panes[paneIndex].style.mozTransform = translate;
	         self.panes[paneIndex].style.webkitTransform = translate;
	         if(paneIndex == self.panes.length - 1){
	        	paneIndex = 0;
	         }else{
	         	paneIndex++;
	         }        	
        },
        resize:function(showIndex){
        	var self=this;
        	showIndex = Math.max(0, Math.min(showIndex, self.panes.length - 1));
        	pos = (oW / 100) * (((paneIndex - showIndex) * 100));
        	for (paneIndex = 0; paneIndex < self.panes.length; paneIndex++) {
                pos = (oW / 100) * (((paneIndex - showIndex) * 100));

                if(self.direction & Hammer.DIRECTION_ALL) {
                    translate = ['translate(' + pos + 'px, 0)',
                		'scale(1, 1)']
                } else {
                    translate = ['translate( 0,' + pos + 'px)',
                		'scale(1, 1)']
                }
                 translate = translate.join(" ");
                 self.panes[paneIndex].style.transform = translate;
		         self.panes[paneIndex].style.oTransform = translate;
		         self.panes[paneIndex].style.msTransform = translate;
		         self.panes[paneIndex].style.mozTransform = translate;
		         self.panes[paneIndex].style.webkitTransform = translate;
            }
        },
		show: function(showIndex, percent, animate ){
			var self=this;
            showIndex = Math.max(0, Math.min(showIndex, self.panes.length - 1));
            percent = percent || 0;
            var className = ele.className;
            if(animate) {
                if(className.indexOf('animate') === -1) {
                    className += ' animate';
                }
            } else {
                if(className.indexOf('animate') !== -1) {
                    className = className.replace('animate', '').trim();
                }
            }
			
			
            for (paneIndex = 0; paneIndex < self.panes.length; paneIndex++) {
                pos = (oW / 100) * (((paneIndex - showIndex) * 100) + percent);

                if(self.direction & Hammer.DIRECTION_ALL) {
                    translate = ['translate(' + pos + 'px, 0)',
                		'scale(1, 1)']
                } else {
                    translate = ['translate( 0,' + pos + 'px)',
                		'scale(1, 1)']
                }
                 translate = translate.join(" ");
                 self.panes[paneIndex].style.transform = translate;
		         self.panes[paneIndex].style.oTransform = translate;
		         self.panes[paneIndex].style.msTransform = translate;
		         self.panes[paneIndex].style.mozTransform = translate;
		         self.panes[paneIndex].style.webkitTransform = translate;
//		         self.panes[paneIndex].style.webkitTransition = '-webkit-transform 0.2s ease-out';
//		         if(showIndex ==0|| showIndex == self.panes.length -1){
//		         	self.panes[paneIndex].style.webkitTransition = '-webkit-transform 0s ease-out';
//		         }  
//		         if(paneIndex == self.panes.length - 1){
//		        	paneIndex = 0;
//		         }
            }
            var closeOpen=$('.imgHead').css('display');
			if(closeOpen == 'none'){
				$('.imgHead').slideDown(500);
			}
			self.resetElement();
            self.currentIndex = showIndex; 
        },
        onPan : function (ev) {
        	//左右滑动
        	var self=this;
        	if(transform.scale == 1){
        		ev.preventDefault();
                var delta = dirProp(self.direction, ev.deltaX, ev.deltaY);
                var percent = (100 / oW) * delta;
                var animate = false;

                if (ev.type == 'panend' || ev.type == 'pancancel') {
                    if (Math.abs(percent) > 20 && ev.type == 'panend') {
                        cur += (percent < 0) ? 1 : -1;
                    }
                    percent = 0;
                    animate = true;
                }
            	console.log(ev.type,percent,delta)                
                if(cur<0){
                	cur = self.panes.length -1;
                }else if(cur >self.panes.length -1){
                	cur = 0;
                }
            	$('#imgView .imgHead span i').text(cur+1);
            	self.show(cur, percent, animate);
            }
        },
		onPanMove :function(ev){
			//放大后拖拽
			var self = this;	
			if(transform.scale > 1){	
				switch(ev.type) {						
		            case 'panstart':
		            		move_x=transform.translate.x;
			            	move_y=transform.translate.y;
		                break;
		
		            case 'panmove':
						transform.translate = {
					        x: move_x + ev.deltaX,
	            			y: move_y + ev.deltaY
					    };
		                break;
					case 'panend':
						break;
		        }
				
				Max_X = (self.container.children[0].offsetWidth * transform.scale - oW)/2;
				Max_Y = (self.container.children[0].offsetHeight * transform.scale - oH)/2;
				
				if(Max_X>0){
					if(transform.translate.x > Max_X){
						transform.translate.x = Max_X;
					}
					if(transform.translate.x < -Max_X){
						transform.translate.x = -Max_X;
					}						
				}else{
					if(transform.translate.x < Max_X){
						transform.translate.x = Max_X;
					}
					if(transform.translate.x > -Max_X){
						transform.translate.x = -Max_X;
					}						
				}
				
				if(Max_Y>0){
					if(transform.translate.y > Max_Y){
						transform.translate.y = Max_Y;
					}
					if(transform.translate.y < -Max_Y){
						transform.translate.y = -Max_Y;
					}						
				}else{
					if(transform.translate.y < Max_Y){
						transform.translate.y = Max_Y;
					}
					if(transform.translate.y > -Max_Y){
						transform.translate.y = -Max_Y;
					}						
				}
				self.container.style.webkitTransition = '-webkit-transform 0s ease-in-out';
				self.updateElementTransform();
				
			}
		},
        onPanEnd :function(ev){
        	var self=this; 
        },
        onPinch : function(ev){
        	//缩放
        	var self=this;
            if(ev.type == 'pinchstart') {
		        initScale = transform.scale || 1;
		    }
            
		    transform.scale = initScale * ev.scale;	
		    
			if(transform.scale<1){
		    	transform.scale =1;
		    }else if(transform.scale>3){
		    	transform.scale=3
		    }
            if(ev.type == 'pinchend') {            	
		    	transform.translate = {
			        x: 0,
        			y: 0
				};
				self.container.style.webkitTransition = '-webkit-transform 0.2s ease-out';
		    }	
			
			self.updateElementTransform();
        },
        onDoubleTap: function(ev){
        	//双击还原
        	var self=this;
        	self.resetElement();
        },
        onTap : function(ev){     
        	//单击隐藏/显示
			var self=this;
			var parentN=self.container.parentNode;
			var onOff=parentN.getAttribute('onOff');
			if($(parentN).hasClass('pane')){
				if(onOff == 'true'){
					$(parentN).find('p').slideUp();
					$(parentN).attr('onOff','false');
					$('.imgHead').slideUp();
				}else{
					$(parentN).find('p').slideDown();
					$(parentN).attr('onOff','true');
					$('.imgHead').slideDown();
				}
			}
        },
        resetElement:function () {
        	var self=this;
		    transform = {
		        translate: { x: 0, y: 0 },
		        scale: 1
			};
			self.updateElementTransform();
		},
		updateElementTransform : function() {
			var self = this;
		    var value = [
		                'translate(' + transform.translate.x + 'px, ' + transform.translate.y + 'px)',
		                'scale(' + transform.scale + ', ' + transform.scale + ')'
		    ];
		
		    value = value.join(" ");

	        self.container.style.transform = value;
	        self.container.style.oTransform = value;
	        self.container.style.msTransform = value;
	        self.container.style.mozTransform = value;
	        self.container.style.webkitTransform = value;			        
		}
        
	})
  
	return HammerCarousel;
});
