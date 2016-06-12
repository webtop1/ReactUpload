define("component/shareMemberDialog",function(require,exports,module){
	var $ = require("jquery"),
	ListView = require("component/listview"),
	_ = $.i18n.prop;
	require("mustache");
	function ShareMemberDialog(node,options){
		this.node = $(node);
		this.option = $.extend({},options);
		this.init();
	}
	ShareMemberDialog.prototype = {
		init:function (){
		    var list_config = {column:1,template:["<li class='list-item'>",
			                                      "<div class='item-image'><i class='icon i-head-user'></i></div>",
			                                      "<div class='fr'><span class='item-name'>{{username}}</span><span class='item-email'>{{#email}}({{email}}){{/email}}</span></div>",
			                                      "</li>"].join("")};
			var inner = $(["<div class='lui-hover-dialog'>",
//			               "<div class='lui-header'><div class='search-box'></div></div>",
			               "<div class='lui-list-wraper'>",
			               "<h2>"+((this.option.data.length==1)?_("共享成员1人"):_("共享成员{0}人",this.option.data.length))+"</h2>",
			               "<div class='lui-list member-list'></div><div class='lui-list search-list'></div></div>",
			               "</div>"].join(""));
			$('body').append(inner);
			var self = this;		
			this.member_list = new ListView(inner.find(".member-list"),list_config);
			this.render(this.option.data);
			$(document).mouseup(function(e){
				if($(".file-share-user").is(e.target)||$(".file-share-user").has(e.target).length!=0){
					return;
				}
				if(!inner.is(e.target)&&inner.has(e.target).length==0){
					inner.remove();
				}
			});
		},
		render:function (data){
			if(data&&data.length>0){
				this.member_list.render(data);
			}	
		}
	}	
	return ShareMemberDialog;
});
