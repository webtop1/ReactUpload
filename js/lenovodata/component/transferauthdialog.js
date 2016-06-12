define("component/transferauthdialog",function(require,exports,module){
	var $ = require("jquery"),
	Dialog = require("component/dialog"),
	ListView = require("component/listview"),
	SearchBox = require("component/searchbox"),
	UserModel = require("model/UserManager"),
	AuthModel = require("model/AuthManager"),
	Tips = require("component/tips"),
	_ = $.i18n.prop;
	require("mustache");
	function TransferAuthDialog(type,params,func){
		var info = {};
		if(type==0){
			info.folder = params;
		}else if(params.length==1&&type==1){
			info.user = params[0];
			info.user.name = info.user.username;
		}else if(type==2){
			info.users = params;
		}
		this.func = func;
		this.option = $.extend({},info);
		this.type = type;//0文件移交 1删除单个用户移交 2删除多个用户移交 
		this.init();
	}
	$.extend(TransferAuthDialog.prototype,{
		init:function(){
			var self = this;
			var confirm_inner = $(["<div class='transferauth'><h2>"+_("该用户拥有与他人共享的文件夹，您可以：")+"</h2>",
			             "<p>"+_("1、彻底删除，清除其个人文件夹和共享文件夹数据")+"</p>",
			             "<p>"+_("2、将其共享文件夹移交给网盘其他用户")+"</p>",
			             "</div>",
			             "<div class='dialog-button-area'>",
			             "<a class='dialog-button ok'>"+_("移交共享文件夹")+"</a>",
			             "<a class='dialog-button cancel'>"+_("彻底删除")+"</a>",
			             "</div>"
			             ].join(""));
			var dialog;
            if(this.type==0){
            	this.selectUser([this.option.folder],Util.getUserID());
            }else if(this.type==1){
            	this.dialog = dialog = new Dialog(_("删除用户"),function(parentNode,func){
            		parentNode.append(confirm_inner);
            		if(/msie/.test(navigator.userAgent.toLowerCase())){
	            		parentNode.css("width",400);
	            	}
            	});
            	confirm_inner.find("a.ok").on("click",function(ev){
            		dialog.close();
            		self.showSharelist(self.option.user);
            	});
            	confirm_inner.find('a.cancel').on('click',function(ev){
            		UserModel.batch_del(function(ret) {
			            if (ret.code == 200) {
			                Tips.show(ret.message);
			                self.func();
			                dialog.close();
			            } else{
			                Tips.warn(ret.message);
			            }
			        }, [self.option.user.id],true);
            	})
            }else{
            	this.showUserlist(this.option.users);
            }
		},
		showUserlist:function(data){
			var inner = $(["<div class='transferauth showauth'><h2 class='info'>"+_("所选用户中有人拥有与他人共享的文件夹，您可以：")+"</h2>",
			                "<div class='selection clearfix'>",
			                   "<p>"+_("1、彻底删除，清除其个人文件夹和共享文件夹数据")+"</p>",
			                   "<p>"+_("2、将其共享文件夹移交给网盘其他用户")+"</p>",
			                "</div>",
			                "<h2 class='usernum'></h2>",
			                "<div class='lui-list'></div>",
			                "<div class='dialog-button-area'>",
			                     "<a class='dialog-button cancel'>"+_("全部删除")+"</a>",
			                "</div>"].join(""));
			var list_config = {column:1,template:['<li class="list-item" index={{index}}>',
			                                      '<span class="item-name" title="{{name}}">{{name}}</span>',
			                                      '<span class="item-email" title="{{email}}">{{email}}</span>',
			                                      '{{#hasshare}}<span class="transfer">'+_("移交权限")+'</span>{{/hasshare}}',
			                                      '<span class="i-authdelete">'+_("删除")+'</span>',
			                                      '</li>'].join("")};
            var self = this;
            self.dialog = new Dialog(_("移交授权"),function(parentNode,func){
            	parentNode.addClass("exwraper");
            	parentNode.append(inner);
            	parentNode.css("width",400);
            	self.user_to_transfer = new ListView($(".transferauth .lui-list"),list_config);
            	var datas = [];
            	var user_counter = 0;
            	for(var i=0;i<data.length;i++){
            		if(data[i].hasshare)user_counter++;
            		datas.push({hasshare:data[i].hasshare,id:data[i].id,name:data[i].username,email:data[i].email,index:data[i].index});
            	}
            	$('.transferauth .usernum').html(user_counter==1?_("有1人存在与他人共享文件夹"):_("有{0}人存在与他人共享文件夹",user_counter));
            	self.user_to_transfer.render(datas);
            });
            self.user_to_transfer.on("delete",function(param){
            	var user_id = data[param].id;
            	UserModel.batch_del(function(result){
            		if(result.code==200){
            			Tips.show(result.message);
            			self.option.users.splice(param,1);
            			self.dialog.close();
            			self.showUserlist(self.option.users);
            		}else{
            			Tips.warn(result.message);
            		}
            	},[user_id],true);
            });
            self.user_to_transfer.on("item-added",function(param){
            	if(param.hasshare){
            		self.dialog.close();
            	    self.showSharelist(param);
            	}	
            });
            inner.find("a.cancel").on("click",function(){
            	var uids = [];
            	for(var i=0;i<data.length;i++){
            		uids.push(data[i].id);
            	}
            	UserModel.batch_del(function(result){
            		if(result.code==200){
            			self.dialog.close();
            			Tips.show(result.message);			
            		}else{
            			Tips.warn(result.message);
            			self.dialog.close();
            		}
            		self.func&&self.func();
            	},uids,true);
            });
		},
		showSharelist:function(data){
			var self = this;
			var inner = $(["<div class='transferauth'><h2 class='share'></h2>",
			                "<div class='lui-list'></div>",
			                "<div class='dialog-button-area'>",
			                     "<a class='dialog-button ok'>"+_("下一步")+"</a>",
			                "</div>"].join(""));
			var list_config = {column:1,template:['<li class="list-item" index={{index}}>',
			                                      '<span class="icon i-checkbox" index={{index}}><i class="icon i-checked"></i></span>',
			                                      '<span class="icon-file folder"></span>',
			                                      '<div class="row2" index={{index}}><span class="up">{{name}}</span><span class="down">共享文件夹</span></div>',
			                                      '</li>'].join("")};
			self.dialog = new Dialog(_("移交权限"),function(parentNode,func){
				parentNode.addClass("exwraper");
				parentNode.append(inner);
				if(/msie/.test(navigator.userAgent.toLowerCase())){
            		parentNode.css("width",400);
            	}
				self.filelist = new ListView(inner.find(".lui-list"),list_config);
				AuthModel.list_by_operator(function(result){
					if(result.code==200){
						var datas = [],obj = {};
						for(var i=0;i<result.data.length;i++){
							var item = result.data[i];
							if(obj[item.path])continue;
							obj[item.path] = true;
							var file = Util.resolvePath(item.path, item.is_dir);
							datas.push({id:item.id,path:item.path,name:file.name,neid:item.neid,index:datas.length})
						}
						$(".transferauth h2.share").html(_('"{0}"的{1}个共享文件夹',data.name,datas.length));
						self.filelist.render(datas);
					}
				},data.id,1);
			});
			this.selected = {};
			self.filelist.on("item-added",function(param){
				var index = param.index;
				if(self.selected[index]){
					delete self.selected[index];
					$(".transferauth .lui-list .list-item").eq(index).removeClass("selected");
				}else{
					self.selected[index] = param;
					$(".transferauth .lui-list .list-item").eq(index).addClass("selected");
				}		
			});
			$(".transferauth a.ok").click(function(ev){
				var shares = [];
				for(var i in self.selected){
					shares.push(self.selected[i]);
				}
				if(shares.length>0){
					self.dialog.close();
					self.selectUser(shares,data.id,function(){
						if(shares.length==self.filelist.data.length){
							self.option.users[data.index].hasshare = false;
							if(self.type==1){
								alert(_("您确定要删除用户吗"));
							}else if(self.type==2){
								self.showUserlist(self.option.users);
							}
						}else{
							self.showSharelist(data);
						}
					});
				}
			});
		},
		selectUser:function(share,user_id,func){
			var self = this;
			var inner = $(["<div id='transferauth'><h2>"+_("网盘成员")+"</h2>",
			                  "<div class='search-box'></div>",
			                  "<div id='foldersharememberlist' class='box-list'><h2>"+_("文件夹共享成员")+"</h2>",
			                     "<div class='lui-list'></div></div>",
			                  "<div id='memberlist' class='box-list'><h2>"+_("网盘成员")+"</h2>",
			                    "<div class='lui-list'></div>",
			                  "</div>",
			                  "<div id='searchedlist' class='box-list'><h2>"+_("网盘成员")+"</h2>",
			                    "<div class='lui-list'></div>",
			                  "</div>",
			                  "<div class='dialog-button-area'>",
			                    "<a class='dialog-button ok'>"+_("确定")+"</a>",
			                    "<a class='dialog-button cancel'>"+_("取消")+"</a>",
			                  "</div>",
			             "</div>"].join(""));
			var list_config = {column:1,template:'<li class="list-item" index="{{index}}"><span class="item-name">{{name}}</span><span class="item-team">{{email}}</span><span class="item-message"></span></li>'};
			
			self.dialog = new Dialog(_("移交权限"),{"minHeight":"430px","minWidth":"486px"},function(parentNode,func){
				parentNode.addClass("exwraper");
				parentNode.append(inner);
				$memberlist=$("#memberlist");
				$memberlist.hide();
				self.searchbox = new SearchBox($("#transferauth .search-box"),function(result){
					$memberlist.hide();
					$("#foldersharememberlist").hide();
					var datas = [];
					for(var i=0;i<result.length;i++){
						var data = result[i];
						if(data.agent_type=="user"){
							datas.push({id:data.uid,name:data.user_name,team:data.team,email:data.email});
						}				
					}
					self.searchedlist.render(datas);
					inner.find("#searchedlist").show();
				});
				self.searchbox.on("close",function(){
					inner.find("#searchedlist").hide();
					$("#foldersharememberlist").show();
				});
				self.searchedlist = new ListView($("#searchedlist>.lui-list"),list_config);
				self.sharelist = new ListView($("#foldersharememberlist>.lui-list"),list_config);
				self.sharelist.data = [];
			    self.memberlist = new ListView($("#memberlist>.lui-list"),list_config);
			    self.memberlist.data = [];
			    if(share.length>=1){
			    	var s_path = [];
			    	for(var n =0;n<share.length;n++){
			    		s_path.push('{"neid":"'+share[n].neid+'"}');	
			    	}
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
							$(self.sharelist.node).css("height","215px");
			    			if(count<3){			    				
			    				if(count==0){
			    					count = 1;
			    					$(self.sharelist.node).find(".scl-content").append("<p class='item-empty'>"+_("暂无共享成员")+"</p>");
			    				    return;
			    				}
			    			}
							self.sharelist.render(self.sharelist.data);
			    		}
			    	},entrys,1);
			    }
				/*
				UserModel.list_for_pages(function(result){
					if(result.code==200){
						for(var i=0;i<result.data.content.length;i++){
							var item = result.data.content[i];
							if(item.user_id==user_id)continue;//踢掉属主用户因为移交不能给该用户
							self.memberlist.data.push({id:item.user_id,name:item.user_name,email:item.email});
						}
						self.memberlist.render(self.memberlist.data);
					}
				},0,10000);*/
			});
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
			self.sharelist.on("item-added",function(param){
				searchUserSpace(self.sharelist,param);
			});
			self.memberlist.on("item-added",function(param){
				searchUserSpace(self.memberlist,param);
			});
			self.searchedlist.on("item-added",function(param){
				searchUserSpace(self.searchedlist,param);
			});
			$("#transferauth a.ok").click(function(ev){
				if(self.selected&&self.selected.id){
					var json_arr = [],frompath;
					$(share).each(function(i,value){
						frompath = {path:value.path};
						if(value.prefix_neid!=0){
							frompath.prefix_neid = value.prefix_neid;
						}
						json_arr.push(frompath);
					});
					AuthModel.auth_transfer(function(result){
						if(result.code==200){
							self.dialog.close();
							if(self.type==0){
								Tips.show('<span class="tipsNone">'+_('{0}移交权限成功<em>{1}</em>',self.option.folder.name,self.selected.name)) +'</span>';
							}
							func&&func();
							self.func&&self.func();
						}else{
							Tips.warn(result.message);
							self.dialog.close();
						}
					},user_id,JSON.stringify(json_arr),self.selected.id);
				}	
			});
			$("#transferauth a.cancel").click(function(ev){
				self.dialog.close();
			});
		}
	});
	return TransferAuthDialog;
});
