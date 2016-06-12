define('component/tips', function(require, exports, module){
	var $ = require('jquery'),
		AlertDialog = require('component/alertDialog');
	
	var Tips = {
		show: show,
		info:info,
		warn: warn,
		prompt: prompt,
		destory: destory,
		dyToast:dyToast,
		closeDialog:closeDialog
	};

	function show(html, time){
		var uiTips = $('<div class="lui-tips toast"></div>'),
			content = $('<div class="tips-toast"></div>');

		uiTips.append(content);
		content.append("<span>"+html+"</span>");

		uiTips.appendTo($('body')).fadeIn();

		var host = $(window),
			w = host.width(),
			h = host.height(),
			tw = uiTips.outerWidth(),
			th = uiTips.outerHeight();
		uiTips.css({left: (w-tw)/2, top: 66});

		var t = time || 3000;
		setTimeout(function(){
			uiTips.animate({opacity: 'hide'}, 'normal', 'swing', function(){
				uiTips.remove();
			});
		}, t);
	}
//	function show(html, time){
//		var uiTips = $('<div class="lui-tips"></div>'),
//			content = $('<div class="tips-content"><img width="64px" height="50px" src="/css/theme/default/img/success-tips.png"/><br></div>');
//
//		uiTips.append(content);
//		content.append($('<span>').html(html));
//
//		uiTips.appendTo($('body')).fadeIn();
//
//		var host = $(window),
//			w = host.width(),
//			h = host.height(),
//			tw = uiTips.outerWidth(),
//			th = uiTips.outerHeight();
//		uiTips.css({left: (w-tw)/2, top: (h-th)/2});
//
//		var t = time || 2000;
//		setTimeout(function(){
//			uiTips.animate({opacity: 'hide'}, 'normal', 'swing', function(){
//				uiTips.remove();
//			});
//		}, t);
//	}
	function closeDialog(message, callback){
		AlertDialog.close();
	}

	function warn(message, callback){
		var alt = new AlertDialog(message, 'warn', callback);
	}
	function info(message, callback,title){
		var alt = new AlertDialog(message, 'info', callback,title);
	}
	function prompt(node, html, button, fn, opt){
		var DEFAULT_CONFIG = {
			position: 'right',
			closable: true
		};
		var cfg = $.extend(DEFAULT_CONFIG, opt);

		var uiTips = $('<div class="lui-tips lui-tips2"></div>'),
			triangle1 = $('<span class="triangle-'+cfg.position+'1"></span>'),
			triangle2 = $('<span class="triangle-'+cfg.position+'2"></span>'),
			content = $('<span class="tips-prompt-content"></span>');

		uiTips.append(triangle1);
		uiTips.append(triangle2);
		
		uiTips.append(content);
		if(!cfg.closable){
			content.append('<a href="javascript:void(0)" class="close">✕</a>');
		}
		content.append($('<span class=""></span>').html(html));
		if(button){
			content.append('<span class="btn">'+button+'</span>');
		}

		uiTips.appendTo($('body')).fadeIn();

		var host = $(node),
			offset = host.offset(),
			w = host.outerWidth(),
			h = host.outerHeight(),
			tw = uiTips.outerWidth(),
			th = uiTips.outerHeight(),
			st = $('body', 'html').scrollTop(),
			tleft, ttop;

		switch(cfg.position){
			case 'left':
				tleft = offset.left+w+20;
				ttop = offset.top+(h-th)/2;
			break;
			case 'right':
				tleft = offset.left+w+10;
				ttop = offset.top-st-8;
			break;
			case 'up':
				tleft = offset.left+(w-tw)/2;
				ttop = offset.top+h+20;
			break;
			case 'down':
				tleft = offset.left+(w-tw)/2;
				ttop = offset.top-th-20;
			break;
		}
		uiTips.css({left: tleft, top: ttop});

		content.find('.close').on('click', function(e){
			uiTips.remove();
		});

		content.find('.btn').on('click', function(e){
			uiTips.remove();
		});

	}
	function dyToast(message){
		var toast = $(".infoDynamic").find('.dynamic-toast');
		if(message && toast.length > 0){
			toast.html(message).fadeIn(500,function(){
				setTimeout(function(){
					toast.fadeOut(500);
				},2000);
			});
		}
	}

	function destory(){
		$('.lui-tips').remove();
	}

	return Tips;
});
