;define('upload/src/SWF', function(require, exports){

	var $=require('jquery'),
		_ = $.i18n.prop,
		Util = require('util'),
		Tips = require('component/tips'),
		flashCheckDialog = require('component/flashCheckDialog');
	require('cookie');
	require('i18n');
	require('swfupload/swfupload.js');
	require('swfupload/plugins/swfupload.queue.js');
	require('swfupload/plugins/swfupload.speed.js');
	var thisref;

	function SWF(node, index){
		var DEFAULT = {
			single: false,
			image: false,
			buttonText: false
		};
		var language = $.cookie('language');
		var imageUrl = 'img/upload-zh.png';
		this.setting = {
			// Backend Settings
			upload_url: 'aaaaaa',
			// File Upload Settings
			file_size_limit : "1048576",	// 默认KB单位，1G
			file_types_description : "All Files",
			file_upload_limit : "0",
			file_queue_limit : "100",
			buttonImageURL:imageUrl,
            moving_average_history_size: 40,

			// 在文件选取窗口将要弹出时触发
			file_dialog_start_handler : function(){},
			//当一个文件被添加到上传队列时会触发此事件，提供的唯一参数为包含该文件信息的file object对象
			file_queued_handler : function(file) {
				index.show();
			},
			//当文件添加到上传队列失败时触发此事件，失败的原因可能是文件大小超过了你允许的数值、文件是空的或者文件队列已经满员了等。该事件提供了三个参数。第一个参数是当前出现问题的文件对象，第二个参数是具体的错误代码，可以参照SWFUpload.QUEUE_ERROR中定义的常量
			file_queue_error_handler : function(file, errorCode, message) {
											if (!index.fileList.taskIsView) {
												index.fileList.taskView(true);
											}else{
												index.fileList.taskIsView = true;
											}
											try {
												//如果文件有名字没有大小并且错误码是ZERO_BYTE_FILE
												//->更改错误码为FILE_EXCEEDS_SIZE_LIMIT         (对应选择了过大的文件无法读取大小)
												//有名字且有大小为0的是选择的空文件，错误码正确                                  （对应选择了空文件）
												//没有名字也没有大小的，错误码是由flash返回的，不正确，要修正 （ 对应选择了过多文件造成只针对ie）
												if (file && file.name && file.size == undefined && errorCode == SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE) {
													errorCode = SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT;
												}
												switch (errorCode) {
													case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:  //-110
//														if (navigator.appName == 'Microsoft Internet Explorer') {
//															index.message(_('文件超过1G了，请下载') + '<a href="/resource/ieUploader_v1.0.0.26.exe">' + _('上传插件</a>') + _('或使用') + '<a href="/client/windows/bin/LenovoBox.zip">' + _('客户端</a>上传'));
//														} else {
//															index.message(_('文件超过1G了，请使用') + '<a href="/client/windows/bin/LenovoBox.zip">' + _('客户端</a>上传'));
//														}
														index.uploadUI.find(".error-handle").show();
														index.uploadUI.find(".error-handle .message").html('文件大于1G，请使用联想云盘客户端');
														setTimeout(function(){
															index.uploadUI.find(".error-handle").hide();
															index.fileList.taskView(false);
														},2000);
														break;
													case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:	//-120
														index.uploadUI.find(".error-handle").show();
														index.uploadUI.find(".error-handle .message").html('不能上传空文件');
														setTimeout(function(){
															index.uploadUI.find(".error-handle").hide();
															index.fileList.taskView(false);
														},2000);
														break;
//													case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:	//-130
//														index.message(_('不能上传') + file.name + ',文件类型不允许');
//														this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
//														break;
													case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:	//-100
														index.uploadUI.find(".error-handle").show();
														index.uploadUI.find(".error-handle .message").html('您一次最多只能添加100个文件');
														setTimeout(function(){
															index.uploadUI.find(".error-handle").hide();
															index.fileList.taskView(false);
														},2000);
														break;
													default:
														index.uploadUI.find(".error-handle").show();
														index.uploadUI.find(".error-handle .message").html(message);
														setTimeout(function(){
															index.uploadUI.find(".error-handle").hide();
															index.fileList.taskView(false);
														},2000);
														break;
												}
											} catch (ex) {
												this.debug(ex);
											}
										},
			//当文件选取完毕且选取的文件经过处理后（指添加到上传队列），会立即触发该事件。可以在该事件中调用this.startUpload()方法来实现文件的自动上传参数number of files selected指本次在文件选取框里选取的文件数量参数number of files queued指本次被添加到上传队列的文件数量参数total number of files in the queued指当前上传队列里共有多少个文件（包括了本次添加进去的文件）
			file_dialog_complete_handler : function(numFilesSelected, numFilesQueued) {
				var self = this;
				index.getUploadUrl(function (url) {
					thisref.uploadURL=url;
					self.startUpload();
				});
			},
			//当文件即将上传时会触发该事件,该事件给了你在文件上传前的最后一次机会来验证文件信息、增加要随之上传的附加信息或做其他工作。可以通过返回false来取消本次文件的上传，参数file为当前要上传的文件的信息对象
			upload_start_handler : function(file) {
				var self = this;
				var url=thisref.makeURL(file);
				index.checkUploadAuth(function(){
					self.setUploadURL(url);
				});
			},
			//该事件会在文件的上传过程中反复触发，可以利用该事件来实现上传进度条参数file object为文件信息对象参数bytes complete为当前已上传的字节数参数total bytes为文件总的字节数
			upload_progress_handler : function(file, bytesLoaded, bytesTotal) {
				var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
				var params={
					id:file.id,
					percent:percent/100,
					loaded:bytesLoaded,
					bytes:bytesTotal,
					size:Util.formatBytes(bytesTotal),
					name:file.name,
					path:'',
					file:file,
					isUpload:false,
					startUploadTime:new Date(),
					timeRemaining:'-',
					status: '-'
				};
				index.updateFilelist(params);
			},
			//文件上传被中断或是文件没有成功上传时会触发该事件。停止、取消文件上传或是在uploadStart事件中返回false都会引发这个事件，但是如果某个文件被取消了但仍然还在队列中则不会触发该事件参数file object为文件信息对象参数error code为错误代码，具体的可参照SWFUpload.UPLOAD_ERROR中定义的常量
			upload_error_handler : function(file, errorCode, message) {
										try {
											/*
											var progress = new FileProgress(file, this.customSettings.progressTarget);
											progress.setError();
											progress.toggleCancel(false);
											*/
											try {
												message = $.parseJSON(message);
											} catch (err) {
												message = {
													errorCode: message,
													message: message
												};
											}
											switch (errorCode) {
												case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
													message.message = _("网络连接错误，请稍候重试！");
													if ("400" == message) {
														message = {
															message: _("文件名或路径太长，不能超过255个字符！")
														};
													}
													if ("403" == message) {
														message = {
															message: _("没有权限，目标文件禁止该操作。")
														};
													}
													if ("405" == message) {
														message = {
															message: _("空间不足，无法完成操作！请联系管理员。")
														};
													}
													if ("401" == message) {
														message = {
															message: _("The token dose not exist or has already expired")
														};
													}
													if ("500" == message){
														message = {
															message: _("很抱歉，您的操作失败了。")
														};
													}
													index.fileList.fail(file, message.message);
													break;
												case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
													index.fileList.fail(file, message);
													break;
												case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
													index.fileList.fail(file, message);
													break;
												case SWFUpload.UPLOAD_ERROR.IO_ERROR:
													index.fileList.fail(file, "上传失败!");
													break;
												case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
													message.message = _("上传失败，请重试！") + "(#2049)";
													index.fileList.fail(file, message);
													break;
												case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
													index.fileList.fail(file, message);
													break;
												case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
													index.fileList.fail(file, message);
													break;
												case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
													index.fileList.fail(file, message);
													break;
												case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
													index.fileList.cancelUploadFile(file, _("已取消"));
													break;
												case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
													index.fileList.fail(file, _("已取消"));
													break;
												default:
													index.fileList.fail(file.id, "上传失败，请重试！");
													break;
											}
										} catch (ex) {
											this.debug(ex);
										}
									},
			//当一个文件上传成功后会触发该事件参数file为文件信息对象参数serverData为服务器端输出的数据
			upload_success_handler : function(file, serverData, code) {
				var data = $.parseJSON(serverData);
				if (data.type && data.type == 'error') {
					var message = data.message;
					index.fileList.fail(file, message);
				} else {
					var params={
						id:file.id,
						percent:file.percentUploaded/100,
						loaded:file.size,
						bytes:file.size,
						size:Util.formatBytes(file.size),
						name:file.name,
						path:'',
						file:file,
						isUpload:true,
						startUploadTime:new Date(),
						timeRemaining:file.timeRemaining,
						status: '-'
					};
					index.updateFilelist(params);
				}
			},
			//当一次文件上传的流程完成时（不管是成功的还是不成功的）会触发该事件，该事件表明本次上传已经完成，上传队列里的下一个文件可以开始上传了。该事件发生后队列中下一个文件的上传将会开始
			upload_complete_handler : function(file) {
				index.updateFilelist({});
			},
			swfupload_loaded_handler : function(){},

			// Button Settings
			button_placeholder_id : node,
			button_width: '86',
			button_height: '32',
			button_text: '<span class="upload-word"></span>',
			button_text_style: '.upload-word{font-size: 14px; color:#ffffff;font-family: "微软雅黑";vertical-align: middle;}',
			button_text_left_padding: 40,
			button_text_top_padding: 3,
			button_window_mode : 'transparent',
			button_disabled :false,
			button_cursor : SWFUpload.CURSOR.HAND,

			// Flash Settings
			flash_url : "swfupload.swf?rev=20141124",
			prevent_swf_caching : false,

			// Debug Settings
			debug: false
//			http_success:[403,405]
		};
		for (var o in index) {
			this[o] = index[o];
		}
		thisref=this;
	}

	$.extend(SWF.prototype, {
		setProperty: function(key, value){
			this.setting[key] = value;
		},
		build: function(){
			$.each(SWFUpload.instances,function(i,is){
				is.destroy();
			});
			if(flashCheckDialog.checkFlash()){
				thisref.SWFUploadObj = new SWFUpload(this.setting);
				return thisref.SWFUploadObj;
			}
			return null;
		},
		makeURL: function(file) {
			if(!file){return;}
			var	params = [];
			var name = file.name;
			var path = thisref.getCurrentPath();
			path != '' && (path = path + '/');
			var data = {
				directory: path,
				file: name
			};
			var l_cookie = $.cookie('X-LENOVO-SESS-ID');
			var l_language = $.cookie('language');
			var uid = Util.getUserID();
			var prefix="";
			/*if(fileManager.fa.data){
				prefix ="prefix_neid="+fileManager.fa.data.prefix_neid+"&";
				prefix +="from="+fileManager.fa.data.from +"&";
			}*/
			var url=thisref.uploadURL+'/v2/files/databox/{directory}{file}?X-LENOVO-SESS-ID='+l_cookie+'&uid='+uid+'&overwrite=true&source=file&language='+l_language+'&t=&path_type='+thisref.getPathType()+'&'+prefix;
			var tempURL = url.replace(/\{([^\}]+)\}/g, function(s0, s1) {
				return data[s1];
			});
			tempURL = encodeURI(tempURL);
			tempURL = tempURL.replace(/#/g, '%23');
			return tempURL;
		}
	});

	return SWF;
});
