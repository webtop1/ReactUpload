define("component/searchbox",function(require,exports,module){
	var $ = require("jquery"),EventTarget = require("component/eventTarget"),
	TeamModel = require("model/TeamManager"),
	UserModel = require("model/UserManager"),
	_ = $.i18n.prop,
	Util = require("util");

    /**
     *
     * @param node
     * @param func
     * @param startPage 开始页
     * @param pageSize 每页显示条数
     * @constructor
     */
	function SearchBox(node,func,startPage,pageSize,searchType,suggestCallback){
		this.node = $(node);
		this.callback = func;
        this.startPage=startPage||0;
        this.pageSize=pageSize||10000;
        this.searchType=searchType;
		this.suggestCallback=suggestCallback;
		this.render();
	}
	$.extend(SearchBox.prototype,EventTarget,{
		render:function(){
			var searchbox = $("<input type='text' class='search-txt' placeholder=\""+_("输入姓名、邮箱搜索")+"\"><a><span class='icon i-search'></span></a>");
			var datalist = $("<ul class='data-list'></ul>");
			this.node.append(searchbox);
			this.node.append(datalist);
			this.searchbox = searchbox;
			this.datalist = datalist;
			this.bindEvent();
		},
		bindEvent:function(){
			var self = this,timer,
				flag=true;
			self.node.delegate("input","keyup",function(ev){				
				var key = this.value;
                if($.trim(key)==""){
                    self.datalist.empty();
                    clearTimeout(timer);
                    return;
                }
				if(key.length>0){
					clearTimeout(timer);
					timer = setTimeout(suggestion,500);
				}
				function suggestion(){
				    UserModel.suggestion(function(result){
						if(self.suggestCallback){
							self.suggestCallback(result);
							return true;
						}
						if(result.code==200){
							self.datalist.empty();
							if(result.data.length>0){
								for(var i=0;i<result.data.length;i++){
									var li = $("<li class='li-item'></li>");
									var user = 'user';
									li.attr("dataid",result.data[i].id);	
									result.data[i].email&&li.attr("title",result.data[i].email);	
									
									result.data[i].agent_id&&li.attr("uid",result.data[i].type == 'team'?'t_':'u_' + result.data[i].agent_id);	
//									result.data[i].email&&li.append("<span class='item-email'>"+result.data[i].email+"</span>");
									
									if(result.data[i].from_domain_account){
										user = 'user-domain';
									}else{
										if(result.data[i].type == 'user'){
											user = 'user';
										}else if(result.data[i].type == 'team'){
											user = 'user6';
										}
									}
									li.append("<span class='icon i-" + user + "'></span><span class='item-name'>"+result.data[i].suggestion+"</span>");
									self.datalist.append(li);
								}
							}else{
								self.datalist.append($("<li class='li-item-no-result'>"+_("搜索无结果")+"</li>"));
							}
							if(flag){
								self.datalist.show();
							}
							flag = true;
						}					
					},key);
			    }
			});
			
			self.node.on("mouseleave",function(ev){
				self.datalist.hide();
			});
			self.node.delegate("input","blur",function(e){
				self.node.removeClass("boxfocus");
			});
			self.node.delegate("input",'keydown',function(ev){
				if(ev.keyCode==13){
					ev.preventDefault();
					ev.stopPropagation();
					flag = false;
					$(this).blur();
					self.search(self.node.find("input").val());
					self.node.find("a>span").removeClass("i-search").addClass("i-search-close");
				}
			});
			self.node.delegate("input",'focus',function(ev){
				self.node.addClass("boxfocus");
			});
			self.node.delegate("a","click",function(ev){
				var icon = $(this).find('span');
				if(icon.hasClass("i-search")){
					self.search(self.node.find("input").val());
					icon.removeClass("i-search").addClass("i-search-close");
				}else{
					icon.removeClass("i-search-close").addClass("i-search");
					self.fire("close");
				}			
			});
			self.datalist.delegate(".li-item","mouseover",function(e){
				$(this).addClass("active");
			});
			self.datalist.delegate(".li-item","mouseout",function(e){
				$(this).removeClass("active");
			});
			self.datalist.delegate(".li-item","click",function(e){
				var key = $(this).find(".item-name").html();
				self.node.find(".search-txt").val(key);
				self.node.find("a>span").removeClass("i-search").addClass("i-search-close");
				self.node.removeClass("boxfocus");
				self.search(key,$(this).attr('uid'));
				self.datalist.hide();
			});
		},
		search:function(key,uid){
			var self = this;
            if(!self.searchType){
                TeamModel.searchUserTeamByName(function(result){
                    if(result.code==200){
                        self.callback&&self.callback(result.data.content,uid);
                    }
                },key,self.startPage,self.pageSize);
            }else if(self.searchType=="user"){
                UserModel.list_for_pages(function(result){
                    if(result.code==200){
                        self.callback&&self.callback(result.data.content);
                    }
                },self.startPage,self.pageSize,null,key);
            }

		}
	});
	return SearchBox;
});
