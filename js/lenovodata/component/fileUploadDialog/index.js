;define('component/fileUploadDialog/index', function(require, exports){

	var $=require('jquery'),
		Dialog = require('component/dialog'),
		SwfUploadUI = require('component/fileUploadDialog/swfUploadUI'),
		EventTarget = require('eventTarget'),
		Util = require('util'),
		ProgressBar = require('component/progressbar');
		
	require('i18n');
	var _ = $.i18n.prop;

	function FileUploadDialog(folder, uploadURL,path_type,from){
		this.folder = folder;
		this.uploadURL = uploadURL;
		this.type = path_type;
		this.from = from;
		this._init();
	}

	$.extend(FileUploadDialog.prototype, EventTarget, {

		_init: function(){
			var self = this, process;

				var uploadUI = new SwfUploadUI('body', self.uploadURL);
				self.uploadUI = uploadUI;
				uploadUI.init(self.folder,self.type,self.from);
				uploadUI.on('completeOne',function(){
					self.fire('completeOne');
				});
				uploadUI.on("loadready",function(){
					self.fire("loadready");
				});				
		},

		setFolder: function(folder,type,from,prefix_neid){
			var self = this;
			self.folder = folder;
			self.type = type;
			if(self.uploadUI){
				self.uploadUI.preparePath(folder,type,from,prefix_neid);
			}
		},

		show: function(){
			var self = this;
			if(self.dialog){
				//self.dialog.show();
			}
		},
		
		getState: function(){
			var self = this;
			return self.uploadUI.getState();
		}
	});
	
	return FileUploadDialog;

});
