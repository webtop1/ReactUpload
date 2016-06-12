;define('component/fileUploadDialog/swfUploadBuilder', function(require, exports){

	var $=require('jquery');
	require('cookie');
	require('i18n');
	var	_ = $.i18n.prop;

	require('swfupload/swfupload.js');
	require('swfupload/plugins/swfupload.queue.js');
	require('swfupload/plugins/swfupload.speed.js');
	var flashCheckDialog = require('component/flashCheckDialog');

	function SwfUploadBuilder(node, eventManager, opt){

		var DEFAULT = {
			single: false,
			image: false,
			buttonText: false
		};
		opt = $.extend(DEFAULT, opt);
		var language = $.cookie('language');
		var imageUrl = language == 'en' ? '/css/theme/default/img/upload-en.png':'/css/theme/default/img/upload-zh.png';
		this.setting = {
			// Backend Settings
			upload_url: '',
			button_action : opt.single?-100:-110,

			// File Upload Settings
			file_size_limit : "1048576",	// 500MB
			file_types : opt.fileType||"*.*",
			file_types_description : "All Files",
			file_upload_limit : "10000",
			file_queue_limit : "0",
      
      		moving_average_history_size: 40,

			// Event Handler Settings (all my handlers are in the Handler.js file)
			file_dialog_start_handler    : eventManager['fileDialogStart'],
			file_queued_handler          : eventManager['fileQueued'],
			file_queue_error_handler     : eventManager['fileQueueError'],
			file_dialog_complete_handler : eventManager['fileDialogComplete'],
			upload_start_handler         : eventManager['uploadStart'],
			upload_progress_handler      : eventManager['uploadProgress'],
			upload_error_handler         : eventManager['uploadError'],
			upload_success_handler       : eventManager['uploadSuccess'],
			upload_complete_handler      : eventManager['uploadComplete'],
			swfupload_loaded_handler	 : eventManager['loadReady'],

			// Button Settings
			button_image_url : opt.image||imageUrl,
			button_placeholder_id : node,
			button_width: '80',
			button_height: '32',
			button_text: '',
			button_text_style: ".theFont {font-size: 14px; color:#ffffff; font-weight: bold; cursor: pointer;}",
			button_text_left_padding: 40,
			button_text_top_padding: 8,
			button_cursor : SWFUpload.CURSOR.HAND,
			button_window_mode : 'transparent',
		
			// Flash Settings
			flash_url : "/resource/swfupload.swf?rev=20141124",
			prevent_swf_caching : false,

			// Debug Settings
			debug: false
//			http_success:[403,405]
		};
	}

	$.extend(SwfUploadBuilder.prototype, {
		setProperty: function(key, value){
			this.setting[key] = value;
		},
		build: function(){
			$.each(SWFUpload.instances,function(i,is){
				is.destroy();
			});
			if(flashCheckDialog.checkFlash()){
				return new SWFUpload(this.setting);
			}
			return null;
		}
	});

	return SwfUploadBuilder; 
});
