;define("component/userTeamAuthCombox",function(require,exports){
	var $ = require("jquery"),
	    EventTarget = require("component/eventTarget"),
	    TeamTree = require("component/teamTree"),
	    TeamModel = require("model/TeamManager"),
	    Util = require("util");
	require("i18n");
	var _ = $.i18n.prop;
	require("mustache");
	var AUTH_LIST = exports.AUTH_LIST = 
		            [{instruction:_("权限说明"),     preview:_("预览"),upload:_("上传"),download:_("下载"),uploadlink:_("创建上传外链"),downloadlink:_("创建下载外链"),create:_("新建目录/文件"),remove:_("删除"),rename:_("重命名"),move:_("移动"),copy:_("复制")},
			         {cssAction:'edit',instruction:_("全部"),        preview:"1",upload:"1",download:"1",uploadlink:"1",downloadlink:"1",create:"1",remove:"1",rename:"1",move:"1",copy:"1"},
				     {cssAction:'upload:download:delivery',instruction:_("上传/下载/外链"),preview:"1",upload:"1",download:"1",uploadlink:"1",downloadlink:"1",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
			         {cssAction:'download:delivery',instruction:_("下载/外链"),    preview:"1",upload:"0",download:"1",uploadlink:"0",downloadlink:"1",create:"0",remove:"0",rename:"0",move:"0",copy:"0"},
					 {cssAction:'upload:delivery',instruction:_("上传/外链"),    preview:"0",upload:"1",download:"0",uploadlink:"1",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
					 {cssAction:'upload:download',instruction:_("上传/下载"),    preview:"1",upload:"1",download:"1",uploadlink:"0",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
					 {cssAction:'download',instruction:_("下载"),        preview:"1",upload:"0",download:"1",uploadlink:"0",downloadlink:"0",create:"0",remove:"0",rename:"0",move:"0",copy:"0"},
			         {cssAction:'upload',instruction:_("上传"),        preview:"0",upload:"1",download:"0",uploadlink:"0",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
			         {cssAction:'preview',instruction:_("预览"),        preview:"1",upload:"0",download:"0",uploadlink:"0",downloadlink:"0",create:"0",remove:"0",rename:"0",move:"0",copy:"0"}];
	function UserTeamAuthCombox(node,type,opt){
		this.node = $.type(node)=='string'?$(node):node;
		this.type = type;
		var DEFAULT = {authTree:false,title:_("所有用户"),isTeam:false};
		this.config = $.extend(DEFAULT,opt);
		this.userTeamData = [{category:'role',name: _("团队成员"), value: "member"},{category:'role',name: _("团队管理员"), value: "admin"}];
		this.authData = [{category:'cssAction',name: _("预览"), value: "preview"},{category:'cssAction',name: _("上传"), value: "upload"},
		                 {category:'cssAction',name: _("上传/外链"), value: "upload:delivery"},{category:'cssAction',name: _("下载"), value: "download"},
		                 {category:'cssAction',name: _("下载/外链"), value: "download:delivery"},{category:'cssAction',name: _("上传/下载"), value: "upload:download"},
		                 {category:'cssAction',name: _("上传/下载/外链"), value: "upload:download:delivery"},{category:'cssAction',name: _("编辑"), value: "edit"}];
		this.template = "<li class='combox-item' index='{{index}}' category={{category}} act={{value}}>{{name}}</li>";
		this.selected = {};
		this._init();
	}
	$.extend(UserTeamAuthCombox.prototype,EventTarget,{
		_init:function(){
			var self =this;
			var combox = $("<div class='lui-combox'><div class='curli'><span class='icon i-user7'></span><span class='curtext'></span><span class='triangle'></span></div></div>");
			var ul = $("<ul class='combox-ul'></ul>");
			if(self.type==2){
				//生成团队树下拉框
				self.tree = new TeamTree(ul,function(param,success,error){
					TeamModel.getTeamListById(function(result){
						success(result);
					});
				},{type:1,title:self.config.title,authTree:self.config.authTree});
				self.tree.on("renderCompleted",function(){
					if(self.config.authTree)
					    self.tree.node.find("li:eq(0)").find("a").remove();
				});
				//下拉框响应选择团队事件
				//隐藏下拉
				//查询团队下的用户 |用户和团队
				self.tree.on("selectTeam",function(teamId,teamName,teamPath,isDomain){
					self.node.find("ul").hide();
                	combox.find(".curli>span.icon").removeClass(function(){
						var classNames = this.className.split(" ");
						classNames.splice(0,2);
						return classNames.join(" ");
					}).addClass(isDomain?"i-team-domain":"i-team");          					
					combox.find(".curtext").text(teamName);
					self.fire("teamSearch",teamId);
				});
				//选择所有用户节点
				self.tree.on("selectAllUser",function(param){
					self.node.find("ul").hide();
					combox.find(".curli>span.icon").removeClass(function(){
						var classNames = this.className.split(" ");
						classNames.splice(0,2);
						return classNames.join(" ");
					}).addClass("i-all");				
					combox.find(".curtext").text(param);
					self.fire("selectAllUser");
				});
				//选择根节点
				self.tree.on("manage",function(param){
					self.node.find("ul").hide();
					combox.find(".curli>span.icon").removeClass(function(){
						var classNames = this.className.split(" ");
						classNames.splice(0,2);
						return classNames.join(" ");
					})
					if(self.config.authTree){
						combox.find(".curli>span.icon").addClass("i-team-user");
					}					
					combox.find(".curtext").text(param);
					self.fire("manage");
				});
				//针对授权树下拉框也要修改图标 
				if(self.config.authTree){
					combox.find(".curli>span.icon").addClass("i-team-user");
				}
				combox.find(".curtext").text(self.config.title);
				combox.append(ul);
				self.node.append(combox);
				self._bindEvent2TreeCombox();
				return;
			}
			self.data = self.userTeamData
			if(self.type==1){
				self.data = this.authData;
				self.node.addClass("auth-combox");
				//self.template = "<li class='combox-item' index='{{index}}' category={{category}} act={{value}}><i class='icon icon-radio' index='{{index}}' category={{category}} act={{value}}></i>{{name}}</li>";
				self.template = "<li class='combox-item' index='{{index}}' category={{category}} act={{value}}>{{name}}</li>";
                combox.find(".curtext").text(_("预览"));
			}						
			$(self.data).each(function(index,item){
				item.index = index;
				ul.append(Mustache.render(self.template,item));
			});
			ul.height(24*ul.find("li").length);
			if(self.type==1&&self.config.isTeam){
				var checkbox_li = Mustache.render("<li class='allow' act='inherit'><input type='checkbox' {{#inherit}}checked{{/inherit}} class='allow-checkbox'/>"+_("允许子团队继承权限")+"</li>",{inherit:this.config.inherit});
				ul.append(checkbox_li);
				ul.height(24*ul.find("li").length+4);
			}			    
			$(combox).append(ul);
			self.node.append(combox);
			combox.find(".curtext").text(self.getDefaultValue(self.config.defaultValue));
			self._bindEvent();
		},
		_bindEvent:function(e){
			var self = this;
			self.node.delegate(".lui-combox","mouseleave",function(e){
				$(this).find("ul.combox-ul").hide();
			});
			self.node.delegate(".combox-ul","mouseleave",function(e){
				var tar = $(e.currentTarget);		
				tar.hide();
			});
			self.node.delegate(".combox-item","click",function(e){				
				var text = $(e.currentTarget).text();
				$(e.currentTarget).parent().parent().find(".curli > .curtext").html(text);
				//index
				//value
				//category
				var type = $(e.target).attr("category");
				var value = $(e.target).attr("act");
				var _index = $(e.target).parents(".list-item").attr("index");
				self.fire("change",_index,type,value);
//				if(self.type==1){
//					$(e.currentTarget).find(".icon").addClass("icon-radio-selected");
//					$(e.currentTarget).siblings().find(".icon").removeClass("icon-radio-selected");
//				}				
				$(e.currentTarget).parent().hide();
			});
			//处理继承的复选框
			self.node.delegate(".combox-ul>li>.allow-checkbox","click",function(e){
				var checkbox = e.currentTarget;
				var _index = $(e.target).parents(".list-item").attr("index");
				self.fire("changeInherit",_index,"inherit",checkbox.checked);
			});
//			self.node.delegate(".combox-item,.allow","mouseover",function(e){
//				if(self.type==1){
//					var show_template = "<div class='auth-wraper'><div class='auth-inner'><h2>{{auth_name}}:</h2><span>{{auth_description}}</span></div><span class='arrow-right'></span></div>";
//					//var data = {auth_name:'编辑',auth_description:'全部'};
//					var key = $(e.currentTarget).attr("act");
//					var auth_desc = self.getAuthList(key);
//					var show_data = {auth_name:e.currentTarget.innerText,auth_description:auth_desc};
//					if(key=="inherit"){
//						show_data.auth_name = _("团队权限的继承");
//						show_data.auth_description = _("对于团队授权，允许继承后，授权的团队及其所有子团队都继承该权限。");
//					}
//					$(".lui-dialog").append(Mustache.render(show_template,show_data));
//					var x = Util.getElementXPos(e.currentTarget);
//					var y = Util.getElementYPos(e.currentTarget);
//					var height = $(".auth-wraper").height();
//					var width = $(".auth-wraper").width();
//					$(".lui-dialog").find(".auth-wraper").css({position:'fixed',left:x-width,top:y-(height-e.currentTarget.offsetHeight)/2})
//				}
//			});
//			self.node.delegate(".combox-item,.allow","mouseout",function(e){
//				if(self.type==1){
//					$(".lui-dialog").find(".auth-wraper").remove();
//				}			
//			});
			self.node.delegate(".curli","click",function(e){
				var tar = $(e.target),cur = $(e.currentTarget);
				if(tar.hasClass("curtext")||tar.hasClass("triangle")){				
					var top = Util.getElementYPos(tar.parent()[0]);
					var left = Util.getElementXPos(tar.parent()[0]);
					//以下代码解决下拉内容被覆盖的问题。
					var maxZIndex = 0;
					$(self.node.parents(".scl-content").find(".list-item>span.combox")).each(function(i,item){
						var zIndex = parseInt($(item).css("z-index"));
						if(zIndex>maxZIndex)
							maxZIndex = zIndex;								
					});
					if(maxZIndex==0)
						maxZIndex = 100;
					maxZIndex+=1;
					tar.parents("span.combox").css("z-index",maxZIndex);
					var _height = cur.height();
					var _width = cur.width();
					var self_height = self.node.find(".combox-ul").height();
					self.node.find(".combox-ul").css({position:"fixed",left:left+1,top:(top+_height+self_height+2)>Util.getTotalHeight()?(top-self_height):(top+_height+2),width:_width});
					if(tar.hasClass("triangle")){
						self.node.find(".combox-ul").toggle();
						return;
					}
					self.node.find(".combox-ul").show();				
				}
				
			});
		},
		getSelected:function(){
			
		},
		getDefaultValue:function(value){
			var self = this;
			for(var i=0;i<self.data.length;i++){
				if(self.data[i].value==value){
					//设置初始值
					if(self.type==1){
						self.node.find(".combox-ul").find(".combox-item").eq(i).find(".icon").addClass("icon-radio-selected");
					}
					return self.data[i].name;
				}
					
			}
			return self.data[0].name;
		},
		_bindEvent2TreeCombox:function(){
			var self = this;

			self.node.delegate(".curli","click",function(e){				
				var tar = $(e.target);
				var top = Util.getElementYPos(tar.parent()[0]);
				var left = Util.getElementXPos(tar.parent()[0]);
				var _height = $(e.currentTarget).height();
				var display = self.node.find("ul")[0].style.display;
				if(tar.hasClass("triangle")&&"block"==display){
					self.node.find("ul").hide();
					return;
				}				
				self.tree.render();				
				self.node.find("ul.combox-ul").css({position:'fixed',left:left+1,top:top+_height+2}).slideDown();
			});
			self.node.delegate(".lui-combox>.curli","mouseleave",function(e){
				if(e.target==e.currentTarget){
					self.node.find("ul.combox-ul").hide();
				}				
			});
            self.node.delegate(".lui-combox>.combox-ul","mouseenter",function(e){
				$(e.currentTarget).show();
			});
			self.node.delegate(".lui-combox>.combox-ul","mouseleave",function(e){
				if(e.target==e.currentTarget){
					 $(e.currentTarget).hide();
				}
				  
			});
		},
		//获取权限值
		getAuthList:function(key){
			var authDescription = AUTH_LIST[0];
			var auth_value = {};
			for(var i=1;i<AUTH_LIST.length;i++){
				var item = AUTH_LIST[i];
				if(item['cssAction']==key){
					for(var k in item){
						auth_value[k] = item[k]; 
					}
				}
			}
			var ret = [];
			if(auth_value['cssAction']){
				for(var prop in auth_value){
					if(auth_value[prop]==1){
						ret[ret.length] = authDescription[prop].replace("\/","");
					}
				}
				return ret.join("/");
			}else{
				return {};
			}			
		}
	});
	return UserTeamAuthCombox;
});