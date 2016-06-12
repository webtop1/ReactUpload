define('lenovodata/util', function(require, exports, module) {
    var $ = require('jquery');
    var Tips = require('component/tips');
    var Wait = require('component/wait');
    require('i18n');
    var _ = $.i18n.prop;

    var unknownErrMessage = _('很抱歉，您的操作失败了，建议您重试一下！');

    var retVal = { code: null, data: null, message: unknownErrMessage };

    $.fn.selectRange = function(start, end) {
        return this.each(function() {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };

    $(document).ajaxComplete(function(event, jqXHR, options) {
        if (jqXHR.status == 402) {
            alert(_("许可证失效"));
        }
    });

    Array.prototype.indexOf = function(key) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == key)
                return i;
        }
        return -1;
    };
    return {
        log: function(msg, type) {
            window.console &&
                (type || (type = "log")) && console[type](msg)
        },
        unknownErrMessage: unknownErrMessage,
        //确认提示confirm
        publick_confirm: function() {
            var r = confirm(CONFIRM_DELETE + "?");
            if (r) {
                return true;
            } else {
                return false;
            }
        },

        //     产生10位随机数，理论上839299365868340224次才会出现一次碰撞
        random: function() {
            var baseStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var r = "",
                n = 10;
            for (var i = 0; i < n; i++) r += baseStr.charAt(Math.floor(Math.random() * 62));
            return r;
        },

        //普通数组去重.对象数组需要添加属性对比
        unique1: function(arr) {
            var n = [];
            for (var i = 0; i < arr.length; i++) {
                var sign = true;
                for (var j = 0; j < n.length; j++) {
                    if (n[j] == arr[i]) {
                        sign = false;
                    }
                }
                if (sign === true) {
                    n.push(arr[i]);
                }
            }
            return n;
        },

        /*获取页面的高和宽*/
        getTotalHeight: function() {
            if (/msie/.test(navigator.userAgent.toLowerCase())) {
                return document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
            } else {
                return self.innerHeight;
            }
        },

        getTotalWidth: function() {
            if ($.browser.msie) {
                return document.compatMode == "CSS1Compat" ? document.documentElement.clientWidth : document.body.clientWidth;
            } else {
                return self.innerWidth;
            }
        },

        validEmail: function(email) {
            var emailtest = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
            return emailtest.test(email);
        },

        //手机号
        validMobile: function(value) {
            var mtest = /^1[3|4|5|8|7]\d{9}$/;
            return mtest.test(value);
        },

        //电话号码
        validPhone: function(phone) {
            var reg = /(^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
            return reg.test(phone);
        },

        validNumber: function(number) {
            var reg = /^\d+$/;
            return reg.test(number);
        },

        validFilename: function(filename) {
            var reg = /[\/:*?"<>|\\]/;
            var reg1 = /^[.]/;
            if (reg.test(filename)) {
                Tips.warn(_('文件夹名称不能包括下列任何字符') + ' : \\/:*?"<>|');
                return false;
            }
            if (reg1.test(filename)) {
                Tips.warn(_('文件夹名称不能以.开头'));
                return false;
            }
            return true;
        },

        validInput: function(input, message) {
            var reg = /[\^\.*<>%&',;=?$"':#@!~\]\[{}\\/`\|\+\-\(\)]/;
            if (reg.test(input.val())) {
                Tips.warn(message ? message : _('不能包括特殊字符'));
                input.focus();
                return false;
            }
            return true;
        },
        //企业定制页面验证输入内容是否含有特殊字符
        validInputVal: function(input) {
            var reg = /[\^\.*<>%&',;=?$￥·——、=+"':#@!~\]\[{}\\/`\|\+\-\(\)]/;
            if (reg.test(input.val())) {
                input.focus();
                return true;
            }
            return false;
        },

        //input框在获得焦点和失去焦点后，修改input框中的颜色值
        focusAndBlurChTtColor: function(id, focusColor, blurColor) {
            //初始化
            $.each($(id).find('input'), function(n, obj) {
                if ($.trim($(obj).val()) == '' || $.trim($(obj).val()) == $(obj).attr('placeholder')) {
                    $(obj).css('color', blurColor);
                }
            })
            $(id).find(':text').focus(function() {
                var obj = $(this);
                if (obj.val() == obj.attr('def')) {
                    obj.css("color", focusColor);
                    obj.val('');
                    if (obj.attr("id") == "pwd" || obj.attr("id") == "pwd2") {
                        obj.attr('type', 'password');
                    }
                } else {
                    obj.css("color", focusColor);
                }
            });
            $(id).find(':password').focus(function(event) {
                //$(event.target).closest('.pwdparent').find('.pwtip').css('display','none');
                $(this).css('color', focusColor);
                $(event.target).closest('.pwdparent').find('.pwtip').hide();
            });
            $(id).find(':password').blur(function(event) {
                if ($.trim($(event.target).val()) == '') {
                    $(event.target).closest('.pwdparent').find('.pwtip').show();
                } else {
                    $(event.target).closest('.pwdparent').find('.pwtip').hide();
                }
            });
            $(id).find(':password').closest('.pwdparent').find('.pwtip').bind('focus, click', function(event) {
                $(event.target).hide();
                $(event.target).closest('.pwdparent').find(':password').focus();
            });

            $(id).find(':text').blur(function() {
                var obj = $(this);
                if (!obj.val()) {
                    obj.css("color", blurColor);
                    obj.val($(this).attr('def'));
                    if (obj.attr("id") == "pwd" || obj.attr("id") == "pwd2") {
                        obj.attr('type', 'text');
                    }
                }
            });
            $(id).find('textarea').focus(function() {
                var obj = $(this);
                if (obj.val() == obj.attr('def')) {
                    obj.css("color", focusColor);
                    obj.val('');
                } else {
                    obj.css("color", focusColor);
                    if (/msie/.test(window.navigator.userAgent.toLocaleLowerCase()) && obj.val() == '') {
                        obj.val('');
                    }
                }
            });
            $(id).find('textarea').blur(function() {
                var obj = $(this);
                if (!obj.val()) {
                    obj.css("color", blurColor);
                    obj.val($(this).attr("def"));
                }
            });

        },
        ajax_json_process_user_batch_result: function(xhr, textStatus, successMsg) {
            var data = xhr.responseJSON ? xhr.responseJSON : { message: unknownErrMessage };
            data || (data = {});

            switch (xhr.status) {
                case 200:
                    var message = [];
                    for (var i = 0, len = data.length; i < len; i++) {
                        if (data[i]["status"] != 200) {
                            message.push(data[i].message);
                        }
                    }

                    if (message.length > 0) {
                        retVal = { code: 500, data: data, message: message };
                    } else {
                        retVal = { code: 200, data: data, message: data[0].message };
                    }
                    break;
                case 401:
                    this.invalidSession();
                    return;
                case 402:
                    retVal = { code: xhr.status, data: null, message: _("License已失效") };
                    break;
                case 400:
                case 403:
                case 404:
                case 409:
                    retVal = { code: xhr.status, data: null, message: data.message };
                    break;
                default:
                    retVal = { code: xhr.status, data: data, message: data.message };
                    break;
            }
            return retVal;
        },
        ajax_json_process_batch_result: function(xhr, textStatus, successMsg) {
            var data = xhr.responseJSON ? xhr.responseJSON : { message: unknownErrMessage };
            data || (data = {});
            successMsg || (successMsg = _("成功"));

            if (data.content === undefined) data.content = [];
            if (data.failed === undefined) data.failed = [];

            switch (xhr.status) {
                case 200:
                case 207:
                    var message = [];
                    for (var i = 0, len = data.failed.length; i < len; i++) {
                        if (message.indexOf(data.failed[i].message) == -1)
                            message.push(data.failed[i].message);
                    }

                    if (message.length > 0) {
                        retVal = { code: 500, data: null, message: message };
                    } else {
                        retVal = { code: 200, data: data.success, message: successMsg };
                    }
                    break;
                case 401:
                    this.invalidSession();
                    return;
                case 402:
                    retVal = { code: xhr.status, data: null, message: _("License已失效") };
                    break;
                case 304:
                case 400:
                case 403:
                case 404:
                case 406:
                case 409:
                    retVal = { code: xhr.status, data: null, message: data.message };
                    break;
                default:
                    retVal = { code: xhr.status, data: null, message: data.message };
                    break;
            }
            return retVal;
        },
        ajax_json_process_normal_result: function(xhr, textStatus, successMsg) {
            var data = xhr.responseJSON ? xhr.responseJSON : { message: unknownErrMessage };
            data || (data = {});
            successMsg || (successMsg = _("成功"));

            if (data.content === undefined) data.content = [];

            switch (xhr.status) {
                case 200:
                    retVal = { code: 200, data: data, message: successMsg };
                    break;
                case 207:
                    var message = [];
                    for (var i = 0, len = data.failed.length; i < len; i++) {
                        message.push(data.failed[i].message);
                    }

                    retVal = { code: 500, data: null, message: message };
                    break;
                case 401:
                    if (data.code == "invalid password/token") {
                        retVal = { code: 401, data: data, message: data.message };
                        break;
                    }
                    this.invalidSession();
                    return;
                case 402:
                    retVal = { code: xhr.status, data: null, message: _("请先导入license") };
                    break;
                case 403:
                    retVal = { code: data.state, data: data, message: data.message };
                    break;
                case 304:
                case 400:

                case 404:
                case 406:
                case 409:
                    retVal = { code: xhr.status, data: null, message: data.message };
                    break;
                default:
                    retVal = { code: xhr.status, data: null, message: data.message };
                    break;
            }
            return retVal;
        },
        _generateURLStr: function(url) {
            var account_id_add = this.getAccountId(),
                uid_add = this.getUserID();
            if (uid_add && account_id_add) {
                if (url.indexOf('?') == -1) {
                    url += "?account_id=" + account_id_add;
                } else {
                    url += "&account_id=" + account_id_add;
                }
                url += "&uid=" + uid_add;
            }
            return url;
        },
        ajax_json_get_nowait: function(url, callback) {
            url = encodeURI(url);
            url = url.replace(/\+/g, '%2B');
            url = url.replace(/#/g, '%23');
            if (url.indexOf('?') == -1) {
                url += "?_=" + (+new Date());
            } else {
                url += "&_=" + (+new Date());
            }
            url = this._generateURLStr(url);
            $.ajax({
                type: 'GET',
                url: url,
                async: true,
                dataType: 'json',
                complete: function() {
                    callback.apply(this, arguments);
                }
            });
        },
        ajax_json_get: function(url, callback) {
            url = encodeURI(url);
            url = url.replace(/\+/g, '%2B');
            url = url.replace(/#/g, '%23');
            if (url.indexOf('?') == -1) {
                url += "?_=" + (+new Date());
            } else {
                url += "&_=" + (+new Date());
            }
            if (url.indexOf('config/get') < 0) {
                url = this._generateURLStr(url);
            }
            var wait = new Wait();
            $.ajax({
                type: 'GET',
                url: url,
                async: true,
                dataType: 'json',
                complete: function() {
                    try {
                        wait.close();
                        callback.apply(this, arguments);
                    } catch (e) {
                        wait.close();
                    }
                },
                error: function() { wait.close(); }
            });
        },
        ajax_json_post_nowait: function(url, postData, callback) {
            url = encodeURI(url);
            url = url.replace(/\+/g, '%2B');
            url = url.replace(/#/g, '%23');
            url = this._generateURLStr(url);
            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                async: true,
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                complete: function() {
                    callback.apply(this, arguments);
                }
            });
        },
        ajax_json_post: function(url, postData, callback) {
            url = encodeURI(url);
            url = url.replace(/\+/g, '%2B');
            url = url.replace(/#/g, '%23');
            url = this._generateURLStr(url);
            var wait = new Wait();
            var self = this;
            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                async: true,
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                complete: function() {
                    try {
                        wait.close();
                        callback.apply(this, arguments);
                        self.sendBuridPointRequest();
                    } catch (e) {
                        wait.close();
                    }
                },
                error: function() { wait.close(); }
            });
        },
        _formatUnits: function(baseNumber, unitDivisors, unitLabels, singleFractional, fixed) {
            var i, unit, unitDivisor, unitLabel;
            if (typeof fixed != 'number') {
                fixed = 2;
            }
            if (baseNumber === 0) {
                return "0 " + unitLabels[unitLabels.length - 1];
            }

            if (singleFractional) {
                unit = baseNumber;
                unitLabel = unitLabels.length >= unitDivisors.length ? unitLabels[unitDivisors.length - 1] : "";
                for (i = 0; i < unitDivisors.length; i++) {
                    if (baseNumber >= unitDivisors[i]) {
                        unit = (baseNumber / unitDivisors[i]).toFixed(fixed);
                        unitLabel = unitLabels.length >= i ? " " + unitLabels[i] : "";
                        break;
                    }
                }

                return unit + unitLabel;
            } else {
                var formattedStrings = [];
                var remainder = baseNumber;

                for (i = 0; i < unitDivisors.length; i++) {
                    unitDivisor = unitDivisors[i];
                    unitLabel = unitLabels.length > i ? " " + unitLabels[i] : "";

                    unit = remainder / unitDivisor;
                    if (i < unitDivisors.length - 1) {
                        unit = Math.floor(unit);
                    } else {
                        unit = unit.toFixed(0);
                    }
                    if (unit > 0) {
                        remainder = remainder % unitDivisor;
                        formattedStrings.push(unit + unitLabel);
                    }
                }

                return formattedStrings.join(" ");
            }
        },

        /**
         * byte格式化
         */
        formatBytes: function(baseNumber, fixed) {
            var sizeUnits = [1099511627776, 1073741824, 1048576, 1024, 1],
                sizeUnitLabels = ["TB", "GB", "MB", "KB", "B"];
            return this._formatUnits(baseNumber, sizeUnits, sizeUnitLabels, true, fixed);
        },

        formatTime: function(baseNumber) {
            var timeUnits = [86400, 3600, 60, 1],
                timeUnitLabels = [_('天'), _('时'), _('分'), _('秒')];
            return this._formatUnits(baseNumber, timeUnits, timeUnitLabels, false);
        },

        /**
         * 文件是否能预览
         */
        canPreview: function(mime, isLink) {
            if (isLink && this.isVideo(mime)) {
                return false;
            }
            if (this.isImage(mime) || this.isVideo(mime) || /\.txt/.test(mime)) {
                return true;
            }
            if (this.isChrome() && typeof sys_config != "undefined" && (sys_config.custom_preview_type != "owa")) {
                return false;
            }
            return /\.doc|pdf|ppt|txt|xls|docx|pptx|xlsx|png|jpeg|jpg|gif|bmp|JPEG|JPG|GIF|BMP|pic|word|excel|mp4|wma|mp3/.test(mime);
        },

        /**
         * 文件能否编辑 （文档）
         */
        canEdit: function(mime) {
            if (this.isImage(mime) || this.isVideo(mime)) {
                return false;
            }
            if (this.isChrome() || sys_config.custom_preview_type == "owa") {
                return false;
            }
            return /\.doc|ppt|xls|docx|pptx|xlsx/.test(mime);
        },
        /**
         * 是否为图片
         * @param mime
         */
        isImage: function(mime) {
            return /\.png|jpeg|jpg|bmp|gif|JPEG|JPG|GIF|BMP/.test(mime)
        },
        /**
         * 是否为音视频
         * @param mime
         * @returns {boolean}
         */
        isVideo: function(mime) {
            return /\.avi|f4v|mpg|wma|mp4|flv|wmv|mov|3gp|rmvb|mkv|asf|264|ts|mts|vob|mp3|aac|flac|ape|wav|m4v/.test(mime);
        },
        /**
         * 是否为chrome浏览器
         */
        isChrome: function() {
            var rChrome = /(chrome)\/([\w.]+)/;
            return rChrome.exec(navigator.userAgent.toLowerCase()) || false;
        },

        /**
         * 是否为火狐浏览器
         */
        isMoz: function() {
            var rMoz = rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
            return rMoz.exec(navigator.userAgent.toLowerCase()) || false;
        },

        /**

         * 能否预览编辑
         */
        canPreviewEdit: function(mimeType) {
            if (this.isImage(mimeType)) {
                return true;
            }
            if (window.sys_config && window.sys_config.custom_preview_type == "owa") {
                return true;
            }
            //软航不支持chrome
            if (this.isChrome()) {
                return false;
            }
            //火狐暂不支持视频预览
            if (this.isMoz()) {
                return false;
            }
            return true;
        },
        /**
         * 解析路径, 返回 文件名和文件后缀 对象
         *@param path 路劲
         *@param flag 是否是文件夹
         */
        resolvePath: function(path, flag) {
            var regName = /\/([^\/]+)$/,
                exSuffix = /\.([^.]+)$/;
            var name, suffix;
            if (!path) return '';
            name = path.match(regName);
            if (!flag && name[1]) {
                suffix = name[1].match(exSuffix) || ['', ''];
            }
            return {
                name: name[1] || '',
                type: flag ? 'folder' : suffix[1].toLowerCase()
            }
        },
        /**
         * 解析文件夹类型
         *@param path 权限字符串
         */
        resolveFolderType: function(share) {
            var ret = 'folder';
            if (share) {
                ret = this.isAdmin() ? 'folder_team' : 'folder_share';
            }
            return ret;
        },
        /**
         * 解析权限, 返回 对应的汉字说明
         *@param path 权限字符串
         */
        resolveAuth: function(auth) {
            var permission = '';
            switch (auth) {
                case "r":
                    permission = _("下载");
                    break;
                case "w":
                    permission = _("上传");
                    break;
                case "rw":
                    permission = _("上传/下载");
                    break;
            }
            return permission;
        },
        /**
         * 解析权限id
         * @param auth 对应权限字符串
         */
        resolvePrivilegeID: function(auth) {
            //只对应八种授权
            var privilege_id = ""; //默认2009
            switch (auth) {
                case "preview":
                    privilege_id = "2009";
                    break;
                case "upload":
                    privilege_id = "2008";
                    break;
                case "upload:delivery":
                    privilege_id = "2007";
                    break;
                case "download":
                    privilege_id = "2006";
                    break;
                case "download:delivery":
                    privilege_id = "2005";
                    break;
                case "upload:download":
                    privilege_id = "2004";
                    break;
                case "upload:download:delivery":
                    privilege_id = "2003";
                    break;
                case "edit":
                    privilege_id = "2001";
                    break;
                default:
                    privilege_id = "2009";
            }
            return privilege_id;
        },
        resolveCSSAction: function(id) {
            var cssAction = "";
            switch ("" + id) {
                case "2009":
                    cssAction = "preview";
                    break;
                case "2008":
                    cssAction = "upload";
                    break;
                case "2007":
                    cssAction = "upload:delivery";
                    break;
                case "2006":
                    cssAction = "download";
                    break;
                case "2005":
                    cssAction = "download:delivery";
                    break;
                case "2004":
                    cssAction = "upload:download";
                    break;
                case "2003":
                    cssAction = "upload:download:delivery";
                    break;
                case "2001":
                    cssAction = "edit";
                    break;
                default:
                    cssAction = "preview";
            }
            return cssAction;
        },
        resolveFileAction: function(id) {
            var fileAction = "";
            switch ("" + id) {
                case "2047":
                    fileAction = "edit";
                    break;
                case "1048":
                    fileAction = "create_delivery";
                    break;
                case "1087":
                    fileAction = "upload:download:delivery";
                    break;
                case "1599":
                    fileAction = "upload:download:delivery";
                    break;
                case "1063":
                    fileAction = "upload:download";
                    break;
                case "1575":
                    fileAction = "upload:download";
                    break;
                case "1045":
                    fileAction = "download:delivery";
                    break;
                case "1557":
                    fileAction = "download:delivery";
                    break;
                case "1029":
                    fileAction = "download";
                    break;
                case "1541":
                    fileAction = "download";
                    break;
                case "1066":
                    fileAction = "upload:delivery";
                    break;
                case "1058":
                    fileAction = "upload";
                    break;
                case '1059':
                    fileAction = 'upload:preview';
                    break;
                case '1024':
                    fileAction = 'list';
                    break;
                case '0':
                    fileAction = 'noAction';
                    break;
                default:
                    fileAction = "preview";
            }
            return fileAction;
        },
        resolveActionCss: function(cssAction) {
            var action = 0;
            switch (cssAction) {
                case 'edit':
                    action = 2047;
                    break;
                default:
                    action = 1025;
            }
            return action;
        },
        //日期格式化
        formatDate: function(dateObj, fmt) {
            var year, month, date, hours, minutes, seconds;

            if (!dateObj) return;

            if (Object.prototype.toString.call(dateObj) == "[object Date]") {
                year = dateObj.getFullYear();
                month = dateObj.getMonth() + 1;
                date = dateObj.getDate();
                hours = dateObj.getHours();
                minutes = dateObj.getMinutes();
                seconds = dateObj.getSeconds();
            } else {
                var regexp = /([\d]{4})-([\d]{2})-([\d]{2})T([\d]{2}):([\d]{2}):([\d]{2})(?:\+([\d]{2}):([\d]{2}))?/
                var d = regexp.exec(dateObj);
                if (!d) return;
                year = d[1], month = d[2], date = d[3], hours = d[4], minutes = d[5], seconds = d[6];
            }
            var o = {
                "M+": +month, //月份
                "d+": +date, //日
                "h+": +hours, //小时
                "m+": +minutes, //分
                "s+": +seconds, //秒
                "q+": Math.floor((+month + 3) / 3) //季度
                    //"S": d.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (year + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },

        /**
         * 科学计数数字转换为字符串
         * 只考虑系统自动转换的科学计数，不考虑0.123e+7等形式
         *@param sn 科学计数
         */
        scientificToString: function(sn) {
            var n = sn.toString(),
                output = '';
            var negative = /([\d\.]+)e-(\d+)/i.exec(n),
                positive = /([\d\.]+)e\+(\d+)/i.exec(n);
            if (negative) {
                var num = negative[1].replace('.', ''),
                    numDecs = negative[2] - 1;
                output = "0.";
                for (var i = 0; i < numDecs; i++) {
                    output += "0";
                }
                output += num;
            } else if (positive) {
                var idx = positive[1].indexOf('.')
                idx < 0 && (idx = 0);

                var num = positive[1].replace('.', ''),
                    numDecs = positive[2] - num.length + idx;
                for (var i = 0; i < numDecs; i++) {
                    output += "0";
                }
                output = num + output;
            } else {
                return n.toString();
            }
            return output;
        },

        haveDirAuth: function(fileObj) {
            return this.isAdmin() || (fileObj && fileObj.authable);
            /*
            if(!this.isAdmin() && fileObj.isfolder){
                if (this.isTeamLeader() ) {
                    if (fileObj.team && this.isOwner(fileObj.creator)) { //团队文件夹，并且是这个文件夹的创建者，可以授权
                        return true;
                    } else {
                        return false;
                    }
                } else { //个人用户不能对目录授权
                   return false;
                }
            }
            return true;
            */
        },

        isOwner: function(creator) {
            return window.LenovoData.user && window.LenovoData.user.user_info.user_name == creator;
        },

        isAdmin: function() {
            return this.isBusiness();
        },
        isTeamLeader: function() {
            return window.LenovoData.user && window.LenovoData.user.team_role == "admin";
        },
        getUserID: function() {
            if (window.LenovoData) {
                return window.LenovoData.user ? window.LenovoData.user.user_info.uid : -1;
            }
            return -1;
        },
        isUser: function() {
            return !this.isAdmin() && !this.isTeamLeader();
        },
        isTrialUser: function() {
            return window.LenovoData && window.LenovoData.user.account_info.type == "trial";
        },
        isBusiness: function() {
            return (window.LenovoData && window.LenovoData.user.user_role & 4) == 4;
        },
        isSafety: function() {
            return (window.LenovoData && window.LenovoData.user.user_role & 2) == 2;
        },
        isMember: function() {
            return (window.LenovoData && window.LenovoData.user.user_role & 1) == 1;
        },
        isRuler: function() {
            return this.isBusiness() || this.isSafety();
        },
        getUserSpaceUsed: function() {
            return window.LenovoData && window.LenovoData.user.user_info.used;
        },
        getUserSpaceQuota: function() {
            return window.LenovoData && window.LenovoData.user.user_info.quota;
        },
        getUserName: function() {
            return window.LenovoData && window.LenovoData.user.user_info.user_name;
        },
        //获取主帐户空间大小数及已使用空间大小数
        getUserAccountSpaceUsed: function() {
            return window.LenovoData && window.LenovoData.user.account_info.space.used;
        },
        getUserAccountSpaceQuota: function() {
            return window.LenovoData && window.LenovoData.user.account_info.space.limit;
        },
        //获取主帐户用户数及已使用用户数
        getUserAccountNumUsed: function() {
            return window.LenovoData && window.LenovoData.user.account_info.user_num.used;
        },
        getUserAccountNumQuota: function() {
            return window.LenovoData && window.LenovoData.user.account_info.user_num.limit;
        },

        getRootDisplayName: function(type) {
            var self = this;
            var name = '';
            switch (type) {
                case 'ent':
                    name = _(sys_config["custom_company_space_" + $.cookie('language') + "_name"]);
                    break;
                case 'self':
                    name = _(sys_config["custom_my_space_" + $.cookie('language') + "_name"]);
                    break;
                case 'share_out':
                    name = _("我的共享");
                    break;
                case 'share_in':
                    name = _("收到的共享");
                    break;
                case 'favorite':
                    name = _("我的收藏");
                    break;
                default:
                    name = _(sys_config["custom_my_space_" + $.cookie('language') + "_name"]);
                    break;
            }
            return name;
        },
        invalidSession: function() {
            window.location.href = "/user/login";
        },
        //3.7之后，此方法作废
        getStorageUrlForPreview: function() {
            var url = (parent.window.LenovoData && parent.window.LenovoData.storage_url) ? parent.window.LenovoData.storage_url : "";
            return "";
        },
        //3.7之后，此方法作废
        getStorageUrl: function() {
            var url = (window.LenovoData && window.LenovoData.storage_url) ? window.LenovoData.storage_url : "";
            return url;
        },
        queryString: function(str) {
            str = str.substr(1);
            var keyValArr = str.split("&");
            var keyValObj = {};
            for (var i = 0, len = keyValArr.length; i < len; i++) {
                var a = keyValArr[i].split("=");
                if (a.length > 1) {
                    keyValObj[a[0].toLowerCase()] = a[1];
                }
            }
            return keyValObj;
        },
        isPathRoot: function(path) {
            var isNotRoot = /\/.+?\/.+/.test(path);
            return !isNotRoot;
        },
        errorLog: function(flags, errcode, message) {
            var msg = message || "";
            this.sendLog('flags=' + flags, "errcode=" + errcode, "message=" + encodeURIComponent(message));
        },

        sendLog: function() {
            /* var param =[];
             for(var i=0,len=arguments.length; i<len; i++) {
                 param.push(arguments[i]);
             }
             var userId = this.getUserID();
             param.push("uid=" + userId);
             var statUrl = "/st.php?" + param.join("&");
             this.ajax_json_get(statUrl);*/
        },
        getElementYPos: function(el) {
            var offset = el ? el.offsetTop : '';
            if (el && el.offsetParent != null)
                offset += this.getElementYPos(el.offsetParent);
            return offset;
        },
        getElementXPos: function(el) {
            var offset = el ? el.offsetLeft : '';
            if (el && el.offsetParent != null)
                offset += this.getElementXPos(el.offsetParent);
            return offset;
        },
        //获取字符长度
        getBytes: function(str) {
            var len = str.length;
            var bytes = len;
            for (var i = 0; i < len; i++) {
                if (str.charCodeAt(i) > 255) bytes++;
            }
            return bytes;
        },
        /**
         * 截取字符串
         * @param str
         * @param len
         */
        subString: function(str, len) {
            var endIndex = len;
            var strLen = str.length;
            for (var i = 0; i < len; i++) {
                if (str.charCodeAt(i) > 255) {
                    endIndex--;
                    strLen++;
                }
            }
            var rs = str;
            if (strLen > len) {
                rs = str.substring(0, endIndex) + "...";
            }
            return rs;
        },
        getAccountId: function() {
            if (window.LenovoData) {
                return window.LenovoData.user ? window.LenovoData.user.account_info._id : -1;
            }
            return -1;
        },
        checkFlashInstalled: function() {
            var isInstalled = true;
            if (/msie/.test(navigator.userAgent.toLowerCase())) {
                try {
                    flashObject = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                } catch (e) {
                    isInstalled = false;
                }
            } else {
                if (!navigator.plugins["Shockwave Flash"])
                    isInstalled = false;
            }
            return isInstalled;
        },
        //通过正则获取顶级团队名
        getTopTeamName: function(path) {
            //  eg: /top/team/name/abc/c  => top
            //                       /top => top
            var reg1 = /^\/([^\/]+)$/,
                reg2 = /^\/([^\/]+)([\/\S]+)$/;
            var name = path.match(reg1);
            if (name && name[1]) {
                return name[1];
            } else {
                name = path.match(reg2);
                if (name && name[1])
                    return name[1];
            }
            return path.split("\/")[1];
        },
        /**
         * 获取团队管理员团队路径  /top/team  =>/top(team)/team
         *                  /top       =>/top(team)
         */
        getTeamAdminTeamPath: function(path) {
            var reg1 = /^\/([^\/]+)$/,
                reg2 = /^\/([^\/]+)([\/\S]+)$/;
            var name = path.match(reg1);
            if (name && name[1]) {
                return path + "(team)";
            } else {
                name = path.match(reg2);
                if (name && name[1])
                    return "/" + name[1] + "(team)" + name[2];
            }
            var t_names = path.split("\/");
            t_names[1] = t_names[1] + "(team)";
            return t_names.join("/");
        },
        /**
         * 获取当前文件父级路径  /我的企业网盘/top1/top2/1.jpg => 我的企业网盘/top1/top2
         */
        getParentPath: function(path) {
            var parentPath = path.substring(0, path.lastIndexOf('/'));
            if (parentPath == '/') {
                parentPath = '';
            }
            return parentPath;
        },

        /**
         * 处理encodeURI后的特殊字符
         */
        getMyEncodeURI: function(path) {
            path = encodeURI(path).replace(/\&/g, '%26').replace(/#/g, '%23').replace(/\+/g, '%2B');
            return path;
        },
        buildRequestUrl: function(category, action, content) {
            //sahara.box.lenovo.com
            var uid = this.getUserID(),
                account_id = this.getAccountId(),
                url = " ";
            var param = [];
            param.push('ca=' + category);
            param.push('ac=' + action);
            param.push('co=' + content);
            param.push('uid=' + uid);
            param.push('aid=' + account_id);
            param.push('_=' + new Date().getTime());
            return url + '' + encodeURI(param.join('&'));
        },
        sendDirectlyRequest: function(category, action, content) {
            var self = this;
            var image = new Image();
            image.src = '';
            if (image.complete) {} else {
                try {
                    image.onload = function() {}
                    image.onerror = function() {}
                } catch (e) {}
            }
        },
        sendBuridPointRequest: function() {
            var action = $("body").data("action"),
                category = $("body").data("category"),
                content = $("body").data("content");
            var map = {
                preview: '预览',
                move: '移动',
                rename: '重新命名',
                'delete': '删除',
                copy: '复制',
                download: '下载',
                share: '外链',
                rmShare: '取消外链',
                remove: '删除',
                recover: '恢复已经删除',
                purge: '永久删除',
                addfolder: '新建目录',
                attribute: '属性',
                remarkEdit: '编辑备注',
                cleanup: '设置定期清理',
                history: '历史版本',
                activate: '激活',
                frozed: '激活',
                frozen: '冻结',
                useredit: '设置',
                edit: '设置',
                subtract: '移出团队',
                kickoff: '移出团队',
                create: '创建',
                'import': '批量导入',
                add: '添加',
                update: '修改',
                auth: '权限',
                authedit: '编辑授权',
                addauth: '添加授权',
                rmAuth: '删除授权',
                login: '登录/注销',
                box: '网盘设置',
                message: '公告',
                modify: '修改',
                send: '发送',
                lookup: '访问',
                deleteTeam: '删除',
                teamSetting: '修改',
                adduser: '添加用户',
                linkdownload: '外链',
                linkpreview: '外链',
                upload: '上传',
                historyrecover: '历史版本',
                lock: '锁定',
                unlock: '解锁',
                exitshare: '退出共享',
                cancelauth: '取消共享',
                transfer: '移交权限',
                notice: '消息设置'
            };
            var ca = "",
                param = [];
            if (map[category]) {
                ca = map[category];
            }
            var pathname = location.pathname;
            if ('rename' == category || 'recover' == category || 'purge' == category || 'remove' == category || 'addfolder' == category || ('delete' == category && pathname == '/')) {
                this.sendDirectlyRequest('文件列表', action + ca, content);
            } else if ('copy' == category || 'move' == category) {
                this.sendDirectlyRequest('网盘移动复制', action + ca, content);
            } else if ('auth' == category) {
                this.sendDirectlyRequest(ca, '确定', content);
            } else if ('share' == category) {
                this.sendDirectlyRequest('设置外链', action + '创建', content);
            } else if ('modify' == category || 'send' == category) {
                this.sendDirectlyRequest('设置外链', action + ca, content);
            } else if ('linkdownload' == category || 'linkpreview' == category) {
                this.sendDirectlyRequest('使用外链', action, content);
            } else if ('rmShare' == category || 'delete' == category && pathname == '/link/list') {
                this.sendDirectlyRequest('设置外链', '删除外链', content);
            } else if ('import' == category) {
                this.sendDirectlyRequest('用户/团队', '批量导入', '用户');
            } else if ('deleteTeam' == category || 'teamSetting' == category || 'add' == category) {
                this.sendDirectlyRequest('用户/团队', ca, '团队');
            } else if ('adduser' == category || 'subtract' == category || 'kickoff' == category) {
                this.sendDirectlyRequest('用户/团队', '添加删除用户', '团队');
            } else if ('addauth' == category || 'authedit' == category || ('auth' == category && pathname == '/user/manage')) {
                this.sendDirectlyRequest('用户/团队', '编辑授权', '团队');
            } else if ('useredit' == category || 'edit' == category) {
                this.sendDirectlyRequest('用户/团队', '修改设置', '用户');
            } else if ('activate' == category || 'frozed' == category || 'frozen' == category || 'create' == category) {
                this.sendDirectlyRequest('用户/团队', ca, '用户');
            } else if ('remarkEdit' == category || 'cleanup' == category) {
                this.sendDirectlyRequest('属性', action + ca, content);
            } else if ('historyrecover' == category) {
                this.sendDirectlyRequest('历史版本', action, content);
            } else {
                this.sendDirectlyRequest(ca, action + ca, content);
            }
        },
        getApiVersion: function() {
            return '/v2';
        },
        dataInArray: function(obj, arr) {
            var flag = false;
            if (obj && arr && arr.length > 0) {
                for (var i in arr) {
                    if (obj.agent_type == "all" && arr[i].agent_type == "all") {
                        flag = true;
                    } else if (arr[i].agent_id == obj.agent_id && arr[i].agent_type == obj.agent_type) {
                        flag = true;
                    }
                }
            }
            return flag;
        },
        dataRepArray: function(ele, arr) {
            var obj = {};
            obj.flag = false;
            if (ele && arr && arr.length > 0) {
                for (var i in arr) {
                    if (ele.agent_type == "all" && arr[i].agent_type == "all") {
                        obj.flag = true;
                        obj.index = i;
                    } else if (arr[i].agent_id == ele.agent_id && arr[i].agent_type == ele.agent_type) {
                        obj.flag = true;
                        obj.index = i;
                    }
                }
            }
            return obj;
        },
        typeIcon: function(typeIcon) {
            var ImgType = typeIcon;
            var jar = {
                "folder_team": "folder_team",
                "folder_share": "folder_share",
                "folder": "folder",
                "doc": "word",
                "docx": "word",
                "rtf": "word",
                "txt": "text",
                "jpg": "pic",
                "JPG": "pic",
                "jpeg": "pic",
                "JPEG": "pic",
                "png": "pic",
                "BMP": "pic",
                "bmp": "pic",
                "gif": "pic",
                "GIF": "pic",
                "tiff": "pic",
                "pcx": "pic",
                "psd": "pic",
                "thm": "pic",
                "yuv": "pic",
                "pps": "ppt",
                "ppsx": "ppt",
                "ppt": "ppt",
                "pptx": "ppt",
                "xls": "excel",
                "xlsx": "excel",
                "csv": "excel",
                "lock": "locks",
                "pct": "pdf",
                "pdf": "pdf",
                "pmd": "pdf",
                "mp3": "music",
                "aac": "music",
                "flac": "music",
                "ape": "music",
                "wma": "music",
                "ra": "music",
                "wav": "music",
                "mid": "music",
                "vqf": "music",
                "aif": "music",
                "au": "music",
                "dsp": "music",
                "cmf": "music",
                "cda": "music",
                "mod": "music",
                "iff": "music",
                "m3u": "music",
                "m4a": "music",
                "mpa": "music",
                "aiff": "music",
                "ac3": "music",
                "mur": "music",
                "mp2": "music",
                "amr": "music",
                "avi": "video",
                "mov": "video",
                "mpg": "video",
                "mp4": "video",
                "xv": "video",
                "3gp": "video",
                "divx": "video",
                "rm": "video",
                "rmvb": "video",
                "asf": "video",
                "wmv": "video",
                "vob": "video",
                "mkv": "video",
                "flv": "video",
                "3g2": "video",
                "asx": "video",
                "f4v": "video",
                "h.264": "video",
                "ts": "video",
                "mts": "video",
                "m4v": "video",
                "exe": "exe",
                "rar": "zip",
                "zip": "zip",
                "zipx": "zip",
                "7z": "zip",
                "cab": "zip",
                "arj": "zip",
                "jar": "zip",
                "lzh": "zip",
                "bin": "zip",
                "deb": "zip",
                "gz": "zip",
                "rpm": "zip",
                "sit": "zip",
                "sitx": "zip",
                "tar": "zip",
                "cad": "cad",
                "dxf": "cad",
                "psd": "ps",
                "ai": "ai",
                "dw": "dw",
                "fil": "fl",
                "id": "id",
                "ae": "ae",
                "3d": "3d",
                "eps": "svg",
                "svg": "svg",
                "cdr": "svg",
                "cdr": "svg",
                "pages": "other",
                "log": "other",
                "msg": "other",
                "wps": "other",
                "xps": "other",
                "chm": "other",
                "pdg": "other",
                "key": "other",
                "efx": "other",
                "sdf": "other",
                "vcf": "other",
                "wks": "other",
                "munbers": "other",
                "3dm": "other",
                "max": "other",
                "com": "other",
                "bat": "other",
                "scr": "other",
                "lib": "other",
                "app": "other",
                "cgi": "other",
                "gadget": "other",
                "vb": "other",
                "wsf": "other",
                "accdb": "other",
                "db": "other",
                "dbf": "other",
                "mdb": "other",
                "pdb": "other",
                "sql": "other",
                "cpl": "setting",
                "cur": "setting",
                "dll": "setting",
                "dmp": "setting",
                "drv": "setting",
                "lnk": "setting",
                "sys": "setting",
                "cfg": "setting",
                "ini": "setting",
                "keychain": "setting",
                "prf": "setting",
                "c": "cpp",
                "class": "cpp",
                "cpp": "cpp",
                "cs": "cpp",
                "dtd": "cpp",
                "fla": "cpp",
                "java": "cpp",
                "m": "cpp",
                "pl": "cpp",
                "py": "cpp",
                "html": "html",
                "htm": "html",
                "xhtml": "html",
                "php": "html",
                "css": "html",
                "js": "html",
                "xml": "html",
                "asp": "html",
                "cer": "html",
                "rss": "html",
                "ttf": "font",
                "fnt": "font",
                "otf": "font",
                "fon": "font",
                "dmg": "iso",
                "toast": "iso",
                "vcd": "iso",
                "iso": "iso"
            };
            var Extension;
            $.map(jar, function(key, value) {
                if (ImgType == value) {
                    Extension = key;
                }
            });

            if (Extension == undefined) {
                Extension = 'other';
            }
            typeIcon = Extension;
            return typeIcon;
        },
        getPathType: function() {
            var pathname = location.pathname;
            if ("/" == pathname) {
                return "ent";
            } else if ("/folder/self" == pathname) {
                return "self";
            } else if ("/folder/myshare" == pathname) {
                return "share_out";
            } else if ("/folder/shared" == pathname) {
                return "share_in";
            } else {
                return "self";
            }
        },

        getPrivatePrivilege: function(cssAction) {
            //自定义权限定义什么就是什么权限，都是单个原子权限
            //组合权限则可能不一定具有本身的权限
            //eg:上传者可以有创建目录的权限
            //eg:下载者可以预览还可以复制，仅仅下载又无法预览和复制，
            //    所以要剔除原子下载权限(download0)
            return {
                canPreview: /preview|edit|download\b|download-\w+/.test(cssAction),
                canUpload: /upload|edit/.test(cssAction),
                canDownload: /download|edit/.test(cssAction),
                canLink: /delivery|edit/.test(cssAction),
                canCreate: /create|edit|upload\b|upload-\w+/.test(cssAction),
                canDelete: /delete|edit/.test(cssAction),
                canRename: /rename|edit/.test(cssAction),
                canMove: /move|edit/.test(cssAction),
                canCopy: /copy|download\b|download-\w+|edit/.test(cssAction)
            };
        },
        /**
         *
         * @param startTime
         * @param endTime
         * @param diffType
         * @returns {Number}
         * @constructor
         */

        GetDateDiff: function(startTime, endTime, diffType) {
            //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
            startTime = startTime.replace(/\-/g, "/");
            endTime = endTime.replace(/\-/g, "/");
            //将计算间隔类性字符转换为小写
            diffType = diffType.toLowerCase();
            var sTime = new Date(startTime); //开始时间
            var eTime = new Date(endTime); //结束时间
            //作为除数的数字
            var divNum = 1;
            switch (diffType) {
                case "second":
                    divNum = 1000;
                    break;
                case "minute":
                    divNum = 1000 * 60;
                    break;
                case "hour":
                    divNum = 1000 * 3600;
                    break;
                case "day":
                    divNum = 1000 * 3600 * 24;
                    break;
                default:
                    break;
            }
            return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
        },

        /*
         *获取cookie值
         * */
        getCookie: function(name) {
            var cookieName = encodeURIComponent(name) + "=",
                cookieStart = document.cookie.indexOf(cookieName);
            cookieValue = null;
            if (cookieStart > -1) {
                var cookieEnd = document.cookie.indexOf(";", cookieStart);
                if (cookieEnd == -1) {
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
            }
            return cookieValue;
        },

        acl: function(name) {
            if (!name) return false;
            return window.LenovoData.acl[name] ? window.LenovoData.acl[name] : false;
        },
        getSpaceName: function() {
            if (typeof sys_config != "undefined") {
                return sys_config["space_name_" + $.cookie('language')];
            }
            if (window.localStorage && localStorage.space_name_zh) {
                return localStorage.space_name_zh;
            }
            return "企业空间";
        },
        //设置企业名称等定制信息
        setNoticeConfig: function(params, func) {
            require.async('lenovodata/model/AccountManager', function(Account) {
                //设置用户配置信息
                Account.set_notice_config(function(retVal) {
                    func(retVal);
                }, "json=" + JSON.stringify(params));
            });
        },
        //更新站点信息
        updateSiteInfo: function() {
            var self = this;
            window.sys_config = {};
            updatePageInfo();

            function updatePageInfo(Account) {
                var info = window.LenovoData.custom_info;
                $(info).each(function() {
                    sys_config[this.name] = this.value;
                });
                if (sys_config["custom_product_" + $.cookie('language') + "_name"]) {
                    var str = document.title ? document.title + "-" : "";
                    document.title = str + sys_config["custom_product_" + $.cookie('language') + "_name"];
                }
                var len = 6;
                if ($.cookie('language')) {
                    len = 14;
                }
                if (sys_config["custom_company_space_" + $.cookie('language') + "_name"]) {
                    var companySpace = sys_config["custom_company_space_" + $.cookie('language') + "_name"];
                    var shortCompanySpace = companySpace;

                    if (companySpace.length > len) {
                        shortCompanySpace = companySpace.substring(0, len) + "...";
                    }
                    $("#m-home").find(".menu-text").text(shortCompanySpace);
                    $("#m-home").find(".menu-text").attr("title", companySpace);

                    var mySpace = sys_config["custom_my_space_" + $.cookie('language') + "_name"];
                    var shortMySpace = mySpace;
                    if (mySpace.length > len) {
                        shortMySpace = mySpace.substring(0, len) + "...";
                    }
                    $("#m-personal").find(".menu-text").text(shortMySpace);
                    $("#m-personal").find(".menu-text").attr("title", mySpace);
                }

            }
        },

        //判断是否有IE插件，有的话返回插件的版本号，没有返回""
        IEPlug: function() {
            try {
                if (this.isIE()) {
                    var IEPlug = document.getElementById('ieUplaoder');
                    if (IEPlug) {
                        return IEPlug.plugin_version;
                    } else {
                        return "";
                    }

                } else {
                    //非IE
                    /*var uploadPlug = navigator.plugins["name"]; //控件name
                     if(uploadPlug == null)
                     {
                     return false;
                     }*/
                    return "";
                }
            } catch (e) {
                return "";
            }
        }
    };
});
