;define("component/userTeamAuthList",function(require,exports){
	var $ = require("jquery"),
	    Dialog = require("component/dialog"),
	    Tips = require("component/tips"),
	    Combox = require("component/combox"),
	    UserTeamAuthCombox = require("component/userTeamAuthCombox"),
	    ListView = require("component/listview"),
	    EventTarget = require("component/eventTarget"),
	    TeamModel = require("model/TeamManager"),
	    AuthModel = require("model/AuthManager"),
		ConfirmDialog = require('component/confirmDialog'),	    
	    Util = require("util"),
	    Dialog = require('component/dialog'),
	    UserModel = require("model/UserManager");
	require("i18n");
	require("placeholder");
	var _ = $.i18n.prop;
	require("mustache");
	Array.prototype.add = function(data){
		if(Object.prototype.toString.call(data)==="[object Array]"){
			if(this.length==0){
				for(var i=0;i<data.length;i++){
					var item = data[i];
					var item = transferData(item);
					this.push(item);
				}
			}else{
				for(var i=0;i<data.length;i++){
					var item = transferData(data[i]);
					var flag = false;
					for(var j=0;j<this.length;j++){
						if(item['agent_type']==this[j]['agent_type']&&item.id==this[j].id){
							flag = true;
							break;
						}
					}
					if(!flag){
						this.push(item);
					}
				}
			}			
		}else{
			if(this.length==0)
			{   
			   this.push(transferData(data));
			}else{
			   var item = transferData(data);
			   var flag = false;
			   for(var i=0;i<this.length;i++){
				   if(item['agent_type']==this[i]['agent_type']&&item.id==this[i].id)
				   {
					   flag = true;
					   break;
				   }
			   }
			   if(!flag){
				   this.push(item);
			   }else{
			   		var dialog = new Dialog(_('提示'), {mask: true}, function(dialog){
		                if(item.role){
		                    dialog.append('<div class="tips-alertDialog"><div class="cell2">' + _('该用户已添加！') +  '</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel ok">' + _('确定') + '</a></div>');
		                }else if(item.mark ==1){
		                	 dialog.append('<div class="tips-alertDialog"><div class="cell2">' + _('该项已添加手机验证！') +  '</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel ok">' + _('确定') + '</a></div>');
		                }else{
			                dialog.append('<div class="tips-alertDialog"><div class="cell2">' + _('该项已添加到授权记录，请在右侧已授权记录中修改！') +  '</div></div><div class="dialog-button-area"><a class="dialog-button confirm-cancel ok">' + _('确定') + '</a></div>');
		                }
		            });
			   		$('.confirm-cancel').click(function(){
		                dialog.close();
		            });
			   }
			}
		}
		function transferData(data){
			   var obj = {};
			   for(var key in data){
				   obj[key] = data[key];
			   }
			   return obj;
		}			
	};
	function UserTeamAuthList(node,type,opt){
		this.node = typeof node=="string"?$(node):node;
		this.type = type;//1设置授权 0 为团队添加用户默认 
		this.mark = opt.mark; //用来区分是手机验证画面
		var config = {title:_("所有用户"),authTree:false,userTeamListTitle:_("选择用户"),authListTitle:'<span><span class="tip">'+_("将下列用户添加到")+'</span>"<b>'+opt.teamName+'</b>"</span>'};
        this.option = $.extend(config,opt);
		this._init();
	}
	
	$.extend(UserTeamAuthList.prototype,EventTarget,{
		_init:function(){
			var self = this;
			var path_template = "<div class='auth-list-item' id='auth-path'><span class='icon i-folder1'></span><span class='auth-list-item-col1' title='{{auth-list-path}}'>{{auth-list-path}}</span></div>";
			var content_template = "<div class='user-team-auth-list'>"+		                       
			                       "<div class='user-team-list'><h2>"+this.option.userTeamListTitle+"</h2><span id='teamGroup' class='combox'></span><input type='text' class='i-text' placeholder='"+_("搜索用户和团队")+"'/><span class='btn-search'><span class='icon icon-search'></span></span><div class='user-list-view' id='user_team_list'></div><div class='user-list-bottom'><input type='checkbox'><u class='user-add'>"+_("添加已选择")+"</u><u class='next'>"+_("下一页")+"</u><u class='prev'>"+_("上一页")+"</u></div></div>"+
			                       "<div class='auth-list'><h2><span class='i-auth'></span><u class='auth-link'>"+_("权限")+"</u>"+this.option.authListTitle+"</h2><div class='auth-list-view' id='auth_list'></div><div class='auth-list-bottom'><u>"+_("清空所有用户")+"</u></div></div>"+
			                       "</div>";
			var auth_list_config = {noclick:true,column:1,template:'<li class="list-item item-{{agent_type}}" index="{{index}}" title="{{name}}{{#email}}({{email}}){{/email}}{{#domain_team}}('+_("域团队")+'){{/domain_team}}{{#domain_user}}-'+_("企业认证用户")+'{{/domain_user}}"><span class="icon i-{{agent_type}}{{#is_domain}}-domain{{/is_domain}}"></span><span class="item-text">{{name}}{{#email}}({{email}}){{/email}}</span><span class="i-inherit i-inherit-{{inherit}}" title='+_("允许子团队继承权限")+'></span><span class="icon col3"></span><span class="combox" id="combox-{{index}}"></span></li>'};
			//登录时手机验证用户列表
			if(self.type == 1 && self.mark == 1){
				self.node.append('<div class="userTip">请确保您添加的用户手机号不为空，避免出现无法登录的现象</div>')
				var auth_list_config = {noclick:true,column:1,template:'<li class="list-item item-{{agent_type}}" index="{{index}}" title="{{name}}{{#email}}({{email}}){{/email}}{{#domain_team}}('+_("域团队")+'){{/domain_team}}{{#domain_user}}-'+_("企业认证用户")+'{{/domain_user}}"><span class="icon i-{{agent_type}}{{#is_domain}}-domain{{/is_domain}}"></span><span class="item-text">{{name}}{{#email}}({{email}}){{/email}}</span><span class="i-inherit i-inherit-{{inherit}}" title='+_("允许子团队继承权限")+'></span><span class="icon col3"></span></li>'};
			}else{
				if(self.type==0){
					self.node.addClass("add-team-user");
					auth_list_config.hasTeamCombox = true;
				}else if(self.type==1){
					auth_list_config.hasAuthCombox = true;
					self.node.append(Mustache.render(path_template,{'auth-list-path':Util.getRootDisplayName()+self.option.path}));				
				}	
			}
					
			self.node.append(content_template);
			///登录时手机验证用户去掉里面没用的dom
			if(self.type == 1 && self.mark == 1) {
				$('.auth-link').remove();
				$('.i-auth').remove();
			}
			$("input[type='text']").placeholder();
			//new Combox("#teamGroup",[]);
			var teamTreeCombox = new UserTeamAuthCombox("#teamGroup",2,{title:self.option.title,authTree:self.option.authTree});
			//左侧团队用户列表
			self.user_team_list = new ListView("#user_team_list",{column:1,template:'<li class="list-item" index="{{index}}" title="{{name}}{{#email}}({{email}}){{/email}}{{#domain_team}}('+_("域团队")+'){{/domain_team}}{{#domain_user}}-'+_("企业认证用户")+'{{/domain_user}}"><input class="item-checkbox" type="checkbox"/><span class="icon i-{{agent_type}}{{#is_domain}}-domain{{/is_domain}}"></span><span class="item-text text-{{agent_type}}">{{name}}{{#email}}({{email}}){{/email}}</span><u>'+_("添加")+'</u></li>'});
			
			//右侧授权列表
			self.auth_list = new ListView("#auth_list",auth_list_config);			
			self.auth_list.data = [];
			self._renderUserTeamList();
			if(self.type ==1 && self.mark ==1){
				self._initSmsAuthList();
			}//如果是授权管理页面，则先查出授权记录
			else if(self.type==1)
			    self._initAuthList();
			//self._renderAuthList();
			if(self.type ==1 && self.mark ==1){
				//手机验证的提示文字
				self.node.append("<span class='userteamauth-instruction'>"+_("在团队及成员列表中选择要添加的团队或用户。")+"</span>");
			}else if(self.type==1){
				self.node.append("<span class='userteamauth-instruction'>"+_("在团队及成员列表中选择要授权的团队或用户,添加到已授权记录列表中。")+"</span>");
			}
            /*************************左侧用户团队选择列表*****************************************/            
            //处理全选
            self.node.delegate(".user-list-bottom>input","click",function(e){
            	var cur = e.currentTarget;
            	if(cur.checked){
            		//选中所有选项，并且"添加已选择"可以显示
            		self.node.find(".user-list-bottom>.user-add").show();
            		/*$(self.node.find(".list-item>.item-checkbox")).each(function(){
            			$(this).trigger("click");
            		});*/
            		self.user_team_list.selectAll(true);
            	}else{
            		self.node.find(".user-list-bottom>.user-add").hide();
            		/*$(self.node.find(".list-item>.item-checkbox")).each(function(){
            			$(this).trigger("click");
            		});*/
            		self.user_team_list.selectAll(false);
            	}
            });
            //响应列表选择操作
            self.user_team_list.on("selected",function(param){
            	var selectedData = [];
            	for(var key in param){
            		selectedData.push(param[key]);
            	}
            	//如果没有选中
            	//全选已经选中和没有选中
            	if(selectedData.length==0){
            		self.node.find(".user-list-bottom>input")[0].checked = false;
            		self.node.find(".user-list-bottom>.user-add").hide();
            	}else{
            		self.node.find(".user-list-bottom>input")[0].checked = true;
            		self.node.find(".user-list-bottom>.user-add").show();
            	}
            });
            //点击团队进入团队
            self.user_team_list.on("teamClick",function(index){
            	var team = self.user_team_list.data[index];
            	$("#teamGroup>.lui-combox").find(".curli>span.icon").removeClass(function(){
					var classNames = this.className.split(" ");
					classNames.splice(0,2);
					return classNames.join(" ");
				}).addClass(team.is_domain?"i-team-domain":"i-team");				
            	$("#teamGroup>.lui-combox").find(".curtext").text(team.name);
            	self.currentPage = 0;
            	self.searchType = 1;
            	self.searchKey = team.id;
            	self._search();
            });
            self.user_team_list.on("allClick",function(){
            	$("#teamGroup>.lui-combox").find(".curli>span.icon").removeClass(function(){
					var classNames = this.className.split(" ");
					classNames.splice(0,2);
					return classNames.join(" ");
				}).addClass("i-all");				
            	$("#teamGroup>.lui-combox").find(".curtext").text(_("所有用户"));
            	self.currentPage = 0;
            	self.searchType = 3;
            	self.searchKey = null;
            	self._search();
            });
            //处理鼠标经过列表
            self.user_team_list.node.delegate(".list-item","mouseenter",function(e){
				$(this).find("u").show();
			});
            self.user_team_list.node.delegate(".list-item","mouseleave",function(e){
				$(this).find("u").hide();
			});
            //处理点击列表末尾添加操作
            self.user_team_list.on("item-added",function(data){
            	self.auth_list.data.add(data);
				self._renderAuthList();
            });
            //添加已选择
            self.node.delegate(".user-list-bottom>.user-add","click",function(e){
            	var data = self.user_team_list.getSelectedItem();
            	self.auth_list.data.add(data);
            	self._renderAuthList();
            	self.node.find(".user-list-bottom>input").trigger("click");
            });
            var not_already_search = true;
            //点击搜索
            /***
             * 点击放大镜   下拉框 变成 搜索输入框，放大镜图标变更为关闭图标
             * 点击关闭图标  搜索输入框 变为 下拉框，关闭图标变更为放大镜图标 
             * 如果执行了搜索，返回初始化列表，否则返回准备搜索之前的列表
             */
            self.node.delegate(".btn-search>.icon","click",function(e){
            	var target = $(e.target);
            	if(target.hasClass("icon-search")){
            		target.removeClass("icon-search").addClass("i-close2");
            		self.node.find(".i-text").show().focus();
            		$("#teamGroup").hide();
            	}else{
            		target.addClass("icon-search");
            		self.node.find(".i-text").val("").hide();
            		$("#teamGroup").show();
            		self.searchKey = null;
            		if(not_already_search)return;
            		not_already_search = true;
            		$("#teamGroup").find(".curli>.icon").removeClass(function(){
                        var classNames = this.className.split(" ");
						classNames.splice(0,2);
						return classNames.join(" "); 
            		});
            		if(self.type==1)
            		   $("#teamGroup").find(".curli>.icon").addClass("i-team-user");
            		$("#teamGroup").find(".curli>.curtext").text(teamTreeCombox.config.title);
            		self._renderUserTeamList();
            	}
            });
            //按照所选团队查询
            teamTreeCombox.on("teamSearch",function(param){
            	self.currentPage = 0;
            	self.searchType = 1;
            	self.searchKey = param;
            	self._search();
            });
            //处理下拉框选择"所有用户" 对应授权时的第四种查询
            teamTreeCombox.on("selectAllUser",function(){
            	self.currentPage = 0;
            	self.searchType = 3;
            	self._search();
            });
            teamTreeCombox.on("manage",function(){
            	self.currentPage = 0;
            	self.searchKey = null;
            	self._renderUserTeamList();
            });
            //处理输入查询
            self.node.delegate(".i-text","keydown",function(e){
            	//捕捉enter
            	if(e.keyCode==13){
            		var search_key = e.currentTarget.value;
            		if(!search_key)return;
            		not_already_search = false;
            		self.searchKey = search_key;
            		self.searchType = 2;
            		self.currentPage = 0;
            		self._search();
            	}
            });
            //翻页  prev page
            self.node.delegate("u.prev","click",function(e){
            	 if(self.currentPage==0){
            		 return;//第一页
            	 }else{
            		 self.currentPage -= 1;            		 
            		 self._search();
            		 self.node.find(".user-list-bottom>.user-add").hide();
            		 self.node.find(".user-list-bottom>input").attr('checked',false);
            	 }
            	 
            });
             //next page
            self.node.delegate("u.next","click",function(e){
            	var lastPage = self.totalSize%self.size==0?self.totalSize/self.size-1:parseInt(self.totalSize/self.size);
            	 if(self.currentPage==lastPage){
            		 return;//最后一页
            	 }else{
            		 self.currentPage += 1;            		 
            		 self._search();
            		 self.node.find(".user-list-bottom>.user-add").hide();
            		 self.node.find(".user-list-bottom>input").attr('checked',false);
            	 }
            });          
            /*****************************右侧列表事件*********************************************/
            //查看权限列表
            self.node.delegate(".auth-list h2>u","mouseenter",function(e){
            	self._showAuthList();
            });
            self.node.delegate(".auth-list h2>u","mouseleave",function(e){
            	self.node.find(".auth-panel").remove();
            });
          //清空所有选择
            self.node.delegate(".auth-list-bottom>u","click",function(e){
            	self.auth_list.data = [];
            	self._renderAuthList();
            });
            self.auth_list.on("change",function(_index,category,value){
            	//update data
            	self.auth_list.data[_index][category] = value;
            	//self._renderAuthList();
			});
            //点击团队授权的继承权限  改变样式
            self.auth_list.on("changeInherit",function(_index,flag){
            	//update css
            	var span_inherit = self.auth_list.node.find(".list-item").eq(_index).find(".i-inherit");
            	//删除span其余的样式
            	span_inherit.removeClass(function(){
            		var clazz  = this.className.split(" ");
            		clazz.splice(0,1);//保留第一个默认的样式名
            		return clazz.join(" ");
            	});
            	span_inherit.addClass("i-inherit-"+flag);
			});
			self.auth_list.on('delete',function(_index){
				if(self.type==0){
					deleteItem();
					return;
				}
       			new ConfirmDialog({content: _("您确认要删除吗？")}, function() {
       				deleteItem();
       			})
				function deleteItem (){
					var curId=self.auth_list.data[_index]._id;	
					var curType = self.auth_list.data[_index].agent_type;
					
					if(curId){
						if(self.type ==1 && self.mark ==1) { //手机认证的删除
							var postData = {action:'disable'};
							if(curType =='all'){
								postData.all = true;
							}else if(curType == 'team'){
								postData.team_ids = [curId];
							}else{
								postData.user_ids = [curId];
							}
							
							UserModel.smsAuthSet(function(ret){
								if (ret.code == 200) {
		                        	self.auth_list.data.splice(_index,1);
		                        	self._renderAuthList();
		                            Tips.show(ret.message);
		                        } else if (ret.code == 500) {
		                            Tips.warn(ret.message.join("<br"));
		                        } else {
		                            Tips.warn(ret.message);
		                        }
		                        context.reload();
							},postData);
							
						}else { //授权的删除
							AuthModel.batch_del(function(ret) {
		                        if (ret.code == 200) {
		                        	self.auth_list.data.splice(_index,1);
		                        	self._renderAuthList();
									//self.auth_list.render(self.auth_list.data);	
		                            Tips.show(ret.message);
		                        } else if (ret.code == 500) {
		                            Tips.warn(ret.message.join("<br"));
		                        } else {
		                            Tips.warn(ret.message);
		                        }
		                        context.reload();
		                    },[curId]);
						}
						
					}else{
						self.auth_list.data.splice(_index,1);
						self._renderAuthList();
						//self.auth_list.render(self.auth_list.data);	
					};

       				//self._renderAuthList();
       			}												
			})
			
		},
		//渲染左侧列表
		_renderUserTeamList:function(){
			this.searchType = 0;
			this._search();
		},
		//渲染右侧列表
		//设置文件夹权限的时候需要渲染
		//添加团队成员和新建授权时候不用渲染
		_renderAuthList:function(){
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
			/*self.auth_list.data = self.auth_list.data.sort(function(a,b){
				//排序，先根据类型，然后根据名称排序
				//这里类型正好是 all team user 字母顺序对应类型顺序 避复杂的排序
				if(a.agent_type==b.agent_type){
					return a.name>b.name;
				}
				return a.agent_type>b.agent_type;
			}); */
			var result = self.auth_list.data.sort(sort_by("agent_type",sort_by("name")));
			self.auth_list.render(result);
			//处理选中的用户个数
			if(self.type==0){
				var addNum=(self.auth_list.data.length>0)?self.auth_list.data.length:'';
				if(addNum>0)
			       $('.auth-list h2 span:eq(1) .tip').html(Mustache.render(_("将下列{{number}}个用户添加到"),{number:addNum}));
				else
				   $('.auth-list h2 span:eq(1) .tip').html(_("将下列用户添加到"));
			}	
		},
		getSelectedItem:function(){
			return this.auth_list.getAllItem();
		},
		_showAuthList:function(){
			var self = this;
			var authPanel = $("<div class='auth-panel'><h2></h2><ul class='auth-body'></ul></div>");
			var data = [{instruction:_("权限说明"),preview:_("预览"),upload:_("上传"),download:_("下载"),uploadlink:_("创建上传外链"),downloadlink:_("创建下载外链"),create:_("新建目录/文件"),remove:_("删除"),rename:_("重命名"),move:_("移动"),copy:_("复制")},
			            {instruction:_("编辑"),      preview:"1",upload:"1",download:"1",uploadlink:"1",downloadlink:"1",create:"1",remove:"1",rename:"1",move:"1",copy:"1"},
				        {instruction:_("上传/下载/外链"), preview:"1",upload:"1",download:"1",uploadlink:"1",downloadlink:"1",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
			            {instruction:_("下载/外链"),   preview:"1",upload:"0",download:"1",uploadlink:"0",downloadlink:"1",create:"0",remove:"0",rename:"0",move:"0",copy:"0"},
					    {instruction:_("上传/外链"),   preview:"0",upload:"1",download:"0",uploadlink:"1",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
					    {instruction:_("上传/下载"),  preview:"1",upload:"1",download:"1",uploadlink:"0",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
					    {instruction:_("下载"),      preview:"1",upload:"0",download:"1",uploadlink:"0",downloadlink:"0",create:"0",remove:"0",rename:"0",move:"0",copy:"0"},
			            {instruction:_("上传"),      preview:"0",upload:"1",download:"0",uploadlink:"0",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
			            {instruction:_("预览"),      preview:"1",upload:"0",download:"0",uploadlink:"0",downloadlink:"0",create:"0",remove:"0",rename:"0",move:"0",copy:"0"}]
			var h_template ="<span class='instruction'>{{instruction}}</span>"+
			                "<span class='preview'>{{preview}}</span>"+
			                "<span class='upload'>{{upload}}</span>"+
			                "<span class='download'>{{download}}</span>"+
			                "<span class='uploadlink'>{{uploadlink}}</span>"+
			                "<span class='downloadlink'>{{downloadlink}}</span>"+
			                "<span class='create'>{{create}}</span>"+
			                "<span class='remove'>{{remove}}</span>"+
			                "<span class='rename'>{{rename}}</span>"+
			                "<span class='move'>{{move}}</span>"+
			                "<span class='copy'>{{copy}}</span>";
			var li_template  = "<li><span class='instruction'>{{instruction}}</span>"+
							   "<span class='preview'><i class='i-auth-{{preview}}'></i></span>"+
					           "<span class='upload'><i class='i-auth-{{upload}}'></i></span>"+
					           "<span class='download'><i class='i-auth-{{download}}'></i></span>"+
					           "<span class='uploadlink'><i class='i-auth-{{uploadlink}}'></i></span>"+
					           "<span class='downloadlink'><i class='i-auth-{{downloadlink}}'></i></span>"+
					           "<span class='create'><i class='i-auth-{{create}}'></i></span>"+
					           "<span class='remove'><i class='i-auth-{{remove}}'></i></span>"+
					           "<span class='rename'><i class='i-auth-{{rename}}'></i></span>"+
					           "<span class='move'><i class='i-auth-{{move}}'></i></span>"+
					           "<span class='copy'><i class='i-auth-{{copy}}'></i></span></li>";
			authPanel.find("h2").append(Mustache.render(h_template,data[0]));
			for(var i=1;i<data.length;i++){
				authPanel.find("ul.auth-body").append(Mustache.render(li_template,data[i]));
			}
			self.node.append(authPanel);
			authPanel.show();
		},
		//各种查询和翻页
		searchType:0,//0 1 2 3默认0  查询所有用户 1查询团队下的用户 2查询团队和用户  3 按名称查找
		currentPage:0,
		size:9,//每页记录数
		totalSize:0,//总记录数
		searchKey:null,
		/****
		 * 分用户查询和团队用户查询
		 * 0：用户查询  团队下的用户查询 用户搜索  (只展示用户)
		 * 1：所有用户和团队 团队下的用户和团队 用户和团队搜索 所有用户  (混合团队和用户) 
		 * 设置授权默认显示  所有用户节点和团队 
		 * 
		 */
		//查询
		_search:function(){
			var self = this;
			//查询团队成员|团队和成员  =  为团队添加成员  只查询团队成员   授权 查询团队并且带出团队成员
			//this.type=0 1 查询团队成员  默认   1查询团队和成员 
			if(this.type==0){
				if(this.searchType==0){
					UserModel.list_for_pages(function(result){
						if(result.code==200){
							renderList(result);
						}
					},this.currentPage,this.size);
				}else if(this.searchType==1){
					//按照团队id查询
					TeamModel.membership_get(function(result){
						if(result.code==200){
							renderList(result);
						}
					},this.searchKey,this.currentPage,this.size);
				}else{
					//处理名称搜索
					UserModel.list_for_pages(function(result){
						if(result.code==200){
							renderList(result);
						}
					},this.currentPage,this.size,UserModel.ROLE.ALL,this.searchKey);
				}
			}else{
				if(this.searchType==0||this.searchType==1){
					//按照团队id查询   默认不给id -> 查询所有一级团队(两种查询合成一个)
					TeamModel.getTeamListById(function(result){
						if(result.code==200){
							renderList(result);
						}
					},this.searchKey,this.searchType==1?true:false,this.currentPage,this.size);
				}else if(this.searchType==2){
					//处理名称搜索
					TeamModel.searchUserTeamByName(function(result){
						if(result.code==200){
							renderList(result);
						}
					},this.searchKey,this.currentPage,this.size);
				}else{
					//授权的时候选择查询所有用户  第四种查询
					UserModel.list_for_pages(function(result){
						if(result.code==200){
							renderList(result);
						}
					},this.currentPage,this.size);
				}
			}
			
			function renderList(ret){
				self.totalSize = ret.data.total_size;
				var datas = [];
								
				for(var i=0,len = ret.data.content.length;i<len;i++){
					var item = ret.data.content[i];
					var d = {};
					if(item.agent_type=="team"){
						d = {id:item._id,uid:item._id,name:item.name,agent_id:item._id,is_domain:item.from_domain_account,domain_team:item.from_domain_account,agent_type:'team',cssAction:'preview',inherit:false};
						if(self.mark==1)
							d.mark=1;
					}else{
						 d = {id:item.uid,uid:item.uid,name:item.user_name,email:item.email,is_domain:item.from_domain_account,domain_user:item.from_domain_account,agent_id:item.uid,agent_type:'user',cssAction:'preview'};
						 if(self.type==0)
							 d.role='member';
						 if(self.mark==1)
						d.mark=1;
					}					
					datas.push(d);
				}
			
				if(self.type==1&&self.searchType==0&&self.currentPage==0){
					datas.splice(0, 0, {id:-1,name:_("所有用户"),agent_type:"all",cssAction:"preview"});
				}
				self.user_team_list.node.height(29*datas.length);
				self.user_team_list.render(datas);
				generatePage();
			}
			function generatePage(){
				var totalPage = self.totalSize%self.size==0?self.totalSize/self.size:parseInt(self.totalSize/self.size)+1;
				self.node.find(".user-list-bottom>u.prev,.user-list-bottom>u.next").show();
				if(totalPage<=1){
					self.node.find(".user-list-bottom>u.prev,.user-list-bottom>u.next").hide();
				}else{
					if(self.currentPage==0){
						self.node.find(".user-list-bottom>u.prev").hide();
					}else if(self.currentPage==totalPage-1){
						self.node.find(".user-list-bottom>u.next").hide();						
					}else{
						self.node.find(".user-list-bottom>u.prev,.user-list-bottom>u.next").show();
					}
				}
			}
		},
		_initAuthList:function(){
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
						self.auth_list.data.push({_id:item.id,id:item.agent_id,name:item.agent_name,agent_id:item.agent_id,is_domain:item.from_domain_account,domain_team:item.from_domain_account,agent_type:item.agent_type,cssAction:item.privilege_name,inherit:item.inherit||false});
					}else{
						self.auth_list.data.push({_id:item.id,id:item.agent_id,name:item.agent_name?item.agent_name:_("所有用户"),is_domain:item.from_domain_account,domain_user:item.from_domain_account,email:item.email,agent_id:item.agent_id,agent_type:item.agent_type,cssAction:item.privilege_name});
					}					
				}
				self._renderAuthList();//渲染列表
			},self.option.path);
		},
		
		_initSmsAuthList: function(){
			var self = this;
			//登录手机验证用户页面，先查询已添加的用户
			UserModel.smsAuthGet(function(result){
				if(result.code!=200){
					return;
				}
				var data = result.data.result;
				
				for(var i=0,len = data.length;i<len;i++){
					var item = data[i];
					if(item.agent_type=="team"){
						self.auth_list.data.push({_id:item.id,id:item.agent_id,name:item.agent_name,agent_id:item.agent_id,is_domain:item.from_domain_account,domain_team:item.from_domain_account,agent_type:item.agent_type});
					}else{
						self.auth_list.data.push({_id:item.id,id:item.agent_id,name:item.agent_name!='all'?item.agent_name:_("所有用户"),is_domain:item.from_domain_account,domain_user:item.from_domain_account,email:item.agent_slug,agent_id:item.agent_id,agent_type:item.agent_type});
					}					
				}
				self._renderAuthList();//渲染列表
			})
		}
	});
	
	return UserTeamAuthList;
});