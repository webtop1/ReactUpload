/*
 * 这个插件配合极速上传下载控件，仅支持IE浏览器
 * 
 * */
/*
	获取任务列表 GetTaskList
	获取所有任务列表数 GetTaskAllCount
	获取正在上传的任务数 GetTaskActiveCount
	暂停所有任务 StopAllTask
	开始所有任务 StartAllTask
	 取消所有任务RemoveAllTask
*/

define('upload/src/plugAIO', function(require, exports, module) {
	var $ = require('jquery'),
		EventTarget = require('eventTarget'),
		AuthUploadManager = require('lenovodata/model/AuthUploadManager'),
		plugFileList = require('Upload/src/plugFileList'),
		Wait = require('component/wait'),
		i18n = require('i18n'),
		_ = $.i18n.prop;

	function PlugAIO(objectId, param) {
		this.numNull =0;
		this.Plug = document.getElementById(objectId);
		this.param = param;
		this.uploadBtn = $('#upload_button');
		this.renderWait = null;
		this.plugFileList = null;
		this.init();
		this.events();
		this.listenEvent();
	}

	$.extend(PlugAIO.prototype, EventTarget, {
		init: function() {
			var self = this;
			this.plugFileList = new plugFileList(this, this.param.path, this.param.path_type);
			this.plugFileList.on('completeOne',function(){
				self.fire('completeOne');
			});
			var version = this.getVersion(); version = version.replace(/\./g, '');
			this.getTaskList(function(task_id){
				var taskinfo = self.Plug.GetTaskInfo(task_id);
				var taskInfo = JSON.parse(taskinfo);
				self.appearUI();
				self.plugFileList.add(taskInfo);
			});
			if (window.fileManager&&Util.getPrivatePrivilege(fileManager.cssAction).canUpload) {
				this.uploadBtn.css({"background-position": "-258px 0"});
			} else {
				this.uploadBtn.css({"background-position": "-430px 0"});
			}			
		},
		//检查版本号
		getVersion: function() {
			return this.Plug.plugin_version;
		},
		//获取任务列表(初始化时获取未上传完成的任务)
		getTaskList:function(fuc){
			var self = this;
			var ary  = this.Plug.GetTaskList(function (task_id) {
				if (task_id) {
					fuc(task_id);					
				}				
			});
		},
		//选择文件
		selectUploadFiles: function (fuc){
			var self = this;
			var path = self.param.path; path = (path==""?"/":"/"+path+"/");path = path.replace(/\/+/g,'/');
			var path_type = self.param.path_type;
			var from = self.param.from;
			var neid = self.param.neid;
			var prefix_neid= self.param.prefix_neid;			
			//返回0是成功，小于0失败
			var res = this.Plug.UploadFilesAsync(path, path_type, from, neid, prefix_neid);
			fuc(res);
   		},
		//选择文件夹
		selectUploadFolder: function(fuc) {
			var self = this;
			var path = self.param.path;path = (path==""?"/":"/"+path+"/");path = path.replace(/\/+/g,'/');
			var path_type = self.param.path_type;
			var from = self.param.from;
			var neid = self.param.neid;
			var prefix_neid= self.param.prefix_neid;			
			this.Plug.UploadFolder(path, path_type, from, neid, prefix_neid, function(taskinfo) {
				var taskInfo = JSON.parse(taskinfo);
				fuc(taskInfo);
			});
		},
		//选择下载文件或文件夹
		selectDownloadFile: function (download_path, filename, isfolder, fuc){
			var self = this;
			var path = self.param.path; path = (path==""?"/":"/"+path+"/");path = path.replace(/\/+/g,'/');path = path+filename;
			var path_type = self.param.path_type;
			var from = self.param.from;
			var neid = self.param.neid;
			var prefix_neid= self.param.prefix_neid;
//			self.renderWait = new Wait();
			var res = this.Plug.DownLoadFileAsync(path, download_path, path_type, from, neid, prefix_neid, isfolder);
			fuc(res);
   		},
   		//点击“浏览”后，调出下载目录
		scanDownloadDir: function(){
			return this.Plug.SelectDir();
		},
		//开始任务
		startTask: function( taskId ){
			var ret  = this.Plug.StartTask(taskId);
			if(ret<0){
				return false;
			}else{
				return true;
			}
		},		
		// 暂停所有任务
		stopAllTask:function(){
			var ret = this.Plug.StopAllTask();
			if(ret>=0){
				return true;
			}else{
				return false;
			}
		},
		//开始所有任务
		startAllTask:function(){
			var ret = this.Plug.StartAllTask();
			if(ret>=0){
				return true;
			}else{
				return false;
			}			
		},
		//移除所有任务
		removeAllTask: function(){
			var ret = this.Plug.RemoveAllTask();
//			if(ret==0){
//				$(this.plugFileList.UI).animate({bottom:"-370px"});
//			}
		},
		//获取所有队列个数
		getTaskAllCount:function(){
			var allNum = this.Plug.GetTaskAllCount();
			return allNum;
		},
		//
		getAllFailTaskCount:function(){
			var allNum = this.Plug.GetAllFailTaskCount();
			return allNum;
		},
		//获取正在上传的任务个数（包括正在传和暂停的个数）
		getTaskActiveCount:function(){
			var currentNum = this.Plug.GetTaskActiveCount();
			return currentNum;
		},
		getStats: function() {
			var all_num = this.Plug.GetTaskAllCount(),	//获取所有队列个数
				active_num = this.Plug.GetTaskActiveCount(),	//获取正在上传的任务个数（包括正在传和暂停的个数）
				fail_nun = this.Plug.GetAllFailTaskCount();		//获取失败的任务个数
			return {all_num:all_num,
					active_num:active_num,
					fail_num:fail_nun
				  };
		},
		//获取或者重置默认下载路径
		defaultPath: function(path){
			if (path) {
				this.Plug.local_path = path;
			}
			return this.Plug.local_path;
		},
		//获取文件类型
		getFileType: function(file) {
			var name = file.Name;
			var index = name.lastIndexOf(".");
			var type = name.substring(index+1, name.length);
			return type;
		},
		//获取指定磁盘的剩余空间
		getDriverFreeSpace: function(){
			var self = this;
			return this.Plug.GetDriverFreeSpace();
		},
		getDefaultPath: function (){
			var self = this;
			return this.Plug.local_path;
		},
		//切换目录时候变换path
		changePath: function(folder, path_type, from, prefix_neid){
			var self = this;
			this.param.path = folder;
			this.param.path_type = path_type;
			this.param.from = from;
			this.param.prefix_neid = prefix_neid;
		},
		//弹出上传窗口
		appearUI: function(){
			if ($(this.plugFileList.UI).css("bottom") == "-370px") {
				$(this.plugFileList.UI).animate({bottom: "0px"});				
			}
		},
		events: function() {
			var self = this;
			//显示组合式的“上传文件”“上传文件夹”按钮
			this.uploadBtn.off("mouseenter").on("mouseenter",function(){
				$("#ie_plug_btn").show();
			});
			//点击“上传”按钮上传文件
			this.uploadBtn.off("click").on('click', function() {
				var can_upload = Util.getPrivatePrivilege(fileManager.cssAction).canUpload;
				if (can_upload&&fileManager) {
				    self.selectUploadFiles(function(res){
				    	if (res > 0) {
				    		self.renderWait = new Wait();				    		
				    	}				    	
					});
				}
			});
			this.uploadBtn.off("mouseleave").on("mouseleave", function(e){
				$("#ie_plug_btn").hide();
			});
			$("#upload-files").off("click").on("click", function(){
				self.uploadBtn.trigger("click");
				return false;
			});
			//点击“文件夹上传”按钮上传文件夹
			$("#upload_folder").off("click").on("click",function(){
				var can_upload = Util.getPrivatePrivilege(fileManager.cssAction).canUpload;
				if (can_upload&&fileManager) {
					self.selectUploadFolder(function(task){});
				}
				return false;
			});
			//插件提供的唯一事件，监听上传的变化
			this.on('taskerInfoChangedNotify', function(taskinfo){
				if (taskinfo) {
					var taskInfo = JSON.parse(taskinfo);
					if (taskinfo.state != "StateNone") {
						self.appearUI();
					}
					self.plugFileList.update(taskInfo);								
					if (window.console) {
						console.log(taskInfo.task_id+"       " +taskInfo.state);
					}
				}				
			});
		},
		listenEvent: function() {
			var self = this;		
			addEvent(this.Plug, 'OnTaskerInfoChangedNotify', function(taskinfo){				
				self.fire('taskerInfoChangedNotify', taskinfo);								
			});

//			this.Plug.attachEvent("OnTaskerInfoChangedNotify", function(taskInfo){
//				var files = JSON.parse(taskInfo);
//				self.fire('taskerInfoChangedNotify', files);
//			});
			
			function addEvent(obj, sEv, fn){
		         if(obj.attachEvent){
		         	obj.attachEvent(sEv, fn);//IE
		         }
		         else{
		         	obj.addEventListener( sEv, fn, false); // chrome firefox
		         }
			 }
		},
	});

	return PlugAIO;

});