;define('component/galleryslide/base', function(require, exports){
	var $=require('jquery'),
		EventTarget = require('eventTarget');

	require('mustache');

	var MARGIN, BORDER_WIDTH;

	/**
	 * @class gallerySlide
	 * AlbumSlide 图片滚动组件
	 */
	function GallerySlide(config, imageId){
		var _CONFIG = {
			node: '',
			data: [],
			ratio: 1.375,          //图片宽高比例
			scroll: 'vertical',  //滚动方向
			imageMargin: 8,      //图片总边距，左右或是上下为4
			borderWidth: 8       //当前选中图片的边框
		};
        
        this.imageId = imageId ? imageId : 0;
		this.cfg = $.extend(_CONFIG, config);

		MARGIN = this.cfg.imageMargin;
		BORDER_WIDTH = this.cfg.borderWidth;

		this.cache = {};
		var cache = this.cache; //缓存
		cache.current = 0; //当前显示的图片index
		cache.total = this.cfg.data.total||0;  //图片总数
		
		var nstr = this.cfg.node;
		this.node = $.type(nstr) == 'string' ? $(nstr) : nstr;

		//初始化
		this._init(imageId);
	}

	$.extend(GallerySlide.prototype, EventTarget, {
		//初始化
		_init: function(imgId){
			var v_template = '<div class="lui-gallerySlide"><div class="gs-vertical"><div class="prev"><div class="prev-arrow"></div></div><div class="content-wraper"><div class="gsContent"><div class="img-border"></div></div></div><div class="next"><div class="next-arrow"></div></div></div></div>',
				h_template = '<div class="lui-gallerySlide"><div class="gs-horizontal"><div class="content-wraper"><div class="gsContent"><div class="img-border"></div></div></div></div></div>';
			var self = this, node = self.node, cfg = self.cfg, cache = self.cache, data = cfg.data;
			
			var gs, sc, cnt, ib, prev, next,
				vw = node.width(), vh = node.height(),
				pw, ph, nw, nh, imgW, imgH;
			
			//垂直模式
			if(cfg.scroll == 'vertical'){

				gs = $(v_template);
				gs.appendTo(node);
				sc = $('.content-wraper', gs);
				cnt = $('.gsContent', gs);  
				ib = $('.img-border', gs); //边框
				prev = $('.prev', gs);     //上一个
				next = $('.next', gs);     //下一个
				pw = prev.outerWidth();    
				ph = prev.outerHeight();
				nw = next.outerWidth();
				nh = next.outerHeight();
				gs.width(vw);
				gs.height(vh);

				sc.css({top: ph, left: 0});
				sc.width(vw);
				var tw = vw, th = vh-ph-nh;
				cnt.width(tw);
				imgW = tw;                         //缩略图片外围宽度
				imgH = Math.round(imgW/cfg.ratio); //缩略图片外围高度
				cnt.height(data.total*imgH);

				cache.totalCount = Math.floor(th/imgH);  //页面中显示缩略图的总数
				var totalHeight = cache.totalCount*imgH; //总高度
				sc.height(totalHeight);
				sc.css('top', ph+(th-totalHeight)/2);

			}else{

				gs = $(h_template);
				gs.appendTo(node);
				sc = $('.content-wraper', gs);
				cnt = $('.gsContent', gs);
				ib = $('.img-border', gs);
				prev = $('.prev', gs);
				next = $('.next', gs);
				
				pw = prev.outerWidth();
				ph = prev.outerHeight();
				nw = next.outerWidth();
				nh = next.outerHeight();
				gs.width(vw);
				gs.height(vh);

				sc.css({left: pw, top: 0});
				sc.height(vh);
				var tw = vw-pw-nw, th = vh;
				cnt.height(th);
				imgH = 91;                         //缩略图片外围高度
				imgW = 121;//Math.round(imgH*cfg.ratio); //缩略图片外围宽度
				cnt.width(data.total*imgW);

				cache.totalCount = Math.floor(tw/imgW);  //页面中显示缩略图的总数
				var totalWidth = cache.totalCount*imgW;  //总宽度
				sc.width(totalWidth);
				sc.css('left', pw+(tw-totalWidth)/2);
				if(cnt.width()<totalWidth)
					cnt.css("left",(totalWidth-cnt.width())/2);
			}
            if(top.window.LenovoData){           	
            	ib.width(imgW-BORDER_WIDTH-MARGIN+2);   //边框宽度
    			ib.height(imgH-BORDER_WIDTH-MARGIN+2);  //边框高度
            }
			ib.css({left:MARGIN/2, top:MARGIN/2});

			cache.current = self.imageId; //当前图片 索引
			cache.currentId = data.list[self.imageId].id;   //当前图片Id
			cache.center = Math.ceil(cache.totalCount/2)-1;  //左半部分的个数 或者  上半部分的个数
			cache.half = cache.totalCount-cache.center-1;    //右半部分的个数 或者  下半部分的个数
			cache.imgW = imgW;
			cache.imgH = imgH;
			//self.render();
			cache.initFlag = false;

			//前一个
			prev.on('click', function(){
				self.prev();
			});
			//后一个
			next.on('click', function(){
				self.next();
			});
			window.onresize = function(){
				var o = data.list[self.cache.current];
				self._preLoadImage(o.id, o.originPath, function(id, url, width, height){
					var ot = self._clone(data.list[self.cache.current]);
					if(ot.id == id){
						ot.url = url;
						ot.width = width;
						ot.height = height;
						ot.total = data.total;
						ot.index = self.cache.current+1;
						//分发 切换事件
						self.fire('change', ot);
					}
				});
			}
		},
		myEncodeURI : function(url) {
           // url = encodeURI(url);
            url = url.replace(/#/g, '%23');
            url += "&_="+new Date().getTime();//增加时间戳解决缓存问题
			return url;
		},

		//contentNode '.gsContent'
		/*
		 *初始化缩略图
		 */
		_initPhotos: function(){
			var template = '<span class="gsImageWraper"><img class="gsImage" id="{{id}}" src="{{thumbnails}}"/></span>';
			var frag = document.createDocumentFragment();		
			var self = this, node = self.node, cfg = self.cfg, cache = self.cache, data = cfg.data;			
			for (var i=0, ii=data.list.length; i<ii; i++) {
				var obj = data.list[i];	
				obj.thumbnails = self.myEncodeURI(obj.thumbnails);
				var imgWrap = $(Mustache.render(template, obj));
				imgWrap.width(cache.imgW);
				imgWrap.height(cache.imgH);
				imgWrap.attr('dataIndex', i);
				var img = $('.gsImage', imgWrap);
				imgWrap.appendTo(frag);
				var imageReady = (function(){
					var list = [],intervalId = null;
					//用来执行队列
					tick = function(){
						var i = 0;
						for(;i<list.length;i++){
							list[i].end?list.splice(i--,1):list[i]();
						}
						!list.length&&stop();
					};
					//停止所有定时器队列
					stop = function(){
						clearInterval(intervalId);
						intervalId = null;
					};
					return function(url,ready,load,error){
						var onready,width,height,newWidth,newHeight,img = new Image();
						img.src = url;
						//如果图片被缓存，则直接返回缓存数据
						if(img.complete){
							ready.call(img);
							load&&load.call(img);
							return;
						}
						width = img.width;
						height = img.height;
						//加载错误后的数据
						img.onerror = function(){
							error&&error.call(img);
							onready.end = true;
							img = img.onload = img.onerror = null;
						};
						//图片尺寸就绪
						onready = function(){
							newWidth = img.width;
							newHeight = img.height;
							if(newWidth!==width||newHeight!==height||newWidth*newHeight>8800){
								ready.call(img);
								onready.end = true;
							}
						}
						onready();
						//完全加载完毕的事件
						img.onload = function(){
							//onload在定时器时间差范围内可能比onready快
							//这里进行检查并保证onready优先执行
							!onready.end&&onready();
							load&&load.call(img);
							//IE gif动画会循环执行onload，置空onload即刻
							img = img.onload = img.onerror = null;
						};
						//加入队列中定期执行
						if(!onready.end){
							list.push(onready);
							//无论何时只容许出现一个定时器，减少浏览器性能损耗
							if(intervalId===null)intervalId = setInterval(tick,40);
						}
					};
				})();
				(function(obj,img){					
					var changeStyle = function(){
						//不要随意更改尺寸，由于历史原因，缩略图大小和原图大小没有按照固定比例，110:80   800:600
						var width  = this.width;	
						var height = this.height;
						if(height<80){
							img.css("marginTop",(82-height)/2+4);
						}		
						if(width<110){
							img.css("marginLeft",(121-width)/2);
						}else if(width>110){
							img.css("width",110);
							//img.css("marginTop",(82-parseInt(img.css("height")))/2+4);
						}
					}
					var onerror = function(){
						var that_imag = document.getElementById(obj.id);
						that_imag.src="/css/theme/default/img/index/loadfailedsmall.png";
						that_imag.style.marginTop = "28px";
						that_imag.style.marginLeft = "33px";
						that_imag.style.width = "58px";
						that_imag.style.height = "42px";
                        that_imag.style.border = 0;
					}	
					imageReady(obj.thumbnails,changeStyle,null,onerror);	
				})(obj,img);
			}
			var contentNode = $('.gsContent', node);
			contentNode.append(frag);
			//分发loaded事件
			self.fire('loaded');
			
			//缩略图点击事件
			contentNode.on('click', function(e){
				var tar = $(e.target), par = tar.parent();
				if(par.hasClass('gsImageWraper')){
					if(!cache.processing){
						var index = tar.parent().attr('dataIndex');
						cache.current = index-0;
						cache.currentId = tar.attr('id');
						self.render();
						self.fire("changeButton");
					}
				}
			});
		},

		//渲染
		render: function(){
			var self = this, cfg = self.cfg, g = self.cache, data = cfg.data,
				gc = g.current, o = data.list[gc];
			
			if(!g.initFlag){
				g.initFlag = true;
				//初始化缩略图区
				self._initPhotos();
			}

			if(gc>data.total-1){
				return;
			}
			//分发 切换之前的事件
			self.fire('beforeChange');			
			if(o.originPath){
				//加载图片
				self._preLoadImage(o.id, o.originPath, function(id, url, width, height){
					var ot = self._clone(data.list[gc]);
					if(ot.id == id){
						ot.url = url;
						ot.width = width;
						ot.height = height;
						ot.total = data.total;
						ot.index = gc+1;
						//分发 切换事件
						self.fire('change', ot);
					}
				});
			}else{
				var ot = self._clone(data.list[gc]);
				//分发 切换事件
				self.fire('change', ot);
			}
			self._scrollToCenter();
		},
		
		//图片滚动至中心位置
		_scrollToCenter: function (){
			var self = this, node = self.node, g = self.cache, cfg = self.cfg, data=cfg.data,
				border = $('.img-border', node), ele = $('.gsContent', node);

			var el, et, newl, newt;
			g.processing = true;

			if(cfg.scroll == 'vertical'){ //垂直方向滚动

				//边框移动
				var btop = g.current*g.imgH+MARGIN/2;
				border.stop().animate({top: btop}, 500, 'swing', function(){
				});

				et = ele.css("top").slice(0, -2)-0; //缩略图容器的top值
				if(g.current < g.center){
					//当前点击图片在 中心图片 的上部的场合
					var dis = g.center-g.current, rdis, diff=g.center-g.totalCount+g.half+1;
					if(diff < 0){
						rdis=0;
					}else{
						rdis=diff<dis ? diff:dis;
						g.center = g.center-rdis;
					}
					newt = et + rdis*g.imgH;
					//缩略图容器移动
					ele.stop().animate({top: newt}, 300, 'swing', function(){
						g.processing = false;
					});

				}else{
					//当前点击图片在 中心图片 的下部的场合
					var dis = g.current-g.center, rdis, diff=g.center+g.half;
					if(diff >= data.total-1){
						rdis = 0;
					}else{
						var tc = data.total-1-diff;
						rdis=tc<dis ? tc:dis;
						g.center = g.center+rdis;
					}
					newt = et - rdis*g.imgH;
					//缩略图容器移动
					ele.stop().animate({top: newt}, 300, 'swing', function(){
						g.processing = false;
					});
				}
				
			} else { //水平方向滚动

				//边框移动
				var bleft = g.current*g.imgW+MARGIN/2;
				border.stop().animate({left: bleft}, 500, 'swing', function(){
				});

				et = ele.css("left").slice(0, -2)-0;  //缩略图容器的left值
				if(g.current < g.center){
					//当前点击图片在 中心图片 的左部的场合
					var dis = g.center-g.current, rdis, diff=g.center-g.totalCount+g.half+1;
					if(diff < 0){
						rdis=0;
					}else{
						rdis=diff<dis ? diff:dis;
						g.center = g.center-rdis;
						//只有移动了才设置中心图片的索引
					}
					newt = et + rdis*g.imgW;
					//缩略图容器移动
					ele.stop().animate({left: newt}, 300, 'swing', function(){
						g.processing = false;
					});
				}else{
					//当前点击图片在 中心图片 的右部的场合
					var dis = g.current-g.center, rdis, diff=g.center+g.half;
					if(diff >= data.total-1){
						rdis = 0;
					}else{
						var tc = data.total-1-diff;
						rdis=tc<dis ? tc:dis;
						g.center = g.center+rdis;
						//只有移动了才设置中心图片的索引
					}
					newt = et - rdis*g.imgW;
					//缩略图容器移动
					ele.stop().animate({left: newt}, 300, 'swing', function(){
						g.processing = false;
					});
				}
				
			}
		},

		//图片预加载
		_preLoadImage: function(id, url, callback){
			var img = new Image();
			var self = this;
			img.src = self.myEncodeURI(url);			
			if (img.complete) {
					callback(id, self.myEncodeURI(url), img.width, img.height);
			} else {
				img.onload = function () {
					callback(id, self.myEncodeURI(url), img.width, img.height);
					img.onload = null;
				};
				img.onerror = function(){
					callback(id, "/css/theme/default/img/index/loadfailed.png", 84, 60);					   
				};
			}
		},

		//下一个图片
		next: function(){
			var self = this, cache = self.cache, data=self.cfg.data;
			if(!cache.processing){
				if(cache.current < data.total-1){
					cache.current++;
					cache.currentId = data.list[cache.current].id;
					self.render();
				}
			}
		},
		
		//上一个图片
		prev: function(){
			var self = this, cache = self.cache, data=self.cfg.data;
			if(!cache.processing){
				if(cache.current > 0){
					cache.current--;
					cache.currentId = data.list[cache.current].id;
					self.render();
				}
			}
		},

		_clone: function(source){
			var obj = {};
			for(var key in source){
				obj[key] = source[key];
			}
			return obj;
		},

		_scalePhoto: function(w, h, iw, ih){
			var size={}, scale;
			if(iw > w){
				size.width = w;
				scale = w/iw;
				size.height = ih*scale;
			}else{
				size.width = iw;
				size.height = ih;
			}
			if(size.height > h){
				size.height = h;
				scale = h/ih;
				size.width = iw*scale;
			}
			return size;
		}
	});

	return GallerySlide;

});
