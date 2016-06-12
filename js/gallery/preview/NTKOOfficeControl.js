/******************************************************************************
 *
 *
 * extend jquery control  NTKOOfficeControl for privew office file
 *
 * @version     1.0.x
 * @author      TINGHAI LIU
 * @url
 * @inspiration
 *
 *****************************************************************************/

(function($) {
	/**
	 * 默认参数
	 */
	var settings  = {
	    id:"TANGER_OCX",
		width : "800px",
        height : "500px",
        url:"",
        isEdit:false
	};
	var elements={};
	//控件对象
	var ntko_ocx={};
    var _ = $.i18n.prop;

	$.fn.NTKOOfficeControl = function(options) {
		settings  = $.extend(settings , options);
		elements=this;
		methonds.init();
        return methonds;
	}
	
	var methonds = {
		init : function() {
			this._render();
            // 验证本地office的环境可用性
            if(!this._checkOffice()){
                return;
            }
            this._initEvent();
			if(settings.isEdit){
				this.setEdit();
			}else{
				this.setPreview();
			}
		},
		_initEvent : function() {
            var browser=this.getBrowerName();
            var self=this;
            if (browser=="IE"){
                var eventFun="attachEvent"; //ie8 ie9 ie10
                //软航插件暂不支持ie11 ,目前方式 <meta http-equiv="X-UA-Compatible" content="IE9|IE8">
                /*if(!ntko_ocx[eventFun]){
                    eventFun="addEventListener";//ie 11
                }*/
                //IE文件保存
                ntko_ocx[eventFun]("OnFileCommand",function(){this.FileCommand(arguments[0]);});
                //文档加载完成
                ntko_ocx[eventFun]("OnDocumentOpened",function(){
                    self.onDocumentOpened();
                });

                if(!settings.isEdit){
                    ntko_ocx[eventFun]("OnWordBeforeRightClick",function(){
                       self.OnWordBeforeRightClick();
                    });
                }
            }
		},
		_render : function() {
			var browser=this.getBrowerName();
			var html=[];
			if (browser=="IE"){
				html.push('<!-- 用来产生编辑状态的ActiveX控件的JS脚本-->   ');
				html.push('<!-- 因为微软的ActiveX新机制，需要一个外部引入的js-->   ');
				html.push('<object id="'+settings.id+'" classid="clsid:C39F1330-3322-4a1d-9BF0-0BA2BB90E970"');
				html.push('codebase="/js/gallery/preview/ofctnewclsid.cab#version=5,0,2,7" width="'+settings.width+'" height="'+settings.height+'"  ');
                html.push('ForOnFileCommand="FileCommand"');
                html.push('>');
                html.push('<param name="IsUseUTF8URL" value="-1">   ');
				html.push('<param name="IsUseUTF8Data" value="-1">   ');
				html.push('<param name="BorderStyle" value="1">   ');
				html.push('<param name="BorderColor" value="14402205">   ');
				html.push('<param name="TitlebarColor" value="15658734">   ');
				html.push('<param name="isoptforopenspeed" value="0">   ');
				html.push('<param name="MakerCaption" value="联想调频科技有限公司">');
				html.push('<param name="MakerKey" value="EBFEBA51BED95FAF36C5F654F1747334F3FD079A">');
                html.push('<param name="ProductCaption" value="云存储系统">');
                html.push('<param name="ProductKey" value="0E09D1840872CE9544C2C027F1F551314AD21460">');
				html.push('<param name="TitlebarTextColor" value="0">   ');
				html.push('<param name="MenubarColor" value="14402205">   ');
				html.push('<param name="MenuButtonColor" VALUE="16180947">   ');
				html.push('<param name="MenuBarStyle" value="3">   ');
				html.push('<param name="MenuButtonStyle" value="7">   ');
				html.push('<param name="WebUserName" value="NTKO">   ');
				html.push('<param name="Caption" value="联想网盘">   ');
                html.push('<div style="margin-top:'+(settings.height-300)/2+'px;" class="preview_noplugin"><div class="preview_noplugin_msg">不能装载文档控件。请在检查浏览器的选项中检查浏览器的安全设置。</div><div class="preview_noplugin_img"></div></div>   ');
				html.push('</object>');
			}
			else if (browser=="firefox"){ 	
					html.push('<object id="'+settings.id+'" type="application/ntko-plug"  codebase="/js/gallery/preview/ofctnewclsid.cab#version=5,0,2,7" width="'+settings.width+'" height="'+settings.height+'" ForOnSaveToURL="saveComplete" ForOnBeginOpenFromURL="OnComplete" ForOndocumentopened="documentopened"');
					html.push('ForOnpublishAshtmltourl="publishashtml"');
					html.push('ForOnpublishAspdftourl="publishaspdf"');
					html.push('ForOnSaveAsOtherFormatToUrl="saveasotherurl"');
					html.push('ForOnDoWebGet="dowebget"');
					html.push('ForOnDoWebExecute="webExecute"');
					html.push('ForOnDoWebExecute2="webExecute2"');
					html.push('ForOnFileCommand="FileCommand"');
					html.push('ForOnCustomMenuCmd2="CustomMenuCmd"');
                    html.push('ForOnWordBeforeRightClick="OnWordBeforeRightClick"');
					html.push('_IsUseUTF8URL="-1"   ');
					html.push('_MakerCaption="联想调频科技有限公司"');
					html.push('_MakerKey="EBFEBA51BED95FAF36C5F654F1747334F3FD079A"');
                    html.push('_ProductCaption="云存储系统"');
                    html.push('_ProductKey="0E09D1840872CE9544C2C027F1F551314AD21460"');
					html.push('_IsUseUTF8Data="-1"   ');
					html.push('_BorderStyle="1"   ');
					html.push('_BorderColor="14402205"   ');
					html.push('_MenubarColor="14402205"   ');
					html.push('_MenuButtonColor="16180947"   ');
					html.push('_MenuBarStyle="3"  ');
					html.push('_MenuButtonStyle="7"   ');
					html.push('_WebUserName="NTKO"   ');
					html.push('clsid="{C39F1330-3322-4a1d-9BF0-0BA2BB90E970}" >');
					html.push('<div style="margin-top:'+(settings.height-300)/2+'px;" class="preview_noplugin"><div class="preview_noplugin_msg">'+_('尚未安装 Web FireFox跨浏览器插件,请点击')+'<a href="/js/gallery/preview/ntkoplugins.xpi">'+_('安装组件')+'</a></div><div class="preview_noplugin_img"></div></div>   ');
					html.push('</object>   ');
			}else if(browser=="chrome"){
					html.push('<object id="'+settings.id+'" clsid="{C39F1330-3322-4a1d-9BF0-0BA2BB90E970}"  ForOnSaveToURL="OnComplete2" ');
					html.push('ForOnpublishAshtmltourl="publishashtml"');
					html.push('ForOnpublishAspdftourl="publishaspdf"');
					html.push('ForOnSaveAsOtherFormatToUrl="saveasotherurl"');
					html.push('ForOnDoWebGet="dowebget"');
					html.push('ForOnDoWebExecute="webExecute"');
					html.push('ForOnDoWebExecute2="webExecute2"');
					html.push('ForOnFileCommand="FileCommand"');
					html.push('ForOnCustomMenuCmd2="CustomMenuCmd"');
					html.push('_MakerCaption="联想调频科技有限公司"');
					html.push('_MakerKey="EBFEBA51BED95FAF36C5F654F1747334F3FD079A"');
                    html.push('_ProductCaption="云存储系统" ');
                    html.push('_ProductKey="0E09D1840872CE9544C2C027F1F551314AD21460"');
					html.push('codebase="/js/gallery/preview/ofctnewclsid.cab#version=5,0,2,7" width="'+settings.width+'" height="'+settings.height+'" type="application/ntko-plug" ');
					html.push('_IsUseUTF8URL="-1"   ');
					html.push('_IsUseUTF8Data="-1"   ');
					html.push('_BorderStyle="1"   ');
					html.push('_BorderColor="14402205"   ');
					html.push('_MenubarColor="14402205"   ');
					html.push('_MenuButtonColor="16180947"   ');
					html.push('_MenuBarStyle="3"  ');
					html.push('_MenuButtonStyle="7"   ');
					html.push('_WebUserName="NTKO"   ');
					html.push('_Caption="联想网盘">    ');
					html.push('<SPAN STYLE="color:red">'+_('尚未安装 Web Chrom 跨浏览器插件,请点击')+'<a href="/js/gallery/preview/ntkoplugins.crx">'+_('安装组件')+'</a></SPAN>   ');
					html.push('</object>');
				}else if (Sys.opera){
                    alert(_("暂不支持此浏览器，请更换IE或者Firefox"));
				}else if (Sys.safari){
                    alert(_("暂不支持此浏览器，请更换IE或者Firefox"));
				}
				$(elements).append(html.join(" "));
				ntko_ocx=document.getElementById(settings.id);
                //添加到信任站点，否则数据可能加载不正常
                ntko_ocx.AddDomainToTrustSite(location.host);


                //增加PDF的支持
                ntko_ocx.AddDocTypePlugin(".pdf","PDF.NtkoDocument","4.0.0.0","/js/gallery/preview/ntkooledocall.cab",51,true);

		},
		/**
		 * 设置预览
		 */		
		setPreview:function(){
			 if(settings.previewUrl){
                 settings.isEdit=false;
                 ntko_ocx.titlebar =false;
                 ntko_ocx.Menubar=false;
                 ntko_ocx.ToolBars=false;
                 ntko_ocx.BeginOpenFromURL(settings.previewUrl,true,false);
			 }
		},
		/**
		 * 设置编辑
		 */
		setEdit:function(){
			 if(settings.previewUrl){
                settings.isEdit=true;
                ntko_ocx.titlebar =false;
                ntko_ocx.Menubar=false;
                ntko_ocx.ToolBars=true;
                ntko_ocx.CustomToolBar=false;
                ntko_ocx.BeginOpenFromURL(settings.previewUrl);
			 }
		},
        /**
         * 获取office的版本
         * 9=Office2000，10=OfficeXP,11=Office2003，12=Office2007，14=Offict2010，6=office95 8= office 97  100=错误，即本机没有安装OFFICE
         * @returns {*}
         */
        _getOfficeVersion:function(){
            var officever = ntko_ocx.getOfficeVer();
            return officever;
        },
        /**
         * 验证本地office的可用性
         */
        _checkOffice:function(){
            if(this._getOfficeVersion()==100){
                alert(_("本机尚未安装OFFICE，请安装后重试"));
                return false;
            }
            if(this._getOfficeVersion()<12&&settings.type=='xlsx'){
                alert(_('当前版本不支持，请安装OFFICE2007或以上的版本'));
                return false;
            }
            return true;
        },
        /**
         * 当文档加载完之后
         */
        onDocumentOpened:function(){
            try{
                if(settings.isEdit){
                    ntko_ocx.SetReadOnly(false,"");
                    ntko_ocx.activate(true);
                    //设置编辑时默认隐藏菜单
                    if ("12" == this._getOfficeVersion()) {
                        //此接口存在bug
                       // ntko_ocx.ActiveDocument.Application.ExecuteExcel4Macro('SHOW.TOOLBAR("Ribbon",False)'); //2010Ribbon全部隐藏
                    } else if ("14" == this._getOfficeVersion()) {
                        ntko_ocx.ActiveDocument.CommandBars.ExecuteMso("MinimizeRibbon"); //2010Ribbon最小化
                    }
                }else{
                    ntko_ocx.SetReadOnly(true,"");
                }
                if(settings.documentReady){
                    settings.documentReady();
                }
            }
            catch (e){
                if(console&&console.log){
                    console.log("onDocumentOpened:"+e)
                }
            }

        },
        /**
         * 设置全屏
         */
        setFullScreen:function(){
            try{
                ntko_ocx.FullScreenMode=true;
            }catch(e){
                if(console&&console.log){
                    console.log("onDocumentOpened:"+e)
                }
            }
        },
        /**
         * 鼠标右键
         * @constructor
         */
        OnWordBeforeRightClick:function(){
            if(!settings.isEdit){
                ntko_ocx.CancelWordRightClick=true;
            }
        },
        /**
         * 保存
         */
        save:function(){
            //从缓存直接读取ntko_ocx 不正常，原因未知。。。
            ntko_ocx=document.getElementById(settings.id);
            //必须在调用SaveToURL之前，部分浏览器曾在bug
            ntko_ocx.CancelLastCommand=true;
            var rs=ntko_ocx.SaveToURL(settings.storage_url,"Filedata","",settings.fileName,0);
            this.setSaveResult(rs);
        },
		setWidth : function(width) {
            ntko_ocx.style.width=width+"px";
		},
		setHeight : function(height) {
            ntko_ocx.style.height=height+"px";
		},
		destory : function() {
            ntko_ocx=null;
            elements.empty();
		},
        FileCommand:function(arg){
            var cmd=arg[0],isCancel=arg[1];
            //点击菜单栏保存
            if(cmd==3&&settings.isEdit){
                methonds.save();
            }
            //右键ctrl+s禁止弹出保存到本地对话框
            ntko_ocx.CancelLastCommand=true;
        },
        /**
         * 保存成功的回调函数
         * @param data
         */
        setSaveResult:function(data){
            var json=jQuery.parseJSON(data);
            settings.saveCallback(json);
        },
		/**
		 * 获取浏览器名称
		 */
		getBrowerName:function(){
			var userAgent = navigator.userAgent, 
			rMsie = /(msie\s|trident.*rv:)([\w.]+)/, 
			rFirefox = /(firefox)\/([\w.]+)/, 
			rOpera = /(opera).+version\/([\w.]+)/, 
			rChrome = /(chrome)\/([\w.]+)/, 
			rSafari = /version\/([\w.]+).*(safari)/;
			var browser;
			var version;
			var ua = userAgent.toLowerCase();
				var browserMatch={};
				var ua=userAgent.toLowerCase();
				var match = rMsie.exec(ua);
				if (match != null) {
					browserMatch= { browser : "IE", version : match[2] || "0" };
				}
				var match = rFirefox.exec(ua);
				if (match != null) {
					browserMatch= { browser : match[1] || "", version : match[2] || "0" };
				}
				var match = rOpera.exec(ua);
				if (match != null) {
					browserMatch= { browser : match[1] || "", version : match[2] || "0" };
				}
				var match = rChrome.exec(ua);
				if (match != null) {
					browserMatch= { browser : match[1] || "", version : match[2] || "0" };
				}
				var match = rSafari.exec(ua);
				if (match != null) {
					browserMatch= { browser : match[2] || "", version : match[1] || "0" };
				}
				if (match != null) {
					browserMatch = { browser : "", version : "0" };
				}
				
			if (browserMatch.browser) {
				browser = browserMatch.browser;
				version = browserMatch.version;
			}
			return 	browser;		
		}
    };


})(jQuery);

/***
 * chrome firefox 控件回调 工具栏操作
 * @param cmd
 * @param isCancel
 * @constructor
 */
function FileCommand(){
    g_preview.FileCommand(arguments);
}
/**
 * firefox保存完成回调
 */
function saveComplete(){
    g_preview.setSaveResult(arguments[2]);
}
/**
 * 文档加载完成回调
 */
function documentopened(){
    g_preview.onDocumentOpened();
}
/**
 * 鼠标右键
 * @constructor
 */
function OnWordBeforeRightClick(){
    g_preview.OnWordBeforeRightClick();
}