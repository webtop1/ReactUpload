;define('upload/index', function(require, exports){
	var _ = $.i18n.prop,
		underscore = require("underscore"),
		EventTarget = require('eventTarget'),
		Util = require('util'),
		SWF = require('upload/src/SWF'),
		AIOPlug = require('upload/src/plugAIO');
		SWFFileList = require('Upload/src/SWFFileList'),
		AuthUploadManager = require('lenovodata/model/AuthUploadManager');
		Dialog = require('component/dialog'),
		require("upload/css/task.css")
		require("jquery");
		require('i18n');

	function index(folder, uploadURL, path_type, from, prefix_neid){
		this.folder = folder;
		this.uploadURL = uploadURL;
		this.path_type = path_type;
		this.from = from;
		this.prefix_neid = prefix_neid;
		this.Plug = null;
		this.fileList = null;
		this.uploadUI = null;
		this.init();
	}

	$.extend(index.prototype, EventTarget, {
		init: function(){
			var self = this;
			this.render();
		},
		render: function(){
			var self=this;
			$("body").append('<div class="upload-task-list upload-dialog" show="false" id="upload_dialog_wrapper"></div>');
			this.uploadUI = $("#upload_dialog_wrapper");
			if (Util.IEPlug() == "1.0.0.30") {
				this.uploadUI.load(g_origin+'/js/module/Upload/plugDialog.html?'+new Date().getTime(),function(){
					var tmp=underscore.template($(this).find("#upload_dialog").html());
		            $("body").append($(this).html(tmp()));		            
		            //使用IE插件
		            self.Plug = new AIOPlug('ieUplaoder', {path: self.folder, path_type: self.path_type, from: self.from, neid: '', prefix_neid: self.prefix_neid});
		            self.Plug.on('completeOne',function(){		            	
						self.fire('completeOne');
					});	
		            self.events();
				});
			} else{
				this.uploadUI.load(g_origin+'/js/module/Upload/SWFDialog.html?'+new Date().getTime(),function(){
					var tmp=underscore.template($(this).find("#upload_dialog").html());
		            $("body").append($(this).html(tmp()));
					self.Plug = new SWF('swfupload-holder', self).build();
					self.fileList = new SWFFileList(self.Plug, self.folder, self.path_type);
					self.fileList.on('completeOne',function(){
						self.fire('completeOne');
					});	
					self.fileList.on('selectFiles',function(){
						self.fire('completeOne');
					});
					self.events();
				});				
			}
			var strPathName=window.location.pathname;
			if(self.isSupportHTML5()&&(strPathName=='/'||strPathName=='/folder/self')){
				require.async('Upload/src/upload_html5',function (upload_html5) {
					var options={
						container:'.page-body',
						main:self
					};
					self.uploadHtml5 = new upload_html5(options);
				})
			}
		},
		events: function(){
			var self = this;
			$("#close-upload-task-list").off('click').on("click", function(){
				var state = self.getState();
				if (state == "active") {
					new ConfirmDialog({title: _("提示"),content: _("确认取消所有未完成的任务?")}, function() {
						self.closeAllTask();
					});
				} else {
					self.closeAllTask();
					setTimeout(function(){
						$(".upload-task-list").animate({bottom: "-370px"}, function(){});
					},0);					
					$("#set-min").css({"background-position":"0 0"});
				}
			});
			$("#set-min").unbind('click').click(function() {
				self.slideDownFileList();
			});
			
			$('#allReUpload').unbind('click').click(function() {
				$('.upload-dialog .task-file').attr('isbefore', 'false');
				self.fileList.startUpload(true);
				$(this).parents('#plugReuploadMsg').hide();
			});
			$("#plugMsg").show().find(".two-pix-btn").on("click", function(){
		        self.downloadPlugTip(this);
		    });
		},
		setFolder: function(folder, type, from, prefix_neid){
			var self = this;
			if (this.fileList) {
				this.fileList.preparePath(folder, type, from, prefix_neid);
			}else {
				this.Plug.changePath(folder, type, from, prefix_neid);
			}			
		},

		show: function(){
			var self = this;
			if(self.dialog){
				//self.dialog.show();
			}
		},
		
		slideDownFileList: function() {
			var self = this;
			if ($(".upload-task-list").css("bottom") == '0px') {
				var minInt = $(".upload-task-list .min-show").height() - $(".upload-task-list").height() - 1;
				$(".min-progress").css({
					width: '0px'
				});
				$(".upload-task-list").animate({
					bottom: minInt + "px"
				}, function() {
					$("#set-min").css({"background-position":"0 0"});
				});
				self.fileList.taskIsView = false;
			} else {
				$(".upload-task-list").animate({
					bottom: "0px"
				}, function() {
					$("#set-min").css({"background-position":"0 -27px"});
				});
				self.fileList.taskIsView = true;
			}
		},
		getState: function() {
			var self = this;
			if (Util.IEPlug() == "1.0.0.30") {
				var active_counts = this.Plug.getStats().active_num;
			}else{
				try{
					var active_counts = this.Plug.getStats().in_progress;
				}catch(e){
					var active_counts = 0;
				}
				
			}
			if (active_counts != 0) {
				return "active";
			}
		},
		makeURL: function(file) {
			if(!file){return;}
			var self = this,
				params = [];
			var name = file.name;
			var path = this.fileList.path;						
			path != '' && (path = path + '/');
			var data = {
				directory: path,
				file: name
			};
			var tempURL = this.uploadURL.replace(/\{([^\}]+)\}/g, function(s0, s1) {
				return data[s1];
			});
			tempURL += new Date().getTime();
			tempURL = encodeURI(tempURL);
			tempURL = tempURL.replace(/#/g, '%23');
			return tempURL;
		},
		closeAllTask: function() {
			var self = this;
			try{
				this.fileList.closeAllTask();
			}catch(e){
				this.Plug.removeAllTask();
			}			
		},
		downloadPlugTip: function(obj) {
			if (!Util.isIE()) {
				$(obj)[0].href = "javascript:";
				var d = new Dialog(_("提示"), {minHeight:210,minWidth:350}, function(content){
					content.addClass("plug_download_plug");
					content.html("<h1 class='title1'>1."+_('该插件目前仅支持IE内核浏览器')+"</h1><h2>("+_('如：IE浏览器、360浏览器和搜狗浏览器的兼容模式等')+")</h2><h1 class='title2'>2."+_('下载安装后，打开IE浏览器即可体验极速传输')+"</h1><div class='btn'><a id='continue_download' href='/resource/IEPlugin/LenovoSuperPlugin_v1.0.0.30.exe'>"+_('继续下载')+"</a><span id='cancel_download'>"+_('取消')+"</span></div>");
				});
				$("#continue_download").on("click", function(){
					$(".i-close").trigger("click");
				});
				$("#cancel_download").on("click", function(){
					$(".i-close").trigger("click");
				});
			}
		},
		getUploadUrl:function (callback,path_type) {
			var self=this;
			var options={
				func:function(res){
					if (res.code == 200) {
						var l_cookie = $.cookie('X-LENOVO-SESS-ID');
						var l_language = $.cookie('language');
						var uid = Util.getUserID();
						var prefix="";
						if(fileManager.fa.data){
							prefix ="prefix_neid="+fileManager.fa.data.prefix_neid+"&";
							prefix +="from="+fileManager.fa.data.from +"&";
						}
						var url=res.data.region+Util.getApiVersion()+'/files/databox/{directory}{file}?X-LENOVO-SESS-ID='+l_cookie+'&uid='+uid+'&overwrite=true&source=file&language='+l_language+'&t=&path_type='+path_type+'&'+prefix;
						callback(url);
					}else {
						throw "get upload url error ";
					}
				}
			};
			$.extend(options,self.fileList);
			if(fileManager.fa.data){
				options.prefix_neid=fileManager.fa.data.prefix_neid;
				options.from=fileManager.fa.data.from;
			}
			AuthUploadManager.checkUploadAuth(options);
		},
		getRegion:function (callback,params) {
			var self=this;
			var options={
				func:function(res){
					callback(res);
				}
			};
			$.extend(options,self.fileList,params);
			options.prefix_neid=fileManager.fa.data&&fileManager.fa.data.prefix_neid;
			AuthUploadManager.checkUploadAuth(options);
		},
		isSupportHTML5:function () {
			try {
				// Check for FileApi
				if (typeof FileReader == "undefined") return false;
				// Check for Blob and slice api
				if (typeof Blob == "undefined") return false;
				var blob = new Blob();
				if (!blob.slice && !blob.webkitSlice) return false;
				// Check for Drag-and-drop
				if (!('draggable' in document.createElement('span'))) return false;
			} catch (e) {
				return false;
			}
			return true;
		}
	});
	
	return index;

});