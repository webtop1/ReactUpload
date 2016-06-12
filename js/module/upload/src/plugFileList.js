;
define('upload/src/plugFileList', function(require, exports) {

	var $ = require('jquery'),
		Scroll = require('component/scroll'),
		EventTarget = require('eventTarget'),
		Util = require('util'),
		Tips = require('component/tips'),
		Wait = require('component/wait'),
		FileController = require('lenovodata/fileController'),
		AuthUploadManager = require('lenovodata/model/AuthUploadManager'),
		ProgressBar = require('component/progressbar');
	require('i18n');

	var _ = $.i18n.prop;

	function plugFileList(instance, path, path_type, from, prefix_neid) {
		this.instance = instance;
		this.Plug = instance.Plug;
		this.total = 0;
		this.current = 0;
		this.completed = 0;
		this.flushInterval = new Date().getTime();
		this.path = path;
		this.from = from ? from : '';
		this.prefix_neid = prefix_neid ? prefix_neid : '';
		this.path_type = path_type;
		this.isDelivery = false;
		this.removeTaskWait = null;
		this.UI = $("#upload_dialog_wrapper");		
	}

	$.extend(plugFileList.prototype, EventTarget, {
		//添加每条数据
		add: function(task) {
			var self = this;
			var task_id = task.task_id,
				state = task.state;
			var complete_size = Util.formatBytes(task.complete_bytes),
				total_size = Util.formatBytes(task.size);
			var	fname = this.getName(task);
			var ftype = this.getType(fname);			
			var action = task.is_upload? _('上传') :_('下载');
			var _html =
				'<div class="task-file" id="list_' + task_id + '" ispause="false" isfail="false" complete="false" cancel="false"><div class="f-l icon-file ' + Util.typeIcon(ftype) + '"></div>' +
				'<div class="f-l filename" id="filename_' + task_id + '">' + fname + '</div>' +
				'<div class="f-l action" id="action_' + task_id + '">' + action + '</div>' +
				'<div class="f-l size" id="size_' + task_id + '"><span id="file_send_' + task_id + '">' + total_size + '</span></div>' +
				'<div class="f-l state" id="state_' + task_id + '"></div>' +
				'<div class="opBox">' +
				'<span class="repeatBtn f-l op-btn upload-repeat" id="reload_' + task_id + '" reUpload="' + task_id + '"  title="' + _('重试') + '"></span>' +
				'<a class="pauseUploadBtn f-l op-btn upload-pause" id="pause_' + task_id + '" pauseId="' + task_id + '" href="javascript:;" title="' + _('暂停上传') + '"></a>' +
				'<a class="continueUploadBtn f-l op-btn upload-continue" id="continue_' + task_id + '" continueId="' + task_id + '" href="javascript:;" title="' + _('恢复上传') + '"></a>' +
				'<a class="cancelUploadBtn f-l op-btn upload-cancel" id="cancel_' + task_id + '" calcelId="' + task_id + '" href="javascript:;" title="' + _('取消') + '"></a>' +
				'<a class="cancelUploadBtn f-l op-btn open-file" id="openfile_' + task_id + '" calcelId="' + task_id + '" href="javascript:;" title="' + _('打开文件') + '"></a>' +
				'<a class="cancelUploadBtn f-l op-btn open-folder" id="openfolder_' + task_id + '" calcelId="' + task_id + '" href="javascript:;" title="' + _('打开所在文件夹') + '"></a>' +
				'</div>' +
				'<div class="max-progress" id="max_process_' + task_id + '"></div><div class="clear"></div></div>';
			this.UI.find('.file-list').append(_html);
			switch (state){				
				case "StateWaitPreparing":
					$("#state_" + task_id).html(_("准备中"));
					break;
				case "StatePreparing":
					$("#state_" + task_id).html(_("准备中"));
					break;
				case "StateWaiting":
					$("#state_" + task_id).html(_("等待传输"));
					break;
				case "StateWorking":
					$("#state_" + task_id).html(_("准备中"));
					break;
				case "StatePaused":
					$("#state_" + task_id).html(_("暂停"));
					$("#pause_" + task_id).hide();
					$("#continue_" + task_id).show();
					break;
				case "StateStop":
					$("#state_" + task_id).html(_("暂停"));
					$("#pause_" + task_id).hide();
					$("#continue_" + task_id).show();
					break;
				case "StateError":
					$("#state_" + task_id).html(task.error_info).addClass("error_color");
					$("#pause_" + task_id).hide();
					$("#reload_" + task_id).show();
					break;
				case "StateCompleted":
					$("#state_" + task_id).html("<span class='complete_pic'></span>");
					var total_size = Util.formatBytes(task.size);
					$("#size_" + task_id).html(total_size);
					$("#pause_" + task_id).hide();
					$("#cancel_" + task_id).hide();
					$("#openfile_" + task_id).show();
					$("#openfolder_" + task_id).show();
					self.completed ++;
					break;
			}
			this.total++;
			this.UI.find("#upload_progress").html(this.completed+'/'+this.total);
			this.events(task);
		},
		events: function(task) {
			var self = this;
			var task_id = task.task_id;
			//取消单个任务
			$("#cancel_" + task_id).unbind('click').click(function(e) {
				self.removeTaskWait = new Wait();
				self.cancelTask(task_id);
				return false;
			});
			//暂停单个任务
			$("#pause_" + task_id).unbind('click').click(function(e) {
				self.pauseTask(task_id);
				return false;
			});
			//继续单个任务
			$("#continue_" + task_id).unbind('click').click(function(e) {
				self.continueTask(task_id);
				return false;
			});
			//暂停全部任务
			$("#pauseAll").unbind('click').click(function() {
				self.pauseAllTask();
				return false;
			});
			//继续全部任务
			$("#continueAll").unbind('click').click(function() {
				self.continueAllTask();
				return false;
			});
			//重新开始任务
			$("#reload_" + task_id).unbind('click').click(function(){
				self.reloadTask(task_id);
				return false;
			});
			//任务完成时点击打开文件
			$("#openfile_" + task_id).unbind('click').click(function(){
				self.openFile(task);
			});
			//任务完成时点击打开文件夹
			$("#openfolder_"+ task_id).unbind('click').click(function(){
				self.openFolder(task);
			});
		},
		//取消单个文件
		cancelTask: function(task_id) {
			var self = this;
			this.Plug.RemoveTask(task_id);			
		},
		//暂停单个文件
		pauseTask: function(task_id) {
			var self = this;
			this.Plug.PauseTask(task_id);
		},
		//继续上传
		continueTask: function(task_id) {
			var self = this;
			this.Plug.StartTask(task_id);
		},
		//暂停所有任务
		pauseAllTask: function() {
			var self = this;
			this.Plug.PauseAllTask();
			$("#pauseAll").hide();
			$("#continueAll").show();
		},
		//继续所有任务
		continueAllTask: function() {
			var self = this;
			this.Plug.StartAllTask();
			$("#pauseAll").show();
			$("#continueAll").hide();
		},
		//重传单个任务
		reloadTask: function(task_id){
			var self = this;
			this.Plug.StartTask(task_id);
		},
		//打开文件
		openFile: function(task){
			var self = this;
			if (task.is_folder) {
				if (task.is_upload) {
					window.fileManager.browse('/'+task.box_file.path, window.fileManager.cssAction);
				}else{
					var local_path = task.local_file.path;
					this.Plug.ShellExecute(local_path);
				}
			} else{
				var local_path = task.local_file.path;
					this.Plug.ShellExecute(local_path);
			}
			
		},
		//打开所在文件夹
		openFolder: function(task){
			var self = this;
			if (task.is_upload) {
				var path = this.getFilePath(task);
				if (task.box_file.pathtype == this.path_type) {
					window.fileManager.browse('/'+ path, window.fileManager.cssAction);
				} else{
					if (task.box_file.pathtype == "ent" ) {
						window.location.href = "/";
						window.fileManager.browse('/'+ path, window.fileManager.cssAction);
					} else{
						window.location.href = "/folder/" + task.box_file.pathtype;
						window.fileManager.browse('/'+ path, window.fileManager.cssAction);
					}					
				}
								
			} else{
				var local_path = task.local_file.path;
				var index = local_path.lastIndexOf("\\");
				var local_path_dir = local_path.substring(0, index+1);
				this.Plug.ShellExecute(local_path_dir);
			}			
		},
		// 更新进度数据和进度条
		update: function(taskInfo) {
			var self = this;			
			var task_id = taskInfo.task_id,
				size = taskInfo.size,
				complete = taskInfo.complete_bytes,
				speed = taskInfo.speed,
				state = taskInfo.state;
			//初始化渲染
			if (!$("#list_" + task_id)[0] && state != "StateNone") {
				self.add(taskInfo);	
				if (this.instance.renderWait) {
					this.instance.renderWait.close();
				}
				return;
			}
			if (state == "StateNone") {				
				$("#list_" + task_id).remove();
				this.total --;
				this.UI.find("#upload_progress").html("(" + this.completed + '/' + this.total + ")");
				if (this.removeTaskWait) {
					this.removeTaskWait.close();
				}
				var counts = this.Plug.GetTaskAllCount();
				if (counts == 0) {
					//如果没有任务了，关闭传输框
					self.UI.animate({bottom:"-370px"}, function(){
						self.UI.find("#upload_progress").html("");
					});
				}
				return;
			}						
			var percent = complete/size;
			var tw = this.UI.find(".file-list").width();
			var complete_size = Util.formatBytes(complete),
				total_size = Util.formatBytes(size);
			$("#state_" + task_id).removeAttr("title");
			if (state == "StatePreparing" ||state == "StateWaitPreparing") {
				$("#size_" + task_id).html(total_size);
				$("#state_" + task_id).html(_("准备中"));
			}
			if (state == "StateWaiting") {
				$("#size_" + task_id).html(total_size);
				$("#state_" + task_id).html(_("等待传输"));
			}
			if (state == "StateWorking") {				
				$("#max_process_" + task_id).animate({width: tw * percent + "px"});
				$("#size_" + task_id).html(complete_size + "/" + total_size);
				$("#state_" + task_id).html(Util.formatBytes(speed) + "/s");
				$("#pause_" + task_id).show();
				$("#continue_" + task_id).hide();
				$("#reload_" + task_id).hide();
			}
			if (state == "StatePaused" ||state == "StateStop") {
				$("#size_" + task_id).html(total_size);
				$("#size_" + task_id).html(total_size);
				$("#state_" + task_id).html(_("暂停"));
				$("#pause_" + task_id).hide();
				$("#continue_" + task_id).show();				
			}
			if (state == "StateCompleted"){
				this.completed++;
				this.current++;
				$("#max_process_" + task_id).animate({width: tw + "px"},function(){
					$(this).css({width: "0px"});
	//				self.UI.find("list_"+task_id).find(".opBox>.op-btn").hide();
					$("#reload_" + task_id).hide();
					$("#cancel_"+task_id).hide();
					$("#pause_"+task_id).hide();
					
					$("#size_" + task_id).html(total_size);
					$("#state_" + task_id).html("<span class='complete_pic'></span>").attr("title", _("已完成"));
					$("#openfile_"+task_id).show();
					$("#openfolder_"+task_id).show();
					$("#filename_" + task_id).on("click", function(){
						$("#openfile_" + task_id).trigger("click");
					});
				});
				if (taskInfo.is_upload) {
					//如果很多小文件上传，那么在2.5秒内不刷新文件列表
					var flushInterval = new Date().getTime();
					if (flushInterval - self.flushInterval > 2500) {
						self.fire('completeOne');
						self.flushInterval = flushInterval;
					}						
				}
				if (self.completed == self.total) {
					Tips.show(self.current + _("个文件已传输"));	
					$("#upload_txt").html(_("传输完毕"));						
					self.current = 0;
					window.fileDialog.slideDownFileList();
				}
//				if (window.console) {
//					console.log(state);
//				}
			}
			$("#state_" + task_id).removeClass("error_color");
			if (state == "StateError") {
				$("#max_process_" + task_id).css({width:"0px"})
				$("#pause_"+task_id).hide();
				$("#cancel_"+task_id).show();
				$("#reload_"+task_id).show();
				$("#size_" + task_id).html(total_size);				
				if (taskInfo.error_code == 20008) {
					var error_tip = _("网盘空间不足");					
				}else if(taskInfo.error_code<13000&&taskInfo.error_code>11999){
					var error_tip = _("网络连接错误");
				}else {
					var error_tip = _("传输错误");
				}
				$("#state_" + task_id).html(error_tip).attr("title", error_tip).addClass("error_color");
				this.UI.find(".file-list").prepend($("#list_" + task_id));				
			}
			
			//更新头部数据
			this.UI.find("#upload_progress").html("(" + this.completed + '/' + this.total + ")");
//			if (window.console) {
//					console.log(taskInfo.state);
//			}
		},
		//获取文件所在路径
		getFilePath: function(task) {
			var path = task.box_file.path;
			var index = path.lastIndexOf("/");
			return path.substring(0, index);
		},
		//获取文件名称
		getName: function(task) {
			var path = task.local_file.path;
			var index = path.lastIndexOf("\\");
			return path.substring(index+1, path.length);
		},
		//获取文件类型
		getType: function(fname) {
			var index = fname.lastIndexOf(".");
			if (index>0) {
				var type = fname.substring(index+1, fname.length);
			}else {
				var type = "folder";
			}
			return type;
		}
	});

	return plugFileList;
})