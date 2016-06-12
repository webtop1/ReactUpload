define("component/transferspacedialog",function(require,exports,module){
	var $ = require("jquery"),
	Dialog = require("component/dialog"),
	ListView = require("component/listview"),
	SearchBox = require("component/searchbox"),
	FileModel = require("model/FileManager"),
	Tips = require("component/tips"),
	_ = $.i18n.prop;
	require("mustache");
	function TransferSpaceDialog(params,func){
		this.info = {};
		this.info.uids = params;
		this.func = func;
		this.init();
	}
	$.extend(TransferSpaceDialog.prototype,{
		init:function(){
			var self = this;
			var inner = $(["<div id='transferauth'><h2>"+_("将删除用户的个人空间移交给指定的用户。")+"</h2>",
			                  "<div class='search-box'></div>",
			                  "<div id='searchspacelist' class='box-list'><h2>"+_("移交给")+"</h2>",
			                    "<div class='lui-list lui-list-space'></div>",
			                  "</div>",
			                  "<div class='dialog-button-area'>",
			                    "<a class='dialog-button ok'>"+_("确定")+"</a>",
			                    "<a class='dialog-button cancel'>"+_("取消")+"</a>",
			                  "</div>",
			             "</div>"].join(""));
			var dialog;
			          
			this.dialog = dialog = new Dialog(_("个人空间数据移交"),function(parentNode,func){
        		parentNode.addClass("exwraper");
        		parentNode.append(inner);
        		if(/msie/.test(navigator.userAgent.toLowerCase())){
            		parentNode.css("width",400);
            	}
        		
        		//搜索结果展示
        		self.searchedlist(inner);
				
        	});
        	
        	//选中搜索结果中的用户
        	self.selectUser();
        	
        	inner.find("a.ok").on("click",function(ev){
        		self.transferDelUser();
        	});
        	inner.find('a.cancel').on('click',function(ev){
        		dialog.close();
        	})
		},
		searchedlist:function(inner){
			var self = this;
			var list_config = {column:1,template:'<li class="list-item" index="{{index}}"><span class="item-name">{{name}}</span><span class="item-team">{{email}}</span><span class="item-message"></span></li>'}; 
			self.searchedlist = new ListView($("#searchspacelist>.lui-list"),list_config);
    		self.searchbox = new SearchBox($("#transferauth .search-box"),function(result){		
				var datas = [];
				for(var i=0;i<result.length;i++){
					var data = result[i];
					if(data.agent_type=="user"){
						datas.push({id:data.uid,name:data.user_name,team:data.team,email:data.email});
					}				
				}
				self.searchedlist.render(datas);
				inner.find("#searchspacelist .lui-list").css('visibility','visible');
			});
			self.searchbox.on("close",function(){
				inner.find("#searchspacelist .lui-list").css('visibility','hidden');
			});
		},
		selectUser:function(){
			var self = this;
			function searchUserSpace(context,param){
				$("#transferauth .lui-list .list-item").removeClass("selected");
				if(self.selected&&self.selected.id==param.id){
					context.node.find(".list-item").eq(param.index).removeClass("selected");
				    self.selected = {};
				}else{
					context.node.find(".list-item").eq(param.index).addClass("selected");
				    self.selected = param;
				}		
			}
			self.searchedlist.on("item-added",function(param){
				searchUserSpace(self.searchedlist,param);
			});
		},
		transferDelUser:function(){
			var self = this;
			var infoDate={};
			
			if(!self.selected){
				Tips.warn(_("请选择一个移交对象"));
				return false;
			}
			
			infoDate.dest_id = self.selected.id;
			infoDate.src_id =  self.info.uids;
			
			
			if(self.info.uids == self.selected.id){
				Tips.warn(_("不能移交给被删除用户"));
				return false;
			}
			
			FileModel.space_transfer(function(result){
				if(result.code==200){
					self.dialog.close();
					self.func && self.func();
				}
			},infoDate);
		}

	});
	return TransferSpaceDialog;
});