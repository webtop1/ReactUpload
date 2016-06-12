;define('component/fileUploadDialog/fileUploadList', function(require, exports){

	var $=require('jquery'),
		Scroll = require('component/scroll'),
		EventTarget = require('eventTarget'),
		Util = require('util'),
		Tips = require('component/tips'),
		FileController = require('lenovodata/fileController'),
		Util = require('util'),
		AuthUploadManager = require('lenovodata/model/AuthUploadManager'),
		ProgressBar = require('component/progressbar');

    require('swfupload/swfupload.js');
    require('swfupload/plugins/swfupload.speed.js');
    require('i18n');
	var _ = $.i18n.prop;

	function FielUploadList(node, instance,path,path_type,from,prefix_neid){
		this.cache = {};
		this.cache.files = [];
		this.cache.filesIndex = {};
		this.cache.processes = [];
		this.cache.instance = instance;
		this.total = 0;
		this.current = 0;
		this.completed = 0;
		this.succeed = 0;
		this.path = path;
		this.from = from ? from:'';
		this.prefix_neid = prefix_neid ? prefix_neid : '';
		this.path_type = path_type;
		this.isDelivery = false;
		this.deliveryCode = '';
		this.token = '';
		this.flushCount = 0;
		this.flushTime = new Date().getTime();
		this.ui = null;
		var node = this.node = $.type(node) == 'string' ? $(node) : node;
	}

	$.extend(FielUploadList.prototype, EventTarget, {

		add: function(file){
			var self = this, g = self.cache, files= g.files, processes = g.processes, node = self.node;
			var type = file.name.split('.');
			var _html = 
				'<div class="task-file"><div class="f-l icon-file '+Util.typeIcon(type.pop())+'"></div>'+
            '<div class="f-l filename" id="filename_'+file.id+'">'+file.name+'</div>'+
            '<div class="f-l progress" id="progress_'+file.id+'">'+_('排队中')+'</div>'+
            '<div class="f-l size" id="size_'+file.id+'"><span id="file_send_'+file.id+'"></span>'+Util.formatBytes(file.size)+'</div>'+
            '<div class="f-l time" id="time_'+file.id+'"></div>'+
            '<div class="op"><a class="cancelUploadBtn f-l op-btn upload-cancel" id="cancel_'+file.id+'" calcelId="'+file.id+'" href="javascript:;"></a></div>'+
            '<div class="max-progress" id="max_process_'+file.id+'"></div><div class="clear"></div></div>';
			ul=$('.upload-task-list .file-list');
			
			var index = files.length;

			files.push({file:file,path:self.path,path_type:self.path_type,from:self.from,prefix_neid:self.prefix_neid});
			if(!self.taskIsView){
				self.taskIsView = true;
				self.taskView(true);
			}
			
			g.filesIndex[file.id] = index;

			self.total++;
			ul.append(_html);
			self.bindEvent();
		},
		updateMinProgress:function(percent){
			if($(".upload-task-list").css("bottom") != '0px'){
				var maxWidth = $(".upload-task-list").width();
				$(".min-progress").css({width:percent*maxWidth/100+'px'});
			}else{
				$(".min-progress").css({width:'0px'});
			}
		},
		taskView:function(isshow){
			var self = this;
			if(isshow){
				if( $(".upload-task-list").css("bottom") != '0px'){
					$(".upload-task-list").animate({bottom:"0px"},function(){
		               $("#set-min").html("—");
		         	});
				}
			}else{
				self.taskIsView = false;
				$(".upload-task-list").animate({bottom:-($(".upload-task-list").height()+2)+"px"});
			}
		},
		closeAllTask:function(){
			var self = this;
			self.cache.instance.stopUpload();
			while(self.cache.instance.getStats().files_queued >0 ){
				self.cache.instance.cancelUpload();
			}
			self.total = 0;
			self.succeed = 0;
			self.cache.files = [];
			self.cache.filesIndex = {};
			self.cache.processes = [];
			self.current = 0;
			self.completed = 0;
			$(".upload-task-list .file-list").empty();
			self.taskView(false);
		},
		netWorkError:function(){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			self.cache.instance.stopUpload();
			while(self.cache.instance.getStats().files_queued >0 ){
				self.cache.instance.cancelUpload();
			}
			if(self.ui != null){
				self.ui.message(_('网络连接错误，请稍后重试'));
			}
			for(var i in files){
				var file = files[i].file;
				$("#progress_"+file.id).addClass('error').html(_('已取消'));
				$("#time_"+file.id).remove();
				$("#size_"+file.id).remove();
				$("#cancel_"+file.id).remove();
				$("#max_process_"+file.id).css({width:"0px"});
			}
		},
		
		start: function(queuedNum){
			var self = this, g = self.cache, files = g.files;
    		self.current = files.length-queuedNum;
    		self.bindEvent();
    		self.updateUplode();
    		self.startTime = new Date();
    		self.loadBytes = 0;
		},
		bindEvent:function(){
			var self = this;
			$(".upload-task-list .cancelUploadBtn").unbind('click').click(function(e){
				self.cancelUploadFile($(this).attr('calcelId'));
				e.stopPropagation();
				e.preventDefault();
				return false;
			});
			$(".upload-task-list #cancelAll").unbind('click').click(function(){
				self.closeAllTask();
			});
		},
//		uploadAgain:function(fileId){
//			self = this;
//			if(fileId){
//				self.succeed--;			
//				$("#cancel_"+fileId).html(_('×')).addClass('btn').attr('isCancel',0);
//				self.startUpload();
//			}
//		},
		cancelUploadFile:function (fileId){
			var self = this;
			if(fileId){
				self.cache.instance.cancelUpload(fileId);
				$("#progress_"+fileId).html(_('已取消'));
				$("#cancel_"+fileId).removeClass('upload-success upload-cancel').addClass('upload-error');
				$("#size_"+fileId).html('');
				$("#time_"+fileId).html('');
				$("#filename_"+fileId).addClass('error');
				$("#max_process_"+fileId).css({width:'0px'});
				self.succeed++;
				self.current++;
				self.updateUplode();
			}else{
				self.closeAllTask();
			}
			self.startUpload();
		},
		startUpload:function(callbak){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			var _file = files[self.current];
			if(self.current >= files.length) return;
			var file = _file.file;
			var path = _file.path;
			var path_type = _file.path_type;
			var from = _file.from;
			var prefix_neid = _file.prefix_neid;
			
			if(file){
				self.checkNetWork(function(){
					if(!self.isDelivery){
						AuthUploadManager.authUpload(function(data){
							callbak(data);
							self.uploadCall(data,file);
						},path, path_type, from,file.size,prefix_neid);
					}else{
						AuthUploadManager.authDeliveryUpload(function(data){
							var params=data;
							params.isDelivery=true;
							callbak(params);
							self.uploadCall(data,file);
						},self.deliveryCode,path,file.size,self.token);
					}
				});
			}
		},
		uploadCall:function(data,file){
			var self = this;
			if(data.code == 200 
				&& typeof data.data.result != 'undefined' 
				&& data.data.result=='success'){
					self.cache.instance.startUpload(file.id);
			}else{
				self.fail(file,data);
				self.startUpload();
			}
		},
		setPostParams:function(path,path_type,from,prefix_neid){
			var self = this;
			self.path = path;
			self.path_type = path_type;
			self.from = from;
			self.prefix_neid = prefix_neid;
			var post_params = {path:path,path_type:path_type,uid:Util.getUserID()};
			if(from){
				post_params.from = from;
			}
			if(/^share/.test(path_type) && parseInt(prefix_neid) > 0){
				post_params.prefix_neid = prefix_neid;
			}
            /*
			self.cache.instance.flashReady(function(){
				self.cache.instance.setPostParams(post_params);
			});*/
			$(".uploadButton").css("left",Util.getElementXPos(document.getElementById("upload_button"))).show();
		},
		getPostParams:function(){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			var _file = files[self.current];
			return {path:_file.path,path_type:_file.path_type,from:_file.from,prefix_neid:_file.prefix_neid};
		},
		update: function(file, percent,bytesLoaded,total){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			var useTime = new Date().getTime() - self.startTime.getTime();
			$(".max-progress").css({width:"0px"});
			self.updateMinProgress(percent);
			if(useTime > 1000 || self.loadBytes == 0){
				$("#time_"+file.id).html(self.makeTime(bytesLoaded, total,useTime));
				self.loadBytes = bytesLoaded;
				self.startTime = new Date();
			}
			if(percent){
	      		var tw = $(".upload-task-list .file-list").width();
				$("#max_process_"+file.id).css({width:tw*percent/100+"px"});
				if(percent < 100){
					$("#progress_"+file.id).html(percent+"%");
					$("#upload_progress").html("("+percent+"%)");
					$("#file_send_"+file.id).html(Util.formatBytes(bytesLoaded)+"/");
				}else{
					$("#progress_"+file.id).html(_("正在入库..."));
					$("#upload_progress").html('('+_("正在入库...")+')');
					$("#file_send_"+file.id).html("");
				}
			}
		},
		makeTime:function(loadBytes,total,useTime){
			var self = this;
			var time = Util.formatTime((total - loadBytes)/((loadBytes - self.loadBytes)*1000/useTime));
			if(parseInt(time) > 0){
				return time;
			}
			return Util.formatTime(0);
		},
		complete: function(file, data){
			$("#size_"+file.id).html('');
			$("#time_"+file.id).html('');
			var self = this, g = self.cache, filesIndex= g.filesIndex, processes = g.processes;
			self.succeed++;
			self.current++;
			self.startTime = new Date();
			self.updateUplode();
			$("#cancel_"+file.id).unbind('click').removeClass('upload-error upload-cancel').addClass('upload-success');
			if(data.has_more_version){
					$("#progress_"+file.id).html(_('已完成，覆盖同名文件'));
			}else{
				$("#progress_"+file.id).html(_('已完成'));
			}
			$(".upload-task-list .file-list .max-progress").css({width:'0px'});
			Tips.show(file.name+_("已上传成功"));
			self.startTime = new Date();
			self.flushPage();
			self.flushCount++;
    		self.loadBytes = 0;
		},

		next: function(){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			var process = processes[self.current];
			self.completed++;
			self.current++;
		},

		getCurrentFileName: function(){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			var file = files[self.current];
			return file.file.name;
		},

		fail: function(file, data){
			var self = this, g = self.cache, filesIndex= g.filesIndex, processes = g.processes;
			self.succeed++;
			self.current++;
			self.updateUplode();
			self.cache.instance.cancelUpload(file.id);
			setTimeout(function(){
				$("#progress_"+file.id).addClass('error').html(data.message);
				$("#time_"+file.id).remove();
				$("#size_"+file.id).remove();
				$("#max_process_"+file.id).css({width:"0px"});
				$("#cancel_"+file.id).unbind('click').removeClass('upload-error upload-cancel upload-success').remove();
			}, 300);
		},
		updateUplode:function(){
			var self = this;
			$(".upload-task-list .file-list").scrollTop($(".upload-task-list .file-list .task-file").height()*(self.succeed-1));
			if(!self.getState().idle){
				$("#upload_txt").html(_('正在上传')+":");
				$("#total_count").html((self.succeed)+"/"+self.total);
			}else{
				if(self.succeed==self.total){
					$("#upload_txt").html(_('已完成'));
				}
				$("#total_count").html('');
				$("#upload_progress").html('');
				var minInt = $(".upload-task-list .min-show").height() - $(".upload-task-list").height()+1;
				$(".upload-task-list").animate({bottom:minInt+"px"},function(){
					self.taskIsView = false;
		        	$("#set-min").html("口");
		        });
			}
		},
		getState: function(){
			var self = this;
			try{
				var st = self.cache.instance.getStats();
				var state = {};
				if(st.files_queued == 0 && st.in_progress == 0){
					state.idle = true;
				}else{
					state.idle = false;
				}
                state.stats = st;
				return state;
			}catch(e){
				//flash not ready
			}
		},
		flushPage:function(){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			if(self.current >= files.length - 1){
				self.fire('completeOne');
			}else{
				if(new Date().getTime() - self.flushTime > 5000 && self.flushCount >= 5){
					self.flushTime = new Date().getTime();
					self.flushCount = 0;
					self.fire('completeOne');
				}
			}
		},
		checkNetWork:function(call){
			var self = this;
			Util.ajax_json_get('/st.php?_='+new Date().getTime(),function(xhr){
				if(xhr.status == 200){
					call();
				}else{
					self.netWorkError();
				}
			});
		}
	});

	return FielUploadList;
})
