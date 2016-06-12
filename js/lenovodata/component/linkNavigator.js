;define('component/linkNavigator',function(require, exports, module){
	var $ = require('jquery'),
	    Util  = require('util');
    var EventTarget = require('eventTarget');
	require('mustache');
	require('i18n');
	var	_ = $.i18n.prop;

    function LinkNavigator(context) {
        this.cssAction = context.cssAction;
        this._init();
    }

	$.extend(LinkNavigator.prototype, EventTarget, {
        _init: function() {
            var self = this;
        },
        render: function(paths, width) {
            var self = this;
            var fileNav = [];
            self.paths = paths;
            self.width = width ? width : 300;

            var dirItemArr = paths;
            
            var item = '<a class="listNav" src="{{url}}" title="{{dirname}}">{{dirname}}</a>';
            var delimiter = '<span class="icon i-fold">&gt\;</span>';
            var first = '<a class="listNav" src="'+dirItemArr[0]+'" title="'+dirItemArr[0]+'">'+dirItemArr[0].substring(0,5)+'...</a>';
            var ellipsis = '<span class="icon i-fold">&gt\;</span><span>...</span><span class="icon i-fold">&gt\;</span>';

            var len = dirItemArr.length;

            //第一级文件夹不显示面包屑

            var dirItemArrDis = [];
            for (var i=len-1; i>=0; i--) {
                if ( dirItemArr[i] != "" ) {
                    var src = dirItemArr.slice(0, i+1).join('/');   
                    if (i==len-1) {
						fileNav.unshift( '<span class="dirNav" title=' + dirItemArr[i] +'>' + dirItemArr[i] + '</span>');
                    } else {
                    	dirItemArrDis[i] = dirItemArr[i].length <= 5? dirItemArr[i]: dirItemArr[i].substring(0,5)+'...';
                        var tmp =  Mustache.render(item, {url:src, dirname:  dirItemArrDis[i]});
                        fileNav.unshift(tmp+delimiter);
                    }
                }
				
 				$('.filenav-area').empty();
				$('.filenav-area').append(fileNav.join(''));

                var realWidth = parseInt($('.filenav-area').css('width'));
                if (realWidth > self.width) {
                    fileNav.shift();
                    $('.filenav-area').empty();
                    $('.filenav-area').append(first+ellipsis + fileNav.join(''));
                    break;
                } else if (i>0){
                    $('.filenav-area').empty();
                }
            }

            $('.filenav-area > a').mouseover(function(e) {
                $(e.currentTarget).css("text-decoration", "underline");
            });

            $('.filenav-area > a').mouseout(function(e) {
                $(e.currentTarget).css("text-decoration", "");
            });
            
            $('.filenav-area > a').click(function() {
                var path = $(this).attr("src");
                self.fire("changePath", path, self.cssAction);
            });
            
            function cutStr(str,L){    
			    var result = '',
			        strlen = str.length,
			        chrlen = str.replace(/[^\x00-\xff]/g,'**').length;
			
			    if(chrlen<=L){return str;}
			    
			    for(var i=0,j=0;i<strlen;i++){
			        var chr = str.charAt(i);
			        if(/[\x00-\xff]/.test(chr)){
			            j++;
			        }else{
			            j+=2;
			        }
			        if(j<=L){
			            result += chr;
			        }else{
			            return result;
			        }
			    }
			}	
        }
    });

    return LinkNavigator;
})