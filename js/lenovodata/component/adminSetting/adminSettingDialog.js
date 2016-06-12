/**
 * Created by thliu-pc on 2015/6/2.
 */
define("component/adminSetting/adminSettingDialog", function (require, exports, module) {
    var $ = require("jquery"),
        Dialog = require("component/dialog"),
        ListView = require("component/listview"),
        UserModel = require("model/UserManager"),
        SearchBox = require("component/searchbox"),
        adminManager = require('model/AdminManager'),
        Tips = require("component/tips"),
        _ = $.i18n.prop;
        require("mustache");

    var STARTPAGE = 0;
    var PAGESIZE = 10;
    var isLoad = false;

    var $addAdmin = {};

    function adminSettingDialog(params) {
        this.info = {};
        this.params = params;
        this.init();
    }

    $.extend(adminSettingDialog.prototype, {
        init: function () {
            var self = this;
            self.innerHTML = $(["<div id='addAdmin'>",
                "<div class='search-box'></div>",
                "<div id='searchspacelist' class='box-list'><h2>" + _('网盘成员') + "</h2>",
                "<div class='lui-list lui-list-space'></div>",
                "</div>",
                "<div class='dialog-button-area'>",
                "<a class='dialog-button ok'>" + _("确定") + "</a>",
                "</div>",
                "</div>"].join(""));

            this.dialog =  new Dialog(_("添加管理员"), function (parentNode, func) {
                parentNode.addClass("exwraper");
                parentNode.append(self.innerHTML);
                if (/msie/.test(navigator.userAgent.toLowerCase())) {
                    parentNode.css("width", 400);
                }
                $addAdmin=$("#addAdmin");
                //搜索结果展示
                self.searchedlist(self.innerHTML);

                self.initEvent();
            });
        },

        searchedlist: function (inner) {
            var self = this;
            var list_config = {
                column: 1,
                reachEnd: function () {
                    if (isLoad) {
                        self.searchUserByPage();
                    }
                },
                template: '<li class="list-item" index="{{index}}"><span class="item-name">{{name}}</span><span class="item-team">{{email}}</span><span class="item-message"></span></li>'
            };
            self.searchedlist = new ListView($("#searchspacelist>.lui-list"), list_config);
            STARTPAGE=0;
            self.searchbox = new SearchBox($addAdmin.find(".search-box"), function (result) {
                var datas = self.processListViewData(result);
                self.searchedlist.render(datas);
                inner.find("#searchspacelist .lui-list").css('visibility', 'visible');
                isLoad = true;
                STARTPAGE = 1;
            }, STARTPAGE, PAGESIZE,"user");
            inner.find(".search-txt").attr("placeholder", _("输入用户名、邮箱搜索"));
        },

        /**
         * 事件绑定
         */
        initEvent:function(){
            var self=this;

            self.searchbox.on("close", function () {
                self.innerHTML.find("#searchspacelist .lui-list").css('visibility', 'hidden');
            });

            self.searchedlist.on("item-added", function (param) {
                self.setSelectUserStyle(param);
            });

            //复选框点击事件
            $addAdmin.delegate("input[name='userItem']", 'click', function () {
                var index=$(this).parent().parent().attr("index");
                self.searchedlist.fire('item-added', {index: index});
            });

            //默认加载数据
            $addAdmin.find(".i-search").trigger('click');

            self.innerHTML.find("a.ok").on("click", function (ev) {
                self.addAdmin();
            });
            self.innerHTML.find('a.cancel').on('click', function (ev) {
                self.dialog.close();
            })
        },
        /**
         * 处理返回的数据
         * @param result
         * @returns {Array}
         */
        processListViewData: function (result) {
            var datas = [];
            for (var i = 0; i < result.length; i++) {
                var data = result[i];
                datas.push({id: data.uid, name: data.user_name, team: data.team, email: data.email});
            }
            return datas;
        },
        /**
         *按页查询用户数据（滚动滚动条时用到）
         */
        searchUserByPage: function () {
            var self = this;
            var key =$addAdmin.find(".search-txt").val();
            isLoad = false;
            UserModel.list_for_pages(function (result) {
                STARTPAGE++;
                if (result.code == 200) {
                    var datas = self.processListViewData(result.data.content);
                    self.searchedlist.render(datas, true);
                }
                var len=$addAdmin.find(".list-item").length;
                if(result.data.total_size==len){
                    isLoad=false;
                }else{
                    isLoad = true;
                }
                self.searchedlist.scroll.scrollDelta(-STARTPAGE*3*90);
            },STARTPAGE, PAGESIZE,null,key);
        },

        /**
         * 设置选中的用户
         * @param param
         */
        setSelectUserStyle: function (param) {
            if (!param||(!param.index&&param.index!=0)) {
                return;
            }
            var self = this;
            var rowObj = $addAdmin.find(".list-item[index='"+param.index+"']");
            if (!rowObj.hasClass("selected")) {
                rowObj.addClass("selected");
            } else {
                rowObj.removeClass("selected");
                $(self.selected).each(function (i) {
                    if (this.index&&this.index == param.index && self.selected.splice) {
                        self.selected.splice(i, 1);
                    }
                });
                rowObj.find("input[name='userItem']").remove();
                return;
            }
            if (!self.selected) {
                self.selected = [];
            }
            self.selected.push(param);
            var checkbox = " <input type='checkbox' checked name='userItem' /> ";
            rowObj.find(".item-message").empty().append(checkbox);
        },

        /**
         * 添加管理员
         * @returns {boolean}
         */
        addAdmin: function () {
            var self = this;
            if (!self.selected) {
                Tips.warn(_("请选择一个用户"));
                return false;
            }
            var params = [];//{ uid: 27,role: 1},{}
            $(self.selected).each(function () {
                var o = {role: self.params.roleId, uid: this.id};
                params.push(o);
            });
            adminManager.add(params, function (result) {
                if (result.code == 200) {
                    self.dialog.close();
                    self.params.callback();
                }
            });
        }

    });
    return adminSettingDialog;
});
