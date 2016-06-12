define("component/authPanel",function(require,exports,module){
	var $ = require("jquery"),
	    _ = $.i18n.prop;
	require("mustache");
	function AuthPanel(node){
		this.node = $(node);
		this.render();
	}
	AuthPanel.prototype = {
		render:function(){
			var authPanel = $("<div class='auth-panel'><h2></h2><ul class='auth-body'></ul></div>");
			var data = [{instruction:_("权限说明"),preview:_("预览"),upload:_("上传"),download:_("下载"),uploadlink:_("创建上传外链"),downloadlink:_("创建下载外链"),create:_("新建目录/文件"),remove:_("删除"),rename:_("重命名"),move:_("移动"),copy:_("复制")},
			            {instruction:_("编辑"),      preview:"1",upload:"1",download:"1",uploadlink:"1",downloadlink:"1",create:"1",remove:"1",rename:"1",move:"1",copy:"1"},
				        {instruction:_("上传/下载/外链"), preview:"1",upload:"1",download:"1",uploadlink:"1",downloadlink:"1",create:"1",remove:"0",rename:"0",move:"0",copy:"1"},
			            {instruction:_("下载/外链"),   preview:"1",upload:"0",download:"1",uploadlink:"0",downloadlink:"1",create:"0",remove:"0",rename:"0",move:"0",copy:"1"},
					    {instruction:_("上传/外链"),   preview:"0",upload:"1",download:"0",uploadlink:"1",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"0"},
					    {instruction:_("上传/下载"),  preview:"1",upload:"1",download:"1",uploadlink:"0",downloadlink:"0",create:"1",remove:"0",rename:"0",move:"0",copy:"1"},
					    {instruction:_("下载"),      preview:"1",upload:"0",download:"1",uploadlink:"0",downloadlink:"0",create:"0",remove:"0",rename:"0",move:"0",copy:"1"},
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
			                "<span class='col_rename'>{{rename}}</span>"+
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
					           "<span class='col_rename'><i class='i-auth-{{rename}}'></i></span>"+
					           "<span class='move'><i class='i-auth-{{move}}'></i></span>"+
					           "<span class='copy'><i class='i-auth-{{copy}}'></i></span></li>";
			authPanel.find("h2").append(Mustache.render(h_template,data[0]));
			for(var i=1;i<data.length;i++){
				authPanel.find("ul.auth-body").append(Mustache.render(li_template,data[i]));
			}
			this.node.append(authPanel);
			authPanel.show();
		}
	}
	return AuthPanel;
});
