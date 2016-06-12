;define('component/fileManager/fileNavigator',function(require, exports, module){
	var $ = require('jquery'),
	    Util  = require('util');
    var EventTarget = require('eventTarget'),
    FileTree = require('component/fileManager/fileTree'),
    Scroll = require('component/scroll');
	require('mustache');
	require('i18n');
	var	_ = $.i18n.prop;

    function FileNavigator(context) {
        this.cssAction = context.cssAction;
        this.type = context.path_type;
        this._init();
    }

	$.extend(FileNavigator.prototype, EventTarget, {
        _init: function() {
            var self = this;
            self.scroll = null;
            
        },
        render: function(paths, width) {
            var self = this;
            var fileNav = [];
            var moreNav = [];
            self.paths = paths;
            self.width = width ? width : 430;

            var dirItemArr = paths;
            
            var item = '<a src="{{url}}" title="{{dirname}}" class="item_arrow"><span class="item_title">{{dirname}}</span></a>';
            var first_temple = '<a  src="/" id="nav_root" title="{{dirname}}" class="item_arrow"><span class="item_title">{{dirname}}</span></a><i class="icon i-arrow-l" id="showTree"></i>';
            if(paths.length==1){
            	first_temple = '<a  id="nav_root" title="{{dirname}}" class="item_arrow_root"><span class="item_title">{{dirname}}</span></a>';
            	if(window.fileManager.navTree&&window.fileManager.navTree.fileTree.childCount>0){
            		first_temple += '<i class="icon i-arrow-l" id="showTree"></i>';
            	}
            }
			var delimiter = '';
            var first = Mustache.render(first_temple, {dirname: Util.getRootDisplayName(self.type)});
            var ellipsis = '<span class="moreNav item_arrow"><i class="moreNavBtn">......</i></span>';

            var len = dirItemArr.length;
            
            var lessItemArrDis = [];
            for(var i=0;i<len;i++){
            	if ( dirItemArr[i] != "" ) {
	             	var src = dirItemArr.slice(0, i+1).join('/');   
	            	lessItemArrDis[i] = dirItemArr[i].length <= 8? dirItemArr[i]: dirItemArr[i].substring(0,8)+'...';
	                var tmp =  Mustache.render(item, {url:src, dirname:  lessItemArrDis[i]});
	            	moreNav.push(delimiter + tmp);           		
            	}
            }

            //第一级文件夹不显示面包屑
//          if (len == 1) return;
            var dirItemArrDis = [];
            for (var i=len-1; i>=0; i--) {
                if ( dirItemArr[i] != "" ) {
                    var src = dirItemArr.slice(0, i+1).join('/');   
                    if (i==len-1) {
                        fileNav.unshift(delimiter + '<span class="item_arrow_cur" title=' + dirItemArr[i] +'>' + dirItemArr[i] + '</span>');
                    } else {
                    	dirItemArrDis[i] = dirItemArr[i].length <= 8? dirItemArr[i]: dirItemArr[i].substring(0,8)+'...';
                        var tmp =  Mustache.render(item, {url:src, dirname:  dirItemArrDis[i]});
                        fileNav.unshift(delimiter + tmp);
                    }
                }

                $('.filenav-area').append(first + fileNav.join(''));

                var realWidth = parseInt($('.filenav-area').css('width'));
                

                if (realWidth > self.width) {
                	moreNav.splice(len-fileNav.length);
                    fileNav.shift();
                    $('.filenav-area').empty();
                    $('.filenav-area').append(first + ellipsis + fileNav.join(''));
                    break;
                } else if (i>0){
                    $('.filenav-area').empty();
                }
            }
            
            if(self.scroll == null){
            	self.scroll = new Scroll('#moreNavList');
            }
            
            //点击出现目录树，点击其它出消失
            var showOnff=true;
            $('.filenav-area').delegate('#showTree','click',function(e){
            	if(showOnff){
            		 $('#filetreewrap').css("visibility","visible");
            	 	stopFunc(e);
            	 	showOnff=false;
            	}else{
            		$('#filetreewrap').css("visibility","hidden");
            		showOnff=true;
            	}
            	
            });
			/*document.onclick = function(e){
				$('#filetreewrap').css("visibility","hidden");
				showOnff=true;
			}
			$('#filetreewrap').on('click',function(e){
				stopFunc(e);
			});
			$('body').delegate('.lui-wait','click',function(e){
				stopFunc(e);
			});
			function stopFunc(e){
				document.all? event.cancelBubble = true : e.stopPropagation();
			}
            
            //end*/

            //点击其它设置框消失
            $(document).click(function(e){
                if(!$('#filetreewrap').is(e.target)&& $('#filetreewrap').has(e.target).length==0){
                    $('body').find('#filetreewrap').css("visibility","hidden");
                }
            });

            $('body').delegate('.lui-wait','click',function(e){
                stopFunc(e);
            });
            function stopFunc(e){
                document.all? event.cancelBubble = true : e.stopPropagation();
            }

            //end

            $('.fileManager_top > a').mouseover(function(e) {
                $(e.currentTarget).css("text-decoration", "underline");
            });

            $('.fileManager_top > a').mouseout(function(e) {
                $(e.currentTarget).css("text-decoration", "");
            });
            
            $('.fileManager_top').delegate('a','click',function() {
                var path = $(this).attr("src");
                if(!path)return false;
                self.fire("changePath", path, self.cssAction);
            });
            $('.moreNavList').delegate('span','click',function() {
                var path = $(this).find('a').attr("src");
                self.fire("changePath", path, self.cssAction);
            });
            
            //
            var timer,onOff=true;
            $('.moreNav').delegate('.moreNavBtn','click',function(e) {
            	var cur = $(e.currentTarget).find('.i-arrow');
            	if(onOff){
            		if(cur.length<1){
	            		$('.moreNavList .scl-content').append(moreNav.join(''));
	            	}
	            	
	                $('.moreNavList').stop(false,true).slideDown(function(){
	                	var height = $("#moreNavList .scl-content").height() > 100 ? 100 : $("#moreNavList .scl-content").height();
			            $("#moreNavList").css({height:height+"px"});
			            self.scroll.render(true);
	                });
            		onOff=false;
            	}else{
            		$('.moreNavList').stop(false,true).slideUp(function(){
            			$('.moreNavList .scl-content').empty();
            		});
            		onOff=true;
            	}
            	e.stopPropagation()
            	e.preventDefault();
            });    
            $('.moreNav').mouseenter(function(e) {
            	clearTimeout(timer);
            });            
            
            $('.moreNav').mouseleave(function(e) {
            	clearTimeout(timer);
            	timer=setTimeout(function(){
            		$('.moreNavList').slideUp(function(){
            			$('.moreNavList .scl-content').empty();
            		});
            		onOff=true;
            	},50)
            });
            $('.moreNavList').mouseenter(function(e) {
            	clearTimeout(timer);
            }); 
            $('.moreNavList').mouseleave(function(e) {
            	clearTimeout(timer);
            	timer=setTimeout(function(){
            		$('.moreNavList').slideUp(function(){
            			$('.moreNavList .scl-content').empty();
            		});
            		onOff=true;
            	},50)
            });
        }
    });

    return FileNavigator;
})
