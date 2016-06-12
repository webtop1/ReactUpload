/**
 * @fileOverview 共享移交，选择要移交的用户
 * @author thliu-pc
 * @version 3.6.0.1
 * @updateDate 2015/11/24
 */
;define("component/transfer/transfer_authdialog",function(require,exports,module){
	var $ = require("jquery"),
	Dialog = require("component/dialog"),
	ListView = require("component/listview"),
	SearchBox = require("component/searchbox"),
	UserModel = require("model/UserManager"),
	AuthModel = require("model/AuthManager"),
	Tips = require("component/tips"),
	_ = $.i18n.prop;
	require("mustache");

	function TransferAuthDialog(params,func){
		var info = {};
		for(var o in params){
			this[o]=params[o];
		}
		this.func = func;
		this.options = $.extend({},params);
		this.preDialog=params.dialog;
		this.init();
	}
	$.extend(TransferAuthDialog.prototype,{

		init:function(){
			var self=this;
            this.render(function(){
				self.events();
				self.setSearchBox();
				self.loadShareUserList(self.options);
			});
		},

		events:function(){
			var self=this;
			self.$sulist=$("#transfer_sugList");
			//上一步
			self.$dialog.delegate('a.pre','click',function(){
				self.preDialog.show();
				self.dialog.dialog.remove();
				self.dialog.mask.remove();
			});
			//确认提交
			self.$dialog.delegate("a.ok",'click',function(ev){
				self.authTransfer(ev);
			});
			//取消
			self.$dialog.delegate("a.cancel",'click',function(){
				self.dialog.close();
				self.preDialog.close();
			});
			//设置选择状态
			self.$sulist.delegate('li','click',function(){
				self.$sulist.find(".selected").removeClass('selected');
				self.selectedUserId=$(this).attr("uid");
				self.selectedUserName=$(this).find(".col2").text();
				$(this).addClass("selected");
			});


		},
		/**
		 * 选择用户
		 * @param afterRender
		 */
		render:function(afterRender){
			var self = this;
			var inner = $(["<div id='transfer_user_wrapper' class='transfer_user_wrapper'><h2>"+_("选择或输入将移交的网盘成员")+"</h2>",
			                  "<div class='search-box'></div>",
			                  "<div id='transfer_userlist' class='transfer_userlist'><h2>"+_("已共享成员")+"</h2>",
			                     "<div style='height: 200px;'></div></div>",
			                  "<div id='transfer_sugList' class='transfer_sugList'><h2>"+_("搜索结果")+"</h2>",
			                    "<ul></ul>",
			                  "</div>",
			             "</div>",
				"<div class='dialog-button-area'>",
				"<a class='dialog-button pre'>"+_("上一步")+"</a>",
				"<a class='dialog-button ok'>"+_("确定")+"</a>",
				"<a class='dialog-button cancel'>"+_("取消")+"</a>",
				"</div>"
			].join(""));
			self.dialog = new Dialog(_("选择移交成员"),{"minHeight":"430px","minWidth":"486px"},function(parentNode,func){
				parentNode.append(inner);
				self.$dialog=parentNode;
				afterRender&&afterRender.call();
			});
			self.dialog.on('close',function(){
				self.preDialog.close();
			});
		},
		/**
		 * 加载已经共享用户
		 * @param share
		 */
		loadShareUserList:function(){
			var self=this;
			var list_config = {column:1,template:'<li class="list-item" index="{{index}}"><span class="col1 icon i-user"></span><span class="item-name col2">{{name}}</span><span class="item-team col3">{{email}}</span><span class="item-message"></span></li>'};
			self.sharelist = new ListView($("#transfer_userlist div"),list_config);
			self.sharelist.data = [];
				var s_path = ['{"neid":"'+this.neid+'"}'];
				var entrys = "["+s_path.join(",")+"]";
				AuthModel.list_by_batch_resource(function(result){
					if(result.code==200){
						var obj = {},count = 0;
						for(var i=0;i<result.data.length;i++){
							var item = result.data[i];
							if(obj[item.id])continue;
							obj[item.id] = true;
							self.sharelist.data.push({id:item.id,name:item.username,email:item.email,index:count++});
						}
						var count = self.sharelist.data.length;
						if(count==0){
							count = 1;
							$(self.sharelist.node).find(".scl-content").append("<p class='item-empty'>"+_("暂无共享成员")+"</p>");
							$(self.sharelist.node).css("height",50*count);
							return;
						}
						self.sharelist.render(self.sharelist.data);
					}
				},entrys,1);

			self.sharelist.on('item-added',function(obj){
				self.selectedUserId=obj.id;
				self.selectedUserName=obj.name;
				$("#transfer_userlist").find("li[index='"+obj.index+"']").addClass("selected");
			});
		},
		/**
		 * 设置搜索
		 */
		setSearchBox:function(){
			var self=this;
			var $sugList=$("#transfer_sugList ul");
			var $transfer_userlist=$("#transfer_userlist");
			var $searchBox=$("#transfer_user_wrapper .search-box");
			self.searchbox = new SearchBox($searchBox,function(result){},0,20,'user',function(result){
					if(result.code==200) {
						$transfer_userlist.hide();
						$sugList.parent().show();
						$sugList.empty();
						if (result.data.length > 0) {
							for (var i = 0; i < result.data.length; i++) {
								var li = $("<li></li>");
								li.attr("uid",result.data[i].agent_id);
								li.append("<span class='col1 icon i-user'></span><span class='col2'>" + result.data[i].suggestion + "</span><span class='item-name col3'>"+ result.data[i].email + "</span>");
								$sugList.append(li);
							}
						} else {
							$sugList.append($("<li class='li-item-no-result'>" + _("搜索无结果，请换个关键词重新尝试") + "</li>"));
						}
					}
			});
			self.searchbox.on('close',function(){
				$transfer_userlist.show();
				$sugList.parent().hide();
				$searchBox.find("input").val("");
			});
		},
		/**
		 * 移交用户共享
		 * @param ev
		 */
		authTransfer:function(ev){
			var self=this;
			var len=$("#transfer_userlist").find("li.selected");
			if(self.$sulist.find(".selected").length<1&&len<1){
				Tips.warn(_('请选择移交成员'));
				return;
			}
				var fromUserId=self.uid;
			    var toUserId=self.selectedUserId;
				var json_arr = [];
				var frompath = {path:self.path};
				if(self.prefix_neid!=0){
					frompath.prefix_neid = self.prefix_neid;
				}
				json_arr.push(frompath);
				AuthModel.auth_transfer(function(result){
					if(result.code==200){
						self.dialog.close();
						self.preDialog.close();
						Tips.show('<span class="tipsNone">'+_('{0}移交权限成功<em>{1}</em>',self.path,self.selectedUserName)) +'</span>';
						func&&func();
						self.func&&self.func();
					}else{
						Tips.warn(result.message);
						self.dialog.close();
						self.preDialog.close();
					}
				},fromUserId,JSON.stringify(json_arr),toUserId);
		}

	});
	return TransferAuthDialog;
});
