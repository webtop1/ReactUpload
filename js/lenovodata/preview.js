/**
 * the page  preview.html depend this script
 * support pdf,doc,docx,ppt,pptx,xls  file
 * Created by thliu on 2015/4/9.
 */
;define("lenovodata/preview",['jquery','i18n','gallery/preview/NTKOOfficeControl'], function (require, exports, module) {
    //页面缓存
    var cache = {
        map: {},//querystring 参数map
        frame: {} //下载用
    };
    var _ = $.i18n.prop;
    var $head = $("#preview_head");
    var $win=$(window);
    var $container=$("#preview_contailer");
    var $body=$("body");
    var $preview_txt={};
    var $process={};
    //txt预览对象
    var flashObj={};
    var intWidth=20;
    var intHeight=80;
    //页面最小宽度
    var minWidth=$win.width()-14;
    var isFlashLoaded=false;
    /**
     * 页面初始化
     */
    exports.init = function (queryStr) {
        if(!/\.txt/.test(queryStr)&&!isBrower()){
            alert(_("暂不支持此浏览器，请更换IE(32位)或者Firefox"));
            return false;
        }
        initParams(queryStr);
        render();
        initControl();
        resize();
        initEvent();
    }
    /**
     * 初始化组件
     */
    var initControl=function(){
        if("txt"!=cache.map.type){
            var o = {
                previewUrl: cache.map.previewUrl,
                isEdit: cache.map.isEdit,
                width: $win.width() - 120,
                height: $win.height() - 55,
                type:cache.map.type,
                storage_url: cache.map.storage_url,
                //文档加载完毕
                documentReady:function(){},
                //保存回调
                saveCallback: function (data) {
                    if (data.result && data.result == "success") {
                        //if(localStorage){
                        //    localStorage.endEdit = true;
                        //}else{
                        //    $.cookie('endEdit','true');
                        //}
                        window.opener.fileManager&&window.opener.fileManager.filelist.reload();
                        alert(_("保存成功"));
                    }
                }
            };

            g_preview  = $container.NTKOOfficeControl(o);
        }else{
            initTxtPreviewControl();
        }

    };

    /**
     * 初始化txt预览
     */
    var initTxtPreviewControl = function () {
        var myclass="";
        if(navigator.userAgent.indexOf("MSIE")>0){
            myclass='classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
        }
        var arrHTML = ['<object ',myclass,' id="preview_txt_flash" data="/js/gallery/preview/preview_txt.swf" type="application/x-shockwave-flash"  width=1',' height=1','">',
            '<param name="quality" value="high" />',
            '<param name="menu" value="false" />',
            '<param name="wmode" value="transparent" />',
            '<param name="movie" value="/js/gallery/preview/preview_txt.swf" />',
            '<param name="allowScriptAccess" value="always" />',
            '</object>'];
        arrHTML.push('<div id="preview_txt" class="preview_txt" style="width:'+($win.width() - intWidth)+'px;height:'+($win.height() - intHeight)+'px;"></div>');
        arrHTML.push(' <div id="preview_txt_progress" class="preview_txt_progress"><span> </span></div> ');
        $container.append(arrHTML.join(""));
        $preview_txt=$("#preview_txt");
        $process=$("#preview_txt_progress > span");
        $process.parent().css({top:$win.height()/2-30,left:$win.width()/2-50});
        if (typeof document.onselectstart!="undefined"){
            document.onselectstart=new Function ("return false");
        }
    };

    /**
     * 初始化参数
     * @private
     */
    var initParams=function(queryStr){
        queryStr = queryStr.replace("?id=", "");
        var host = (queryStr.indexOf("http") > -1 ? "" : window.location.protocol + "//" + window.location.host + "/");
        var mapStr=queryStr.substr(queryStr.indexOf("?")+1,queryStr.length);
        $(mapStr.split("&")).each(function () {
            var cur = this.split("=");
            cache.map[cur[0]] = this.replace(cur[0]+"=","");
        });
        var m=cache.map;
        var l_cookie = $.cookie('X-LENOVO-SESS-ID');
        if(!l_cookie){
            l_cookie= m.cid;
            document.cookie += "X-LENOVO-SESS-ID="+l_cookie;
        }
        var l_language = $.cookie('language');

        if (cache.map["previewUrl"]||cache.map["islink"]) {
            if(cache.map.fileName){
                var types=cache.map.fileName.split(".");
                cache.map.type=types[1];
            }
        }

        //文件夹下外链的预览
        if (m["previewUrl"]) {
            m.url = m["previewUrl"];
            //存在一encode的，所以先decode
            m.url=encodeURI(decodeURI(m.url)).replace(/#/g,"%23")+"?";
            //单独文件的外链
        } else if(m["islink"]){
            m.url=queryStr;
        }else{
            var strFilePath=queryStr.split("&")[0];
            var arrFilePath=strFilePath.split("/");
            m.fileName=arrFilePath[arrFilePath.length-1];
            var arrFile=m.fileName.split(".");
            m.type=arrFile[arrFile.length-1];
            var reqParams = [];
            reqParams.push("neid="+m["neid"]);
            reqParams.push("rev="+m["rev"]);
            reqParams.push("uid="+m["uid"]);
            reqParams.push("root=databox");
            reqParams.push("action=preview");
            reqParams.push("X-LENOVO-SESS-ID="+l_cookie);
            var savePath="/v2/dl_router/databox/";
            var fileName=cache.map["fileName"];
            fileName.lastIndexOf()
            if(fileName.indexOf(m.type)<0){
                fileName +=m.type;
            }
            m.url = host + savePath+fileName+"?"+reqParams.join("&");
        }
        //预览访问的URL
        var token=m.token?"&token="+ m.token:"";
        m.previewUrl= m.url+"&user_op=preview"+token;
        //下载访问的URL
        m.downloadUrl= m.url+"&op=download"+token;
        //存储参数
        var stoParams=[];
        stoParams.push('X-LENOVO-SESS-ID='+l_cookie);
        stoParams.push('uid='+ m.uid);
        stoParams.push('overwrite=true');
        stoParams.push('source=file');
        stoParams.push('language='+l_language);
        stoParams.push('path_type='+m.path_type||"self");
        stoParams.push('path=/a.txt');
        stoParams.push('neid='+m.neid);
        m.storage_url += '/files/databox/a.txt?';//a.txt?不能為空
        m.storage_url +=stoParams.join("&");
        m["isEdit"]=(cache.map["opType"] === "preview" ? false : true);
    };
    /**
     * 页面渲染
     * @private
     */
    var render = function () {
        //隐藏头部
        if(cache.map["head"]){
            $head.hide();
            return;
        }
        var className="preview_icontype";
        switch (cache.map["type"]) {
            case "ppt":
                className += " ppt";
                break;
            case "pptx":
                className += " ppt";
                break;
            case "xlsx":
                className += " excel";
                break;
            case "xls":
                className += " excel";
                break;
            case "pdf":
                className += " pdf";
                break;
            case "txt":
                className += " txt";
                break;
            default :
                className += " word";
                break;
        }
        $head.find(".preview_icontype").removeClass().addClass(className);
        var fileName = decodeURI(decodeURI(cache.map["fileName"]));
        var size = decodeURI(cache.map["size"]);
        $("#preview_filename").text(fileName + " ("+_('大小')+":" + size + ")");

        //如果已经为编辑则隐藏编辑按钮
        if (cache.map["opType"] === "edit" || cache.map["type"] === "pdf") {
            $head.find("img[name='edit']").hide();
        }

        //txt预览禁止全屏和编辑
        if(cache.map["type"] === "txt"){
            $head.find("img[name='edit']").hide();
            $head.find("img[name='fullScreen']").hide();
            //$container.css({"border":"solid 1px #b8d4f6"});
        }

        //外链预览模式
        if (cache.map["captcha"] && cache.map["captcha"] == "lenovo") {
            $head.find("img[name='edit']").hide();
        }
        //外链文件夹下的预览
        if (cache.map["previewUrl"]&&!isEdit) {
            $head.find("img[name='edit']").hide();
        }

        //编辑权限
        var isEdit = /upload:download|edit/.test(cache.map["action"]);
        var islocked=(cache.map["islocked"]==="true"||false);
        if(!isEdit||islocked){
            $head.find("img[name='edit']").hide();
        }

        //下载权限
        var isDownload = /download|edit/.test(cache.map["action"]);
        if(!isDownload){
            $head.find("img[name='download']").hide();
        }
        $head.find("img[name='edit']").attr("title",_("编辑"));
        $head.find("img[name='download']").attr("title",_("下载"));
        $head.find("img[name='fullScreen']").attr("title",_("全屏"));
    }
    /**
     * 事件绑定
     * @private
     */
    var initEvent = function () {
        $head.delegate('img', 'click', function () {
            var flag = $(this).attr("name");
            switch (flag) {
                case "edit":
                    edit();
                    break;
                case  "link":
                    link();
                    break;
                case "download":
                    download();
                    break;
                case "fullScreen":
                    setfullScreen();
                    break;
            }
        });

        $(window).resize(function(){
            resize();
        });

        //编辑模式增加退出提醒
        if(cache.map.isEdit){
            $body.attr("onbeforeunload","return ('')");
        }
    }
    /**
     * 编辑
     */
    var edit = function () {
        g_preview.setEdit();
        $head.find("img[name='edit']").hide();
        $body.attr("onbeforeunload","return ('')");
    };

    /**
     * 下载
     */
    var download = function () {
        if (cache.frame && cache.frame.length > 0) {
            cache.frame.attr('src', cache.map.downloadUrl);
        } else {
            $body.append("<iframe id='preview-download-iframe' style='display: none;'></iframe>");
            cache.frame = $('#preview-download-iframe');
            cache.frame.attr('src', cache.map.downloadUrl);
        }
    };

    /**
     * 设置为全屏
     */
    var setfullScreen=function(){
        g_preview.setFullScreen();
    };

    /**
     * 调整UI size
     */
    var resize=function(){
        //PC Client 需要零边距
        if(cache.map["head"]){
            intWidth=5;
            intHeight=5;
        }
        //页面最小尺寸，保证内容正常显示
        var intW=$win.width() - intWidth;
        var intH=$win.height()-intHeight;
        if($win.width()<minWidth){
            intW=minWidth;
        }
        $container.width(intW);

        if("txt"!=cache.map.type){
            g_preview.setWidth(intW);
            g_preview.setHeight(intH);
        }
    };
    /**
     * flash加载完成,flashcallback
     * @returns {*}
     */
    window.g_url=function(){
        return cache.map.previewUrl;
    };
    /**
     * flashcallback
     * @param txt
     */
    window.g_process = function(txt){
        $process.css("width", String(txt) + "%");
        $process.html(String(txt) + "%");
    };
    /**
     * flashcallback
     * @param txt
     */
    window.g_showTxt=function(txt){
        var timeout=setTimeout(function(){
            $process.parent().hide();
            var arrTxt = [];
            var len=txt.length;
            var i=0;
            for(i;i<len;i+=5120){
                arrTxt.push(txt.substring(i,i+5120))
            }
            $preview_txt.data("pageindex",0);
            $preview_txt.data("totalpage",arrTxt.length);
            $preview_txt.html(arrTxt[0].replace(/\r\n/g,"<br/>"));
            $preview_txt.scroll(function(){
                var scrollTop= $preview_txt[0].scrollTop;
                var scrollHeight=$preview_txt[0].scrollHeight;
                //rachend
                if(scrollTop>=scrollHeight-$preview_txt.height()){
                    var pageindex=$preview_txt.data("pageindex")+1;
                    if(pageindex< $preview_txt.data("totalpage")){
                        $preview_txt.data("pageindex",pageindex)
                        $preview_txt.append(arrTxt[pageindex].replace(/\r\n/g,"<br/>"));
                    }
                }
            });
            clearTimeout(timeout);
            timeout=null;
        },1000);
    };


    /**
     * 是否支持当前浏览器
     * @returns {boolean}
     * @private
     */
    var isBrower=function(){
        var rMsie = /(msie\s|trident.*rv:)([\w.]+)/;
        var rFirefox = /(firefox)\/([\w.]+)/;
        var ua = navigator.userAgent.toLowerCase();
        if(!rMsie.exec(ua)&&!rFirefox.exec(ua)){
            return false;
        }
        if(window.navigator.platform!='Win32'){
            return false;
        }
        return true;
    }
});