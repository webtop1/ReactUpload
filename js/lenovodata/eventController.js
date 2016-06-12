;define('lenovodata/eventController', function(require, exports,module){
	var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
	var Util = require('lenovodata/util');
	var UserManager = require('lenovodata/model/UserManager');
	var FileManager = require('lenovodata/model/FileManager');
	var TempTool = require('component/eventTemplateTool');
	var previewController = require('lenovodata/previewController');
	var AuthModel = require('model/AuthManager');
	var fileController = require('lenovodata/fileController');
	var eventManager = require('lenovodata/model/EventManager');
	var Tips = require('component/tips');
	require('mustache');
	var eventController = function(call,isBox){ //isBox为true时为网盘，false为所有动态列表
    	this.index = 0;
    	this.currentData = [];
    	this.fileData = {}; //存放动态中请求回来的文件数据
    	this.userInfo = {};
    	this.call = call; //目前该变量保存滚动条的list，重新渲染滚动条下的数据
    	this.isBox = isBox ? true : false;
    	this.bindEvent();
    	this.eventManager = new eventManager();
    	this.splitNeid = {};
    	this.showUserInfoBox = false;
	}
	eventController.prototype = {
		bindEvent:function(){
    		var self = this;
    		//跳转事件
    		if(!self.isBox){
    			$("#listBody").delegate('.dy-icon,.event','click',function(){
		    		self.gotoBox(this);
		    	});
    		}
	    	//收起事件
	    	$("#listBody").delegate(".select-icon","click",function(){
				$(this).parent().nextAll(".item,.line").slideToggle(300,function(){
					self.call();
				});
				$(this).toggleClass('active-icon');
			});
			
			$("#listBody").delegate(".file","mouseover",function(){
				if($(this).find('.hover a').length > 0){
					$(this).find('.hover a').show();
				}else{
					self.getFileInfoByNeid($(this).attr('neid'),this);
				}
			}).delegate(".file","mouseleave",function(){
				$(this).find('.hover a').hide();
			});
			$("#listBody").delegate('.file .info','click',function(){
				self.locationToFolder(this);
			});
			$("#listBody").delegate(".dy-icon-user","mouseenter",function(e){
				var offset = $(this).offset();
				var uid = $(this).attr('uid');
				self.showUserInfoBox = true;
				self.getUserInfo(uid,offset.left,offset.top);
			}).delegate(".dy-icon-user","mouseleave",function(){
				$("body").find('.dynamic-user-info').remove();
				self.showUserInfoBox = false;
			});
			$("#listBody").delegate('.desc a','click',function(){
				Util.sendDirectlyRequest("主页面","由右侧栏动态中进入文件夹","-");
				self.gotoBox(this);
			});
			$("#listBody").delegate('.hover a','click',function(){
				var neid = $(this).parent().parent().attr('neid');
				if($(this).hasClass('i-preview')){
					Util.sendDirectlyRequest("主页面",'右侧动态栏中"预览"按钮',"-");
					self.accessMode(neid,'preview');
				}else if($(this).hasClass('i-download')){
					Util.sendDirectlyRequest("主页面",'右侧动态栏中"下载"按钮',"-");
					self.accessMode(neid,'download');
				}
			});
			//所有动态中的 更多和收起
			$("#listBody").undelegate('.more','click').delegate('.more','click',function(){
				if($(this).find('i').hasClass('down')){
					$(this).find('.dispaly').html(_('收起'));
					$(this).siblings('.dy-content').removeClass('no-wrap');
					$(this).find('i').removeClass('down').addClass('up');
				}else{
					$(this).find('.dispaly').html(_('更多'));
					$(this).siblings('.dy-content').addClass('no-wrap');
					$(this).find('i').addClass('down').removeClass('up');
				}
			});
    	},
    	locationToFolder:function(box){
    		var neid = $(box).parent().attr('neid');
    		var data = this.getDataByNeid(neid);
    		if(data && data.isfolder){
    			this.locationTo(data);
    		}
    	},
    	gotoBox:function(box){
    		var self = this;
    		var current = $(box).parents('.item').attr('index');
    		localStorage.clear();
    		for(var k in this.currentData){
    			if(self.currentData[k].index == current){
    				var bool = (typeof this.currentData[k].target[0] != 'undefined' &&
    					parseInt(this.currentData[k].target[0].neid) > 0) ||(
    					typeof this.currentData[k].pneid != 'undefined' && 
    					parseInt(this.currentData[k].pneid)>0);
    				if(bool){ // && parseInt(this.currentData[k].neid) > 0
	    				self.getInfo(this.currentData[k],box);
    				}else{
    					self.clearNum(self.currentData[k],box);
    					self.showToast(404);
    				}
    				break;
    			}
    		}
    	},
    	filterSplitNeid:function(neid,eventType){
    		var splitType = [1001,1017001,1014001,1010];
    		for(var i in splitType){
    			if(splitType.hasOwnProperty(i) && splitType[i] == eventType){
    				this.splitNeid[neid] = true;
    			}
    		}
    	},
    	getInfo:function(data,box){
    		var useFromPNeidEventType = [1014];
    		var self = this;
    		var neid = parseInt(data.target[0].neid);
    		var path_type = data.pathType;
    		for(var i in useFromPNeidEventType){
    			if(data.eventType == useFromPNeidEventType[i]){
    				neid = data.from[0].pneid;
    				break;
    			}
    		}
    		if(parseInt(data.pneid) > 0){
    			neid = parseInt(data.pneid);
    		}
    		if(location.pathname.indexOf('/event/list') != -1){
    			path_type == 'self' && (path_type = 'share_out');
    			this.filterSplitNeid(neid,data.eventType);
    		}else{
    			path_type = Util.getPathType();
    			
    		}
    		if(neid > 0){
    			FileManager.metadata_path_info_no_wait(function(json){
    				if(json.code == 200){
    					self.locationTo(json.data);
    				}else{
    					self.clearNum(data,box);
    					self.showToast(json.code,json.message);
    				}
    			},neid,path_type);
    		}
    	},
    	clearNum:function(data,box){
    		var path_type = data.path_type=="share_out" ? 'self' : data.path_type;
    		var params = {type:'clear',etuIds:data.etuIds};
    		this.eventManager.list_no_wait(function(json){
    			if(json.code == 200){
    				$(box).siblings('.has-dynamic').remove();
    			}
    		},params);
    	},
    	showToast:function(code,message,useMessage){
    		localStorage.clear();
    		if(code == 404 && !useMessage){
    			message = _("文件夹不存在");
    		}
    		if(code == 403 && !useMessage){
    			message = _("您没有查看该文件夹的权限");
    		}
    		if(location.href.indexOf('event/list') != -1){
				Tips.show(message);
			}else{
				Tips.dyToast(message);
			}
    	},
    	locationTo:function(data){
    		if(typeof data.isfolder != 'undefined') data.isFolder = data.isfolder;
    		if(/^share_/.test(data.path_type)){
    			localStorage.setItem('from',data.from);
				localStorage.setItem('prefix_neid',data.prefix_neid);
    		}
    		if(data.path.indexOf('/') === 0){
    			data.path = data.path.substr(1);
    		}
    		if(!data.isFolder){
    			var tmp = data.path.split('/');
    			tmp.pop();
    			data.path = tmp.join('/');
    		}else{
    			if(this.splitNeid[data.neid] === true && location.pathname.indexOf('event/list') != -1){
    				var tmp = data.path.split('/');
	    			tmp.pop();
	    			data.path = tmp.join('/');
    			}
    		}
    		
    		localStorage.setItem("currentPath",data.path);
			localStorage.setItem('showTab',1);
			localStorage.setItem('path_type',data.path_type);
			//localStorage.setItem('neid',data.neid);
			
    		if(data.path_type == 'ent'){
				location.href = '/';
				return;
			}else if(data.path_type == 'share_in'){
				location.href = '/folder/shared';
				return;
			}else if(data.path_type == 'share_out'){
				location.href = '/folder/myshare';
				return;
			}else if(data.path_type == 'self'){
				location.href = '/folder/self';
				return;
			}
    	},
    	
    	getUserInfo:function(uid,x,y){
    		var self = this;
    		x -= 263;
    		y -= 35;
    		$("body").find('.dynamic-user-info').remove();
    		if(!self.userInfo.hasOwnProperty(uid)){
    			UserManager.info_get(function(data){
	    			var data = {
	    				username:data.data.user_name,
	    				email:data.data.email,
	    				phone:data.data.mobile
	    			}
	    			self.userInfo[uid] = data;
	    			if(self.showUserInfoBox){
	    				var html = Mustache.render($("#dynamic-user-info-template").html(), data);
	    				$("body").append(html).find('.dynamic-user-info').css({top:y+"px",left:x+"px"}).show();
	    			}
	    		},uid);
    		}else{
    			var data = self.userInfo[uid];
    			if(self.showUserInfoBox){
    				var html = Mustache.render($("#dynamic-user-info-template").html(), data);
	    			$("body").append(html).find('.dynamic-user-info').css({top:y+"px",left:x+"px"}).show();
    			}
    		}
    	},
    	filterData:function(data,unflip){
    		var self = this;
    		var today = Util.formatDate(new Date(),'yyyy-MM-dd');
    		var yesterday = Util.formatDate(new Date(new Date().getTime()-86400000),'yyyy-MM-dd');
    		var newData = {};
    		if(!unflip){
    			data = this.flipData(data);
    		}
    		for (var i in data) {
    			if(typeof data[i] != 'object' || isNaN(i)){
    				continue;
    			}
    			var time = Util.formatDate(new Date(data[i].ctime),"yyyy-MM-dd");
    			if(today == time){
    				time = _("今天");
    			}else if(yesterday == time){
    				time = _('昨天');
    			}
    			if(!newData.hasOwnProperty(time)){
    				newData[time] = [];
    			}
    			var path = data[i].path ? data[i].path : data[i].target[0].path;
    			data[i].time = Util.formatDate(new Date(data[i].ctime),"hh:mm");
    			
    			if(path){
    				data[i].titlePath = path.split('/').pop();
    			}else{
    				data[i].titlePath = '';
    			}
    			
    			if(!data[i].hasOwnProperty('pathType') || !data[i].pathType || !isNaN(data[i].pathType) || data[i].pathType == ''){
    				data[i].folderIconType = 'folder';
    			}else{
    				if(/^share_/.test(data[i].pathType)){
    					data[i].folderIconType = 'folder_share';
    				}else if(data[i].pathType == 'self'){
    					data[i].folderIconType = 'folder';
    				}else{
    					data[i].folderIconType = 'folder_team';
    				}
    			}

    			if(data[i].num > 99){
    				data[i].num = '99+';
    			}
    			if(data[i].num>9&&data[i].num<99){
	        		data[i].cla = 'msgMid';
	        	}else if(data[i].num == '99+'){
	        		data[i].cla = 'msgBig';
	        	}else{
	        		data[i].cla = 'msgSmall';
	        	}
    			data[i].index = self.index++;
    			this.currentData.push(data[i]);
    			newData[time].push(self.createTemplateData(data[i]));
    		}
    		data = [];
    		for(var i in newData){
    			data.push({date:i,list:newData[i]});
    		}
    		return data;
    	},
    	flipData:function(data){
    		var newData = [];
    		for(var i=data.length-1;i>=0;i--){
    			newData.push(data[i]);
    		}
    		return newData;
    	},
		createTemplateData:function(data){
    		data.iconType = 'user';
    		return TempTool.getTemplate(data);
    	},
    	getFileInfoByNeid:function(neid,dom){
    		var self = this;
    		var path = this.getPathByNeid(neid);
    		if(path && typeof this.fileData[neid] == 'undefined'){
    			this.fileData[neid] = true;
    			FileManager.metadata_no_wait(function(data){
    				if(data.code == 200){
    					self.fileData[neid] = self.adapt(data.data);
    					self.showFileAccess(neid,dom);
    				}else{
    					self.fileData[neid] = data;
    				}
	    		},path,{neid:neid});
    		}else{
    			self.showFileAccess(neid,dom);
    		}
    	},
    	
    	showFileAccess:function(neid,dom){
    		if(this.fileData.hasOwnProperty(neid) && typeof this.fileData[neid] == 'object' && !this.fileData[neid].isfolder){
    			var data = this.fileData[neid];
    			var access = {preview:false,download:false};
    			if(Util.canPreview(data.mimeType) && (data.access_mode & 1) == 1){ //有预览权限
    				access.preview = true;
    			}
    			if((data.access_mode & 4) == 4){
    				access.download = true;
    			}
    			$(dom).find('.hover').append(Mustache.render(
    				$("#dynamic-event-file-hover-template").html(),access));
    			this.call();
    		}
    	},
    	getPathByNeid:function(neid){
    		var self = this;
    		for(var i in self.currentData){
    			if(!self.currentData[i].hasOwnProperty('event_file')){
    				continue;
    			}
    			var tmp = self.currentData[i]['event_file']
    			for(var k in tmp){
    				if(!tmp.hasOwnProperty(k)) continue;
    				if(tmp[k].neid && neid == tmp[k].neid){
    					return tmp[k].path;
//  					return tmp[k].isFolder ? null : tmp[k].path;
    				}
    			}
    		}
    		return null;
    	},
    	getEventDataByNeid:function(neid){
    		var self = this;
    		for(var i in self.currentData){
    			if(!self.currentData[i].hasOwnProperty('event_file')){
    				continue;
    			}
    			var tmp = self.currentData[i]['event_file']
    			for(var k in tmp){
    				if(!tmp.hasOwnProperty(k)) continue;
    				if(tmp[k].neid && neid == tmp[k].neid){
    					return self.currentData[i];
    				}
    			}
    		}
    		return null;
    	},
    	getDataByNeid:function(neid){
    		return this.fileData.hasOwnProperty(neid) ? this.fileData[neid] : null;
    	},
    	/**
    	 * @param {Int} neid 
    	 * @param {Object} type  preview|download
    	 */
    	accessMode:function(neid,type){
    		var data = this.getDataByNeid(neid);
    		switch(type){
    			case 'preview':
    				new previewController(data,'preview',data,[data]);
    				break;
    			case 'download':
    				new fileController({currentData:data},'download',data,null);
    				break;
    		}
    	},
    	adapt:function(item){
    		var self = this;
            var file = Util.resolvePath(item.path, item.is_dir);
            var typeIcon = file.type;
            if(item.is_dir){
            	if(item.is_shared&&item.is_team){
            		typeIcon = "folder_team";
            	}else if(item.is_shared){
            		typeIcon = "folder_share";
            	}else{
            		typeIcon = "folder";
            	}                
            }
            var d = {};
            d.access_mode = item.access_mode;
            d.isfolder = item.is_dir;
            d.isdelete = item.is_deleted;
            d.isShare = item.is_shared;
            d.thumbExist = item.thumb_exist;
            d.isTeam = item.is_team;
            d.type = typeIcon;
	        d.typeIcon = Util.typeIcon(typeIcon);
            d.name = file.name;
            d.size = Util.formatBytes(item.bytes);
            d.datetime = Util.formatDate(item.modified, _('yyyy-MM-dd')+' hh:mm'),
            d.path = item.path;
            d.path_type = item.path_type;
            d.creator = item.creator;
            d.uid = item.uid;
            d.neid = item.neid;
            d.prefix_neid = item.prefix_neid;
            d.from = item.from;
            d.hash = item.hash;
            d.action = Util.resolveFileAction(item.access_mode);
            d.languageAction = AuthModel.getAuthTitle(d.action);
            d.authable = item.authable;
            d.cssAction = Util.resolveFileAction(item.access_mode).replace(/:/g, "-");
            d.hasDelivery = item.delivery_code? true: false;
            d.islocked = item.lock_uid?true:false; //文件是否锁定
            d.unlockAdmin = (item.lock_uid == Util.getUserID()) || Util.isAdmin() ;//是否有解锁的权限（只有本人和管理员有权限）
            d.deliveryTitle = d.hasDelivery?_('查看外链'):_('外链分享');
            d.deliveryCode = item.delivery_code;
            d.mimeType = item.mime_type;
            d.desc = item.desc;
            d.share_to_personal=item.share_to_personal;
            d.isshared = item.is_shared&&("/folder/self"==location.pathname);
            if (item.is_shared) {
            	if(!item.is_team)
                    d.category = _("共享文件夹");
            	else
            		d.category = _("团队文件夹");
            } else {
                d.category = _("普通文件夹");
            }
            if(!d.isfolder) {
            	d.rev = item.rev;
            	d.version = item.rev_index;
            }
            return d;
    	},
    	/**
    	 * 处理所有动态中是否显示更多按钮
    	 */
    	display:function(){
    		$('.dynamic-item .item .dy-content').each(function(){
    			$('body').append('<div id="text-data" style="float:left;">'+$(this).html()+'</div>');
    			if($('#text-data').width()+5 >= $(this).width()){
    				$(this).siblings('.more').show();
    			}
    			$('#text-data').remove();
    		});
    	}
	}
	module.exports = eventController;
});