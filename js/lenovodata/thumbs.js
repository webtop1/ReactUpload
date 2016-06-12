;define("lenovodata/thumbs",function(require,exports,modules){
	var $ = require("jquery"),
	    FileModel = require("model/FileManager"),
	    PhotoSlide = require('component/galleryslide/photoslide'),
	    width = document.body.offsetWidth-132,
	    height = parseInt(width*0.76),
	    Util = require("util");      	           
	exports.init = function(){
		var queryString = location.href.substring(location.href.indexOf("?"));
		var params = Util.queryString(queryString);
		if(parent.window.previewData){
			if(params.mark =="sigleDelivery"){
				previewSigleImage(params.cur,parent.window.previewData);
				return;
			}
			var storage_url = Util.getStorageUrlForPreview();
			previewImage(storage_url,params.cur,parent.window.previewData,params.isdelivery,params.delivery_token);
		}else{
			FileModel.metadata(function(result){
				var mask = document.createElement("div");
		    	mask.className = "lui-mask";
		    	mask.style.zIndex = "70";
		    	mask.id = "lui-mask-iframe";
		    	document.body.appendChild(mask);
				previewImage(params.storageurl,params.cur,result.data.content);	
			},decodeURIComponent(params.path),{offset:params.offset,
				            limit:params.limit,
				              cur:params.cur,
				        path_type:params.path_type,
				             from:params.from,
				      prefix_neid:params.prefix_neid,
				     content_type:FileModel.CONTENT_TYPE.FILE, 
				          orderby:params.orderby?params.orderby:FileModel.ORDERBY.NAME,
				             sort:params.sort?params.sort:FileModel.SORT.ASC});
		}     
			
	}
	function previewImage(storage_url,current, data,isDelivery,delivery_token){
        var photodata = [];

        var currentId;
        for(var i=0, len=data.length; i<len; i++){
                var da = data[i];
                if((da.thumb_exist||da.thumbExist) && da.action !=="upload" &&  da.action !=="upload:delivery"){
                	
                	var d = {
                            id: da.hash,
                            name: Util.resolvePath(da.path, false).name,
                            description: "",
                            originPath: FileModel.thumbnails(storage_url,da.path,da.path_type,da.from,da.neid,width, height, da.hash,da.rev,isDelivery,da.deliveryCode,delivery_token, da.previewUrl),
                            thumbnails: FileModel.thumbnails(storage_url,da.path,da.path_type,da.from,da.neid, 100, 76, da.hash,da.rev,isDelivery,da.deliveryCode,delivery_token, da.previewUrl)
                        };
                    	photodata.push(d);
                        if (decodeURIComponent(current) == d.name) {
                            currentId = photodata.length-1;
                        }
                }                       
        }
        if(photodata.length){
            var pg1 = new PhotoSlide(photodata, currentId);
        }
    }
	function previewSigleImage(current, data){
        var photodata = [];
        var currentId;
        var da = data[0];
        	
    	var d = {
                id: da.hash,
                name: decodeURIComponent(current),
                description: "",
                originPath: da.path + '&delivery_token='+da.token +'&w='+width+'&h='+height+'&hash=' +da.hash+ '&rev=' + da.rev,
                thumbnails: da.path + '&delivery_token='+da.token +'&w=100&h=76'+'&hash=' +da.hash+ '&rev=' + da.rev
            };
        photodata.push(d);
        currentId = 0;        
        if(photodata.length){
            var pg1 = new PhotoSlide(photodata, currentId);
        }
    }
});
