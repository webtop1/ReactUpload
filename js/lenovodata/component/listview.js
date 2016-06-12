;define('component/listview', function(require, exports){
	var $= jquery = require('jquery'),
		EventTarget = require('eventTarget'),
		Util = require("util"),
		Scroll = require('component/scroll'),
		LuiCombox = require("component/luicombox"),
		UserTeamAuthCombox = require("component/userTeamAuthCombox");
	require('i18n');
	var	_ = $.i18n.prop;
	require('mustache');

	function ListView(node, config){
		var DEFAULT={
			column: 3,
			template: '<li class="list-item" index="{{index}}" title="{{name}}"><input class="item-checkbox" type="checkbox"/><span class="icon i-user"></span><span class="item-text">{{name}}</span><span class="isfull-{{member_limit}}">('+_("已满")+')</span></li>'
		};
		this.node = $.type(node) == 'string' ? $(node) : node;
		this.cfg = $.extend(DEFAULT, config);
        this.index=0;
        this.mapData={};
		this.selected = {};
		this._init();
	}

	$.extend(ListView.prototype, EventTarget, {
		_init: function(){
			var self = this;
			var ul=$('<ul class="lui-listview"></ul>');
			self.node.append(ul);
			self.scroll = new Scroll(ul);
            self.scroll.on('reachEnd',function(){
               if(self.cfg.reachEnd){
                   self.cfg.reachEnd.call();
               }
            });

            ul.delegate('.list-item', 'click', function(e){
				var cur = $(e.currentTarget),
					index = cur.attr('index'),
					tar = $(e.target), cbox;

				if(tar.hasClass('item-checkbox')){
					cbox = tar.get(0);
					if(tar.parent().find(".isfull-true").length>0){
						cbox.checked = false;
						return;
					}
					if(!cbox.checked){
						cur.removeClass('selected');
						self.data[index].selected = false;
						delete self.selected[index];
					}else{
						cur.addClass('selected');
						self.selected[index] = self.data[index];
						self.data[index].selected = true;
					}
					self.showBatch();
					var selectItem = self.getSelectedItem();
					var allItem = self.getAllItem();
					
					if(selectItem.length == allItem.length){
						$('.share-list').find(".item-checkbox").get(0).checked = true;
					}else{
						$('.share-list').find(".item-checkbox").get(0).checked = false;
					}
					
				}else{
					cbox = cur.find('.item-checkbox').get(0);
					if(tar.hasClass("i-authdelete")){
						var _index = tar.parent().attr("index");
						if(_index!=-1){
							self.fire('delete',_index);
						}
					}else{
						var _index = tar.parent().attr("index");
						if(_index!=-1){
							var obj = {},item_added =  self.mapData[_index];
                        	for(var k in item_added){
                        		obj[k] = item_added[k];//复制操作避免数据写同步
                        	}
							obj.index=_index;
							self.fire("item-added",obj);
						}
					}
					
				}
				//分发选择事件
				self.fire("selected",self.selected);
			});


		},

		render: function(data,isAppend){
			var self = this, ul = self.node.find('.lui-listview'), cols=self.cfg.column,num=0;
			self.data = data;
            if(!isAppend){
                self.scroll.emptyContent();
                self.index=0;//索引值必须从0开始
            }
			if(data.length==0&&!isAppend){
				$("#teamList .scl-content").append("<p style='text-align:center;line-height:200px;'>"+_("您目前没有可加入的团队")+"</p>");
			}
			for(var i=0, len=data.length; i<len; i++){
                var index=self.index++;
                self.mapData[index]=data[i];
                data[i].index = index;
				var li = $(Mustache.render(self.cfg.template, data[i]));
				if(li.find(".isfull-true").length>0){
					li.find("input[type='checkbox']").attr("disabled","disabled");
					li.css("background-color","#e0e0e0");
				}
				if(self.cfg.hasRoleCombox){
					var combox = new LuiCombox(li.find(".lui-combox"),{initval:data[i].role,type:'combox_role'});
					combox.on("change",function(_index,type,value){
						self.data[_index][type] = value;
					});
				}else if(self.cfg.hasAuthCombox){
					/*var authCombox = new UserTeamAuthCombox(li.find(".combox"),1,{defaultValue:data[i].cssAction,inherit:data[i].inherit,isTeam:data[i].agent_type=="team"});
					authCombox.on("change",function(_index,type,value){
						self.data[_index][type] = value;
					});
					authCombox.on("changeInherit",function(_index,type,flag){
						self.data[_index][type] = flag;
						//self.render(self.data);
						self.fire("changeInherit",_index,flag);
					});*/
					var combox = new LuiCombox(li.find(".lui-combox"),{initval:data[i].cssAction,inherit:data[i].inherit,isteam:data[i].agent_type=='team'});
					combox.on("change",function(_index,type,value){
						self.data[_index][type] = value;
					});
					combox.on("changeInherit",function(_index,type,value){
						self.data[_index][type] = value;
						self.fire("changeInherit",_index,value);
					});
				}
				li.width(100/cols + '%');
				if(data[i].selected){
					self.selected[i] = self.data[i];
					li.find(".item-checkbox").attr("checked",true);
					li.addClass('selected');
					num++;
				}
				self.scroll.appendContent(li);
				if(num>1){
					$('.share-list').find('.batch').show();
					$('.share-list').find('.authorize').hide();
				}else{
					$('.share-list').find('.batch').hide();
					$('.share-list').find('.authorize').show();
				}
				if(num == data.length){
					$('.share-list').find("h2 .item-checkbox").get(0).checked = true;
				}
			}
			if(data.length<2){
				$('.share-list').find('.batch').hide();
				$('.share-list').find('.authorize').show();
			}
//          self.selected = {};
			self.scroll.render();
		},

		getSelectedItem: function(){
			var self = this, data = self.selected, items=[];
			for(var key in data){
				items.push(data[key]);
			}
			return items;
		},
		getAllItem:function(){
			var self = this, data = self.data, items=[];

			for(var i=0;i<data.length;i++){
				items.push(data[i]);
			}	

//			for(var key in data){
//				if(key=='add')continue;
//				items.push(data[key]);
//			}			
			return items;
		},
		getAuthItem:function(){
			var self = this, data = self.data, items=[];

			for(var i=0;i<data.length;i++){
				items.push(data[i]);
			}				
			return items;
		},
		selectAll:function(flag){
			//全选 | 全不选
			var self = this;
			$(self.node.find(".list-item")).each(function(index,item){
				if(flag){
					$(item).addClass("selected");
					$(item).find(".item-checkbox").get(0).checked = true;
					$('.share-list').find(".item-checkbox").get(0).checked = true;
					self.selected[index] = self.data[index];
					self.data[index].selected = true;
				}else{
					$(item).removeClass("selected");
					$(item).find(".item-checkbox").get(0).checked = false;
					$('.share-list').find(".item-checkbox").get(0).checked = false;
					delete self.selected[index];
					self.data[index].selected = false;
				}
			});
			self.showBatch();
		},
		showBatch:function(){
			var self = this;
			var selectItem = self.getSelectedItem();
			var batch = $('.share-list').find('.batch');
			var authorize = $('.share-list').find('.authorize');
			if(selectItem.length>1){
				batch&&batch.show();
				authorize.hide();
			}else{
				batch&&batch.hide();
				authorize.show();
			}
		}
	});

	return ListView;
});
