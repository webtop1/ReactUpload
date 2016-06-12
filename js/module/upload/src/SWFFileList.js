;define('upload/src/SWFFileList', function(require, exports){

	var $=require('jquery'),
		Scroll = require('component/scroll'),
		EventTarget = require('eventTarget'),
		Util = require('util'),
		Tips = require('component/tips'),
		AuthUploadManager = require('lenovodata/model/AuthUploadManager');

    require('swfupload/swfupload.js');
    require('swfupload/plugins/swfupload.speed.js');
    require('i18n');
	var _ = $.i18n.prop;

	function SWFFileList(instance, path, path_type, from, prefix_neid){
		this.instance = instance;
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
		this.taskIsView = false;
		this.flushCount = 0;
		this.flushTime;
		this.UI = $("#upload_dialog_wrapper");
		this.averySelectFiles = [];
	}

	$.extend(SWFFileList.prototype, EventTarget, {

		add: function(file){
			var self = this;
			var type = file.name.split('.');
			var _html = 
				'<div class="task-file" id="task_"'+file.id+'><div class="f-l icon-file '+Util.typeIcon(type.pop())+'"></div>'+
            '<div class="f-l filename" id="filename_'+file.id+'" title='+file.name+'>'+file.name+'</div>'+
            '<div class="f-l progress" id="progress_'+file.id+'">'+_('排队中')+'</div>'+
            '<div class="f-l size" id="size_'+file.id+'"><span id="file_send_'+file.id+'"></span>'+Util.formatBytes(file.size)+'</div>'+
            '<div class="f-l time" id="time_'+file.id+'"></div>'+
            '<div class="opBox"><a class="cancelUploadBtn f-l op-btn" id="cancel_'+file.id+'" calcelId="'+file.id+'" href="javascript:;"></a></div>'+
            '<div class="max-progress" id="max_process_'+file.id+'"></div><div class="clear"></div></div>';
			ul=$('#upload_dialog_wrapper .file-list');
//			files.push({file:file,path:self.path,path_type:self.path_type,from:self.from,prefix_neid:self.prefix_neid});
			self.total++;
			//一次添加100个以上要报错，所以不渲染列表			
			ul.append(_html);				
	    	this.bindEvent();

		},
		taskView:function(isshow){
			var self = this;
			var state = self.getState();
			self.UI.show();
			if(isshow){
				if( self.UI.css("bottom") != '0px'){
					self.UI.animate({bottom:"0px"},function(){});
					$("#set-min").css({"background-position":"0 -27px"});
					self.taskIsView = true;
				}
			}else{
				if (state.idle) {
					self.taskIsView = false;
					self.UI.animate({bottom:-(self.UI.height()+2-44)+"px"});
					$("#set-min").css({"background-position":"0 0"});
				}				
			}
		},
		closeAllTask:function(){
			var self = this;
			self.total = 0;
			self.succeed = 0;
			self.current = 0;
			self.completed = 0;
			self.upload_failure = false;
			$(".cancelUploadBtn").trigger('click');
			self.UI.hide().find('.file-list').empty();
			self.taskIsView = false;
			self.UI.css('bottom', '-370px');
//			$("#upload_dialog_wrapper .file-list").empty();
//			self.taskView(false);
		},		
		start: function(queuedNum){
			var self = this, g = self.cache, files = g.files;
    		self.current = files.length-queuedNum;
//  		self.bindEvent();
    		self.updateUpload();
    		self.startTime = new Date();
    		self.loadBytes = 0;
		},
		bindEvent:function(){
			var self = this;
			$("#upload_dialog_wrapper .cancelUploadBtn").off('click').on('click',function(e){
				self.cancelUploadFile($(this).attr('calcelId'));
				return false;
			});
			$("#upload_dialog_wrapper #cancelAll").off('click').on('click',function(){
				$(".cancelUploadBtn").trigger('click');
				self.taskView(false);
				return false;
			});
		},
		setPostParams:function(path,path_type,from,prefix_neid){
			var self = this;
			self.path = path;
			self.path_type = path_type;
			self.from = from;
			self.prefix_neid = prefix_neid;
			var post_params = {path:path,path_type:path_type,aid:Util.getAccountId()};
			if(from){
				post_params.from = from;
			}
			if(/^share/.test(path_type) && parseInt(prefix_neid) > 0){
				post_params.prefix_neid = prefix_neid;
			}
			self.instance.flashReady(function(){
				self.instance.setPostParams(post_params);
			});
		},
		preparePath: function(path,path_type,from,prefix_neid){
			var self = this;
			self.tempDirectory = path;
			self.directory = path;
			self.path = path;
			self.from = /^share/.test(path_type) ? from : '';
			self.path_type = path_type;
			self.prefix_neid = prefix_neid;
			self.setPostParams(path, path_type, self.from, prefix_neid);
			
		},
		update: function(file, percent, bytesLoaded, total){
			var self = this;
			var remainTime = file.timeRemaining;remainTime = Math.round(remainTime);
			//$(".max-progress").css({width:"0px"});
			if(percent){
	      		var tw = $("#upload_dialog_wrapper .file-list").width();
				$("#max_process_"+file.id).css({width:tw*percent/100+"px"});
				if(percent < 100){
					$("#progress_"+file.id).html(percent+"%");
					$("#upload_progress").html("("+percent+"%)");
				}else{
					$("#progress_"+file.id).html(_("正在入库..."));
					$("#upload_progress").html('('+_("正在入库...")+')');
				}
				$("#file_send_"+file.id).html(Util.formatBytes(bytesLoaded)+"/");
				$("#time_"+file.id).html(remainTime + ' 秒');
			}
		},
		complete: function(file, data){
			var self = this;
			self.succeed++;
			self.current++;
//			self.startTime = new Date();
//			self.updateUpload();
			$("#cancel_"+file.id).unbind('click').removeClass('upload-error upload-cancel cancelUploadBtn').addClass('upload-success');			
			$("#size_"+file.id).html('');
			$("#time_"+file.id).html('');
			$("#progress_"+file.id).html('已完成');
			$("#max_process_"+file.id).css({width:0});
			
			var  completeTime = new Date().getTime();			
			if (completeTime - self.flushTime >1000 || !self.flushTime) {
				self.flushPage();
				self.flushTime = completeTime
			}			
			self.taskView(false);
		},
		cancelUploadFile:function (fileId, message){
			var self = this;			
			self.instance.cancelUpload(fileId);
			$("#progress_"+fileId).addClass('error').html("已取消").attr("title", "已取消");
			$("#cancel_"+fileId).removeClass('upload-success upload-error cancelUploadBtn').addClass('upload-cancel');
			$("#size_"+fileId).remove();
			$("#time_"+fileId).html('');
			$("#filename_"+fileId).addClass('error');
			$("#max_process_"+fileId).css({width:'0px'});
			self.current++;
		},
		fail: function(file, message){
			var self = this;
			var fileId = file.id;
			self.instance.cancelUpload(fileId);
			$("#progress_"+fileId).addClass('error').html(message).attr("title", message);
			$("#cancel_"+fileId).removeClass('upload-success upload-cancel cancelUploadBtn').addClass('upload-error');
			$("#size_"+fileId).remove();
			$("#time_"+fileId).html('');
			$("#filename_"+fileId).addClass('error');
			$("#max_process_"+fileId).css({width:'0px'});
		},
		updateHead:function(){
			var self = this;
			var state = self.getState();
			if(!state.idle){
				$("#upload_txt").html(_('正在上传')+":");
				$("#total_count").html((self.succeed)+"/"+self.total);
			}else{
				/*if (state.stats && state.stats.upload_cancelled) {
					$("#upload_txt").html(_('已取消'));
				}else{*/
					$("#upload_txt").html(_('已完成'));
				//}
				$("#total_count").html('');
				$("#upload_progress").html('');
			}
		},
		getState: function(){
			var self = this;
			var state = {};
			try{
				var st = self.instance.getStats();				
				if(st.files_queued == 0 && st.in_progress == 0){
					state.idle = true;
				}else{
					state.idle = false;
				}
                state.stats = st;
				return state;
			}catch(e){
				state.idle = true;
				return state;
			}
		},
		intoCategory:function(func){
			var self = this;
			if (!this.getState().idle) {
				if (window.confirm("上传正在进行中，确定离开此页面？")) {
					self.closeAllTask();
					self.UI.remove();
					func();
				}				
			}else{
				func();
			}
		},
		flushPage:function(){
			var self = this;
			self.completeTimer&&clearTimeout(self.completeTimer);
			self.completeTimer=setTimeout(function () {
				self.fire('completeOne');
			},2000);
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
		},
		netWorkError:function(){
			var self = this, g = self.cache, files= g.files, processes = g.processes;
			self.instance.stopUpload();
			while(self.instance.getStats().files_queued >0 ){
				self.instance.cancelUpload();
			}
			if(self.ui != null){
				self.ui.message(_('网络连接错误，请稍后重试'));
			}
			for(var i in files){
				var file = files[i].file;
				if(file.hasOwnProperty('state'))continue;
				$("#progress_"+file.id).addClass('error').html(_('已取消'));
				$("#time_"+file.id).remove();
				$("#size_"+file.id).remove();
				$("#cancel_"+file.id).remove();
				$("#max_process_"+file.id).css({width:"0px"});
			}
		},
	});

	return SWFFileList;
})
