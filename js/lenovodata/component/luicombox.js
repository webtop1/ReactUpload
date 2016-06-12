define("component/luicombox",function(require,exports,module){
	var $ = require("jquery"),
	_ = $.i18n.prop,
	Util = require("util"),
	EventTarget = require("component/eventTarget");
	var AUTHITEM = {
			              preview:{name:_("预览"),value:'preview'},
			               upload:{name:_("上传"),value:'upload'},
			    'upload:delivery':{name:_("上传/外链"),value:'upload:delivery'},
			             download:{name:_("下载"),value:'download'},
			  'download:delivery':{name:_("下载/外链"),value:'download:delivery'},
			    'upload:download':{name:_("上传/下载"),value:'upload:download'},
	   'upload:download:delivery':{name:_("上传/下载/外链"),value:'upload:download:delivery'},
			                edit :{name:_("编辑"),value:'edit'}
	};
	var ROLEITEM = {
		'member':{name:_("团队成员"),value:'member'},
		'admin':{name:_("团队管理员"),value:'admin'}
	};
	function LuiCombox(node,options){
		this.node = $(node);
		this.option = $.extend({isteam:false,initval:'preview'},options);
		this.render();
	}
	$.extend(LuiCombox.prototype,EventTarget,{
		render:function(){
			var combox = $("<span class='combox-text'></span><span class='icon i-luicombox'></span>");
			this.node.append(combox);
			var datalist = $("<ul class='combox-ul'></ul>");
			for(var i in AUTHITEM){
				var item = "<li class='combox-item' cssaction={{value}}>{{name}}</li>";
				item = $(Mustache.render(item,AUTHITEM[i]));
				datalist.append(item);
			}
			if(this.option.isteam){
				datalist.append(Mustache.render('<li class="combox-item-inherit"><input {{#inherit}}checked{{/inherit}} type="checkbox"/>'+_("允许子团队继承权限")+'</li>',{inherit:this.option.inherit}));
			}
			
			if(this.option.type=="combox_role"){
				datalist.html("");
				for(var i in ROLEITEM){
					var item = "<li class='combox-item' cssaction={{value}}>{{name}}</li>";
					item = $(Mustache.render(item,ROLEITEM[i]));
					datalist.append(item);
				}
				this.node.find(".combox-text").html(ROLEITEM[this.option.initval].name);
			}else{
				this.node.find(".combox-text").html(AUTHITEM[this.option.initval].name);
			}
			
			this.node.append(datalist);
			this.datalist = datalist;
			this.bindEvent();
		},
		bindEvent:function(){
			var self = this;
			this.node.delegate(".combox-text,.i-luicombox","click",function(ev){
				var ele = self.node.find(".combox-text")[0];
				var top = Util.getElementYPos(ele);
				var left = Util.getElementXPos(ele);
				var height = ele.offsetHeight;
				if(/msie 7/.test(navigator.userAgent.toLowerCase())){
					left +=1;
					top+=1;
					//z-index
					var zIndex = 0;
					$(".lui-combox").each(function(index,combox){
						if(zIndex<$(combox).css('z-index')){
							zIndex = $(combox).css("z-index");
						}
					});
					self.node.css("z-index",zIndex+1);
				}
				self.datalist.css({top:top+height,left:left-1});
				self.datalist.show();
			});
			this.node.on("mouseleave",function(ev){
				self.datalist.hide();
			});
			this.datalist.on("mouseleave",function(ev){
				self.datalist.hide();
			});
			this.datalist.delegate("li.combox-item","mouseenter",function(ev){
				$(ev.currentTarget).addClass("active");
			});
			this.datalist.delegate("li.combox-item","mouseleave",function(ev){
				$(ev.currentTarget).removeClass("active");
			});
			this.datalist.delegate("li.combox-item","click",function(ev){
				self.datalist.hide();
				self.node.find(".combox-text").html(ev.currentTarget.innerHTML);
				var value = ev.currentTarget.getAttribute("cssaction");
				var index = $(this).parents(".list-item").attr("index");
				if(self.option.type=="combox_role"){
					self.fire("change",index,'role',value);
					return this;
				}
				self.fire("change",index,'cssAction',value);
			});
			this.datalist.delegate("li.combox-item-inherit>input","click",function(ev){				
				var value = ev.currentTarget.checked;
				var index = $(this).parents(".list-item").attr("index");
				self.fire("changeInherit",index,'inherit',value);
			});
		}
	});
	return LuiCombox;
})
