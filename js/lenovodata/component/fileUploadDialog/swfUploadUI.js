;define('component/fileUploadDialog/swfUploadUI', function(require, exports){
	
	var $=require('jquery'),
		cookie = require('cookie'),
		Util = require('util'),
		SwfUploadBuilder=require('component/fileUploadDialog/swfUploadBuilder'),
		EventTarget = require('eventTarget'),
		FileUploadList = require('component/fileUploadDialog/fileUploadList'),
		ConfirmDialog = require('component/confirmDialog');

	require('i18n');
	var _ = $.i18n.prop;

	function SwfUploadUI(container, uploadURL){
		this.node = $.type(container) == 'string' ? $(container) : container;
		this.uploadURL = uploadURL;
		this.instance = null;
		this.succeed = 0;
	}

	$.extend(SwfUploadUI.prototype, EventTarget, {
		init: function(folder,path_type,from){
			var self = this;

			self.directory = folder;

			var box = $('<div class="upload-task-list"><div class="min-show"><div class="bar-line-5"></div>'+
		        '<div class="bar-title"><div class="min-progress"></div>'+
		            '<div class="max-title f-l"><span id="upload_txt">'+_('正在上传')+':</span><span id="total_count"></span><span id="upload_progress"></span></div>'+
		            '<div class="f-r op">'+
		                '<span id="set-min">—</span><span id="close-upload-task-list">×</span>'+
		            '</div></div></div>'+
		    '<div class="line-1"></div><div class="task-title"><div class="f-l file">'+_('文件')+'</div>'+
		        '<div class="f-l progress">'+_('进度')+'</div><div class="f-l size">'+_('大小')+'</div>'+
		        '<div class="f-l time">'+_('剩余时间')+'</div>'+
		        '<div class="f-l"><a class="btn" id="cancelAll" href="javascript:;">'+_('取消所有')+'</a></div>'+
		        '</div><div class="error-handle">'+
		        '<div class="message">文件过大</div></div>'+
		    '<div class="line-1"></div><div class="file-list"></div></div>');
			

			var swf, filelist;


			var EventManager = {
				fileDialogStart: function(){

				},
				/**
				 * 入队st.start列
				 */
				fileQueued: function(file){
					filelist.add(file);
				},
				/**
				 * 文件对话框完成
				 */
				fileDialogComplete: function(numFilesSelected, numFilesQueued){
              		if(numFilesQueued>0){
              			var status = this.getStats();
              			if(status.in_progress == 0){
              				if(self.tempDirectory !== undefined){
              					self.directory = self.tempDirectory;
              				}
              				filelist.start(numFilesQueued);
							//swf.setUploadURL(self.makeURL());
							filelist.startUpload(function(data){
								if(!data.isDelivery){
									var l_cookie = $.cookie('X-LENOVO-SESS-ID');
									var l_language = $.cookie('language');
									var uid = Util.getUserID();
									self.uploadURL=data.data.region+Util.getApiVersion()+'/files/databox/{directory}{file}?X-LENOVO-SESS-ID='+l_cookie+'&uid='+uid+'&overwrite=true&source=file&language='+l_language+'&t=';
								}else{
									var urls=self.uploadURL.split("/v2/");
									urls[0]=data.data.region+Util.getApiVersion()+"/";
									self.uploadURL=urls.join("");
								}
								swf.setUploadURL(self.makeURL());
							});
              			}
              		}
				},
				
				/**
				 * 开始上传
				 */
				uploadStart: function(file){
                    Util.sendLog('flags=startupload', "filename=" + file.name, "filesize="+file.size);
				},
				/**
				 * 上传进度
				 */
				uploadProgress: function(file, bytesLoaded, bytesTotal){
        			var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
					filelist.update(file, percent,bytesLoaded,bytesTotal);
					//self.fire('uploadProgress', file, percent, filelist.current+1, filelist.total);
				},
				/**
				 * 上传成功
				 */
				uploadSuccess: function(file, serverData,code){
//					console.log(arguments);
                    Util.sendLog('flags=successupload', "filename=" + file.name, "averageSpeed="+file.averageSpeed, "filesize="+file.size, "timeElapsed="+file.timeElapsed);
					var data = $.parseJSON(serverData);
					if(data.type && data.type == 'error'){
						filelist.fail(file, data);
					}else{
						filelist.complete(file, data);
						Util.sendBuridPointRequest();
						self.fire('uploadSuccess', file, filelist.current+1, filelist.total);
						self.succeed++;
					}
				},
				/**
				 * 上传完成
				 */
				uploadComplete: function(){
					if (this.getStats().files_queued === 0) {
						//document.getElementById(this.customSettings.cancelButtonId).disabled = true;
					} else {
//						filelist.next();
						swf.setUploadURL(self.makeURL());
						filelist.startUpload();
					}
				},
				fileQueueError: function(file, errorCode, message) {
                    Util.sendLog('flags=queueerror', "errcode="+errorCode, "filename=" + file.name, "averageSpeed="+file.averageSpeed, "filesize="+file.size, "timeElapsed="+file.timeElapsed);
					try {						
						//如果文件有名字没有大小并且错误码是ZERO_BYTE_FILE
						//->更改错误码为FILE_EXCEEDS_SIZE_LIMIT         (对应选择了过大的文件无法读取大小)
						//有名字且有大小为0的是选择的空文件，错误码正确                                  （对应选择了空文件）
						//没有名字也没有大小的，错误码是由flash返回的，不正确，要修正 （ 对应选择了过多文件造成只针对ie）
						if(file.name&&file.size==undefined&&errorCode==SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE){
                        	errorCode = SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT;
                        }
						switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							self.message(_('文件超过1G了，请使用')+ '<a href="/client/windows/bin/LenovoBox.zip">' + _('客户端</a>上传'));
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							if("File is zero bytes or cannot be accessed and cannot be uploaded."==message&&/msie/.test(navigator.userAgent.toLowerCase())){
								self.message(_("你选择的文件过多，请使用")+ '<a href="/client/windows/bin/LenovoBox.zip">' + _('客户端</a>上传'));
								break;
							}
							self.message(_('您选择了一个空文件，换个试试'));
							this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							self.message(_('不能上传')+file.name+',文件类型不允许');
							this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							self.message('亲，歇会儿，你已经传了100个了');
							break;
						default:
							if (file !== null) {
								//progress.setStatus("Unhandled Error");
								self.message(_('很抱歉，您的操作失败了，建议您重试一下！'));
							}
							this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							break;
						}
					} catch (ex) {
				        this.debug(ex);
				    }
				},
				loadReady:function(){
					filelist.setPostParams(self.directory,path_type,self.filelist.from,self.filelist.prefix_neid);					
				},
				/**
				 * 上传错误
				 */
				uploadError: function(file, errorCode, message) {
                    Util.sendLog('flags=uploaderror', "errcode="+errorCode, "filename=" + file.name, "averageSpeed="+file.averageSpeed, "filesize="+file.size, "timeElapsed="+file.timeElapsed);
					try {
						/*
						var progress = new FileProgress(file, this.customSettings.progressTarget);
						progress.setError();
						progress.toggleCancel(false);
						*/
						try{
							message = $.parseJSON(message);
						}catch(err){
							message = {errorCode: message, message: message};
						}
						switch (errorCode) {
						case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
							//progress.setStatus("Upload Error: " + message);
							//this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
							//self.message("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
							message.message = _("网络连接错误，请稍候重试！");
							if("400"==message){
								message = {message:_("路径太长，最长支持255个字符！")};
							}else if("403"==message){
								message = {message:_("没有权限，目标文件禁止该操作。")};
							}else if("405"==message){
								message = {message:_("空间不足，无法完成操作！请联系管理员。")};
							}else if("401"==message){
								message = {message:_("The token dose not exist or has already expired")};
							}
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
							//progress.setStatus("Configuration Error");
							//this.debug("Error Code: No backend file, File name: " + file.name + ", Message: " + message);
							//self.message("Error Code: No backend file, File name: " + file.name + ", Message: " + message);
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
							//progress.setStatus("Upload Failed.");
							//this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							//self.message("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.IO_ERROR:
							//progress.setStatus("Server (IO) Error");
							//this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
							//self.message("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            message.message = _("网络连接错误，请稍候重试！");
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
							//progress.setStatus("Security Error");
							//this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
							//self.message("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
              message.message = _("上传失败，请重试！") + "(#2049)";
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
							//progress.setStatus("Upload limit exceeded.");
							//this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							//self.message("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
							//progress.setStatus("File not found.");
							//this.debug("Error Code: The file was not found, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							//self.message("Error Code: The file was not found, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
							//progress.setStatus("Failed Validation.  Upload skipped.");
							//this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							//self.message("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							filelist.fail(file, message);
							break;
						case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
							//self.message(file.name +":"+ message);
							//filelist.fail(file, message);
							/*
							if (this.getStats().files_queued === 0) {
								document.getElementById(this.customSettings.cancelButtonId).disabled = true;
							}
							progress.setStatus("Cancelled");
							progress.setCancelled();
							*/
							break;
						case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
							//self.message(file.name +":"+ message);
							//progress.setStatus("Stopped");
							filelist.fail(file, _("已取消"));
							break;
						default:
							//progress.setStatus("Unhandled Error: " + error_code);
							//this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
							//self.message("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		              if (message == "Error #2049") {
									  filelist.fail(file, _("上传失败，请重试！") + "(#2049)");
		              } else if (message ==  "Error #2038") {
									  filelist.fail(file, _("网络连接错误，请稍候重试！"));
		              } else {
									  filelist.fail(file, message);
		              }
									break;
								}
							} catch (ex) {
						        this.debug(ex);
						    }
						}
			};
			swf = new SwfUploadBuilder('swfupload-holder', EventManager).build();
			self.SwfUpload=swf;
			if(!swf){return;}
			filelist = new FileUploadList(box, swf,folder,path_type);
			self.instance = swf;
			
			filelist.on('uploadSuccess', function(){
				self.fire('uploadSuccess');
			});
			filelist.on('completeOne',function(){
				self.fire('completeOne');
			});
			
	        self.filelist = filelist;
	        self.filelist.ui = self;
	        if($('.upload-task-list').length == 0){
				self.node.append(box);
				this.bindEvent(swf);				
			}
	        self.filelist.on("loadready",function(){
	        	self.fire("loadready");
	        });        
		},
		bindEvent:function(swf){
			var self = this;
			var _self = this;
			$("#set-min").unbind('click').click(function(){
		       self.slideDownFileList();
			});
			$("#close-upload-task-list").unbind('click').click(function(){
				var st = self.getState(swf);
				if(!st){
					self.filelist.taskView(false);
				}
				else if(st&&st.idle){
					self.closeAllTask();
				}
				else{
					var content = {
						title:_("提示"),
						content:_("确认取消所有未上传的任务?")
					}
					new ConfirmDialog(content,function(){
						self.closeAllTask();
					});
				}
			});
		},
		closeAllTask:function(){
			var self = this;
			self.filelist.closeAllTask();
		},
		slideDownFileList:function(){
			if($(".upload-task-list").css("bottom") == '0px'){
	           var minInt = $(".upload-task-list .min-show").height() - $(".upload-task-list").height()+1;
	           $(".min-progress").css({width:'0px'});
	           $(".upload-task-list").animate({bottom:minInt+"px"},function(){
	               $("#set-min").html("口");
	           });
			}else{
	           $(".upload-task-list").animate({bottom:"0px"},function(){
	               $("#set-min").html("—");
	              
	           });
			}
		},
		setDelivery:function(isDelivery,deliveryCode,token){
			var self = this;
			if(!self.filelist)return;
			self.filelist.isDelivery = isDelivery;
			self.filelist.token = token;
			self.filelist.deliveryCode = deliveryCode;
		},
		makeURL: function(){
			var self = this,params=[];
			var name = self.filelist.getCurrentFileName();
			var param = self.filelist.getPostParams();
			var dir = param.path.replace(/^\//, '');
			dir != '' && (dir = dir+'/');
			var data = {directory: dir, file: name};
			var tempURL = self.uploadURL.replace(/\{([^\}]+)\}/g, function(s0, s1){
				return data[s1];
//				return encodeURIComponent(data[s1]);
			});
			tempURL += new Date().getTime();
			tempURL = encodeURI(tempURL);
	      	tempURL = tempURL.replace(/#/g, '%23');
	      	for(var i in param){
	      		if(i=='from'&&param[i]==null)continue;
	      		if(i=='prefix_neid'&&param[i]==undefined)continue;
	      		if(i == 'path') continue;
	      		params.push(i+"="+param[i]);
	      	}
	      	if(tempURL.indexOf('?') !== -1){
	      		tempURL+= '&'+params.join('&');
	      	}else{
	      		tempURL+= '?'+params.join('&');
	      	}
			return tempURL;
		},

		preparePath: function(path,path_type,from,prefix_neid){
			var self = this;
			self.tempDirectory = path;
			self.directory = path;
			if(!self.filelist){return;}
			self.filelist.path = path;
			self.filelist.from = /^share/.test(path_type) ? from : '';
			self.filelist.path_type = path_type;
			self.filelist.prefix_neid = prefix_neid;
			self.filelist.setPostParams(path,path_type,self.filelist.from,prefix_neid);
		},

		message: function(msg){
			var self = this, msgh = self.node.find('.upload-task-list .error-handle');
			msgh.find('.message').empty().html(msg);
			msgh.show();
			self.filelist.taskView(true);
			setTimeout(function(){
				msgh.fadeOut(1000);
				if(self.getState(self.instance).idle){
					self.filelist.taskView(false);
				}
			},5000);
		},

		getState: function(swf){
			var self = this;
			try{
				if(swf){
					var st = swf.getStats();
				}else{
					var st = self.instance.getStats();					
				}
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
		}
	});
	

	return SwfUploadUI;
})
