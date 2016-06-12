define('component/scroll', function(require, exports, module){

	var $=require('jquery'),
		EventTarget = require('eventTarget');
	require('js/gallery/jquery/mousewheel/3.1.3/jquery.mousewheel.js');
	/**
	 * @isBottom  滚动条默认在最底部，向上滚动加载
	 */
	function Scroll(node,isBottom){
		this.node = typeof node == 'string' ? $(node) : node; 
		this.direction = isBottom;
		this._init();
		
	}
	
	$.extend(Scroll.prototype, EventTarget, {
		_init: function(){
			var self = this;
			self.node.wrapInner('<div class="scl-content"></div>');
			self.node.wrapInner('<div class="contentArea clearfix"></div>');
			self.node.wrapInner('<div class="lui-scroll"></div>');

			var scroll = self.node.find('.lui-scroll');
			this.scroll = scroll;
			self.render();
			if(self.direction){
				self.scrollDelta(-$("#listBody .scl-content").height(),true);
				setTimeout(function(){
					self.scrollDelta(-30);
				},200);
			}
			scroll.bind('mousewheel', function(e, delta, deltaX, deltaY) {
				/*
				var timer = 0;
				if (!timer) {
   					timer = setTimeout(function() {
   						self.scrollDelta(deltaY*5);
   						timer = 0;
   					}, 30);
  				}
  				*/
  				self.scrollDelta(deltaY*30);
  				e.preventDefault();
  				e.stopPropagation();
			});
		},

		render: function(flag){
			var self = this;
			var STEP = 20, BAR_SIZE = 8;

			var scroll = self.scroll,
				contentArea = scroll.find('.contentArea'),
				content = scroll.find('.scl-content'),
				trackV = $('<div class="trackV"><div class="track-bg"></div><div class="barV"></div></div>'),
				trackH = $('<div class="trackH"><div class="track-bg"></div><div class="barH"></div></div>');

			var sh = scroll.height(), sw = scroll.width(),
				scrollV, scrollH, barheight, barwidth, originTop, originCtop;
			if(flag){
				if(self.vbar){
					var status = self.vbar;
					originTop = status.barOffset/status.barMaxOffset;
					originCtop = status.contentOffset;
				}
			}

			var w = self.node.width(), h = self.node.height(),
				ch = content.outerHeight(), cw = content.outerWidth();
			//contentArea.height(h);
			
			scroll.find('.trackV').remove();
			scroll.find('.trackH').remove();

			if(!flag){
				content.css({'top': 0});
			}

			content.css({'left': 0});
			
			if(ch > sh){
				scroll.append(trackV);
				//scroll.width(w);
				//contentArea.width(w);
				trackH.width(w-BAR_SIZE);
				scrollV = true;
				self.scrollV = scrollV;
			}else{
				scrollV = false;
				self.scrollV = null;
				content.animate({top: 0});
			}

			if(cw > sw){
				scroll.append(trackH);
				//scroll.height(h);
				//contentArea.height(h);
				trackV.height(h-BAR_SIZE);
				scrollH = true;
				self.scrollH = scrollH;
			}else{
				scrollH = false;
				self.scrollH = null;
			}

			var th = trackV.height(), tw = trackH.width();

			var moveFlagV = false, moveFlagH = false, move = {};
			if(scrollV){
				var barV = trackV.find('.barV'), barheight = h*h/ch;
				barheight < 20 ? barheight = 20 : null;
				barV.height(barheight);

				self.vbar = {
					contentHeight:  ch,
					height: barheight,
					barMaxOffset: h-barheight,
					contentMaxOffset: ch-h,
					ratio: (ch-h)/(h-barheight),
					barOffset:0,
					contentOffset:0
				};
				
				barV.on('mousedown', function(e){
					var max=self.vbar.barMaxOffset, ratio = self.vbar.ratio;
					moveFlagV = true;
					move.top = e.pageY-barV.position().top;
					e.preventDefault();
					e.stopPropagation();
				
					var process, cnt = content;
					$('body').on('mousemove', function(me){
						if(moveFlagV){
							if(!process){
								process = 1;
								var top = me.pageY-move.top;
								top < 0 ? top = 0 : null;
								top > max ? top = max : null;
								barV.css({top: top});
								cnt.css({'top': -top*ratio});

								self.vbar.barOffset = top;
								self.vbar.contentOffset = -top*ratio;

								setTimeout(function(){
									process = null;
								}, 100);

								if(top == max){
									self.fire('reachEnd');
								}
							}
						}
						me.preventDefault();
						me.stopPropagation();
					});

					$('body').on('mouseleave', function(me){
						if(moveFlagV){
							moveFlagV = false;
							$('body').off();
						}
						me.preventDefault();
						me.stopPropagation();
					});
					$('body').on('mouseup', function(me){
						if(moveFlagV){
							moveFlagV = false;
							$('body').off();
						}
						me.preventDefault();
						me.stopPropagation();
					});

				});

				if(flag){
					originTop = isNaN(originTop)?0:originTop;
					originCtop = isNaN(originCtop)?0:originCtop;
					var bt = self.vbar.ratio*originTop;
					barV.css({top: bt});
					self.vbar.barOffset = bt;
					self.vbar.contentOffset = originCtop;
				}

			}

			if(scrollH){
				var barH = trackH.find('.barH'), barwidth = w*w/cw;
				barwidth < 20 ? barwidth = 20 : null;
				barH.width(barwidth);

				self.hbar = {
					contentWidth:  cw,
					width: barwidth,
					barMaxOffset: w-barwidth,
					contentMaxOffset: cw-w,
					ratio: (cw-w)/(w-barwidth),
					barOffset:0,
					contentOffset:0
				};

				//bind event
				barH.on('mousedown', function(e){
					var max=self.hbar.barMaxOffset, ratio = self.hbar.ratio;
					moveFlagH = true;
					move.left = e.pageX-barH.position().left;
					e.preventDefault();
					e.stopPropagation();

					var process, cnt = content;
					$('body').on('mousemove', function(me){
						if(moveFlagH){
							if(!process){
								process = 1;
								var left = me.pageX-move.left ;
								left < 0 ? left = 0 : null;
								left > max ? left = max+6 : null;

								barH.css({left: left});
								cnt.css({'left': -left*ratio});

								self.hbar.barOffset = left;
								self.hbar.contentOffset = -left*ratio;

								setTimeout(function(){
									process = null;
								}, 100);
							}
						}
						me.preventDefault();
						me.stopPropagation();
					});
					$('body').on('mouseup', function(me){
						if(moveFlagH){
							moveFlagH = false;
							$('body').off();
						}
						me.preventDefault();
						me.stopPropagation();
					});
				});
			}
		},

		scrollTo: function(num, flag){
			var self = this, scroll = self.scroll,
				contentArea = scroll.find('.contentArea'),
				content = scroll.find('.scl-content');

			if(self.scrollH){
				var barH = scroll.find('.barH');
				var hbar = self.hbar;

				var bl = hbar.barMaxOffset*num, cl = -hbar.contentMaxOffset*num;
				if(flag){
					barH.css({left: bl});
					content.css({left: cl});
				}else{
					barH.stop().animate({left: bl}, 500, 'swing');
					content.stop().animate({left: cl}, 500, 'swing');
				}

				hbar.barOffset = bl;
				hbar.contentOffset = cl;
			}

			if(self.scrollV){
				var barV = scroll.find('.barV');
				var vbar = self.vbar;

				var bt = vbar.barMaxOffset*num, ct = -vbar.contentMaxOffset*num;
				if(flag){
					barV.css({top: bt});
					content.css({top: ct});
				}else{
					barV.stop().animate({top: bt}, 500, 'swing');
					content.stop().animate({top: ct}, 500, 'swing');
				}

				vbar.barOffset = bt;
				vbar.contentOffset = ct;
				
			}

		},

		scrollDelta: function(delta,barvToBottom){
			var self = this;

			var scroll = self.scroll,
			contentArea = scroll.find('.contentArea'),
			content = scroll.find('.scl-content');
			if(self.scrollV){
				processBarV();
			}

			function processBarV(){
				var barV = scroll.find('.barV');
				var vbar = self.vbar;
				
				if(barvToBottom){
					var bt = vbar.barOffset-delta, 
					ct = vbar.contentOffset+delta*vbar.ratio;
				}else{
					var ct = vbar.contentOffset + delta;
					bt = vbar.barOffset - 1/vbar.ratio*delta;
				}
				bt<0 && (bt=0);
				bt>vbar.barMaxOffset && (bt = vbar.barMaxOffset);
				
				ct>0 && (ct=0);
				ct<-vbar.contentMaxOffset && (ct = -vbar.contentMaxOffset);
				
				if(ct==-vbar.contentMaxOffset) bt = vbar.barMaxOffset;

				/*
				barV.stop().animate({top: bt}, 500, 'swing');
				content.stop().animate({top: ct}, 500, 'swing');
				*/
				barV.css('top', bt);
				content.css('top', ct);

				vbar.barOffset = bt;
				vbar.contentOffset = ct;
				if(!self.direction && ct == -vbar.contentMaxOffset){
					self.fire('reachEnd');
				}
				if(self.direction && ct > -10){
					self.fire('reachEnd');
				}
			}
		},

		appendContent: function(nodeObj){
			var self = this;
			var scroll = self.scroll,
				content = scroll.find('.scl-content');
			content.append(nodeObj);
		},

		emptyContent: function(){
			var self = this;
			var scroll = self.scroll,
				content = scroll.find('.scl-content');
			content.empty();
		}


	});
	return Scroll;
});
