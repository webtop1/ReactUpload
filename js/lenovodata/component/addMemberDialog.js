define("component/addMemberDialog",function(require,exports,module){
	var $ = require("jquery"),
	SearchBox = require("component/searchbox"),
	Tips = require("component/tips"),
	Dialog = require("component/dialog"),
	ConfirmDialog = require("component/confirmDialog"),
	MemberTree = require("component/memberTree"),
	TeamModel = require("model/TeamManager"),
	ListView = require("component/listview"),
	EventTarget = require("component/eventTarget"),
	_ = $.i18n.prop,
	Util = require("util");
	function AddMemberDialog(params,callback){
		var auth_list_config = { 
			                     noclick:true,
			                     column:1,
			                     hasRoleCombox:true,
			                     template:['<li class="list-item item-{{agent_type}}" index="{{index}}" title="{{name}}{{#userSlug}}({{userSlug}}){{/userSlug}}{{#domain_team}}(',
			                     	        _("域团队"),
			                     	        '){{/domain_team}}{{#domain_user}}-',
                                            _("企业认证用户"),
                                            '{{/domain_user}}">',
                                            '<span class="icon i-authdelete"></span><div class="lui-combox auth-combox" id="combox-{{index}}"></div>',
                                            '<span class="icon i-{{agent_type}}{{#is_domain}}-domain{{/is_domain}}"></span>',
                                            '<span class="item-text">{{name}}{{#userSlug}}({{userSlug}}){{/userSlug}}</span>',
                                            '</li>'].join("")
                               };
        this.option = $.extend(params,auth_list_config);
        this.callback = callback;
		this._init();
	}
	$.extend(AddMemberDialog.prototype,EventTarget,{
		_init:function(){
			var inner = ["<div class='auth-pane'>",
			               "<div class='teamtree'>",
			               "<div class='clearfix'><h2>"+_("团队成员")+"</h2><div class='search-box'></div></div>",
			                  "<div id='teamGroup' class='treewrapper'></div>",
			                  "<div class='listwrapper'></div>",
			               "</div>",
			               "<div class='icon-arrow'><span class='icon i-arrow-right'></span></div>",
			               "<div class='share-list'><h2>"+_("成员")+"</h2>",
			                  "<div class='list-wrap'>",
			                     "<div class='lui-list'></div>",
			                     "<a id='removeAll'>"+_("清空所有用户")+"</a>",
			                   "</div>",
			               "</div>",			               
			             "</div>",
			             "<div class='dialog-button-area'>",
			                  "<a class='dialog-button ok'>"+_("确定")+"</a><a class='dialog-button cancel'>"+_("取消")+"</a>",
			             "</div>"
			            ].join("");
			var self = this;
			var dialog = new Dialog(_("添加团队成员"),function(parentNode,func){
				if(/msie/.test(navigator.userAgent.toLowerCase())){
					parentNode.css("width",680);
				}
				self.contentWraper = parentNode;
			    parentNode.append($(inner));
			    self.auth_list = new ListView($(".lui-list"),self.option);
			    self.auth_list.data = [];
			    self.render();
			});
			this.dialog = dialog;
		},
		render:function(){
			var self = this;
			var searchBox = new SearchBox(this.contentWraper.find(".search-box"),function(result){
				self.contentWraper.find(".treewrapper").hide();
				self.contentWraper.find(".listwrapper").show();
				var datas = [];				
				for(var i=0,len = result.length;i<len;i++){
					var item = result[i];
					var d = {};
					if(item.agent_type=="user"){
						 d = {id:item.uid,uid:item.uid,name:item.user_name,email:item.email,is_domain:item.from_domain_account,domain_user:item.from_domain_account,agent_id:item.uid,agent_type:'user',cssAction:'preview'};
						 d.role='member';
						 datas.push(d);
					}								
				}
				self.user_team_list.render(datas);				
			});
			self.user_team_list = new ListView($(".listwrapper"),{column:1,template:'<li class="list-item" index="{{index}}" title="{{name}}{{#email}}({{email}}){{/email}}{{#domain_team}}('+_("域团队")+'){{/domain_team}}{{#domain_user}}-'+_("企业认证用户")+'{{/domain_user}}"><span class="icon i-{{agent_type}}{{#is_domain}}-domain{{/is_domain}}"></span><span class="item-text text-{{agent_type}}">{{name}}{{#email}}({{email}}){{/email}}</span></li>'});
			searchBox.on("close",function(){
				self.contentWraper.find(".treewrapper").show();
				self.contentWraper.find(".listwrapper").hide();
			});			
			self.tree = new MemberTree(self.contentWraper.find(".treewrapper"),function(param,success,error){
				TeamModel.getTeamListById(function(result){
					success(result);
				},'',false,0,20);
			},{type:1,title:_("所有用户"),authTree:true,max_height:220});
			self.tree.render();
		    self.bindEvent();	
		},
		bindEvent:function(){
			var self = this;
            self.tree.on("selectNode",function(node){
            	    var obj = {
			                   id:node.id,
			                   uid:node.id,
			                   name:node.name,
			                   email:node.email,
			                   userSlug:node.userSlug,
			                   agent_id:node.agent_id,
			                   is_domain:node.isCer,				                   
			                   agent_type:node.agent_type,
			                   role:'member'
			                  };
			        if(Util.dataInArray(obj,self.auth_list.data))return;
					self.auth_list.data.push(obj);
					self.renderAuthList();
			});
			self.user_team_list.on("item-added",function(obj){
				if(Util.dataInArray(obj,self.auth_list.data))return;
				self.auth_list.data.push(obj);
				self.renderAuthList();
			});
			self.auth_list.on("delete",function(index){
				new ConfirmDialog({content:_("您确认要删除吗？")},function(){					
						self.auth_list.data.splice(index,1);
						self.renderAuthList();
				});
			});
			self.contentWraper.find("#removeAll").click(function(ev){
				if(self.auth_list.data.length==0)return;
				new ConfirmDialog({content:_("您确认要清空所有用户吗？")},function(){					
						self.auth_list.data = [];
						self.renderAuthList();
				});
			});
			self.contentWraper.find(".dialog-button-area a.ok").click(function(ev){
				self.submitAuth();
			});
			self.contentWraper.find(".dialog-button-area a.cancel").click(function(ev){
				self.dialog.close();
			});
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
          		var item = arr[i];	
          		//去掉数组里面非直接量对象即函数的元素
                if(Object.prototype.toString.call(item)=="[object Function]")
                	continue;
          		entry_infos.push('{"uid":'+item.uid+',"role":"'+item.role+'"}');
            }
            if(entry_infos.length==0){
            	//Tips.warn(_("请选择要添加权限的用户！"));
            	this.callback&&this.callback();
            	this.dialog.close();
            	return;
            }
            var self = this;
            TeamModel.membership_batch_creat(function(ret){
	            if(ret.code == 200){	            	
	            	Tips.show(_('添加成功'));
	            	self.callback&&self.callback();
	            	self.dialog.close();	            	
	            } else {
	            	Tips.warn(ret.message);
	            }	            
	        },this.option.id,entry_infos);
		}
	});
	return AddMemberDialog;
});
