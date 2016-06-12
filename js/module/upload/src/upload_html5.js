/**
 * @fileOverview HTML5文件上传
 * @author thliu-pc
 * @version 3.4.1.0
 * @updateDate 2016/4/8
 */
;
define('upload/src/upload_html5', function (require, exports) {
    var Util = require('util');
    var Tips = require('component/tips');
    require('upload/src/upload_html5.CryptoJS.js');
    var SHA256 = require('upload/src/upload_html5.sha256.js');
    /**
     *
     * @param options
     * container
     *
     */
    var STEP = 4194304;//4*1024*1024;
    var MAX_SIZE = 1073741824;//1G
    var self = {};
    window.uploadlist = {
        status:'-',
        files: [/*{
            id: '4257',//文件唯一编号
            trunkNum: 5,//分块数
            loaded: 0,//已上传大小
            uploadurl: '',//多数据中心，根据条件每个文件的上传地址可能不一样
            isUpload: false,//全部上传完成后更新状态,
            startUploadTime: 0,//开始上传时间
            timeRemaining: '0',//剩余时间
            status: '-',//如果为取消时值为 ：cancel,验证hash 时为：check, 上传时为：upload
            file: {},
            hashs: {
                '134a9fc1bc49cc708a03f39019441cb3ae9d5589d5ca27bb665cc55fdf0c1265': {
                    isUpload: false,//是否完成上传
                    isCheck: false,//是否验证
                    start: 0,//开始
                    end: 40156549,//结束
                    retryNum: 1,//上传重试次数
                    fileId:fileId,//冗余值方便读取,
                    status:'-',//如果为取消时值为 ：cancel,验证hash 时为：check, 上传时为：upload
                    hashs: '134a9fc1bc49cc708a03f39019441cb3ae9d5589d5ca27bb665cc55fdf0c1265' //冗余值方便读取
                }
            }
        }*/]
    };


    function uploadHTML5(options) {
        for (var o in options) {
            this[o] = options[o];
        }
        self = this;
        this.files_queued = [];
        this.in_progress = 0;
        this.init();

    }

    uploadHTML5.prototype = {
        init: function () {
            this.render();
            this.event();
            this.worker = new Worker(g_origin + '/js/module/upload/src/upload_htm5.worker.sha256.js');
        },
        render: function () {
            var html = "<input  style='display: none;' type='file' multiple='multiple' id='upload_files_input' /><div id='drop_mask_box'></div>";
            $('body').append(html);
            this.$mask=$('#drop_mask_box');
        },
        /**
         * 事件绑定
         */
        event: function () {
            var $container = $(self.container);
            $container[0].addEventListener("dragenter", function (event) {
                if (!self.mask) {
                    self.showMask();
                }
                self.stopPropagation(event);
            }, false);
            $container[0].addEventListener("dragover", function (event) {
                self.stopPropagation(event);
            }, false);
            $container[0].addEventListener("drop", self.handleDrop, false);
            $container[0].addEventListener("dragleave", function (event) {
                self.stopPropagation(event);
            }, false);

            self.$mask[0].addEventListener("dragenter", function (event) {
                if (!self.mask) {
                    self.showMask();
                }
                self.stopPropagation(event);
            }, false);
            self.$mask[0].addEventListener("dragover", function (event) {
                self.stopPropagation(event);
            }, false);
            self.$mask[0].addEventListener("drop", self.handleDrop, false);
            self.$mask[0].addEventListener("dragleave", function (event) {
                self.hideMask();
                self.stopPropagation(event);
            }, false);

            $('#upload_files_input')[0].addEventListener('change', self.handleDrop, false);

            if(self.uploadId){
                $('#'+self.uploadId)[0].addEventListener('change', self.handleDrop, false);
            }

            $('#container').on('cancel-one',function (evt,data) {
                self.deleteFile(data.id);
                self.update();
            });

            $('#container').on('cancel-all',function (evt,data) {
                self.cancelAllUpload();
                self.update();
            });

        },
        /**
         * 停止事件冒泡
         * @param event
         */
        stopPropagation: function (event) {
            event.stopPropagation();
            event.preventDefault();
        },
        /**
         * 打开文件窗口
         */
        openFilesWindow: function () {
            $('#upload_files_input').click();
            return false;
        },
        /**
         * 更新上传进度
         * @param fileId
         */
        updateProcess: function (fileId) {
            var fileObj = self.getFile(fileId);
            if(!fileObj){return;}
            if(fileObj.status=='cancel'){
                return;
            }
            //用时
            Util.log("☀current time :"+new Date().getTime()+" start time:"+fileObj.startUploadTime.getTime());
            var seconds = parseInt((new Date().getTime() - fileObj.startUploadTime.getTime()) / 1000);
            //速率 k/秒
            var scale = fileObj.loaded / 1024 / seconds;
            var remain = fileObj.file.size / 1024 / scale - seconds;
            remain=parseInt(remain);
            fileObj.timeRemaining = remain?remain:'-';
            //更新进度
            var per = parseInt(fileObj.loaded / fileObj.file.size * 100);
            if (per > 100) {
                per = 100;
                fileObj.loaded = fileObj.file.size;
            }
            self.update();
    //            self.main.fileList.update(fileObj, per, fileObj.loaded, fileObj.file.size);
        },
        /**
         * 显示遮罩层
         */
        showMask: function () {
            self.mask = true;
            self.$mask.css({
                width: '100%',
                height: '100%',
                position: 'absolute',
                'z-index': 800,
                background: '#666666',
                opacity: 0.5,
                top: 0
            });
        },
        /**
         * 隐藏遮罩层
         */
        hideMask: function () {
            self.mask = false;
            self.$mask.css({
                width: '1px',
                height: '1px',
                position: 'none',
                'z-index': 0,
                top: 0
            });
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
        },
        /**
         * 获取文件的状态
         * @param fileId
         */
        getFileStatus:function(fileId){
           return self.getFile(fileId).status;
        },
        /**
         * 设置分块数
         * @param file
         */
        setTrunkNum: function (file) {
            var num = parseInt(file.size / 4194304);
            if (file.size % 4194304 != 0) {
                num += 1;
            }
            self.getFile(file.id).trunkNum = num;
        },

        /**
         * 获取单个文件分块数量
         * @param fileId
         * @returns {number|Number|*}
         */
        getTrunNum: function (fileId) {
            return self.getFile(fileId).trunkNum;
        },

        /**
         * 添加hash
         * @param fileId
         * @param hashVal
         * @param start
         * @param end
         */
        addHash: function (fileId, hashVal, start, end) {
            var fileObj = self.getFile(fileId);
            if(!fileObj){return;}
            if (!fileObj.hashs) {
                fileObj.hashs = {};
            }
            if (!fileObj.hashs[hashVal]) {
                fileObj.hashs[hashVal] = {
                    isUpload: "-",
                    status:'-',
                    start: start,
                    fileId:fileId,
                    end: end,
                    retryNum: 0,
                    hash: hashVal
                }
            }
        },

        /**
         * 获取单个文件文件的所有hash
         * @param fileId
         * @returns {Array}
         */
        getFileAllHashs: function (fileId) {
            var fileObj = self.getFile(fileId);
            var hashs = fileObj.hashs;
            var result = [];
            for (var o in hashs) {
                result.push(o);
            }
            return result;
        },

        /**
         * 更新分块状态
         * @param opions
         */
        updateTruUploadStatus: function (opions) {
            var fileObj = self.getFile(opions.fileId);
            if(!fileObj){return;}
            for (var i = 0; i < opions.needed_block.length; i++) {
                if (opions.needed_block[i] == "") {
                    continue;
                }
                fileObj.hashs[opions.needed_block[i]].isUpload = opions.isUpload;
                fileObj.hashs[opions.needed_block[i]].upload_id = opions.upload_id;
                if (opions.isUpload) {
                    fileObj.loaded += STEP;
                }
            }
        },

        /**
         * 获取下一个待上传的文件块
         * @param fileId
         * @returns {string}
         */
        getNextTrunk: function (fileId) {
            var result = "";
            var fileObj = self.getFile(fileId);
            if(!fileObj){return result;}
            var hashs=fileObj.hashs;
            for (var o in hashs) {
                if (hashs[o].isUpload === false&&hashs[o].status=='-') {
                    result = hashs[o];
                    break;
                }
            }
            return result;
        },

        /**
         * 更新hash是否验证状态
         * @param fileId
         * @param arrHashs
         */
        updateHashCheckStatus: function (fileId, arrHashs) {
            var fileObj = self.getFile(fileId);
            for (var i = 0; i < arrHashs.length; i++) {
                fileObj.hashs[arrHashs[i]].isCheck = true;
            }
        },
        /**
         * 获取待验证的hash
         * @param fileId
         * @returns {Array}
         */
        getNeedCheckHashs: function (fileId) {
            var arr = [];
            var fileObj = self.getFile(fileId);
            if(!fileObj){
                return arr;
             }
            var hashs=fileObj.hashs;
            for (var o in hashs) {
                if (!hashs[o].isCheck) {
                    arr.push(o);
                }
            }
            return arr;
        },
        /**
         * 是否可以提交上传
         * @param fileId
         */
        isCommitUpload: function (fileId) {
            var result = true;
            var fileObj = self.getFile(fileId);
            if(!fileObj){ return result;}
            var trunkNun = fileObj.trunkNum;
            var hashs = fileObj.hashs;
            var i = 0;
            for (var o in hashs) {
                if (hashs[o].isCheck && hashs[o].isUpload) {
                    ++i;
                } else {
                    result = false;
                    break;
                }
            }
            if (i != fileObj.trunkNum) {
                result = false;
            }
            return result;
        },
        /**
         * 开始后台线程，专门负责sha256计算
         * @param file
         */
        startWorker: function (fileId, begin, callback) {
            if (!self.worker.isAddEventListener) {
                self.worker.addEventListener('message', function (event) {
                    if (event.data) {
                        Util.log("■ start worker get hash :" + event.data.hash + " fileId:" + event.data.fileId);
                        self.addHash(event.data.fileId, event.data.hash, event.data.start, event.data.end);
                        callback(event.data.fileId);
                        if (event.data.end != event.data.size) {
                            postMessage(event.data.fileId, event.data.end, event.data.fileId);
                        }
                    }
                });
                self.worker.isAddEventListener = true;
            }

            function postMessage(fileId, start) {
                var fileObj = self.getFile(fileId);
                if(!fileObj){return;}
                //用户取消上传
                if (fileObj.status == 'cancel') {
                    return;
                }
                var file = fileObj.file;
                var end = Math.min(start + STEP, file.size);
                var blob = file.slice(start, end);
                Util.log("★ start worker post message start:" + start + " end:" + end + " file size:" + file.size + "file id:"+fileId);
                self.worker.postMessage({
                    'blob': blob,
                    fileId: fileId,
                    start: start,
                    end: end,
                    size: file.size
                });
            }

            postMessage(fileId, begin);
        },
        /**
         * 设置上传列表状态 -:默认 upload：上传中 complete：完成
         * @param status
         */
        setListStatus:function (status) {
            uploadlist.status=status;
        },
        /**
         * 获取上传列表状态  -:默认 upload：上传中 complete：完成
         * @returns {string}
         */
        getListStatus:function () {
          return   uploadlist.status;
        },
        /**
         * 获取一个待上传的文件
         * @returns {*}
         */
        takeFie:function () {
            var file;
            for(var i=0;i<uploadlist.files.length;i++){
                if(!uploadlist.files[i].isUpload&&uploadlist.files[i].status=="-"){
                    uploadlist.files[i].startUploadTime=new Date();
                    file = uploadlist.files[i].file;
                    break;
                }
            }
            return file;
        },
        /**
         * 检查hash是否存在
         */
        chunkedUpload: function () {
            //正在上传
            if(self.getListStatus()=='upload'){
                return;
            }
            //获取上传文件
            var file=self.takeFie();
            //所有文件上传完成
            if(!file){
                self.setListStatus('complete')
                return;
            }
            self.setListStatus('upload');
            self.setTrunkNum(file);
            //用户取消
            if(self.getFileStatus(file.id)=='cancel'){
                return;
            }

            /**
             * 主线程开始获取第一块的hash
             * @param file
             * @param start
             */
            function getFirstHash(file, start) {
                var end = Math.min(start + STEP, file.size);
                var blob = file.slice(start, end);
                SHA256(blob, function (hash) {
                    Util.log('■ get first hash:' + hash+" file idd"+file.id);
                    self.addHash(file.id, hash, start, end);
                    checkHash(file.id);
                });
            }
            getFirstHash(file, 0);

            //从第二块开始后台计线程算hash
            if (file.size > STEP) {
                (function (fileObj) {
                    var checkHashTimer;
                    self.startWorker(fileObj.id, 1 * STEP, function (fileId) {
                        checkHashTimer && clearTimeout(checkHashTimer);
                        checkHashTimer = setTimeout(function () {
                            checkHash(fileId);
                        }, 10);
                    });
                })(file);
            }

            /**
             * hash 验证
             * @param fileId
             */
            function checkHash(fileId) {
                var arrHashs = self.getNeedCheckHashs(fileId);
                //已验证hash,但未上传
                if(arrHashs.length==0&&self.getNextTrunk(fileId)!=""){
                    upload(fileId);
                    return;
                }
                var fileObj=self.getFile(fileId);
                if(!fileObj){
                    return;
                }
                var url = fileObj.uploadUrl + '/v2/commit_chunked_upload/commit/databox';
                Util.log("checkHash start hashes:" + arrHashs.join(',') + "file id:"+fileId);
                var params = 'hashes[]=' + arrHashs.join('&hashes[]=');
                Util.ajax_json_post_nowait(url, params, function (xhr, textStatus) {
                    var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                    Util.log("checkHash end needed_block:" + retVal.data.needed_block+" file id:"+fileId);
                    if (retVal.data.needed_block.length > 0) {
                        self.updateTruUploadStatus({
                            fileId: fileId,
                            needed_block: retVal.data.needed_block,
                            isUpload: false,
                            offset: 0,
                            upload_id: retVal.data.upload_id
                        });
                        upload(fileId);
                    }
                    //已经存在的数据块
                    var arr = this.data.replace(/&/g, '').split('hashes[]=');
                    var strNeeds = retVal.data.needed_block.join(',');
                    var arrExistTrunk = [];
                    for (var j = 0; j < arr.length; j++) {
                        if (arr[j] == "") {
                            continue;
                        }
                        if (strNeeds.indexOf(arr[j]) == -1) {
                            arrExistTrunk.push(arr[j]);
                        }
                    }
                    if (arrExistTrunk.length > 0) {
                        self.updateTruUploadStatus({
                            fileId: fileId,
                            needed_block: arrExistTrunk,
                            isUpload: true,
                            offset: 0,
                            upload_id: retVal.data.upload_id
                        });
                        self.updateProcess(fileId);
                    }
                    commit(fileId);

                });
                self.updateHashCheckStatus(fileId, arrHashs);
            }

            /**
             * 分块上传
             * @param fileId
             */
            function upload(fileId) {
                function post(trunk) {
                    Util.log('chunkupload start file id:'+trunk.fileId);
                    var fileObj=self.getFile(trunk.fileId);
                    var url = fileObj.uploadUrl + "/v2/chunked_upload?hash=" + trunk.hash + "&offset=0&upload_id=" + trunk.upload_id + "&X-LENOVO-SESS-ID=" + $.cookie("X-LENOVO-SESS-ID");
                    var xhr = self.xhr = new XMLHttpRequest();
                    xhr.fileId = trunk.fileId;
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                var result = $.parseJSON(xhr.responseText);
                                self.updateTruUploadStatus({
                                    fileId: xhr.fileId,
                                    needed_block: [result.hash],
                                    isUpload: true,
                                    offset: 0,
                                    upload_id: retVal.data.upload_id
                                });
                                self.updateProcess(xhr.fileId);
                                var nextTrunk = self.getNextTrunk(xhr.fileId);
                                if (nextTrunk != "") {
                                    post(nextTrunk);
                                } else {
                                    commit(file.id);
                                }
                                Util.log('chunkupload end ok :' + xhr.responseText+" file id:"+xhr.fileId)
                            }else {
                                var message=xhr.status;
                                if ("400" == message) {
                                    message = {
                                        message: language("文件名或路径太长，不能超过255个字符！")
                                    };
                                }
                                if ("403" == message) {
                                    message = {
                                        message: language("没有权限，目标文件禁止该操作。")
                                    };
                                }
                                if ("405" == message) {
                                    message = {
                                        message: language("空间不足，无法完成操作！请联系管理员。")
                                    };
                                }
                                if ("401" == message) {
                                    message = {
                                        message: language("The token dose not exist or has already expired")
                                    };
                                }
                                if ("500" == message||"0"==message){
                                    message = {
                                        message: language("很抱歉，您的操作失败了。")
                                    };
                                }
                                var fileObj=self.getFile(xhr.fileId);
                                self.main.fileList.fail(fileObj,message.message);
                                Util.log('chunkupload end error:' + xhr.responseText+" file id:"+xhr.fileId);
                                self.complete(xhr.fileId);
                            }
                        }

                    };
                    xhr.onerror=function(){
                        Util.log('chunkupload send error fileId :'+ xhr.fileId);
                        self.setListStatus('-');
                        self.chunkedUpload();
                    };
                    /* xhr.upload.onprogress=function(evt){
                     fileObj.loaded += evt.loaded;
                     var percentComplete = Math.round(fileObj.loaded / fileObj.bytes);
                     Util.log('percentComplete:'+percentComplete);
                     };
                    xhr.upload.addEventListener('progress', function (evt) {
                        Util.log('progress');
                    }, false);*/
                    xhr.open('POST', url, true);
                    var file = self.getFile(fileId).file;
                    xhr.send(file.slice(trunk.start, trunk.end));
                    trunk.status='upload';

                }

                var trunk = self.getNextTrunk(fileId);
                if(trunk){
                    post(trunk);
                }
            }

            /**
             * 提交所有的分块
             * @param fileId
             */
            function commit(fileId) {
                if (!self.isCommitUpload(fileId)) {
                    return;
                }
                var options = self.getFile(fileId);
                if(!options){
                    return;
                }
                var uploadUrl = options.uploadUrl + "/v2/commit_chunked_upload/commit/databox/" + encodeURIComponent(options.name) + "?X-LENOVO-SESS-ID=" + $.cookie("X-LENOVO-SESS-ID");
                var params = {
                    bytes: options.bytes,
                    is_file_commit: true,
                    overwrite: true,
                    path: options.path,
                    path_type: options.path_type,
                    'hashes': self.getFileAllHashs(fileId),
                    fileId: fileId
                }
                Util.log("chunkupload start is_file_commit true file id:"+fileId);
                $.ajax({
                    url: uploadUrl,
                    type: "POST",
                    data: params,
                    complete: function (xhr, textStatus) {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                var result = $.parseJSON(xhr.responseText);
                                self.complete(fileId);
                            }
                        }

                    }
                });
            }

        },
        /**
         * 文件拖入处理
         * @param event
         */
        handleDrop: function (event) {
            self.stopPropagation(event);
            var files=[];
            var rawFiles;
            var items;
            var errMsg="";
            if (event.dataTransfer) {
                rawFiles = $.makeArray(event.dataTransfer.files);
                items = $.makeArray(event.dataTransfer.items);
            } else {
                rawFiles = $.makeArray(event.currentTarget.files);
                items = $.makeArray(event.currentTarget.items);
            }
            for (var i = 0; i < rawFiles.length; i++){
                try {
                    //mozGetAsEntry(),
                    if (items[i]&&items[i].webkitGetAsEntry) {
                        var _file = items[i].webkitGetAsEntry();
                    }
                    else if (items[i]&&items[i].getAsEntry) {
                        var _file = items[i].getAsEntry();
                    }
                    $.extend(_file,rawFiles[i]);
                    if(rawFiles[i].size==0){
                        errMsg=_("不能上传空文件或文件夹");
                        break;
                    }
                    if(rawFiles[i].size > MAX_SIZE){
                        errMsg=_("文件大于1G，请使用联想云盘客户端");
                        break;
                    }
                    if (_file && _file.isDirectory) {
                        errMsg=_(" 不能上传空文件或文件夹");
                        break;
                    }
                }
                catch (e) {}
                    files.push(rawFiles[i]);
            }
            if(!errMsg&&files.length==0){
                errMsg=_(" 不能上传空文件或文件夹");
            }else if (files.length > 100) {
                errMsg=_(" 您一次最多只能添加100个文件");
            }
            if (!self.dragstartMsg) {
                self.dragstartMsg = Tips.show(_("拖动文件以上传到:") + (self.getCurrentPath()+_('当前目录')));
            }
            if (errMsg) {
                Tips.show(errMsg);
                self.hideMask();
                return;
            }
            //self.main.fileList.instance = self;
            self.hideMask();
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                (function (obj) {
                    var fileId = parseInt(Math.random() * (10000));
                    Util.log('create file id:' + fileId);
                    obj["id"] = fileId;

                    var params={
                        path_type: self.getPathType(),
                        bytes:obj.size
                    };
                    self.getRegion(function (url) {
                      /*  self.addTask(obj);*/
                        var rootPath = (self.getCurrentPath()? '/' +  self.getCurrentPath(): "");
                        self.addFile({
                            id: obj.id,
                            name: obj.name,
                            bytes: obj.size,
                            loaded: 0,
                            path: rootPath + '/' + obj.name,
                            path_type: self.getPathType(),
                            uploadUrl: url,
                            file: obj,
                            isUpload:false,
                            startUploadTime:new Date(),
                            status: '-'
                        });
                        /*if(res.code !=200 ){
                            self.main.fileList.fail(obj,res.message);
                            Util.log('upload error , code'+res.code+" message:"+res.message);
                            return;
                        }*/
                        self.updateProcess(obj.id);
                        self.startUpload();
                    },params);
                })(file);
            }



        },
        /**
         * 开始上传
         */
        startUpload:function(){
            if(self.getListStatus()!='upload'){
                self.chunkedUpload();
            }
        },
        /**
         * 添加文件到任务列表
         * @param file
         */
        addTask: function (file) {
            var self = this;
            if (!self.main.fileList.taskIsView) {
                self.main.fileList.taskIsView = true;
                self.main.fileList.taskView(true);
            }
            self.main.fileList.add(file);
        },
        /**
         * 当一个文件上传处理完成时
         * @param fileId
         */
        complete: function (fileId) {
            var fileObj=self.getFile(fileId);
            if(!fileObj){return;}
            fileObj.isUpload=true;
            var file = fileObj.file;
            Util.log("upload complete，file id: " + fileId);
            self.main.fileList.complete(file);
            self.main.fileList.updateHead();
            self.setListStatus('-');
            self.deleteFile(fileId);
            self.chunkedUpload();
            self.updateFilelistTitle();
        },
        /**
         * 取消上传
         * @param id 文件唯一标识
         */
        cancelUpload: function (fileId) {
            self.getFile(fileId).status = 'cancel';
            if (self.xhr && self.xhr.fileId == fileId) {
                self.xhr.abort();
                self.setListStatus('-');
            }
            self.setListStatus('-');
            self.deleteFile(fileId);
            self.updateFilelistTitle();
            self.chunkedUpload();
        },
        /**
         *取消所有上传
         */
        cancelAllUpload: function () {
            for (var o in uploadlist.files) {
                uploadlist.files[o].status = 'cancel';
            }
            if (self.xhr) {
                self.xhr.abort();
            }
            self.setListStatus('-');
            self.deleteAllFile();
            self.updateFilelistTitle();
        },
        /**
         * 删除待上传的文件
         * @param fileId
         */
        deleteFile:function(fileId){
            for(var o in uploadlist.files){
                if(uploadlist.files[o].id==fileId){
                    uploadlist.files.splice(o,1);
                    break;
                }
            }
        },
        /**
         * 删除所有待上传的文件列表
         */
        deleteAllFile:function(){
            uploadlist.files=[];
        },
        /**
         * 获取文件上传状态 (swffilelist 回调用到)
         * @returns {{stats: {upload_cancelled: boolean}, files_queued: *, in_progress: number}}
         */
        getStats: function () {
            var num=0;
            var isCancel=false;
            for (var i=0;i<uploadlist.files.length;i++) {
                if(uploadlist.files[i].isUpload !==true){
                    num++;
                }
                if(uploadlist.files[i].status == 'cancel'){
                    isCancel=true;
                }
            }
            return {
                stats:{
                    upload_cancelled:isCancel
                },
                files_queued:num,
                in_progress:num
            };
        },
        /**
         * 更新上传列表的标题
         */
        updateFilelistTitle:function(){
            var $title= $("#upload_txt");
            var str="";
            if(self.getListStatus()=='upload'){
                str=_('正在上传');
            }else if(self.getListStatus()=="complete"){
                str=_('已完成');
            }
            $title.text(str);
        }
    };
    return uploadHTML5;
});