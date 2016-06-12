;define('component/galleryslide/photogallery', function(require, exports){
	var $ = require('jquery'),
		EventTarget = require('eventTarget'),
		GallerySlide = require('./base.js');

	/**
	 * @class gallerySlide
	 * AlbumSlide 图片滚动组件
	 */
	function PhotoGallery(data, currentId){

		this.cache = {};
		var cache = this.cache; //缓存
		var mask = $('<div class="lui-mask"></div>'),
			template = '<div class="lui-photoGallery">'+
				       '<div class="image-info"><span class="right-info"><span class="photo-title"></span><span class="photo-description"></span><span>(</span><span class="page"></span><span>)</span></span>'+
				       '<div class="left-tool"><span class="icon i-close"></span></div></div>'+
				       '<div style="clear:both;"></div>'+
				       '<div class="center-content"><div class="prev"><div class="prev-arrow"></div></div><div class="next"><div class="next-arrow"></div></div><img class="pgImage" src="img/loading5.gif" alt="" title=""/></div>'+
				       '<div style="clear:both;"></div>'+
				       '<div class="right-slide"></div></div>';
		var node = $(template);
		if(!data.mask)
		    mask.appendTo($('body')).fadeIn(600);
		node.appendTo($('body')).fadeIn(600);

		this.node = node;
		this.mask = mask;
		this.data = data;
        this.currentId = currentId;

		//初始化
		this._init();
	}

	$.extend(PhotoGallery.prototype, EventTarget, {
		//初始化
		_init: function(){
			
			var self = this, pg = self.node, cache = self.cache, data = self.data;

			var holder = $('.right-slide', pg), img = $('.pgImage', pg), imgParent = img.parent(),
				prev = $('.prev-arrow', pg), next = $('.next-arrow', pg), cc = $('.center-content', pg),
				pw = imgParent.width(), ph = imgParent.height();

			img.css({left:(pw-58)/2, top:(ph-10)/2});           
			$('.i-close', pg).on('click', function(){
				/*if(self.mask){
	                self.mask.fadeOut(600, function(){
	                    self.mask.remove();
	                });
            	}
                pg.fadeOut(1000, function(){
                    pg.remove();
                    self.fire('close');
                });*/
				if(top.window.previewData){
					top.window.previewData = null;
					$(top.window.document.getElementById("lui-mask-iframe")).remove();
					$(top.window.document.getElementById("web_iframediv")).remove();
				}else{
					window.open("","_self","");
					window.close();
				}
						
			});
            //改变图标样式  为了兼容火狐  from background-position-x/y  ->background
			$(".icon",pg).hover(function(){
				$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -372px -21px"});
			},function(){
				$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -404px -21px"});
			});
			
			var gs = new GallerySlide({
                node: holder,
                data: data,
                scroll: 'horizontal'
            }, self.currentId);

            gs.on('beforeChange', function(e){
            	if($.browser && $.browser.msie){
	            	Anim.stop(img);
	            	new Anim(img, {opacity: 0.4}, .3, 'easeBothStrong', function(){
					}).run();
            	}
            });

            var stack = [], prcessing = false;

            gs.on('change', function(e){
            	/*
            	if(/msie/i.test(navigator.userAgent.toLowerCase())){
            		doProcessIe(e);
            	}else{
            		if(!prcessing){
						prcessing = true;
						doProcess(e);
	            	}else{
	            		stack.unshift(e);
	            	}
            	}
            	*/
            	doProcessIe(e);
            });

            gs.render();

			function doProcess(e){
				
				var size = self._scalePhoto(pw, ph, e.width, e.height);
            	var imgOld = img.clone(false), lhalfImg = img.clone(false);
            	var rhalf = $('<div class="right-half"></div>'), lhalf = $('<div class="left-half"></div>');
            	imgOld.appendTo(cc);
            	lhalfImg.appendTo(lhalf);

        		img.attr('src', e.url);
        		img.attr('alt', e.name);
            	img.width(size.width);
            	img.height(size.height);
            	img.css({left:(pw-size.width)/2, top:(ph-size.height)/2});

            	var imgNew = img.clone(false), rhalfImg = img.clone(false);
            	imgNew.css('-webkit-transform', 'rotateY(-270deg )');
            	imgNew.css('-moz-transform', 'rotateY(-270deg )');
            	imgNew.hide();
            	rhalfImg.appendTo(rhalf);
            	
				setTimeout(function(){
					imgOld.addClass('image-rotate');
					lhalf.appendTo(cc);
					setTimeout(function(){
						imgOld.remove();
						rhalf.appendTo(cc);
						lhalf.css('z-index', 0);
						imgNew.appendTo(cc);
						imgNew.show();
						imgNew.css('-webkit-transition', 'All 1s ease-in-out');
						imgNew.css('-moz-transition', 'All 1s ease-in-out');
						imgNew.css('-webkit-transform', 'rotateY(-360deg )');
						imgNew.css('-moz-transform', 'rotateY(-360deg )');
						setTimeout(function(){
							lhalf.remove();
							rhalf.remove();
							imgNew.remove();
							prcessing = false;
							if(stack.length > 0){
								var ev = stack.shift();
								stack.length = 0;
								doProcess(ev);
							}
						}, 500);
					}, 500);
					
				}, 100);
            	
            	var title = $('.photo-title', pg),
            		desc = $('.photo-description', pg),
            		page = $('.page', pg);

            	title.text(e.name);
            	desc.text(e.description);
            	page.html(e.index+'/'+e.total);
			}

			function doProcessIe(e){
				var pw = $('.pgImage', pg).parent().width(),ph = $('.pgImage', pg).parent().height();
				var size = self._scalePhoto(pw, ph, e.width, e.height);
				var newImg = $("<img class='pgImage' src="+e.url+">");
				//newImg.attr('src', e.url);
				newImg.attr('alt', e.name);
				newImg.width(size.width);
				newImg.height(size.height);
				newImg.css({left:(pw-size.width)/2, top:(ph-size.height)/2});     
                imgParent.find(".pgImage").remove();
                imgParent.append(newImg);
            	var title = $('.photo-title', pg),
            		desc = $('.photo-description', pg),
            		page = $('.page', pg);

            	title.text(e.name);
            	desc.text(e.description);
            	page.html(e.index+'/'+e.total);
			}

            prev.on('click', function(e){
            	gs.prev();
            	e.preventDefault();
            	e.stopPropagation();
            });
            next.on('click', function(e){
            	gs.next();
            	e.preventDefault();
            	e.stopPropagation();
            });
            if(gs.cache.total>1){
            	next.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -83px 0"});
            }
            gs.on("changeButton",function(){
            	if(gs.cache.total>1){	
                	var cindex = gs.cache.current;
                	var total = gs.cache.total;
                	if(cindex==0){             		
                		next.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -83px 0"});
                		prev.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -163px 0"});
                	}else if(cindex==(total-1)){
                		next.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat 0px 0"});
                		prev.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -245px 0"});
                	}else{
                		next.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -83px 0"});
                		prev.css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -245px 0"});
                	}
                }
            });           
            prev.hover(function(){
            	if(gs.cache.total>1&&(gs.cache.current!=0)){
					$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -205px 0"});
				}
			},function(){
				if(gs.cache.total>1&&(gs.cache.current!=0)){
					$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -245px 0"});
				}else if(gs.cache.total>1&&(gs.cache.current==0)){
					$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -163px 0"});
				}
			});
			next.hover(function(){
				if(gs.cache.total>1&&(gs.cache.current!=gs.cache.total-1)){
					$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -42px 0"});
				}
			},function(){
				if(gs.cache.total>1&&(gs.cache.current!=gs.cache.total-1)){
					$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat -83px 0"});
				}else if(gs.cache.total>1&&(gs.cache.current==gs.cache.total-1)){
					$(this).css({"background":"url(css/theme/default/img/index/icon_preview.png) no-repeat 0px 0"});
				}
			});
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

	return PhotoGallery;

});
