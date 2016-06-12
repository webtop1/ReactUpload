;define('lenovodata/previewController', function(require, exports){
	var $ = require('jquery'),Util = require('util'),FileModel = require('model/FileManager');
    var Tips = require('component/tips');
    require('i18n');
    var	_ = $.i18n.prop;
	function controller(context, type, current, data){
		//Util.sendBuridPointRequest();
		if(!('preview'==type)&&!('edit'==type))return;
        if(!current.mimeType) return;
        if(current.mimeType.indexOf('image')!= -1){
            previewImage(context, current, data);
        }else if(current.mimeType.indexOf('doc')!= -1 || 
                 current.mimeType.indexOf('pdf')!= -1 ||
                 current.mimeType.indexOf('ppt')!= -1 ){
            var url=getUri(context, type, current, data);
            previewDoc(url,current,context);
        }else if(current.mimeType.indexOf('doc')!= -1){
            previewImage(context, current, data);
        }else if(Util.isVideo(current.mimeType)){
            previewVideo(context,current,data);
        }
	}

    var timer = null;
    function changeEditStatus (context){
        if(localStorage){
            localStorage.endEdit = false;
        }else{
            $.cookie('endEdit','false');
        }

        timer = window.setInterval(function(){
            var flag;
            if(localStorage){
                flag = localStorage.endEdit = false;
            }else{
                flag = $.cookie('endEdit','false');
            }
            if(flag == "true"){
                context._renderList();
                window.clearInterval(timer);
            }
        },1000);
    }

    function getUri(context, type, current, data){
        var uri = FileModel.downloadLink(current.path, current.dataUrl, data);
        var actionurl = uri.substr(0,uri.indexOf("?")).replace(/%/g,"%25").replace(/#/g,"%23");
        var uid = Util.getUserID();
        var account_id = Util.getAccountId();
        var rev=current.rev;
        var neid=current.neid;
        var directory=encodeURI(current.path.substring(0,current.path.lastIndexOf("/")));
        var path_type=current.path_type;
        var prefix_neid=current.prefix_neid;
        var filePath=encodeURI(current.path);
        // uri = uri.replace('\/\/','\/');
        var path="";
        if(current["downloadUrl"]){
            path="&previewUrl="+current["downloadUrl"]+'&type='+current.type+'&fileName='+encodeURI(current.name)+'&size='+current.size+'&opType=preview&action='+current.action;
        }else{
            path = actionurl + '&path_type='+path_type+'&neid='+neid+'&rev='+rev+'&account_id='+account_id;
            path+='&uid='+uid+'&size='+current.size;
            path+='&islocked='+current.islocked;
            path+='&storage_url='+encodeURI(Util.getStorageUrl())+ Util.getApiVersion()+'&opType='+type+"&action="+current.action;
        }
        //qq浏览器下存在cookie丢失的问题，原因未知
        path +="&cid="+$.cookie('X-LENOVO-SESS-ID');
        return path;
    }
    function previewImage(context, current, data){
    	var mask = document.createElement("div");
    	mask.className = "lui-mask";
    	mask.style.zIndex = "70";
    	mask.style.minWidth = 1024+"px";
    	mask.id = "lui-mask-iframe";
    	document.body.appendChild(mask);
    	var preview_dialog = $("<div id='web_iframediv' style='position:absolute;top:0;overflow:hidden;left:0;height:100%;width:100%;z-index:1000;min-width:1024px;'></div>");
    	window.previewData = data;
    	var iframe = document.createElement("iframe");
    	current.name = current.name.replace(/\<em\>/g,"").replace(/\<\/em\>/g,"");
    	if(context.mark == "sigleDelivery"){
    		iframe.src ="/thumbs.html?path="+encodeURIComponent(context.path)+'&mark=' +context.mark+ '&delivery_token=' + encodeURIComponent(current.token)+ '&cur='+encodeURIComponent(current.name);
    	}
    	else if(current.isDelivery){
    		iframe.src = "/thumbs.html?path=/"+encodeURIComponent(context.path)+ '&delivery_token='+ encodeURIComponent(current.token)+"&isDelivery=true&offset=0&limit=50&cur="+ encodeURIComponent(current.name);
    	}else{
    		iframe.src = "/thumbs.html?path=/"+encodeURIComponent(context.path)+'&path_type='+current.path_type+"&offset=0&limit=50&cur="+ encodeURIComponent(current.name);
    	}  	
    	$(iframe).attr("width","100%").attr("height","100%").attr("frameborder","no").attr("scrolling","no");
    	preview_dialog.append($(iframe));
    	$('body').append(preview_dialog); 	
    }
    function previewDoc(url,current,context){
        var location="";
        if(window.sys_config.custom_preview_type=="owa"&&current.mimeType!="doc/.txt"){
            if(current.previewUrl){
                location = current.previewUrl+'&delivery_token='+current.token;
            }else{
                location =  FileModel.preview(current.path, current.rev,current.path_type,current.from,current.neid);
            }
        }else{
           var token=current.token?"&token="+current.token:"";
            location=window.location.protocol+"//"+window.location.host+"/preview/preview.html?id="+url+token;
        }
        //changeEditStatus(context.filelist);
        window.open(location);
    }
	function previewDeliveryDoc (content,current,data){
		var url = FileModel.deliveryPreview(current.previewUrl,current.deliveryCode,current.token);
		window.open(url);
	}

    function previewVideo(content,current,data){
        FileModel.getVedioStat(function(data){
            if(data.code==200&&data.data.code=="succeed"){
                showVedio();
            }else if(data.data&&data.data.code!="succeed"){
                Tips.show(data.data.message);
            }else if(data.code===0){
                Tips.info(_("哎呀！网络不太给力，快去检查一下吧！"),null,_("无法正常预览"));
            }
            else{
                Tips.warn(_("系统出错了！"));
            }
        },current.neid,current.hash);

        function showVedio(){
            require.async(['component/dialog','module/video/video_main'],function(Dialog,Video){
                var vedioObj={};
                var url =FileModel.preview(current.path, current.rev,current.path_type,current.from,current.neid,current.mimeType);
                var downloadUrl = FileModel.downloadLink(current.path, current.dataUrl, data);
                //http://video-js.zencoder.com/oceans-clip.mp4
                var dialog = new Dialog(_('音视频预览'),{mask:true},function(context){
                    vedioObj=new Video({url:url,container:context});
                    vedioObj.init();
                });
                dialog.on('close',function(){
                    vedioObj.destroy();
                });
            })
        }

    }

	return controller;
});
