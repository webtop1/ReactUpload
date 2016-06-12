define("component/authDialog",function(require,exports,module){
	var $ = require("jquery"),
	SearchBox = require("component/searchbox"),
	Tips = require("component/tips"),
	Dialog = require("component/dialog"),
	ConfirmDialog = require("component/confirmDialog"),
	AuthPanel = require("component/authPanel"),
	AuthTree = require("component/authTree"),
	AuthModel = require("model/AuthManager"),
	TeamModel = require("model/TeamManager"),
	ListView = require("component/listview"),
	LuiCombox = require("component/luicombox"),
	SearchTeam = require("component/searchTeam"),
	EventTarget = require("component/eventTarget"),
	_ = $.i18n.prop,
	Util = require("util");
	function AuthDialog(params,callback){
		this._index = 1;
		var auth_list_config = {
			                     noclick:true,
			                     column:1,
			                     hasAuthCombox:true,
			                     template:['<li class="list-item item-{{agent_type}}" index="{{index}}" title="{{name}}{{#userSlug}}({{userSlug}}){{/userSlug}}{{#domain_team}}(',
			                     	        _("域团队"),
			                     	        '){{/domain_team}}{{#domain_user}}-',
                                            _("企业认证用户"),
                                            '{{/domain_user}}">',
                                            '<span class="icon i-authdelete"></span><div class="lui-combox auth-combox" id="combox-{{index}}"></div>',
                                            '<span class="file-select"><input type="checkbox" class="item-checkbox"></span>',
                                            '<span class="icon i-{{agent_type}}{{#is_domain}}-domain{{/is_domain}}"></span>',
                                            '<span class="item-text">{{name}}</span>',
                                            '<i class="i-inherit i-inherit-{{inherit}}" title='+_("允许子团队继承权限")+'></i>',
                                            '</li>'].join("")
                               };
        this.option = $.extend(params,auth_list_config);
        this.callback = callback;
		this._init();
	}
	$.extend(AuthDialog.prototype,EventTarget,{
		_init:function(){
			var inner = ["<div class='auth-pane'>",
			               "<div class='teamtree'>",
			                  "<div class='clearfix'><h2>"+_("团队成员")+"</h2><div class='search-box'></div></div>",
			                  "<div id='teamGroup' class='treewrapper'></div>",
			                  "<div class='listwrapper' id='searchteam'></div>",
			               "</div>",
			               "<div class='icon-arrow'><span class='icon i-arrow-right'></span></div>",
			               "<div class='share-list'><h2><span class='authorize'>"+_("权限")+"</span><i></i><input type='checkbox' class='item-checkbox'><label>"+_("全选")+"</label>",
			               "<div class='batch'><span class='icon i-authdelete'></span>"+_("批量操作")+"&nbsp;<div class='lui-combox auth-combox' id='comboxAll'></div></div></h2>",
			                   "<div class='lui-list'></div>",
			               "</div>",
			             "</div>",
			             "<div class='dialog-button-area'>",
			                  "<a class='dialog-button ok'>"+_("确定")+"</a><a class='dialog-button cancel'>"+_("取消")+"</a>",
			             "</div>"
			            ].join("");
			var AuthPerson = ["<div class='auth-pane auth-person'>",
			               "<div class='share-list'><div class='authtree'>",
			               "<div class='clearfix'><h2>"+_("团队成员")+"</h2><div class='search-box'></div></div>",
			               "<div class='listwrapper' id='searchteam'></div></div>",
			               "<h2><span class='authorize'>"+_("权限")+"</span><i></i><input type='checkbox' class='item-checkbox'><label>"+_("全选")+"</label>",
			               "<div class='batch'><span class='icon i-authdelete'></span>"+_("批量操作")+"&nbsp;<div class='lui-combox auth-combox' id='comboxAll'></div></div></h2>",
			                   "<div class='lui-list'></div>",
			               "</div>",
			             "</div>",
			             "<div class='dialog-button-area'>",
			                  "<a class='dialog-button ok'>"+_("确定")+"</a><a class='dialog-button cancel'>"+_("取消")+"</a>",
			             "</div>"
			            ].join("");
			var self = this;

			if("/"==location.pathname||'/user/manage'==location.pathname||'/auth/list'==location.pathname || '/folder/favorite'==location.pathname && 'ent' == self.option.path_type){
				var dialog = new Dialog(_("授权管理"),function(parentNode,func){
					self.contentWraper = parentNode;
				    parentNode.append($(inner));

					if(/msie/.test(navigator.userAgent.toLowerCase())){
				    	parentNode.css("width",680);
				    }
				    self.auth_list = new ListView($(".share-list>.lui-list"),self.option);
				    self.auth_list.data = [];
				    self.render();
				});
			}else{
				var dialog = new Dialog(_("共享管理"),function(parentNode,func){
					self.contentWraper = parentNode;
				    parentNode.append($(AuthPerson));

					if(/msie/.test(navigator.userAgent.toLowerCase())){
				    	parentNode.css("width",350);
				    }
					parentNode.find('.listwrapper').addClass('pearsonList');
				    self.auth_list = new ListView($(".share-list>.lui-list"),self.option);
				    self.auth_list.data = [];
				    self.render();
				});
			}


			this.dialog = dialog;
		},
		render:function(){
			var self = this;
			var datas = [];
			var combox = new LuiCombox(self.contentWraper.find(".lui-combox"),{initval:'preview'});
			this.combox = combox;
			var searchBox = new SearchBox(this.contentWraper.find(".search-box"),function(result,uid){
				self.contentWraper.find(".listwrapper").show();
				self.contentWraper.find(".treewrapper").hide();
				self.searchTree.render(result);
				if(uid){
					self.searchTree.setSelectedNode(uid);
				}
			});

			self.searchTree = new SearchTeam($('#searchteam'),{type:1,max_height:220});
			searchBox.on("close",function(){
				self.contentWraper.find(".treewrapper").show();
				self.contentWraper.find(".listwrapper").hide();
				self.contentWraper.find(".scl-content").css('top','0');
				self.contentWraper.find(".search-txt").val('');
			});
			self.tree = new AuthTree(self.contentWraper.find(".treewrapper"),function(param,success,error){
				TeamModel.getTeamListById(function(result){
					success(result);
				},'',false,0,20);
			},{type:1,title:_("所有用户"),authTree:true,max_height:220});
			self.tree.render();
		    self.requestAuthData();
		    self.bindEvent();
		},
		bindEvent:function(){
			var self = this;
            self.tree.on("selectTeam",function(node){
            	 selectTeam(node);
			});
			self.tree.on("item-user",function(node){
				selectTeam(node);
			});

			function selectTeam(node){
				var obj = {
	                   id:node.id,
	                   name:node.name,
	                   agent_id:node.agent_id,
	                   is_domain:node.isCer,
	                   agent_type:node.agent_type,
	                   selected:true
	                  };
		        if(node.id==-1&&("/"!=location.pathname&&'/auth/list'!=location.pathname&&'/user/manage'!=location.pathname))return;
		        if(node.agent_type=="team")obj.inherit = false;
		        if(node.agent_type=="user")obj.userSlug = node.userSlug;
		        if(Util.dataRepArray(obj,self.auth_list.data).flag){
		        	var index = Util.dataRepArray(obj,self.auth_list.data).index;
		        	self.auth_list.data[index].selected = true;
		        	self.renderAuthList();
		        	return;
		        };
				self.auth_list.data.push(obj);
				self.renderAuthList();
			}
			self.searchTree.on("item-user",function(node){
				selectTeam(node);
			});
			self.searchTree.on("item-list",function(obj){
				if(Util.dataInArray(obj,self.auth_list.data))return;
				self.auth_list.data.push(obj);
				self.renderAuthList();
			});

			self.searchTree.on("item-close",function(){
				self.contentWraper.find(".listwrapper").hide();
				self.contentWraper.find(".search-txt").val('');
				$('.auth-person').find("a>span.i-search-close").removeClass("i-search-close").addClass("i-search");
			});

			//批量操作全选
			$('.item-checkbox').unbind('click').on('click', function(e){
                if($(this).prop('checked')){
                    self.auth_list.selectAll(true);
                }else{
                    self.auth_list.selectAll(false);
                }
                self.auth_list.node.find('.item-checkbox').prop('checked',$(this).prop('checked'));
            });

			//批量操作权限
			$('#comboxAll').delegate("li.combox-item","click",function(ev){
				self.combox.datalist.hide();
				var comboxAll = $(self.auth_list.getSelectedItem());
				for(var i=0,len = comboxAll.length;i<len;i++){
					comboxAll[i].cssAction = $(ev.currentTarget).attr('cssaction');
					self.auth_list.node.find(".list-item.selected .combox-text").html(ev.currentTarget.innerHTML);
				}

			});
			//批量操作删除
			$('.share-list').delegate("h2 .i-authdelete","click",function(ev){
				var curArr=[],index=0;
				var selectItem = self.auth_list.getSelectedItem();
				var len = selectItem.length;
				new ConfirmDialog({title: _("删除确认"), content: _("您确认要删除吗？")}, function(){
					for(var i=0;i<len;i++){
						if(selectItem[i]._id){
							curArr.push({
								auth_id:selectItem[i]._id
							});
						}else{
							for(var j in self.auth_list.data){
								if(!self.auth_list.data[j]._id && self.auth_list.data[j].index == selectItem[i].index){
									self.auth_list.data.splice(j,1);
								}
							}
						}
						delete self.auth_list.selected[selectItem[i].index];
					}
					self.auth_list.selected = {};
					self.renderAuthList();
					if(curArr.length>0){
							AuthModel.batch_del(function(ret) {
		                        if (ret.code == 200) {
		                        	for(var i in curArr){
		                        		for(var j in self.auth_list.data){
		                        			if(self.auth_list.data[j]._id && self.auth_list.data[j]._id==curArr[i].auth_id){
		                        				self.auth_list.data.splice(j,1);
		                        				break;
		                        			}
		                        		}
		                        	}
//				                    self.auth_list.selectAll(false);
									self.auth_list.selected = {};
				                	self.renderAuthList();
		                            Tips.show(ret.message);
		                        }else {
		                            Tips.warn(ret.message);
		                        }
		                    },curArr);
						}
					$('.share-list').find("h2 .item-checkbox").get(0).checked = false;
				});

			});

			self.auth_list.on("changeInherit",function(_index,value){
				//update css
            	var span_inherit = self.auth_list.node.find(".list-item").eq(_index).find(".i-inherit");
            	//删除span其余的样式
            	span_inherit.removeClass(function(){
            		var clazz  = this.className.split(" ");
            		clazz.splice(0,1);//保留第一个默认的样式名
            		return clazz.join(" ");
            	});
            	span_inherit.addClass("i-inherit-"+value);
			});
			self.auth_list.on("delete",function(index){
				var curId = self.auth_list.data[index]._id;
				new ConfirmDialog({content:_("您确认要删除吗？")},function(){
                    if(curId){
						AuthModel.batch_del(function(ret) {
	                        if (ret.code == 200) {
	                        	self.auth_list.data.splice(index,1);
	                        	self.renderAuthList();
	                        	if(self.auth_list.data.length==0){
	                        		self.callback&&self.callback();
	                        	}
	                            Tips.show(ret.message);
	                        } else if (ret.code == 500) {
	                            Tips.warn(ret.message.join("<br"));
	                        } else {
	                            Tips.warn(ret.message);
	                        }
	                    },[{auth_id:curId}]);
					}else{
						self.auth_list.data.splice(index,1);
						self.renderAuthList();
					}
					$('.share-list').find("h2 .item-checkbox").get(0).checked = false;
				});
			});
			self.contentWraper.find("h2>span.authorize").hover(function(){
				new AuthPanel($(this));
			},function(){
				$('body').find(".auth-panel").remove();
			});
			self.contentWraper.find(".dialog-button-area a.ok").click(function(ev){
				self.submitAuth();
			});
			self.contentWraper.find(".dialog-button-area a.cancel").click(function(ev){
				self.callback&&self.callback();
				self.dialog.close();
			});
		},
		requestAuthData:function(){
			var self = this;
			//如果是授权管理页面，则先查询授权记录
			AuthModel.list_by_resource(function(result){
				if(result.code!=200){
					return;
				}
				var data = result.data;
				for(var i=0,len = data.length;i<len;i++){
					var item = data[i];
					if(item.agent_type=="team"){
						self.auth_list.data.push({_id:item.id,id:item.agent_id,name:item.agent_name,agent_id:item.agent_id,is_domain:item.from_domain_account,domain_team:item.from_domain_account,agent_type:item.agent_type,cssAction:item.privilege_name,inherit:item.is_subteam_inheritable||false,selected:false});
					}else{
						self.auth_list.data.push({_id:item.id,id:item.agent_id,name:item.agent_type=="all"?_("所有用户"):item.agent_name,is_domain:item.from_domain_account,domain_user:item.from_domain_account,email:item.email,agent_id:item.agent_id,agent_type:item.agent_type,cssAction:item.privilege_name,selected:false,userSlug:'123456789'});
					}
				}
				self.renderAuthList();//渲染列表
			},self.option.path,("/user/manage"==location.pathname||"/"==location.pathname||"/auth/list"==location.pathname||"/folder/favorite"==location.pathname && 'ent' == self.option.path_type)?"ent":null,self.option.prefix_neid);
		},
		renderAuthList:function(){
            var self = this;
			var sort_by = function(name,minor){
			    return function(o,p){
			        var a,b;
			        if(o && p && typeof o === 'object' && typeof p ==='object'){
			            a = o[name];
			            b = p[name];
			            if(a === b){
			                return typeof minor === 'function' ? minor(o,p):0;
			            }
			            if(typeof a === typeof b){
			                return a < b ? -1:1;
			            }
			            return typeof a < typeof b ? -1 : 1;
			        }else{
			            thro("error");
			        }
			    }
			};
			self.auth_list.data = Util.unique1(self.auth_list.data);
			var result = self.auth_list.data.sort(sort_by("agent_type",sort_by("name")));
			self.auth_list.render(result);
		},
		submitAuth:function(){
			var arr = this.auth_list.getAuthItem(),entry_infos=[];
          	for(var i=0;i<arr.length; i++){
          		var item = arr[i],str_arr = [];
          		//去掉数组里面非直接量对象即函数的元素
                if(Object.prototype.toString.call(item)=="[object Function]")
                	continue;
                if(item.agent_type=="all"){
                	item.agent_id = Util.getAccountId();
                }
          		str_arr.push('{"agent_id":'+item.agent_id);
          		str_arr.push('"agent_type":"'+item.agent_type+'"');
          		if(item.agent_type=="team"){
          			str_arr.push('"is_subteam_inheritable":'+item.inherit);
          		}
          		str_arr.push('"privilege_id":"'+Util.resolvePrivilegeID(item.cssAction)+'"}');
          		entry_infos.push(str_arr.join(","));
            }
            if(entry_infos.length==0){
            	//Tips.warn(_("请选择要添加权限的用户！"));
            	this.callback&&this.callback();
            	this.dialog.close();
            	return;
            }
            var self = this;
            //判断是不是自己  自己不能给自己共享
            if(Util.getUserID() == item.agent_id) {
               Tips.show(_('不能给自己共享'));
               self.callback&&self.callback();
               self.dialog.close();
               return;
             }
            AuthModel.auth_batch_create(function(ret){
	            if(ret.code == 200){
	            	var showMsg = _('授权成功');
                if('/folder/myshare' == location.pathname){
                   showMsg = _('共享成功');
                 }
	            	Tips.show(showMsg);
	            	self.callback&&self.callback();
                self.dialog.close();
	            } else {
	            	Tips.warn(ret.message);
	            }
	        }, this.option.path,("/user/manage"==location.pathname||"/"==location.pathname||"/auth/list"==location.pathname||"/folder/favorite"==location.pathname && 'ent' == self.option.path_type)?"ent":null,this.option.prefix_neid,entry_infos);
		}
	});
	return AuthDialog;
});
