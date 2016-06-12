/**
 * @fileOverview 共享移交，加载已经共享的用户
 * @author thliu-pc
 * @version 3.6.0.1
 * @updateDate 2015/11/24
 */
;
define("component/transfer/transfer_dialog", function(require, exports, module) {
    var $ = require("jquery"),
        Dialog = require("component/dialog"),
        ListView = require("component/listview"),
        SearchBox = require("component/searchbox"),
        UserModel = require("model/UserManager"),
        AuthModel = require("model/AuthManager"),
        Tips = require("component/tips"),
        Util = require('util'),
        AdminTransferAuthDialog = require("component/transfer/transfer_authdialog"),
        _ = $.i18n.prop;
    require("mustache");

    function TransferDialog(context, params) {
        for (var o in params[0]) {
            this[o] = params[0][o];
        }
    }
    $.extend(TransferDialog.prototype, {
        init: function() {
            var self = this;
            this.dialog = dialog = new Dialog(_("共享移交"), { "minHeight": "430px", "minWidth": "486px" }, function(parentNode, func) {
                var html = [];
                html.push('<div class="transfer_content_wrapper" id="transfer_content_folder"></div>');
                html.push('<div class="dialog-button-area">')
                html.push('<a  class="dialog-button ok disabled">' + _('确定') + '</a>');
                html.push('<a  class="dialog-button cancel">' + _('取消') + '</a>');
                html.push('</div>')
                parentNode.append(html.join(""));
                self.$dialog = parentNode;
                self.$transfer_content_folder = $("#transfer_content_folder");
                self.loadShareData();
                self.events();
            });
        },
        events: function() {
            var self = this;

            this.$transfer_content_folder.delegate('li', 'click', function() {
                var $this = $(this);
                if ($this.hasClass("li-item-no-result") || $this.hasClass("header")) {
                    return;
                }
                self.$transfer_content_folder.find(".selected").removeClass('selected');
                self.selectedIndex = $(this).attr("dataindex");
                $this.addClass('selected');
                self.updateBtnStatus();
            });

            var $container = this.$transfer_content_folder.parent();
            $container.find('.ok').click(function() {
                if ($(this).hasClass("disabled")) {
                    return;
                }
                var data = self.data[self.selectedIndex];
                self.dialog.hide(true);
                data.dialog = self.dialog;
                data.uid = self.uid;
                new AdminTransferAuthDialog(data, function() {});
            });
            $container.find('.cancel').click(function() {
                self.dialog.close();
            });
        },

        /**
         * 更新按钮状态
         */
        updateBtnStatus: function() {
            var self = this;
            var len = self.$transfer_content_folder.find(".selected").length;
            if (!len) {
                self.$dialog.find("a.ok").addClass("disabled");
            } else {
                self.$dialog.find("a.ok").removeClass("disabled");
            }
        },
        /**
         * 加载共享文件夹数据
         */
        loadShareData: function() {
            var self = this;
            AuthModel.list_by_operator(function(data) {
                var html = [];
                self.data = {};
                html.push("<ul>");
                html.push("<li class='header'><span class='col2'>\"" + self.userName + "\"" + _("的共享文件夹") + "</span><span  class='col3'>" + _("创建时间") + "</span></li>");
                $(data.data).each(function() {
                    var time = new Date(this.mtime);
                    html.push("<li dataindex=" + this.id + "><span class='col1'></span><span  class='col2'>" + this.path + "</span><span  class='col3'>" + Util.formatDate(time, _('yyyy-MM-dd') + ' hh:mm') + "</span></li>");
                    self.data[this.id] = this;
                });
                // if (!data.data || data.data == 'null') {
                //     html.push("<li class='li-item-no-result'>" + _("暂无共享数据") + "</li>")
                // }
                if (data.data.length == 0) {
                     html.push("<li class='li-item-no-result'>" + _("暂无共享数据") + "</li>")
                 }
                html.push("</ul>");
                self.$transfer_content_folder.append(html.join(""));
            }, self.uid, 1,0)
        }
    });
    return TransferDialog;
});
