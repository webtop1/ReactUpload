;define("component/galleryslide/photoslide",function(require,exports,module){
	var $ = require("jquery"),
	Util = require("util");
	function PhotoSlide(data,currentId){
		this.cache = data;
		this.size = data.length;
		this.current = currentId;
		this.width = 100;
		this.margin = 22;
		this.init();
	}
	PhotoSlide.prototype = {
		init:function(){
			var inner = $(["<div class='lui-photoslide'>",
			               "<div class='lui-photo-title'><h2></h2><span class='icon i-preview-close'></span></div>",
			               "<div class='prev'><i class='icon i-arrow-prev'></i></div><div class='next'><i class='icon i-arrow-next'></i></div>",
			               "<div class='lui-photo-content'>",			               
			               "<div class='lui-photo-image'><div class='img-wraper'><img src='img/loading5.gif'></div></div>",
			               "</div>",
			               "<div class='lui-photo-bottom'><div class='lui-slide'><div class='image-border'></div><ul class='image-ul'></ul></div></div>",
			               "</div>"].join(""));
			$('body').append(inner);
			this.content = inner;
			if(this.size<3){
				inner.find(".lui-slide").css("width",this.size*this.width+(this.size-1)*this.margin);
			}
			var height = document.body.offsetHeight-186;
			inner.find(".img-wraper").css({marginTop:(height-60)/2});
			inner.find(".lui-slide>ul").css("width",this.size*(this.width+this.margin));
			for(var i=0;i<this.size;i++){
				var li = $("<li class='lui-slide-image'></li>");
				inner.find(".lui-slide>ul").append(li);
			}			
			this.render();
			this.bindEvent();
			var self = this;
			window.onresize = function(){
				self.render();
			}
		},
		render:function(){
			var loadImage = (function(){
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
							newWidth = img.offsetWidth;
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
			//生成大图
			var self = this,height = document.body.offsetHeight-186;		
			if(this.cache[this.current].image){
				var that = this.cache[this.current].image;
				var src = that.getAttribute("src");
				$(".img-wraper").css("marginTop",(height>that.height)?(height-that.height)/2:0);
			    $(".img-wraper").css("width",that.width)
			    if(height<that.height){
			   	   $(".img-wraper>img").css("height",height).css("width",that.width*(height/that.height));
                   $(".img-wraper").css("width",that.width*(height/that.height));  
			    }else{
			   	   $(".img-wraper>img").css({width:that.width,height:that.height});
			    }
				$(".img-wraper>img").attr("src",src);
				$(".lui-photo-title>h2").html(this.cache[this.current].name);
			}else{
				loadImage(this.cache[this.current].originPath,
					function(){
					   var src = this.getAttribute("src");
					   //根据加载到的图片尺寸更改显示位置和显示宽高
					   $(".img-wraper").css("marginTop",(height>this.height)?(height-this.height)/2:0);
					   $(".img-wraper").css("width",this.width)
					   if(height<this.height){
					   	  $(".img-wraper>img").css("height",height).css("width",this.width*(height/this.height));
	                      $(".img-wraper").css("width",this.width*(height/this.height));  
					   }else{
					   	  $(".img-wraper>img").css({height:this.height,width:this.width});
					   }
					   $(".img-wraper>img").attr("src",src);
					   self.cache[self.current].image = this;
					   $(".lui-photo-title>h2").html(self.cache[self.current].name);
				    },
				    null,
				    function(){
				    	var image = $("<img src='/css/theme/default/img/index/loadfailed.png'>");
						$(".img-wraper").css("marginTop",(height-60)/2);
						$(".img-wraper").css({width:80,height:60});
						$(".img-wraper>img").attr("src",image.attr("src")).css({width:80,height:60});
						self.cache[self.current].image = image[0];
					    $(".lui-photo-title>h2").html(self.cache[self.current].name);
					}
				);
			}		
			//生成缩略图
			var start = 0;
			var end = this.cache.length;
			if(this.size>3){
				if(this.current==0){
					end = 3;
				}else if(this.current==(end-1)){
					start = end-3;
				}else{
					start = this.current-1;
					end = this.current+2;
				}
			}
			for(var i=start;i<end;i++){
				if(this.cache[i].preimage)continue;
				(function(index){
					loadImage(self.cache[index].thumbnails,function(){
						var height = this.height;
						var width = this.width;
						if(height<100){
							$(this).css("marginTop",(100-height)/2);
						}
						if(width<100){
							$(this).css("marginLeft",(100-width)/2);
						}
						self.content.find(".image-ul>li").eq(index).append(this);
						self.cache[index].preimage = this;
					},null,
					function(){
						var preimage = $("<img src='/css/theme/default/img/index/loadfailedsmall.png'>");
						preimage.css({width:48,height:40,marginTop:30,marginLeft:26,border:0});
						self.content.find(".image-ul>li").eq(index).append(preimage);
						self.cache[index].preimage = preimage;
					});
				})(i);	
			}
			this.slide();
		},
		bindEvent:function(){
			var self = this;
			$(".i-preview-close",this.content).on("click",function(e){
				if(parent.window.previewData){
					parent.window.previewData = null;
					$(parent.window.document.getElementById("lui-mask-iframe")).remove()
					$(parent.window.document.getElementById("web_iframediv")).remove();
				}else{
					window.open("","_self","");
					window.close();
				}
			});
			$(".i-arrow-prev",this.content).on("click",function(e){
				//todo
				self.prev();
			});
			$(".i-arrow-next",this.content).on("click",function(e){
				//todo
				self.next();
			});
			$(this.content).delegate(".lui-slide-image","click",function(e){
				var index = $(this).index();
				if(index==self.current)return;
				self.current = index;
				self.render();
			});
		},	
		next:function(){
			if(this.size>0&&this.current<this.size-1){
				this.current++;
				this.render();
			}
		},
		prev:function(){
			if(this.size>0&&!(this.current==0)){
				this.current--;
				this.render();
			}
		},
		slide:function(){
			//计算移动
			if(this.size>3&&this.current>0&&this.current<this.size-1){
				this.content.find(".lui-slide>ul").css("left",-(this.current-1)*(this.width+this.margin));
			}
			if(this.size>3&&this.current==this.size-1){
				this.content.find(".lui-slide>ul").css("left",-(this.current-2)*(this.width+this.margin));
			}
			var pos = 0;
			if(this.current==0){
				pos = 0;
			}else if(this.current==(this.size-1)&&this.size>=3){
				pos = 2;
			}else{
				pos = 1;
			}
			this.content.find(".image-border").css("left",pos*(this.width+this.margin))
		}
	}
	return PhotoSlide;
});
