;define('component/upload', function(require, exports){
	var $ = require('jquery'),
		ProgressBar = require('component/progressbar'),
        EventTarget = require('eventTarget'),
        Tips = require('component/tips'),
        flashCheckDialog = require('component/flashCheckDialog'),
        SwfUp = require('component/fileUploadDialog/swfUploadBuilder');

    function Upload(node, url, opt){
    	this.node = $.type(node) == 'string' ? $(node) : node;
    	this.url = url || '';

    	this.option = opt;

        if(opt.postParam){
            var param = '';
            for(var key in opt.postParam){
                param += key +'='+ opt.postParam[key]+'&';
            }
            param = param.slice(0, -1);
            this.url += '?' + param;
        }
    	this._init();
    }

    $.extend(Upload.prototype, EventTarget, {
    	_init: function(){
    		var self = this;
    		var up = $('<div class="lui-upload"><a style="float:left;width:80px;height:32px;background:url(\'/css/theme/default/img/upload-'+($.cookie('language') == 'en' ? 'en':'zh')+'.png\')" id="uploadButton"></a><div class="uploadProgress"></div></div>');
    		self.node.append(up);

            var barHolder = up.find('.uploadProgress');

    		var template = '<div class="content"><span class="name">{{name}}</span><span class="proc">{{proc}}</span><span class="icon i-delete"></span></div>';
    		var bar = new ProgressBar(barHolder, template, {});
            bar.delegate({'.i-delete': function(e){
                    self.instance.cancelUpload();
                    barHolder.hide();
                }
            });
			if(!flashCheckDialog.checkFlash()) return;
            self.instance = new SwfUp('uploadButton', {
                fileQueued: function(file){
                    barHolder.show();
                    bar.render({name: file.name, proc: 0});
                },
                /**
                 * 文件对话框完成
                 */
                fileDialogComplete: function(numFilesSelected, numFilesQueued){
                },
                /**
                 * 上传进度
                 */
                uploadProgress: function(file, bytesLoaded, bytesTotal){
                    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                    bar.update(percent);
                    bar.render({name: file.name, proc: percent});
                },
                /**
                 * 上传成功
                 */
                uploadSuccess: function(file, serverData){
                    self.fire('complete', serverData);
                },
                /**
                 * 上传完成
                 */
                uploadComplete: function(file){
                	return false;
                },
                /**
                 * 上传失败
                 */
                uploadError:function(file,errorCode,message){
                	self.fire("error",{errCode:errorCode,msg:message});
                },
                fileQueueError: function(file, errorCode, message) {
                    try {
                        switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            Tips.warn('文件超过500M了，请使用<a href="/client/windows/bin/LenovoBox.zip">客户端</a>上传');
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            Tips.warn(_('不能上传')+file.name+'&nbsp;&nbsp;,文件类型不允许');
                            break;
                        default:
                            if (file !== null) {
                                Tips.warn('很抱歉，您的操作失败了，建议您重试一下！');
                            }
                            break;
                        }
                    } catch (ex) {}
                }
            }, self.option).build();
    	},

    	startUpload: function(){
    		var self = this;
    		self.instance.setUploadURL(self.url);
    		self.instance.startUpload();
    	}
    });

	return Upload;
});
