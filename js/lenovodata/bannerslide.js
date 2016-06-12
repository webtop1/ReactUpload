;define("lenovodata/bannerslide",function(require,exports,modules){
	var $ = require("jquery");
	exports.init = function(options){
		var banner = $("<div class='banner-num'><ul class='ul-number'><li class='on'></li><li></li><li></li></ul></div>"+
				"<div class='banner-content'><ul class='ul-content'><li class='activity mobile'><a href='/client/android/bin/LenovoBox.apk'>下载到PC</a></li><li><a target='_blank' href='http://email.box.lenovo.com/email/lenovo_sjhs1_boxlenovo.html'>免费试用</a></li><li class='client'></li></ul></div>");
		this.banner = banner;
		$('.banner-bg2').append(banner);
		doSlide(banner);
	}
	function doSlide(banner){
        var slide = {
        	current:0,
        	container:banner,
        	self:this,
            next:function(){        	
            	slide.current++;           	
            	if(slide.current==3){
            		slide.current = 0;
            	}
                slide.render(slide.current);
            },
            render:function(index){
            	slide.container.find("ul.ul-number li").eq(index).addClass("on").siblings().removeClass("on");
            	slide.container.parent(".banner-bg2").css("background","url(/css/theme/default/img/index/index_banner"+index+".png) top center no-repeat");
                slide.container.find("ul.ul-content li").eq(index).show().siblings().hide();
            }
        };
		var time = setInterval(slide.next,5000);
        slide.container.find("ul.ul-number li").on("click",function(){
            clearInterval(time);
            slide.current = $(this).index();
            slide.render(slide.current);
            //$(this).addClass("on").siblings().removeClass('on');
           // slide.container.parent(".banner-bg2").css("background","url(/css/theme/default/img/index/index_banner_"+slide.current+".png) top center no-repeat");
           // slide.container.find("ul.ul-content li").eq(slide.current).show().siblings().hide();
        }).on("mouseout",function(){
        	time = setInterval(slide.next,5000);
        }).on("mouseover",function(){
        	clearInterval(time);
        });
	}
});