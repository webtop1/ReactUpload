;define('js/module/upload/main', function(require, exports){
    var _ = $.i18n.prop;
    var SWF = require('upload/src/SWF');
        require("upload/css/task.css");
        require("jquery");
        require('i18n');

    var self;

    function main(options){
        self=this;
        this.options=options;
        for(var o in options){
            this[o]=options[o];
        }
        this.init();
    }

    $.extend(main.prototype, {
        init: function(){
           this.render();
        },
        render:function(){
            var self = this;
            if(!self.isSupportHTML5()){
                require.async('upload/src/upload_html5',function (upload_html5) {
                    self.uploadPlug = new upload_html5(self.options);
                })
            }else {
                   self.uploadPlug = new SWF('swfupload-holder', self).build();
            }
        },
        isSupportHTML5:function () {
            try {
                if (typeof FileReader == "undefined") return false;
                if (typeof Blob == "undefined") return false;
                var blob = new Blob();
                if (!blob.slice && !blob.webkitSlice) return false;
                if (!('draggable' in document.createElement('span'))) return false;
            } catch (e) {
                return false;
            }
            return true;
        },
        show:function(){
            $('#container').show();
        },
        hide:function(){
            $('#container').hide();
        },
        addFile:function(params){
            if (!uploadlist.files) {
                uploadlist.files = [];
            }
            uploadlist.files.push(params);
        },
        updateFilelist:function(params){
            if(params.id&&!this.getFile(params.id)){
                this.addFile(params);
            }else{
                $.extend(this.getFile(params.id),params);
            }
            if(self.update){
                self.update();
            }
        },
        /**
         * 添加文件到uploadlist
         * @param params
         */
        addFile: function (params) {
            if (!uploadlist.files) {
                uploadlist.files = [];
            }
            uploadlist.files.push(params);
            if(self.update){
                self.update();
            }
        },
        /**
         * 获取uploadlist单个文件
         * @param fileId
         * @returns {*}
         */
        getFile: function (fileId) {
            var fileObj;
            for (var o in uploadlist.files) {
                if (uploadlist.files[o].id == fileId) {
                    fileObj = uploadlist.files[o];
                    break;
                }
            }
            return fileObj;
        }
    });

    return main;

});