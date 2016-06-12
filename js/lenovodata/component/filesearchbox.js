define("component/filesearchbox",function(require,exports,module){
	SearchController = require('lenovodata/searchController');
	require("calendar");
	function FileSearchBox(node,func){
		this.node = $(node);
		this.callback = func;
		this.render();
	}
	FileSearchBox.prototype = {
		render:function(){
			var template = $(['<div class="search-area-box"><input id="search-input" placeholder='+_("搜索文件")+'>',
			                  '<i id="search-btn" class="icon i-search" title="'+_("搜索")+'"></i>',
			                  '<span class="search-more"><span class="arrow"></span></span></div>',
			                ].join(""));
			                
			this.node.empty();
			this.node.append(template);
			this.node.append($("#template_sinior_search").html());
			this.bindEvent();		
		},
		bindEvent:function(){
			var self = this;
			var onOff=true; 
			
	        var timer=null;
	        self.node.on("mouseleave",function(ev){
	        	clearTimeout(timer);
				timer=setTimeout(function(){
					searchBoxHide();
				},2000);
	        });
	        self.node.on("mouseenter",function(ev){
				clearTimeout(timer);
			});
			
			$("#type").mouseenter(function(){
				clearTimeout(timer);
			});
	        
	        function searchBoxShow(){
				$("#searchBox").stop(false,true).slideDown();			
				onOff=false;
			}
			function searchBoxHide(){
				$(".gldp-default").hide();				
				$("#searchBox").stop(false,true).slideUp();					
				onOff=true;
			}

		self.node.delegate(".search-more","click",function(ev){
			if(onOff){
				searchBoxShow();
			}else{
				searchBoxHide();
			}


			$('#startDate').calendar({
                    calendarOffset:{
                       x:10,y:30
                    },
		            onClick: (function(el, cell, date, data) {
		                el.val(Util.formatDate(date, 'yyyy-MM-dd'));
		            })
		        });	
		        
		        $('#endDate').calendar({
                    calendarOffset:{
                        x:10, y:85
                    },
		            onClick: (function(el, cell, date, data) {
		                el.val(Util.formatDate(date, 'yyyy-MM-dd'));
		            })
		        });
		        
		        $('.gldp-default').on("mouseenter",function(ev){
					clearTimeout(timer);
				});
				$('.gldp-default').on("mouseleave",function(ev){
					$(".gldp-default").hide();
				});
	        });
	        
	        //高级搜索
	        var searchbtn = $('#search-btn'),sinput = $("#search-input");
	        $('#gosearch').on('click',function(){
	        	var val = $.trim(sinput.val());     	    											
				var desc = $('#searchBox').find('#desc')[0].checked ? true:false;
				var exact = $('#searchBox').find('#exact')[0].checked ? true:false;
	        	var size_start = $("#searchBox").find('.size').eq(0).val(), size_end = $("#searchBox").find('.size').eq(1).val();
	        	if(size_start != '' && !Util.validNumber(size_start)){
	        		Tips.warn(_('[起始大小]：请输入正确的数字'));
	        		return;
	        	}
	        	if( size_end != '' && !Util.validNumber(size_end)){
	        		Tips.warn(_('[结束大小]：请输入正确的数字'));
	        		return;
	        	}
	        	if( size_start && size_end){
	        		if(parseInt(size_start) > parseInt(size_end)){
	        			Tips.warn(_('结束大小必须大于起始大小'));
	        			return;
	        		}
	        		
	        	}	        	     	
	        	var time_start =  $('#startDate').val(), time_end = $('#endDate').val();
	        	if( new Date(time_start.replace(/\-/g,'/')) > new Date(time_end.replace(/\-/g,'/')) ) {
	        		Tips.warn(_('结束日期必须大于开始日期'));
	        		return;
	        	}        	
	        	if(time_start) time_start += ' 00:00:00';
	        	if(time_end) time_end += ' 23:59:59';
	        	var creator = $('.creator').val();	        	
	        	var filetype = $('#searchBox #type').val();		        	
	        	if(path){
	        		self.path = path;
	        	}        	
				if(searchbtn.hasClass('i-search')){
        			var val = $.trim(sinput.val());		        		
        		}
				searchbtn.removeClass('i-search').addClass('i-close2');
				
				searchBoxHide();
				
				self.callback&&self.callback(true);
				Util.sendDirectlyRequest('搜索','高级搜索','-');
	        	SearchController(window.fileManager, 'file', val, size_start, size_end, time_start, time_end, creator, filetype, desc,exact);
	        });
	        searchbtn.on('click', function(e){
        		var me = $(this);
        		if(me.hasClass('i-close2')){
        			self.callback&&self.callback(false);
        			searchbtn.removeClass('i-close2').addClass('i-search');
                    $(".fileManager_bottom").show();
        			window.fileManager.browse(window.fileManager.path || '/', self.cssAction);
        		}else{
        			var val = $.trim(sinput.val());
	        		if(val != ''){
	        			self.callback&&self.callback(true);
	        			searchbtn.removeClass('i-search').addClass('i-close2');
	        			Util.sendDirectlyRequest('搜索','普通搜索','-');
	        			SearchController(window.fileManager, 'file', val);
	        		}      		
        		}
        	});
        	sinput.on('keydown', function(e){
        		//if(!searchbtn.hasClass('i-close2')){
	        		if(e.keyCode == 13){
	        			var val = $.trim(sinput.val());
		        		if(val != ''){
		        			self.callback&&self.callback(true);
		        			searchbtn.removeClass('i-search').addClass('i-close2')
		        			Util.sendDirectlyRequest('搜索','普通搜索','-');
		        			SearchController(window.fileManager, 'file', val);
                            $(".fileManager_bottom").hide();
		        		}
	        		}
        		//}
        	}).on("focus",function(e){
        		self.node.addClass("searchboxfocus");
        	}).on('blur',function(e){
        		self.node.removeClass("searchboxfocus");
        	});
		}
	}
	return FileSearchBox;
});
