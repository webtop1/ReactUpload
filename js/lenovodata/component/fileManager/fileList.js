;define('component/fileManager/fileList', function (require, exports) {
    var $ = jquery = require('jquery'),
        EventTarget = require('eventTarget'),
        FileModel = require('model/FileManager'),
        Favorite = require('component/fileManager/favorite_tools'),
        AuthModel = require('model/AuthManager'),
        Util = require('util'),
        Tips=require('tips'),
        Scroll = require('component/scroll');
        require('i18n');
        require('cookie');
        var _ = $.i18n.prop;
        require('mustache');

    function FileList(node, file_template, filedelete_template, folder_template, folderdelete_template, empty_template, cssAction, type, from, prefix_neid) {
        this.node = $.type(node) == 'string' ? $(node) : node;

        this.file_template = file_template;
        this.filedelete_template = filedelete_template;
        this.folder_template = folder_template;
        this.folderdelete_template = folderdelete_template;
        this.empty_template = empty_template;

        this.totalSize = 0;
        this.pageSize = 50;
        this.pages = 1;
        this.lastSize = 0;
        this.orderby = FileModel.ORDERBY.MTIME;
        this.includeDeleted = 'false';
        this.sort = FileModel.SORT.ASC;
        this.cssAction = cssAction;
        this.type = type;
        this.from = from;
        this.newFloder = [];
        this.prefix_neid = prefix_neid;
        //以下四项是为实时自适应屏幕宽度设计的参数
        this.checkboxWidth = 35;   //复选框图标的宽度
        this.iconWidth = 65;   //文件图标的宽度
        this.moreBtnWidth= 138;//更多按钮的宽度
        this.statusWidth = 85; //状态图标的宽度
        this.scrollBarWidth = 20; //滚动条的宽度

        this._init();
    }

    FileList.view_model = "list";
    $.extend(FileList.prototype, EventTarget, {
        _requestData: function (path, offset, limit, func, error, from, prefix_neid) {
            var self = this;
            var path_type = self.type;
            var filter = {
                path_type: path_type,
                include_deleted: self.includeDeleted,
                offset: offset,
                limit: limit,
                orderby: self.orderby,
                sort: self.sort
            };
            if (path_type == "share_in" && from) {
                filter.from = from;
            }
            if (path_type == "share_in" || path_type == "share_out") {
                self.prefix_neid && (filter.prefix_neid = self.prefix_neid);
            }
            //收藏页面走单独的查询收藏的方法
            if(path_type == "favorite"){
                Favorite.getItem(self,func);
            }else{
                FileModel.metadata(function (result) {
                    if (result.code == 200) {
                        var data = result.data, datas = [];
                        //将查询得到的metaData跟fileList进行绑定
                        for(var ii = 0,len = data.content.length;ii<len;ii++){
                            if(!self.metaData){
                                self.metaData = data.content;
                                break;
                            }else{
                                var len1 = self.metaData.length;
                                var flag = true;
                                for(var jj = 0;jj<len1;jj++){
                                    if(self.metaData[jj] == data.content[ii]){
                                       flag = false;
                                    }
                                }
                                if(flag){
                                    self.metaData.push(data.content[ii]);
                                }
                            }
                        }
                        self.totalSize = data.total_size;
                        self.authable = data.authable;
                        var map = [];
                        for (var i = 0, ii = data.content.length; i < ii; i++) {
                            var item = data.content[i];
                            var d = self._adapt(item);
                            datas.push(d);
                        }
                        if (path != '') {
                            file = Util.resolvePath(data.path, data.is_dir);
                            self.parentData = self._adapt(data);
                        }
                        if (func) func(datas);
                    } else {
                        if (error) error();
                    }
                }, '/' + path, filter);
            }
        },
        _adapt: function (item) {
            var self = this;
            var file = Util.resolvePath(item.path, item.is_dir);
            var typeIcon = file.type;
            if (item.is_dir) {
                if (item.is_shared&& item.is_team) {
                    typeIcon = "folder_team";
                } else if (item.is_shared) {
                    typeIcon = "folder_share";
                } else {
                    typeIcon = "folder";
                }
            }

            var d = {};
            d.isfolder = item.is_dir;
            d.isdelete = item.is_deleted;
            d.isShare = item.is_shared;
            d.is_bookmark = item.is_bookmark;
            d.bookmark_id = item.bookmark_id;
            d.thumbExist = item.thumb_exist;
            d.isTeam = item.is_team;
            d.type = typeIcon;
            d.typeIcon = Util.typeIcon(typeIcon);
            d.name = file.name;
            d.title = file.name;
            d.filename = file.name;
            d.size = Util.formatBytes(item.bytes);
            d.datetime = Util.formatDate(item.modified ||item.datetime, _('yyyy-MM-dd') + ' hh:mm'),
                d.path = item.path;
            d.path_type = item.path_type;
            d.creator = item.creator;
            d.updator = item.updator;
            d.creator_uid = item.creator_uid;
            d.neid = item.neid;
            d.prefix_neid = item.prefix_neid;
            d.from = item.from;
            d.hash = item.hash;
            d.action = Util.resolveFileAction(item.access_mode);
            d.languageAction = AuthModel.getAuthTitle(d.action);
            d.authable = item.authable;
            d.cssAction = Util.resolveFileAction(item.access_mode).replace(/:/g, "-");
            d.hasDelivery = item.delivery_code ||item.hasDelivery ? true : false;
            d.islocked = item.lock_uid ? true : false; //文件是否锁定
            d.unlockAdmin = (item.lock_uid == Util.getUserID()) || Util.isAdmin();//是否有解锁的权限（只有本人和管理员有权限）
            d.deliveryTitle = d.hasDelivery ? _('查看外链') : _('外链分享');
            d.deliveryCode = item.delivery_code;
            d.mimeType = item.mime_type;
            d.desc = item.desc;
            d.share_to_personal = item.share_to_personal;
            d.isshared = item.is_shared&& ("/folder/self" == location.pathname);
            d.owner = item.from_name;
            d.isImage = /image/.test(item.mime_type);
            if (item.is_shared) {
                if (!item.is_team)
                    d.category = _("共享文件夹");
                else
                    d.category = _("团队文件夹");
            } else {
                d.category = _("普通文件夹");
            }
            if (!d.isfolder) {
                d.rev = item.rev;
                d.version = item.rev_index > 999 ? '999+' : item.rev_index;
            }
            return d;
        },

        _renderList: function () {
            var self = this;
            self._requestData(self.path, 0, self.pages * self.pageSize, function (datas) {
                self.render(datas);
            }, function () {
            }, self.from, self.prefix_neid);


        },
        _init: function () {
            var self = this;
            $.cookie("orderby") && (self.orderby = $.cookie("orderby"));
            $.cookie("sort") && (self.sort = $.cookie("sort"));
            var filelist = $('<div class="lui-filelist"></div>'),
                header_template = (self.type == "favorite" ? $('#template_filelist_listheader_favorite').html():$('#template_filelist_listheader').html()),
                list_wraper = $('<div class="list-wraper list-view"></div>');
            var h = self.node.height() - self.node.find('.filelist-header').outerHeight();


            filelist.append(header_template);
            filelist.append(list_wraper);
            self.node.append(filelist);
            this.filelist = filelist;
            this.mode = FileList.view_model;

            list_wraper.height(h);

            self._initContextMenu();
            self._initDisplayModel(filelist);
            self._initSearchModel();
            self.paging = false;

            //初始化文件排序Combox
            $('#item-selectAll').unbind('click').on('click', function (e) {
                //var tar = $(e.target).get(0);
                if ($(this).prop('checked')) {
                    $('.filelist-item').addClass('item-selected');

                } else {
                    $('.filelist-item').removeClass('item-selected');
                }
                $('.item-checkbox').prop('checked', $(this).prop('checked'));
                Util.sendDirectlyRequest("主页面", '"文件名"前的全选按钮', "-");
                self._select();
            });


            //排序
            var sm = $('.filelist-header');
            //初始化默认排序
            switch (self.orderby) {
                case 'mtime' :
                    sm.find('.updateData i').addClass('icon ' + self.orderby + self.sort);
                    break;
                case 'name' :
                    sm.find('.updateTitle i').addClass('icon ' + self.orderby + self.sort);
                    break;
                case 'size' :
                    sm.find('.updateSize i').addClass('icon ' + self.orderby + self.sort);
                    break;
                case 'updator' :
                    sm.find('.updateUser i').addClass('icon ' + self.orderby + self.sort);
                    break;
            }

            sm.on('click', function (e) {
                //搜索模式不支持排序
                if(self.data.searchData){
                    return;
                }
                //收藏页面只能按时间排序
                if(!self.data.searchData && self.type == "favorite"){
                    var tar = $(e.target);
                    var clas;
                    if (tar.hasClass('icon')) {
                        tar = tar.parent();
                    }
                    if (tar.hasClass('updateData')) {
                        clas = 'mtime';
                        doNext();
                    }
                } else{
                    var tar = $(e.target);
                    var clas;
                    if (tar.hasClass('icon')) {
                        tar = tar.parent();
                    }
                    if (tar.hasClass('updateTitle')) {
                        clas = 'name';
                        doNext();
                    } else if (tar.hasClass('updateSize')) {
                        clas = 'size';
                        doNext();
                    } else if (tar.hasClass('updateData')) {
                        clas = 'mtime';
                        doNext();
                    } else if (tar.hasClass('updateUser')) {
                        clas = 'updator';
                        doNext(self, clas);
                    }
                }

                function doNext() {
                    if (self.sort == 'asc') {
                        self.sort = 'desc'
                    } else {
                        self.sort = 'asc';
                    }
                    $('.filelist-header').find('span i').removeClass();
                    tar.find('i').addClass('icon ' + clas + self.sort);

                    Util.sendDirectlyRequest('文件列表', '排序', (FileModel.ORDERNAME[clas] + '' + (self.sort == 'desc' ? '降序' : '升序')));
                    self.doSort(clas, self.sort);
                };
            });

            self._bindListItemEvent(list_wraper);
        },
        /**
         * 初始化右键菜单
         * @private
         */
        _initContextMenu: function () {
            var self = this;
            var $fileManagerWraper=$('#fileManagerWraper');
            var contextMenu_folder = $('#template_contextMenu_folder').html(),
                contextMenu_file = $('#template_contextMenu_file').html(),
                contextMenu_fileDelete = $('#template_contextMenu_filedelete').html(),
                contextMenu_folderDelete = $('#template_contextMenu_folderdelete').html(),
                contextMenu_multi = $('#template_contextMenu_multi').html(),
                contextMenu_multiDelete = $('#template_contextMenu_multidelete').html(),
                contextMenu_right = $('#template_contextMenu_right').html();

            self.node.append(contextMenu_folder);
            self.node.append(contextMenu_file);
            self.node.append(contextMenu_fileDelete);
            self.node.append(contextMenu_folderDelete);
            self.node.append(contextMenu_multi);
            self.node.append(contextMenu_multiDelete);
            self.node.append(contextMenu_right);

            $fileManagerWraper.unbind('click').bind('click', function (e) {
                var tar = e.target;
                var clas = tar.id;
                if ($(tar).hasClass('menu-item')) {
                    var clas = tar.id;
                    self.fire(clas, fileManager.filelist.currentData);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            $fileManagerWraper.bind("contextmenu",function(e){
                if(!$(".pop-menu:visible").length) {
                    self.showWholeRightContextMenu(e);
                }
            });

            $('#folderContextMenu,#fileContextMenu,#fileDeleteContextMenu,#folderDeleteContextMenu' +
            ',#multiContextMenu,#multiDeleteContextMenu,#contextMenuRight').on('mouseleave', function (e) {
                $(this).hide();
            }).on("click", function (e) {
                $(this).hide();
            });
        },
        /**
         * 初始化列表展示方式
         * @param filelist
         * @private
         */
        _initDisplayModel: function (filelist) {
            var self = this;
            $('#fileManagerHeader').delegate('.oper .list-view', 'click', function () {
                Util.sendDirectlyRequest("主页面", "列表显示方式选择", "-");
                fnList();
                //自动调整文件名称显示宽度
                self.adaptWidth("list");
            });

            $('#fileManagerHeader').delegate('.oper .icon-view', 'click', function () {
                Util.sendDirectlyRequest("主页面", "图标显示方式选择", "-");
                fnicon();
                //自动调整文件名称显示宽度
                self.adaptWidth("icon");
            });
            function fnList() {
                var wraper = $('.list-wraper', filelist);
                var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
                var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
                lview.addClass('list-view-on');
                iview.removeClass('icon-view-on');
                wraper.removeClass('icon-view');
                wraper.addClass('list-view');
                $('.select-all label').show();
                $('.filelist-header').addClass('list-header');
                $('.updateUser').addClass('updateShow');
                $('.updateData').addClass('updateShow');
                $('.updateSize').addClass('updateShow');
                $(".filelist-context").show();
                FileList.view_model = self.mode = 'list';
                wraper.find(".filelist-item").removeClass("thumb-nail");
                if (self.scroll) {
                    self.scroll.render();
                }
            }

            function fnicon() {
                var wraper = $('.list-wraper', filelist);
                var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
                lview.removeClass('list-view-on');
                iview.addClass('icon-view-on');
                wraper.removeClass('list-view');
                wraper.addClass('icon-view');
                FileList.view_model = self.mode = 'icon';
                //缩略图视图点击时，更改样式，使渲染的时候添加的图片显示出来
                //图片早在渲染的时候已经加入页面只是没有显示出来。
                if (self.data) {
                    self._generateThumbs(function (flag, index, url) {
                        if (flag) {
                            var parentFileItem = wraper.find(".filelist-item");
                            $(parentFileItem).eq(index).addClass("thumb-nail");
                        }
                    });
                }

                if (self.scroll) {
                    self.scroll.render();
                }

                $('.select-all label').hide();
                $(".filelist-context").hide();
                $('.updateUser').removeClass('updateShow');
                $('.updateData').removeClass('updateShow');
                $('.updateSize').removeClass('updateShow');
            }

            if (self.mode == "list")
                fnList();
            else
                fnicon();
        },
        //图标视图生成缩略图
        _generateThumbs: function (callback) {
            var self = this;
            var data = self.data;
            for (var i = 0; i < data.length; i++) {
                var cur = data[i];
                if (!cur.thumbExist || cur.isdelete)
                    continue;//针对不能预览的文件或者一般文件夹直接跳过
                if (cur.cssAction == "upload" || cur.cssAction == "upload-delivery")continue;
                (function (param, index) {
                    var imgUrl = FileModel.thumbnails(Util.getStorageUrl(), param.path, param.path_type, param.from, param.neid, 70, 70, param.hash, param.rev);//缩略图大小130*70
                    var image = new Image();
                    image.src = imgUrl;
                    if (image.complete) {
                        callback(true, index, imgUrl);//能够加载的图片显示缩略图
                    } else {
                        try {
                            image.onload = function () {
                                callback(true, index, imgUrl);
                            }//能够加载的图片显示缩略图
                            image.onerror = function () {
                                callback(false, index);
                            }//不能够加载的图片原样显示
                        } catch (e) {
                            callback(false, index);
                        }
                    }
                })(cur, i);
            }
        },
        //获取可现实最大条数
        _getScreenMaxNum:function(){
            return parseInt($("#fileManagerWraper").height()/50);
        },
        _bindListItemEvent: function (list_wraper) {
            var self = this;
            var val = ",";//记录已经选择的值
            var ibe = -1; //记录初始值

            /*==禁止右键菜单 解决之前浏览器右键出现默认菜单的不兼容==*/
            $(document).bind('contextmenu', function () {
                return false;
            })
            /*===禁止右键end ===*/
            list_wraper.delegate('.filelist-item', 'mousedown', function (e,obj) {
                var ctar = $(e.currentTarget), tar = $(e.target);
                if(tar.get(0).tagName=="EM"){//在全文搜索结果中点击文件夹当前对象是EM标签，需要获取父级标签才可以点击打开文件夹
                    tar = tar.parent();
                }
                var da = self.data[ctar.attr('index')];
                var isf = ctar.attr('isfolder');
                var headerAuth = $('.filelist-header-auth');
                var event = e || window.e;
                //此方法是依托下面的收藏页面更新操作的，用于保证数据更新后点击的元素还是数据更新之前的元素
                if(obj){
                    tar = obj.tar;
                    e.button = obj.button;
                    e.pageX = obj.xPos;
                    e.pageY = obj.yPos;
                }
                //根据2015-12-10最新讨论结果，暂时取消点击收藏列表更新快照的操作
                //更新本行数据，仅在收藏页面执行更新操作
                if(self.type == "favorite"){
                    //调用收藏更新单条文件的方法
                    var flag = false;
                    Favorite.metadata(self.favoriteData[ctar.attr('index')],self,function(res){
                        if(res.code != 200){
                            flag = true;
                        }
                    });
                    if(flag){
                        //如果文件不存在阻止右键菜单
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                }

                var cbx, flag, cmd;

                if (e.button == 2) {
                    var px = e.pageX, py = e.pageY;

                    if (Object.prototype.toString.call(self.currentData) == '[object Array]' && self.currentData.length > 1) {
                        var cssAction, actionObj = {}, action, allStatus = {hasDeleted: false, hasNoDeleted: false,hasTeam:false};
                        for (var i = 0, len = self.currentData.length; i < len; i++) {
                            if (self.currentData[i].isdelete) {
                                allStatus.hasDeleted = true;
                            } else {
                                allStatus.hasNoDeleted = true;
                            }
                            if(self.currentData[i].isTeam&&!allStatus.hasTeam){//是否包含团队
                                allStatus.hasTeam = true;
                            }
                            action = self.currentData[i].action;
                            actionObj[action] = action;
                        }

                        cssAction = AuthModel.getContextAction(actionObj);

                        //删除文件和未被删除文件同时选择时，上下文不显示
                        if (allStatus.hasDeleted && allStatus.hasNoDeleted) {
                            return;
                        }

                        if (cssAction == AuthModel.ACTION.LIST) return;

                        var menu;
                        if (allStatus.hasDeleted) {
                            menu = $('#multiDeleteContextMenu');
                        } else {
                            menu = $('#multiContextMenu');
                        }
                        menu.show();
                        menu.removeClass();
                        menu.addClass("pop-menu action-" + cssAction);
                        self._setContextMenuStyle(menu,e);
                        if(allStatus&&allStatus.hasTeam){//如果多选选中的包含团队文件夹，则隐藏删除按钮
                            menu.find('.remove').css("display","none");
                        }else{
                            menu.find('.remove').css("display","block");
                        }

                        //判断所选的多个文件有几个是已经收藏的
                        if(self.currentData[0].path_type_old == "favorite"){
                            //如果是收藏右键菜单只有打包下载和取消收藏
                            menu.find('.favorite').css("display","none");
                            menu.find('.cancelfavorite').css("display","block");
                            menu.find('.copymove').css("display","none");
                            menu.find('.remove').css("display","none");
                        }else{
                            for(var i = 0,len = self.currentData.length;i<len;i++){
                                if(!self.currentData[i].is_bookmark){
                                    menu.find('.favorite').css("display","block");
                                    menu.find('.cancelfavorite').css("display","none");
                                    break;
                                }else{
                                    menu.find('.favorite').css("display","none");
                                    menu.find('.cancelfavorite').css("display","block");
                                }
                            }
                        }

                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    } else {
                        var menu;
                        if (isf == 'true') {
                            if (da.isdelete) {
                                menu = $('#folderDeleteContextMenu');
                            } else {
                                menu = $('#folderContextMenu');
                                if (da.isshared) {
                                    menu.find("#auth").html(_("共享管理"));
                                } else if ("/folder/self" == location.pathname) {
                                    menu.find("#auth").html(_("共享"));
                                } else if ("/folder/favorite" == location.pathname && da.path_type == "ent"){
                                    menu.find("#auth").html(_("授权管理"));
                                }
                            }
                        } else {
                            if (da.isdelete) {
                                menu = $('#fileDeleteContextMenu');
                                if (da.hasMoreVersion == 'no-version') {
                                    menu.find('#history').hide();
                                }
                            } else {
                                menu = $('#fileContextMenu');
                            }
                        }
                        menu.removeClass();
                        menu.addClass("pop-menu action-" + da.cssAction);
                        self._setContextMenuStyle(menu,e);
                        menu.show();
                        //--------------------------------------
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = '';
                        e.preventDefault();
                        e.stopPropagation();
                    }
                } else {
                    $('body').data('action', '文件列表按钮');
                    if (tar.hasClass('item-checkbox')) {
                        cbx = tar;
                        flag = 1;
                        cmd = '';
                    } else if (tar.hasClass('file-select')) {
                        cbx = tar.find("input:checkbox");
                        flag = 4;
                        cmd = '';
                    } else if (tar.hasClass('i-preview')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'preview';
                    } else if (tar.hasClass('i-edit')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'edit';
                    }
                    else if (tar.hasClass('i-undo')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'recover';
                    } else if (tar.hasClass('copy')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'copymove';
                    } else if (tar.hasClass('i-auth')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'auth';
                    } else if (tar.hasClass('cleanup')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'cleanup';
                    } else if (tar.hasClass('i-delete') || tar.hasClass('delete')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'remove';
                    } else if (tar.hasClass('i-purge')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'purge';
                    } else if (tar.hasClass('goback')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'goback';
                    }  else if (tar.hasClass('favorite')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'favorite';
                    } else if (tar.hasClass('cancelfavorite')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'cancelfavorite';
                    } else if (tar.hasClass('rename')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'rename';
                    } else if (tar.hasClass('transfer')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'transfer';
                    } else if (tar.hasClass('i-exitshare')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'exitshare';
                    } else if (tar.hasClass('cancelauth')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'cancelauth';
                    } else if (tar.hasClass('history')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'history';
                    } else if (tar.hasClass('rmShare')) {
                        cbx = ctar.find('.rmShare');
                        flag = 2;
                        cmd = 'rmShare';
                    }
                    else if (tar.hasClass('i-sendlink')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'share';
                    } else if (tar.hasClass('lock')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'lock';
                    } else if (tar.hasClass('unlock')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'unlock';
                    } else if (tar.hasClass('reqUnlock')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'reqUnlock';
                    } else if (tar.hasClass('sure') || tar.hasClass('cancel')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        e.preventDefault();
                        e.stopPropagation();
                    } else if (tar.hasClass('rename-input')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        return true;
                    } else if (tar.hasClass('i-more')) {
                        cbx = ctar.find('.item-checkbox');
                    } else if (tar.hasClass('i-download')) {
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'download';
                    } else if (tar.hasClass('icon') || tar.hasClass('display-name') || (tar.parent().hasClass('display-name') && tar.parent().find('b').length != 0)) {
                        cbx = ctar.find('.item-checkbox');
                        var isf = ctar.attr('isfolder');
                        flag = 2;
                        if (isf == 'true') {
                            $('.uploadButton').show();
                            $('body').data('action', '点击名称链接');
                            self.fire('folderClick', da);
                            return;
                        } else {
                            cmd = 'download';
                            $('body').data('action', '点击文件名称');
                        }
                    } else if (tar.hasClass('history')) {
                        self.fire('history', da);
                    }else if(tar.hasClass('label')){
                        self.fire('label', da);
                    } else {
                        cbx = ctar.find('.item-checkbox');
                        flag = 3;
                        cmd = '';
                    }
                };


                $('#search-input').blur();

                var cbox = cbx.get(0);
                var i = ctar.attr('index');
                //获取键盘事件
                $(window).keydown(function (e) {
                    if (e.shiftKey)key = true;
                }).keyup(function () {
                    key = false;
                });

                if (flag == 1) {
                    if (!cbox.checked) {
                        ctar.addClass('item-selected');
                    } else {
                        ctar.removeClass('item-selected');
                    }
                } else if (flag == 4) {
                    if (!cbox.checked) {
                        cbox.checked = true;
                        ctar.addClass('item-selected');
                    } else {
                        cbox.checked = false;
                        ctar.removeClass('item-selected');
                    }
                } else if (flag == 2) {
                    if (!cbox.checked) {
                        $('.item-checkbox', self.filelist).each(function (idx, itm) {
                            itm.checked = false;
                        });
                        $('.filelist-item', self.filelist).removeClass('item-selected');
                        ctar.addClass('item-selected');
                        cbox.checked = true;
                    }
                } else {
                    if (cbox) {
                        //ctrl键按下
                        if (event.ctrlKey) {
                            if (cbox.checked == true) {
                                cbox.checked = false;
                                ctar.removeClass('item-selected');
                            } else {
                                ctar.addClass('item-selected');
                                cbox.checked = true;
                            }
                        } else if (event.shiftKey) {//shift键按下
                            if (ibe != -1) {
                                $('.item-checkbox', self.filelist).each(function (idx, itm) {
                                    itm.checked = false;
                                });
                                ctar.siblings().removeClass("item-selected");
                                val = ",";
                                for (var ii = Math.min(i, ibe); ii <= Math.max(i, ibe); ii++) {
                                    val += ii + ",";
                                    $('.filelist-item').eq(ii).addClass('item-selected');
                                    $('.filelist-item').eq(ii).find('.item-checkbox').get(0).checked = true;
                                }
                            } else {
                                if (val.indexOf("," + i + ",") != -1) {
                                    val = val.replace("," + i + ",", ",");
                                    cbox.checked = false;
                                    ctar.removeClass('item-selected');
                                } else {
                                    $('.item-checkbox', self.filelist).each(function (idx, itm) {
                                        itm.checked = false;
                                    });
                                    $('.filelist-item', self.filelist).removeClass('item-selected');
                                    ctar.addClass('item-selected');
                                    cbox.checked = true;

                                    val += i + ",";
                                    ibe = i;
                                }
                            }
                        } else {
                            if (cbox.checked) {
                                ctar.removeClass('item-selected');
                                cbox.checked = false;
                            } else {
                                $('.item-checkbox', self.filelist).each(function (idx, itm) {
                                    itm.checked = false;
                                });
                                $('.filelist-item', self.filelist).removeClass('item-selected');
                                ctar.addClass('item-selected');
                                cbox.checked = true;

                                val += i + ",";
                                ibe = i;
                            }
                        }
                    }
                }


                //键盘上下键 ↑ ↓
                var itemBox = $('.scl-content').find('.filelist-item');
                var itemCheckbox = $('.scl-content').find('.item-checkbox');
                var cur = $('.scl-content').find('.item-selected').attr('index');
                $(document).keydown(function (event) {
                    //判断是否打开对话框，防止影响对话框里面的回车键盘操作 //阻止列表的回车转向新建文件夹时的回车事件
                    if ($('.lui-dialog').length != 0 || $('#fileManagerWraper').find('.new-item').length != 0 || $('#fileManagerWraper').find('.edit-name').length != 0) {
                        return;
                    }

                    event = event || window.event;
                    if (event.keyCode == 38) {  //按了上箭头
                        if (cur > 0) {
                            $('.filelist-item', self.filelist).removeClass('item-selected');
                            itemBox.eq(cur).prev().addClass('item-selected');
                            $('.item-checkbox', self.filelist).each(function (idx, itm) {
                                itm.checked = false;
                            });
                            cur--;
                            itemCheckbox.eq(cur).get(0).checked = true;
                        }
                    } else if (event.keyCode == 40) { //按了下箭头
                        if (cur < itemBox.length - 1) {
                            $('.filelist-item', self.filelist).removeClass('item-selected');
                            itemBox.eq(cur).next().addClass('item-selected');
                            $('.item-checkbox', self.filelist).each(function (idx, itm) {
                                itm.checked = false;
                            });
                            cur++;
                            itemCheckbox.eq(cur).get(0).checked = true;
                        }
                    } else if (event.keyCode == 13) { //回车
                        var ctar = itemBox.eq(cur);
                        var isf = ctar.attr('isfolder');
                        var isFocus = $("#search-input").is(":focus")
                        if (isf == 'true' && !isFocus) {
                            var da = self.data[ctar.attr('index')];
                            $('body').data('action', '文件列表回车');
                            self.fire('folderClick', da);
                        }

                        event.preventDefault();
                        event.stopPropagation();
                    }
                    ;
                });

                if (e.button == 2) {
                    self._select();
                    self._setContextMenuStyle(menu,e);
                } else {
                    self.timer && clearTimeout(self.timer);
                    self.timer = setTimeout(function () {
                        self._select();
                    }, 500);
                }


                $('.delivery-false').remove();
                switch (cmd) {
                    case 'preview':
                        self.fire('preview', da, self.data);
                        break;
                    case 'edit':
                        self.fire('edit', da, self.data);
                        break;
                    case 'recover':
                        self.fire('recover', da, self.data);
                        break;
                    case 'purge':
                        self.fire('purge', da, self.data);
                        break;
                    case 'history':
                        self.fire('history', da);
                        break;
                    case 'copymove':
                        self.fire('copymove', da);
                        break;
                    case 'auth':
                        self.fire('auth', da);
                        break;
                    case 'cleanup':
                        self.fire('cleanup', da);
                        break;
                    case 'remove':
                        self.fire('remove', da);
                        break;
                    case 'favorite':
                        self.fire('favorite', da);
                        break;
                    case 'cancelfavorite':
                        self.fire('cancelfavorite', da);
                        break;
                    case 'rename':
                        self.fire('rename', da);
                        break;
                    case 'transfer':
                        self.fire('transfer', da);
                        break;
                    case 'attribute':
                        self.fire('attribute', da);
                        break;
                    case 'share':
                        self.fire('share', da);
                        break;
                    case 'rmShare':
                        self.fire('rmShare', da);
                        break;
                    case 'exitshare':
                        self.fire('exitshare', da);
                        break;
                    case 'cancelauth':
                        self.fire('cancelauth', da);
                        break;
                    case 'lock':
                        self.fire('lock', da);
                        break;
                    case 'unlock':
                        self.fire('unlock', da);
                        break;
                    case 'reqUnlock':
                        self.fire('reqUnlock', da);
                        break;
                    case 'download':
                        var action = self.currentData && self.currentData.action;
                        if (action && action == 'preview' || action == 'upload:delivery' || action == 'upload') {

                        } else {
                            self.fire('download', da);
                        }
                        break;
                    case 'label':
                        self.fire('label',da);
                        break;

                }

                var fileHead = $('.filelist-header-auth');
                var fileTimer;
                fileHead.delegate('.fileMore', 'mouseenter', function (e) {
                    var ctar = $(e.currentTarget);
                    ctar.siblings('ul').stop(true, true).slideDown();
                });
                fileHead.delegate('.fileMore', 'mouseleave', function (e) {
                    var ctar = $(e.currentTarget);
                    fileTimer = setTimeout(function () {
                        ctar.siblings('ul').stop(true, true).slideUp();
                    }, 100)
                });
                fileHead.delegate('ul', 'mouseenter', function (e) {
                    clearTimeout(fileTimer)
                });
                fileHead.delegate('ul', 'mouseleave', function (e) {
                    var ctar = $(e.currentTarget);
                    ctar.stop(true, true).slideUp();
                });

                /*==========拖拽选择代码 列表==============*/
                if (e.button != 2) { //排除右键拖拽
                }
                /*==============拖拽选择 end============*/
                if(cmd!=""){
                    e.preventDefault();
                    e.stopPropagation();
                }

            });

            /*==============拖拽选择 父级加============*/
            $('#fileManagerWraper').bind('mousedown', function (e) {

                var event = e || window.e;
                if (e.button != 2) {
                    self.onBeforeSelect(event);

                    $(document).bind('mousemove', function (e) {
                        var event = e || window.e;
                        if (($(e.target).attr('type') != 'checkbox')) {
                            self.onSelect(event);
                            self.clearEventBubble(e);
                        }
                    });

                    $(document).bind('mouseup', function () {
                        self.ondragEnd();
                    });
                    self.clearEventBubble(e);

                }
            });
            /*==============拖拽选择 end============*/
            //拖拽是有一些节点要阻止默认
            list_wraper.delegate('input[type=text]', 'mousedown', function (e) {
                e.stopPropagation();
            });
            list_wraper.delegate('', 'mousedown', function (e) {
                self.showWholeRightContextMenu(e);
                e.stopPropagation();
            });
            list_wraper.delegate('.sure', 'mousedown', function (e) {
                e.stopPropagation();
            });
            list_wraper.delegate('.cancel', 'mousedown', function (e) {
                e.stopPropagation();
            });
            $('#fileManagerHeader').bind('mousedown', function (e) {
                self.showWholeRightContextMenu(e);
                e.stopPropagation();
            });
            $('#fileManagerWraper').delegate('.pop-menu li', 'mousedown', function (e) {
                e.stopPropagation();
            });
            $('#fileManagerWraper').delegate('.filelist-header-auth span', 'mousedown', function (e) {
                e.stopPropagation();
            });


            list_wraper.delegate('.filelist-item', 'dblclick', function (e) {
                var ctar = $(e.currentTarget);
                var isf = ctar.attr('isfolder');
                clearTimeout(self.timer);
                if (isf == 'true') {
                    var da = self.data[ctar.attr('index')];
                    $('.uploadButton').show();
                    $('body').data('action', '鼠标左键双击');
                    self.fire('folderClick', da);
                }
                e.preventDefault();
                e.stopPropagation();
            });

            list_wraper.delegate('.filelist-item', 'mouseover', function (e) {
                //动态调整文件列表名称显示宽度
                self.adaptWidthMouseover($(this));
                var tar = $(e.currentTarget);
                var da = self.data[tar.attr('index')];
                var operate = $(e.currentTarget).find('.file-operate');
                var len = $(e.currentTarget).parents('.list-view');
                var cbox = $('.item-checkbox', self.filelist);
                var num = 0;

                for (var i = 0; i < cbox.length; i++) {
                    if (cbox.get(i).checked) {
                        num++;
                    }
                }
                tar.addClass('item-hover');
//              tar.addClass('item-selected');

                //收藏页面不允许删除、重命名、移动复制等操作
                if(da.path_type_old == "favorite"){
                        operate.find('.delete').hide();//隐藏删除
                        operate.find('.rename').hide();//隐藏重命名
                        operate.find('.copy').hide();//隐藏复制
                        operate.find('.favorite').hide();//隐藏收藏
                    if(da.path_type == "ent"){
                        operate.find('.auth').attr('title','授权管理');
                        operate.find('.auth').find('.i-auth').attr('title','授权管理');
                    }else{
                        operate.find('.auth').attr('title','共享');
                        operate.find('.auth').find('.i-auth').attr('title','共享');
                    }
                } else if(da.path_type == "share_in"){
                    operate.find('.delete').hide();//隐藏删除
                    operate.find('.rename').hide();//隐藏重命名
                    //除收藏页面收藏按钮显示
                    if(da.is_bookmark){
                        operate.find('.favorite').hide();
                    }else{
                        operate.find('.cancelfavorite').hide();
                    }
                }else{
                    //除收藏页面收藏按钮显示
                    if(da.is_bookmark){
                        operate.find('.favorite').hide();
                    }else{
                        operate.find('.cancelfavorite').hide();
                    }
                }

                if (!Util.haveDirAuth(da) || /share_in/.test(da.path_type)) {
                    operate.find('.auth').hide();
                } else {
                    operate.find('.auth').css("display", "inline-block");
                }

                if (!Util.canPreview(da.mimeType)) {
                    operate.find('.preview').hide();
                }
                if (!Util.canEdit(da.mimeType)) {
                    operate.find('.edit').hide();
                }

                //依据权限判断是否支持编辑（1：上传/下载 2：上传下载外链 3;编辑）
                var isEdit = true;
                if (parseInt(Util.resolvePrivilegeID(da["action"])) > 2004) {
                    isEdit = false;
                }
                if (da.type == 'pdf' || !Util.canEdit(da.mimeType) || !isEdit) {
                    operate.find('.edit').hide();
                }

                //如果文件为锁定状态,且不是自己加的锁，则不能编辑
                if (da.islocked && !da.unlockAdmin) {
                    operate.find('.edit').hide();
                }

                //如果是team文件夹，需把右侧和右键的重命名、删除、复制移动去掉
                if (da.isfolder && !da.isTeam && self.type != 'share_in' && self.type != 'favorite' && self.type != "ent") {
                    if (da.isShare) {
                        operate.find("span.transfer").css("display", "block");
                        operate.find("span.cancelauth").css("display", "block");
                    } else {
                        operate.find("span.transfer").hide();
                        operate.find("span.cancelauth").hide();
                    }
                } else {
                    if (da.isTeam || self.type == 'share') {
                        operate.find("span.transfer").hide();
                        operate.find("span.cancelauth").hide();
                    }
                }
                //企业空间和收到的共享 一级目录(非大管理员下) 和团队文件夹 重命名删除 隐藏
                if ((/share|ent/.test(da.path_type) && /^\/([^\/]+)$/.test(da.path) && !Util.isAdmin()) || da.isTeam) {
                    operate.find('span.rename').hide();
                    operate.find('span.delete').hide();
                }
                if (da.isTeam || (self.type == 'share_in' && self.path == '')) {
                    operate.find("span.cleanup").hide();
                }

//				if(Util.isAdmin()){
//					operate.find("span.transfer").hide();
//          		operate.find("span.cancelauth").hide();
//          	}


                //定期清理
                if (!da.isfolder || da.isTeam || da.action != "edit") {
                    operate.find(".cleanup").hide();
                } else {
                    operate.find(".cleanup").css("display", "block");
                }
                //退出共享
                if ("share_in" == self.type || "favorite" == self.type) {
                    if (da.share_to_personal == true && self.path == "") {
                        operate.find("span.exitshare").css("display", "inline-block");
                    } else {
                        operate.find("span.exitshare").hide();
                    }
                }
                //我的共享根目录,隐藏删除按钮操作
                if ("share_out" == self.type && self.path == "") {
                    operate.find("span.delete").hide();
                }


                if (tar.attr('index') != -1) {
                    var d = self.data[tar.attr('index')];
                    if (d.isfolder && d.isTeam && (d.path.lastIndexOf('/') == 0) || d.action != "edit") {

                        tar.find('#delete').hide();
                        tar.find('.rename').hide();
                        if (/download/.test(d.action) && da.path_type_old != "favorite") {
                            tar.find('.copy').css("display", "block");
                        }
                    } else if (e.isfolder && e.isTeam) {
                        tar.find('#delete').hide();
                        tar.find('.rename').hide();
                    }
                }

                if (len.length > 0 && num <= 1) {
                    operate.addClass('operateShow');
                }

                var iMore = operate.find('.fileMore');

                //隐藏fileMore
                var oUl = operate.find('ul');
                var aSpan = oUl.find('span');
                var count = 0;

                for (var i = 0; i < aSpan.length; i++) {
                    if (aSpan.eq(i).css('display') == 'none') {
                        count++;
                    }
                }
                if (aSpan.length == count) {
                    iMore.hide();
                }

                var fileTimer;
                operate.delegate('.fileMore', 'mouseenter', function (e) {
                    var ctar = $(e.currentTarget);
                    var ul = ctar.siblings('ul');
                    var h = $(window).height() - ul.height() - 32;

                    ul.css('display', 'block');
                    if (h < ul.offset().top) {
                        ul.css({'top': '-' + ul.height() + 'px'});
                    }
                });
                operate.delegate('.fileMore', 'mouseleave', function (e) {
                    var ctar = $(e.currentTarget);
                    fileTimer = setTimeout(function () {
                        ctar.siblings('ul').hide().removeAttr("style");
                    }, 100)
                });
                operate.delegate('ul', 'mouseenter', function (e) {
                    clearTimeout(fileTimer)
                });
                operate.delegate('ul', 'mouseleave', function (e) {
                    var ctar = $(e.currentTarget);
                    ctar.hide().removeAttr("style");
                });

                e.preventDefault();
                e.stopPropagation();

            });

            list_wraper.delegate('.filelist-item', 'mouseleave', function (e) {
                //动态调整文件列表名称显示宽度
                self.adaptWidthMouseleave($(this));
                var tar = $(e.currentTarget);
                var operate = $(e.currentTarget).find('.file-operate');
                var cbox = tar.find("input:checkbox").get(0);
                if (cbox.checked == false) {
//					tar.removeClass('item-selected');
                    tar.find('');
                }
                tar.removeClass('item-hover');
                operate.find('ul').slideUp();
                operate.removeClass('operateShow');
            });


        },
        _setContextMenuStyle:function(menu,event){
            var px = event.pageX, py = event.pageY;
            var top=py;
            top + menu.outerHeight() > $(window).height() && (top -= menu.height())
            if(px>(window.outerWidth-menu.innerWidth())){
                px = window.outerWidth - menu.innerWidth();
            }
            menu.css({left: px - 5, top: top});
        },
        _select: function () {
            var self = this;
            var coll = $('.item-selected', self.filelist);
            var headerAuth = $('.filelist-header-auth');
            if (coll.length > 1) {
                var datas = [];
                $.each(coll, function (idx, item) {
                    var d = self.data[$(item).attr('index')];
                    datas.push(d);
                });
                self.currentData = datas;
                self.fire('multiSelect', self, datas);
                headerAuth.show();
            } else if (coll.length == 1) {
                var d = self.data[coll.attr('index')];
                self.currentData = d;
                if (d) {
                    self.fire('select', d, coll);
                    headerAuth.show();
                    //如果没有编辑权限就不能加锁解锁
                    if (self.currentData.action != "edit") {
                        $('#fileContextMenu').find('#lock').hide();
                        $('#fileContextMenu').find('#unlock').hide();
                    }

                    if(!Util.canPreview(self.currentData.mimeType)){
                        headerAuth.find('.preview').hide();
                    }
                    if(!Util.canEdit(self.currentData.mimeType)){
                        headerAuth.find('.edit').hide();
                    }

                    //依据权限判断是否支持编辑（1：上传/下载 2：上传下载外链 3;编辑）
                    var isEdit = true;
                    if (parseInt(Util.resolvePrivilegeID(d["action"])) > 2004) {
                        isEdit = false;
                    }
                    var islocked = d.islocked;
                    if (d.type == 'pdf' || !Util.canEdit(d.mimeType) || !isEdit || (islocked && !d.unlockAdmin)) {
                        headerAuth.find('.edit').hide();
                    }

                }
            } else if (coll.length == 0) {
                self.currentData = null;
                headerAuth.hide();
                self.fire('unselect', self.parentData);

            }
        },

        renderByPath: function (path) {
            var self = this;
            self.path = path;
            self._renderList();
        },
        //非搜索列表渲染
        render: function (data) {
            var self = this, filelist = self.filelist;
            var list = $('.list-wraper', filelist);
            list.empty();
            self.data = data;
            if(data.length == 0){
                $('.filelist-header').css({'visibility':'hidden'});
                $('.filelist-header-auth').hide();
                if(!data.searchData){
                    self.fire('afterRender',self.parentData);
                }
                self._empty(list);
                return;
            }else{
                $('.filelist-header').css({'visibility':'inherit'});
            }

            var scroll_wraper = $('<div class="scroll-wraper"></div>');
            var h = self.node.height()-self.node.find('.filelist-header').outerHeight();


            scroll_wraper.height(h);
            $('.filelist-header-auth').hide();

            for(var i=0, ii=data.length; i<ii; i++){
                var cda = data[i],
                    itm = self._adaptTemplate(cda);
                itm.attr('index', i);

                if(!cda.isfolder && !Util.canPreview(cda.mimeType)){
                    itm.find('.preview').hide();
                    itm.find('.edit').hide();
                }

                //如果是teamfolder的根目录，需要把外链图标去掉
                /*
                 var re = /\/.*\/.+/;
                 if(cda.isfolder && cda.team && !re.test(cda.path)){
                 itm.find('.i-sendlink').remove();
                 }
                 */
                //如果文件只有上传/外链权限，去掉外链图标
                if (!cda.isfolder && cda.action == AuthModel.ACTION["UPLOAD:DELIVERY"]) {
                    itm.find('#sendlink').hide();
                }
                scroll_wraper.append(itm);
            }
            self.lastSize = data.length;
            list.append(scroll_wraper);
            self.scroll = new Scroll(scroll_wraper);
            //自动调整文件名称显示宽度
            self.adaptWidth("list");

            self.reachEnd = false;
            self.scroll.on('reachEnd', function(){
                if(self.lastSize < self.totalSize || self.type == "favorite" && !self.reachEnd){
                    if(!self.paging){
                        self.paging = true;
                        self.loading();

                        setTimeout(function(){
                            self.nextPage();
                        }, 2000);
                    }
                }
            });
            //每次渲染时都要重新加载缩略图
            //如果是图标视图就直接更改样式使缩略图显示出来
            self._generateThumbs(function(flag,index,url){
                if(flag){
                    var fileItem = list.find(".filelist-item").eq(index);
                    $(fileItem).find("span.file-area>img").attr("src",url);
                    var h = $(fileItem).find("span.file-area>img").height();
                    if(h<70){
                        $(fileItem).find("span.file-area>img").css("marginTop",(70-h)/2);//图片很小或者是图标的小图片就水平和垂直居中显示
                    }
                    if(self.mode=="icon"){
                        $(fileItem).addClass("thumb-nail");
                    }
                }else{
                    list.find(".filelist-item").eq(index).find("span.file-area>img").remove();
                }
            });

            //防止搜索时头部又重新渲染
            if(!data.searchData){
                self.fire('afterRender',self.parentData);
            }

            self.fire('shareInit',self.data);

           self.setDragEvent();
        },
        setDragEvent:function(){
            $(".filelist-item").each(function(){
                $(this)[0].addEventListener('ondragleave',function (event){
                    console.log("ondragleave");
                });
                $(this)[0].addEventListener('ondragend',function (event){
                    console.log("onDrop end");
                });
            });
        },
        //全文检索列表渲染
        fullTextRender:function(data,nextIndex, keyword, filetype, size_start, size_end, time_start, time_end, creator, desc){
            var self = this, filelist = self.filelist;
            var list = $('.list-wraper', filelist);
            $('.filelist-header').css({'visibility':'visible'});
            //搜索结果为空
            if(data.length==0&&nextIndex==0&&data.has_more == "false"){
                self._empty(list);
                self.last=true;
                return;
            }
            self.last=false;
            if (data.has_more == "false") {
                self.last=true;
            }
            if (data.pre_index == "0") {
                self.scroll = null;
                self.data = null;
                self.data= data;
                self.ratio=0;
            }else{
                self.data=self.data.concat(data);
            }
            self.data.searchData=true;
            var scroll_wraper = list.find('.scroll-wraper');
            //追加的内容滚动条需要重新处理
            if (scroll_wraper.length) {
                scroll_wraper.append(scroll_wraper.find(".filelist-item")).find(".lui-scroll").remove()
            } else {
                scroll_wraper = $('<div class="scroll-wraper"></div>');
            }
            var h = self.node.height() - self.node.find('.filelist-header').outerHeight();
            scroll_wraper.height(h);
            $('.filelist-header-auth').hide();

            var i = scroll_wraper.find(".filelist-item").length;
            var j = self.data.length;
            for (;i < j; i++) {
                var cda = self.data[i],
                    itm = self._adaptTemplate(cda);
                itm.attr('index', i);

                if (!Util.canPreview(cda.mimeType)) {
                    itm.find('.preview').hide();
                }

                if (!Util.canEdit(cda.mimeType)) {
                    itm.find('.edit').hide();
                }
                //如果文件只有上传/外链权限，去掉外链图标
                if (!cda.isfolder && cda.action == AuthModel.ACTION["UPLOAD:DELIVERY"]) {
                    itm.find('#sendlink').hide();
                }
                scroll_wraper.append(itm);
            }
            self.lastSize = data.length;
            if (!list.find('.scroll-wraper').length) {
                list.append(scroll_wraper);
            }
            self.scroll = new Scroll(scroll_wraper);
            self.scroll.on('reachEnd', function () {
                if (self.last) {
                    return;
                }
                self.ratio=0.6;
                self.searchFullText(data.next_index, data.keyword,filetype, size_start, size_end, time_start, time_end, creator, self.desc,self.exact);
                self.scroll.direction=true;
            });

            if(data.pre_index!=0){
                setTimeout(function(){
                    self.scroll.render(true);
                    self.scroll.scrollTo(self.ratio, true);
                },100);
            }
            //根据分辨率大小设置自动查询条数
            if(data.has_more=="true"&&self._getScreenMaxNum()>self.data.length){
                var timer=setTimeout(function(){
                    self.ratio=0;
                    self.searchFullText(data.next_index, data.keyword,filetype, size_start, size_end, time_start, time_end, creator, self.desc,self.exact);
                    clearTimeout(timer);
                },100);
            }
            //每次渲染时都要重新加载缩略图
            //如果是图标视图就直接更改样式使缩略图显示出来
            self._generateThumbs(function (flag, index, url) {
                if (flag) {
                    var fileItem = list.find(".filelist-item").eq(index);
                    $(fileItem).find("span.file-area>img").attr("src", url);
                    var h = $(fileItem).find("span.file-area>img").height();
                    if (h < 70) {
                        $(fileItem).find("span.file-area>img").css("marginTop", (70 - h) / 2);//图片很小或者是图标的小图片就水平和垂直居中显示
                    }
                    if (self.mode == "icon") {
                        $(fileItem).addClass("thumb-nail");
                    }
                } else {
                    list.find(".filelist-item").eq(index).find("span.file-area>img").remove();
                }
            });
            self.fire('shareInit', self.data);
        },
        _adaptTemplate: function (cda) {
            var self = this, itm;
            if (cda.isfolder) {
                if (cda.isdelete) {
                    itm = $(Mustache.render($(self.folderdelete_template).html(), cda));
                    itm.addClass('changeGrey');
                } else {
                    itm = $(Mustache.render($(self.folder_template).html(), cda));
                }
            } else {
                if (cda.isdelete) {
                    itm = $(Mustache.render($(self.filedelete_template).html(), cda));
                    itm.addClass('changeGrey');
                } else {
                    itm = $(Mustache.render($(self.file_template).html(), cda));
                    if (!cda.thumbExist) {
                        itm.find("span.file-area>img").remove();
                    }
                }
            }

            //搜索的关键字置为红色
           /* if (cda.keyword) {
                var name = itm.find(".display-name"), name1 = '';
                //有特殊字符的正则有问题，所以搜索特殊字符暂时不作高亮显示了
                if (!cda.keyword.match(/[&^()+-.]/)) {
                    var patten = new RegExp(cda.keyword, 'i');
                    name.text().replace(patten, function (s, t) {
                        name1 = name.text().replace(patten, '<b class="searchKey">' + s + '</b>');
                    });
                }
                if (!name1) {
                    name1 = name.text();
                }
                itm.find(".display-name").html(name1);
            }*/

            //新加载的图片显示
            if (self.mode == "icon") {
                if (cda.thumbExist) {
                    var imgUrl = FileModel.thumbnails(Util.getStorageUrl(), cda.path, cda.path_type, cda.from, cda.neid, 130, 70, cda.hash, cda.rev);//缩略图大小130*70
                    var image = new Image();
                    image.src = imgUrl;
                    if (image.complete) {
                        itm.find("span.file-area>img").attr('src', imgUrl);
                        $(itm).addClass("thumb-nail");
                        //callback(true,index,imgUrl);//能够加载的图片显示缩略图
                    } else {
                        try {
                            image.onload = function () {
                                itm.find("span.file-area>img").attr('src', imgUrl);
                                $(itm).addClass("thumb-nail");
                            }//能够加载的图片显示缩略图
                            image.onerror = function () {
                                itm.find("span.file-area>img").remove();
                            }//不能够加载的图片原样显示
                        } catch (e) {
                            itm.find("span.file-area>img").remove();
                        }
                    }
                }
                itm.find(".filelist-context").hide();
            }
            itm.attr('draggable',"true");
            itm.attr('ondragend',"fileManager.filelist.dragDownload("+cda.neid+")");
            return itm;
        },
        /**
         * 拖拽文件下载
         * @param neid
         */
        dragDownload:function(neid){
            $(".tips-toast").find('span').text('拖拽文件下载');
            var da;
            var curData=this.data;
            for(var o in curData){
                if(curData[o].neid==neid){
                    da=curData[o];
                    break;
                }
            }
            if(da){
                this.fire('download', da);
            }
        },
        add: function (data) {
            var self = this;
            var len = self.data.length;
            self.removeLoading();
            for (var i = 0, ii = data.length; i < ii; i++) {
                var itm = self._adaptTemplate(data[i]);
                itm.attr('index', len + i);
                var cda = data[i];
                if (!cda.isfolder && !Util.canPreview(cda.mimeType)) {
                    itm.find('.i-preview').remove();
                }
                if (!cda.isfolder && cda.action == AuthModel.ACTION["UPLOAD:DELIVERY"]) {
                    itm.find('.i-sendlink').remove();
                }
                self.scroll.appendContent(itm);
            }
            self.data = self.data.concat(data);
            self.scroll.render(true);
            //calculate scroll's pos
            var pos = self.calculateScrollRate(data.length);
            self.scroll.scrollTo(pos, true);
        },
        calculateScrollRate: function (num) {
            var self = this;
            var rate = (self.data.length - num) / self.data.length;
            return rate;
        },
        nextPage: function () {
            var self = this;
            self.removeLoading();
            self.pageN++;
            self.current = self.lastSize;

            self._requestData(self.path, self.lastSize, self.pageSize, function (datas) {
                self.add(datas);
                self.lastSize += datas.length;
                self.paging = false;
                self.pages++;
            }, function () {
                self.removeLoading();
                self.paging = false;
            }, self.from, self.prefix_neid);
        },
        //全文检索下一页
        searchFullText: function (nextIndex, keyword, filetype, size_start, size_end, time_start, time_end, creator, desc,exact) {
            var self=this;
            self.desc = desc;
            self.exact = exact;
            var context = window.fileManager;
            var curFileNeid = null;
            var prefixNeid = '';
            if(nextIndex=="0"){
                $('.list-wraper',"#fileManagerWraper").empty();
            }
            if (context.type == 'share_in' || context.type == 'share_out') {
                if (context.path) {
                    curFileNeid = context.currentData.neid;
                    prefixNeid = context.currentData.prefix_neid;
                }
            }
            self.data.searchData=true;
            FileModel.searchByFulltext(function (result) {
                if (result.code == 200) {
                    var datas = [];
                    for (var i = 0, ii = result.data.entrys.length; i < ii; i++) {
                        try {
                            var item = result.data.entrys[i];
                            item.path = item.path.replace('</', '<#');
                            var file = Util.resolvePath(item.path, item.is_dir);
                            file.name = file.name.replace('<#', '</');
                            var typeIcon = file.type;
                            if (item.is_dir) {
                                if (item.is_team) {
                                    typeIcon = "folder_team";
                                } else if (item.is_shared) {
                                    typeIcon = "folder_share";
                                } else {
                                    typeIcon = "folder";
                                }
                            }

                            var d = {};
                            d.isfolder = item.is_dir;
                            d.isdelete = item.is_deleted;
                            d.isShare = item.is_shared;
                            d.thumbExist = item.thumb_exist;
                            d.type = typeIcon;
                            d.typeIcon = Util.typeIcon(typeIcon);
                            d.name = item.title || file.name;
                            d.updator = item.path;//查询时需要显示路径
                            d.filename = item.title || file.name;
                            d.title=item.title.replace(/\<em\>/g,"").replace(/\<\/em\>/g,"");
                            d.mimeType = item.mime_type;
                            d.size = Util.formatBytes(item.bytes);
                            d.datetime = item.modified,
                                d.path = item.path;
                            d.path_type = item.path_type;
                            d.from = item.from || "";
                            d.neid = item.neid;
                            d.prefix_neid = item.prefix_neid;
                            d.parentPath = Util.getParentPath(item.path);
                            d.creator = item.creator;
                            d.hash = item.hash;
                            d.desc = item.desc;
                            d.team = item.team;
                            d.action = Util.resolveFileAction(item.access_mode);
                            d.cssAction = Util.resolveFileAction(item.access_mode).replace(/:/g, "-");
                            d.languageAction = AuthModel.getAuthTitle(d.action);
                            if (!item.team_id) {
                                item.team_id = '';
                            }
                            d.teamId = item.team_id;
                            d.hasMoreVersion = item.has_more_version ? 'has-version' : 'no-version';
                            d.hasDelivery = item.delivery_code ? true : false;
                            d.deliveryCode = item.delivery_code;
                            d.deliveryTitle = d.hasDelivery ? _('查看外链') : _('外链分享');
                            d.islocked = item.lock_uid ? true : false; //文件是否锁定
                            d.unlockAdmin = (item.lock_uid == Util.getUserID()) || Util.isAdmin();//是否有解锁的权限（只有本人和管理员有权限）
                            d.keyword = keyword;
                            d.context = item.context;
                            if (item.is_shared) {
                                d.category = item.team ? _("团队文件夹") + "(" + AuthModel.getAuthTitle(d.action) + ")" : _("共享文件夹") + "(" + AuthModel.getAuthTitle(d.action) + ")";
                            } else {
                                d.category = _("普通文件夹");
                            }
                            if (!d.isfolder) {
                                d.rev = item.rev;
                                d.version = item.rev_index;
                            }
                            datas.push(d);
                        }
                        catch (err) {
                            //console.log( "error" );
                        }
                    }
                    //用来标实此数据为搜索数据
                    datas.searchData = true;
                    datas.keyword = keyword;
                    datas.has_more=result.data.has_more;
                    datas.next_index = result.data.next_index;
                    datas.pre_index = nextIndex;
                    //context.processSearch(totalSize);
                    context.filelist.fullTextRender(datas,nextIndex, keyword, filetype, size_start, size_end, time_start, time_end, creator, self.desc,self.exact);
                    $('.file-date').css('display', 'none');
                    $('.file-path').addClass('file-path-show');
                    $(".updateUser").text(_("所在目录"));
                }else{
                    Tips.show(_(result.message));
                    $('#search-btn').trigger('click')
                }

            }, "/" + context.path, Util.getPathType(), null, curFileNeid, 0, 100, filetype, keyword, false, size_start, size_end, time_start, time_end, creator, desc,exact, prefixNeid, nextIndex);

        },
        doSort: function (orderby, sort) {
            var self = this;
            self.orderby = orderby;
            $.cookie("orderby", orderby);
            $.cookie("sort", sort);
            self._renderList();
        },

        loading: function () {
            this.wait = new Wait();
        },

        removeLoading: function () {
            this.wait.close();
        },

        _empty: function (parent) {
            var self = this;
            var pathname = location.pathname;
            var empty_img, empty_txt;

            if (self.data.searchData) {
                empty_img = "empty_search";
                empty_txt = _("抱歉，没有找到相关的文件/文件夹", self.data.keyword);
            } else {
                if ("/" == pathname && self.path == '') {
                    if (Util.isAdmin()) {
                        empty_img = "empty empty_self";
                        empty_txt = _("上传文件到云存储系统，<br/>安全高效快捷");
                    } else {
                        empty_img = "empty empty_ent";
                        empty_txt = _("您暂时未被授权任何团队文件夹，请联系管理员");
                    }
                } else if ("/folder/self" == pathname && self.path == '') {
                    empty_img = "empty empty_self";
                    empty_txt = _("上传文件到云存储系统，<br/>安全高效快捷");
                    //当个人的quota为0的时候，根目录的上传和新建文件夹按钮不显示
                    var quota = window.LenovoData && window.LenovoData.user.user_info.quota;
                    if (quota == 0) {
                        $("#fileManagerHeader .button-area").hide();
                        $(".uploadButton").hide();
                        empty_txt = _("您的个人文件夹空间为零，请联系管理员为您分配空间");
                    }
                } else if ("/folder/myshare" == pathname && self.path == '') {
                    empty_img = "empty empty_share_out";
                    empty_txt = _("开启共享，轻松协作") + '<br/><a target="_blank" href="/help/help_tab2.html?tag=order#60">' + _("如何共享我的文件？") + "</a>";
                } else if ("/folder/shared" == pathname && self.path == '') {
                    empty_img = "empty empty_share_in";
                    empty_txt = _("没有收到的共享");
                } else if ("/folder/favorite" == pathname && self.path == '') {
                    empty_img = "empty empty_favorite";
                    empty_txt = _("没有收藏");
                } else if ("/link/list" == pathname && self.path == '') {
                    empty_img = "empty empty_link";
                    empty_txt = _("没有任何外链") + '<br/><a target="_blank" href="/help/help_tab2.html?tag=share#50">' + _("如何创建一个外链？") + "</a>";
                } else if ("/mail/list" == pathname && self.path == '') {
                    empty_img = "empty empty_mail";
                    empty_txt = _("没有邮件附件") + '<br/><a target="_blank" href="#">' + _("如何添加邮件附件？") + "</a>";
                } else if ("/event/list" == pathname && self.path == '') {
                    empty_img = "empty empty_event";
                    empty_txt = _("文件动态早知晓 重要信息0遗漏");
                } else {
                    empty_img = "empty empty_default";
                    empty_txt = _("空文件夹");
                }
            }
            //parent.append($(self.empty_template).html());
            parent.append(Mustache.render($(self.empty_template).html(), {
                cssAction: self.cssAction,
                empty_img: empty_img,
                empty_txt: empty_txt
            }));
        },
        _initSearchModel: function () {
            var self = this;
            var oBtn = $('.oper .operSearch');

            oBtn.delegate('.i-search', 'click', function () {
                var searchBox = $('.search-area');
                searchBox.slideToggle();
            });
        },
        reload: function () {
            var self = this;
            self.fire("reload");
            self._renderList();
        },

        onBeforeSelect: function (evt) {
            var self = this;
            if (!document.getElementById("selContainer")) {
                self.selectDiv = document.createElement("div");
                $(self.selectDiv).css({
                    'position': 'absolute',
                    'width': 0,
                    'height': 0,
                    'left': 0,
                    'top': 0,
                    'font-size': 0,
                    'margin': 0,
                    'padding': 0,
                    'border': '1px dashed #0099FF',
                    'background-color': '#C3D5ED',
                    'z-index': 1000,
                    'filter': 'alpha(opacity:60)',
                    'opacity': '0.6',
                    'display': 'none'
                });
                self.selectDiv.id = "selContainer";
                document.body.appendChild(this.selectDiv);
            } else {
                self.selectDiv = document.getElementById("selContainer");
            }

            self.startX = self.posXY(evt).x;
            self.startY = self.posXY(evt).y;
            self.isSelect = true;

        },
        posXY: function (event) {
            event = event || window.event;
            var posX = event.pageX;
            var posY = event.pageY;
            return {
                x: posX,
                y: posY
            };
        },
        onSelect: function (evt) {
            var self = this;
            if (self.isSelect) {
                $(self.selectDiv).show();

                var posX = self.posXY(evt).x;
                var poxY = self.posXY(evt).y;

                var a = $(self.selectDiv)[0].style.left = Math.min(posX, this.startX) + 'px';
                var b = $(self.selectDiv)[0].style.top = Math.min(poxY, this.startY) + 'px';
                var c = $(self.selectDiv)[0].style.width = Math.abs(posX - this.startX) + 'px';
                var d = $(self.selectDiv)[0].style.height = Math.abs(poxY - this.startY) + 'px';
                var regionList = $('.filelist-item');
                for (var i = 0; i < regionList.length; i++) {
                    var r = regionList[i],
                        sr = self.innerRegion(self.selectDiv, r);

                    if ($(self.selectDiv).width() > 0) {

                        if (sr) {
                            $(r).addClass('item-selected');
                            $(r).find('input')[0].checked = 'checked';

                        } else {
                            $(r).removeClass('item-selected');
                            $(r).find('input').removeAttr('checked');
                            $('#item-selectAll').removeAttr('checked');

                        }
                    }

                }
            }
        },

        // 判断一个区域是否在选择区内
        innerRegion: function (selDiv, region) {
            var self = this;
            var t1 = parseInt(selDiv.style.top);
            var l1 = parseInt(selDiv.style.left);
            var r1 = t1 + parseInt(selDiv.offsetWidth);
            var b1 = t1 + parseInt(selDiv.offsetHeight);


            var t2 = self.getPos(region).top;
            var l2 = self.getPos(region).left;
            var r2 = l2 + parseInt(region.offsetWidth);
            var b2 = t2 + parseInt(region.offsetHeight);

            var t = Math.max(t1, t2);
            var r = Math.min(r1, r2);
            var b = Math.min(b1, b2);
            var l = Math.max(l1, l2);

            if (b1 < t2 || r1 < l2 || t1 > b2 || l1 > r2) {
                return null;
            } else {
                return region;
            }

        },
        getPos: function (obj) {
            var l = 0;
            var t = 0;

            while (obj) {
                l += obj.offsetLeft;
                t += obj.offsetTop;

                obj = obj.offsetParent;
            }

            return {left: l, top: t};
        },

        ondragEnd: function () {
            var self = this;
            if ($(self.selectDiv).length != 0) {
                self.selectDiv.style.display = "none";
            }
            self.isSelect = false;
            if ($('fileManagerWrapper ') && $('#selContainer').height() > 10) {
                self._select();
            }

            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
            $('#fileManagerWraper').unbind('mouseleave');
        },
        clearEventBubble: function (evt) {
            var evt = evt || window.event;
            if (evt.stopPropagation) evt.stopPropagation();
            else evt.cancelBubble = true;
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;

        },
        adaptWidth: function (type) {
            var self = this;
            var ItemWidth = $('.filelist-icon').css('width');
            if(type == "list"){
                $('.lui-filelist .list-view .filelist-item .file-area').css('width',(parseInt(ItemWidth)-self.checkboxWidth-self.scrollBarWidth)+'px');
                $('.lui-filelist .list-view .filelist-item .file-area .file-info .file-name a').css('max-width',(parseInt(ItemWidth)-self.checkboxWidth-self.iconWidth-self.statusWidth-self.scrollBarWidth)+'px');
            }else{
                $('.lui-filelist .icon-view .filelist-item .file-area').css('width',(parseInt(ItemWidth)-self.checkboxWidth-self.scrollBarWidth)+'px');
                $('.lui-filelist .icon-view .filelist-item .file-area .file-info .file-name a').css('max-width',(parseInt(ItemWidth)-self.checkboxWidth-self.iconWidth-self.statusWidth-self.scrollBarWidth)+'px');
            }
        },
        adaptWidthMouseleave: function (item) {
            var self = this;
            var ItemWidth = item.find('.filelist-icon').css('width');
            item.find('.file-area').css('width',(parseInt(ItemWidth)-self.checkboxWidth-self.scrollBarWidth)+'px');
            item.find('.file-area .file-info .file-name a').css('max-width',(parseInt(ItemWidth)-self.checkboxWidth-self.iconWidth-self.statusWidth-self.scrollBarWidth)+'px');
        },
        adaptWidthMouseover: function (item) {
            var self = this;
            var ItemWidth = item.find('.filelist-icon').css('width');
            item.find('.file-area').css('width',(parseInt(ItemWidth)-self.checkboxWidth-self.scrollBarWidth)+'px');
            item.find('.file-area .file-info .file-name a').css('max-width',(parseInt(ItemWidth)-self.checkboxWidth-self.iconWidth-self.statusWidth-self.moreBtnWidth-self.scrollBarWidth)+'px');
        },
        checkAuth:function(e){
            var ctar = $(e.currentTarget), tar = $(e.target);
            if(tar.get(0).tagName=="EM"){//在全文搜索结果中点击文件夹当前对象是EM标签，需要获取父级标签才可以点击打开文件夹
                tar = tar.parent();
            }
            var da = self.data[ctar.attr('index')];

            if (Object.prototype.toString.call(self.currentData) == '[object Array]' && self.currentData.length > 1) {
                var cssAction, actionObj = {}, action, allStatus = {
                    hasDeleted: false,
                    hasNoDeleted: false,
                    hasTeam: false
                };
                for (var i = 0, len = self.currentData.length; i < len; i++) {
                    if (self.currentData[i].isdelete) {
                        allStatus.hasDeleted = true;
                    } else {
                        allStatus.hasNoDeleted = true;
                    }
                    if (self.currentData[i].isTeam && !allStatus.hasTeam) {//是否包含团队
                        allStatus.hasTeam = true;
                    }
                    action = self.currentData[i].action;
                    actionObj[action] = action;
                }

                cssAction = AuthModel.getContextAction(actionObj);
            }else {
                return da.cssAction;
            }
        },
        //显示全局右键菜单
        showWholeRightContextMenu:function(e){
            if (e.button == 2) {
                var px = e.pageX, py = e.pageY;
                var self = this;
                var menu = $('#contextMenuRight');
                menu.removeClass();
                //menu.addClass("pop-menu action-" + self.parentData.action.replace(new RegExp(/(:)/g),"-"));
                menu.addClass("pop-menu action-" + self.cssAction);
                if('/folder/favorite' == location.pathname){
                    menu.find('#trash').css("display","none");
                }else if('/folder/myshare' == location.pathname){
                    menu.find('#upload').css("display","none");
                }
                var top = py;
                top + menu.outerHeight() > $(window).height() && (top -= menu.height())
                if (px > (window.outerWidth - menu.innerWidth())) {
                    px = window.outerWidth - menu.innerWidth();
                }
                menu.css({left: px - 5, top: top});
                menu.show();
                menu.find('li').unbind().bind('click',function(){
                    self.globalRightBtn($(this).attr('id'),$(this));
                });
            }
        },
        //显示全局右键菜单
        globalRightBtn:function(clas,item){
            var self = this;
            switch (clas) {
                case 'upload' :
                    fileDialog.uploadHtml5.openFilesWindow();
                    break;
                case 'addfolder' :
                    self.fire(clas);
                    break;
                case 'refresh' :
                    self._renderList();
                    break;
                case 'trash' :
                    if(self.includeDeleted == 'true'){
                        item.text(_('显示已删除'));
                        $('.header_bot').find('.trash').removeClass('trashShow');
                        self.includeDeleted = 'false';
                        Util.sendDirectlyRequest('文件列表','隐藏已删除','');
                    }else{
                        item.text(_('隐藏已删除'));
                        $('.header_bot').find('.trash').addClass('trashShow');
                        self.includeDeleted = 'true';
                        Util.sendDirectlyRequest('文件列表','显示已删除','');
                    }
                    self._renderList();
                    break;
            }
        }
    });


    return FileList;
})
