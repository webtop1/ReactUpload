;define('component/dynamic', function(require, exports){
	var $= jquery = require('jquery'),
	EventTarget = require('eventTarget'),
    FileModel = require('model/FileManager.js'),
	AuthModel = require('model/AuthManager'),
    Util = require('util'),
    eventController = require('lenovodata/eventController'),
    eventManager = require('lenovodata/model/EventManager'),
    List = require('component/list'),
	Scroll = require('component/scroll');
	require('i18n');
	require('cookie');
	var	_ = $.i18n.prop;

	require('mustache');
	
	function Dynamic(node,path_type,path,neid,prefix_neid,from){
		var self =this;
		self.node = $.type(node) == 'string' ? $(node) : node;
		self.path_type = path_type=="share_out" ? 'self' : path_type;
		self.neid = neid || null;
		self.path = path || '';
		self.from = from || '';
		self.prefix_neid = prefix_neid || 0;
		self.dataList = [];
		self.selectIndex = 0; //当前选中的index
		if(self.path.indexOf('/') != 0){
			self.path = '/'+self.path;
		}
		self._init();
	}
	$.extend(Dynamic.prototype, EventTarget, {
		_init:function(){
			var self = this;
			self.ec = new eventController(function(){
				self.renderScroll();
			},true);
			self.manager = new eventManager();
			self.checkHasDynamic();
			if(self.node != null){
				self.infoTab();
			}
		},
		infoTab:function(){
			var self = this;
			var infoTabHead = self.node.find('.infoTab').find('.infoTabHead');
			var index = localStorage.getItem('showTab') || 0;
			if(infoTabHead.length > 0){
				self.selectHeader(index);
				infoTabHead.delegate('span','click',function(e){
					var index = $(e.target).index();
					localStorage.setItem('showTab',index);
					if(index==1)Util.sendDirectlyRequest("主页面","点击右侧栏动态tab","-");
					self.selectHeader(index);
				});
			}
		},
		selectHeader:function(index){
			var self = this;
			self.node.find('.infoTab .infoTabHead span').eq(index).addClass('active').siblings().removeClass('active');
			self.node.find('.infoTab .infoBox').eq(index).show().siblings('.infoBox').hide();
			if(index == 1 && index != self.selectIndex){
				self.selectIndex = index;				
				self.renderDynamic();
				$(".has-dynamic-icon").removeClass('has-dynamic');
			}else{
				self.selectIndex = index;
				self.dataList = [];
			}
			
			var dynamicTab = self.node.find('.infoTab .infoTabHead span.infoTabDynamic');
			if(dynamicTab.hasClass('active')){
				$('.show-dynamic-button').addClass('dynamicShow');
			}else{
				$('.show-dynamic-button').removeClass('dynamicShow');
			}
		},
		renderDynamic:function(){
			var self = this;
			var path = self.path;
			var path_type = self.path_type;
			if(!path) return;
			self.setBodyHeight();
			var list = new List('#dynamic-list', function(param, success, error){
				var params = {type:'all',n:param.size,p:param.offset+1,path:path,path_type:path_type};
				if(parseInt(self.neid) > 0){
					params.neid = self.neid;
				}
				if(parseInt(self.prefix_neid)>0){
					params.prefix_neid = self.prefix_neid;
				}
	            self.manager.list(function(result){
	            	if(result.code == 200){
	            		$(".scl-content .dynamic-item").remove();
	            		self.dataList = self.dataList.concat(result.data.event);
						success(self.ec.filterData(self.dataList),result.total);
						$(".scl-content .dynamic-item").last().css({'margin-bottom':'5px'});
					}
	            	setTimeout(function(){
	            		/*实时更新是否有新动态*/
	            		self.checkHasDynamic(true);
	            		$("#has-dynamic").removeClass('has-dynamic');
	            		if(self.list&&self.list.scroll){
	            			self.list.scroll.render(true);
	            		}
	            	},100);
		         }, params);
		        },false,10,true);
	        list.initList({
				'empty': '#template_dynamic_nodata_body',
	            'default':"#template_dynamic_list_body",
	            'folder':"#template_dynamic_list_body"
	        });
	        list.render(true);
	        self.list = list;
		},
		checkHasDynamic:function(isDynamic){
			var self = this;
			var params = {path:self.path,path_type:self.path_type};
			if(parseInt(self.from) > 0){
				params.from = self.from;
			}
//			if(parseInt(self.neid) > 0){
//				params.neid = self.neid;
//			}
			if(parseInt(self.prefix_neid)>0 && /^share_/.test(self.path_type)){
				params.prefix_neid = self.prefix_neid;
			}
			if ($(".has-dynamic-icon").length>0 && typeof params.path_type == 'string') {
				self.manager.hasNew(function(json){
					self.checkHasDynamicBack(json,isDynamic);
				},params);
			}
			if(location.pathname.indexOf('event/list') != -1){
				self.manager.hasNew(function(json){},{type:'clear'});
			}else{
				if($('.has-dynamic-icon-all').length>0 && self.path =='/'){
					self.manager.hasNew(function(json){
						self.checkAllHasDynamicBack(json);
					},{});
				}
			}
			
		},
		checkAllHasDynamicBack:function(json){
			if(json.count>9&&json.count<99){
        		$('.has-dynamic-icon-all i').attr({'class':'msgMid'});
        	}else if(json.count >99){
        		$('.has-dynamic-icon-all i').attr({'class':'msgBig'});
        	}else{
        		$('.has-dynamic-icon-all i').attr({'class':'msgSmall'});
        	}
			if(json.hasOwnProperty("hasNew") && json.hasNew){
				if(json.count >= 100){
					json.count = '99+';
				}
				$(".has-dynamic-icon-all").addClass('has-dynamic').find('i').html(json.count);
			}else{
				$(".has-dynamic-icon-all").removeClass('has-dynamic').find('i').html('');
			}
		},
		checkHasDynamicBack:function(json,isDynamic){
			json.count >= 100 && (json.count='99+');
			if(json.count>9&&json.count<99){
        		$('#has-dynamic-show-num i').attr({'class':'msgMid'});
        	}else if(json.count == '99+'){
        		$('#has-dynamic-show-num i').attr({'class':'msgBig'});
        	}else{
        		$('#has-dynamic-show-num i').attr({'class':'msgSmall'});
        	}
			if(json.hasOwnProperty("hasNew") && json.hasNew){
				$(".has-dynamic-icon").addClass('has-dynamic');
				$('#has-dynamic-show-num').addClass('show').find('i').html(json.count);
			}else{
				$(".has-dynamic-icon").removeClass('has-dynamic');
				$('#has-dynamic-show-num').removeClass('show').find('i').html('');
			}
			if(typeof isDynamic == 'boolean' && isDynamic){
				$("#has-dynamic").removeClass('has-dynamic');
			}
		},
		setBodyHeight:function(){
			var height = $(".conright").height() - $(".fileAttribute .file-top").height() - $(".fileAttribute .infoTabHead").height() - $('#foot').height() - 30;
			$("#dynamic-list #listBody").empty().css({height:(height+8)+"px"});
		},
		renderScroll:function(){
			var self = this;
			if(self.list){
				self.list.scroll.render(true);
				//self.list.scroll.scrollDelta(-$("#listBody .scl-content").height());
			}
		}
	});
	return Dynamic;
})