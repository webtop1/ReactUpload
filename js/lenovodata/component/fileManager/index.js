;define('component/fileManager/index', function(require, exports){
	var $ = require('jquery'),
		Tips = require('component/tips'),
		EventTarget = require('eventTarget'),
		FileList = require('component/fileManager/fileList'),
		FileAttribute = require('component/fileManager/fileAttribute'),
        FileNavigator = require('component/fileManager/fileNavigator'),
        AuthModel = require('model/AuthManager'),
        FileModel = require('model/FileManager'),
		Favorite = require('component/fileManager/favorite_tools'),
        Util = require('util'),
		FileUploadDialog =require('Upload/index'),
		Dynamic = require('component/dynamic'),
		FileSearchBox = require('component/filesearchbox'),
		FileTree = require('component/fileManager/fileTree'),
		FileController = require('lenovodata/fileController'),
		SearchController = require('lenovodata/searchController'),
		flashCheckDialog = require('component/flashCheckDialog'),
		PreviewController = require('lenovodata/previewController'),
	    AuthUploadManager = require('lenovodata/model/AuthUploadManager');
        require("cookie");
        require('calendar');
    require('i18n');
	var	_ = $.i18n.prop;
	function FileManager(node,type){
		this.node = node;
		this.currentData = null;
		this.firstLoadFlag = false;
		this.type = type;
	}
	$.extend(FileManager.prototype, EventTarget, {
		renderList: function(){
			var self = this;
			if(self.filelist){
				self._renderList();
				self.fire("reload", self);
			}
		},
		_renderList: function(){
			var self = this;
			self.node = $.type(self.node) == 'string' ? $(self.node) : self.node;
			var fa = new FileAttribute('#file-attr-wraper',self.type,self.path);
			$.each(['copymove', 'preview','edit','share', 'exitshare','auth', 'cancelauth','transfer','attribute', 'download', 'history', 'favorite', 'cancelfavorite','cancelFavorite','rename','cleanup', 'recover', 'purge','rmShare','remarkEdit','lock','unlock','reqUnlock','remove'], function(index, key){
				fa.on(key, function(e){
					$('body').data('category',key).data('action','工具栏内按钮').data('content',($.isArray(e)==true)?'-':(e&&e.isfolder)?'文件夹':'文件');
					self[key](e);
				});
			});
			//初始化
			self.node.empty();
			self.filelist = null;
            var fl_from,fl_prefix_neid;
            if((self.type=="share_in"||self.type=="share_out")&&self.currentData){
            	fl_from = self.currentData.from;
            	fl_prefix_neid =self.currentData.prefix_neid;
            }
			var fl = new FileList(self.node, '#template_filelist_fileview', '#template_filelist_filedelete', '#template_filelist_folderview', '#template_filelist_folderdelete', '#template_nofile', self.cssAction,self.type,fl_from,fl_prefix_neid);

			$.each(['preview','edit', 'share', 'auth', 'cancelauth','exitshare','transfer','goback','favorite','cancelfavorite','rename','cleanup', 'copymove', 'expire', 'history', 'attribute', 'recover', 'purge', 'download', 'upload', 'addfolder','rmShare','lock','unlock','reqUnlock','remove','label'], function(index, key){
				fl.on(key, function(e){
					$('body').data('category',key).data('content',e?(($.isArray(e)==true)?'-':e.isfolder?'文件夹':'文件'):'');
					self[key](e);
				});
			});
			fl.pageN = 0;
			fl.on('select', function(e, cur){
				var type;
				if(e.isfolder){
					type = e.isdelete ? 'folderdelete' : 'folder';
				}else{
					type = e.isdelete ? 'filedelete' : 'file';
				}
            	//锁定后隐藏加锁
            	if(e.islocked){
            		$('#fileContextMenu').find('#lock').hide();
            		if(e.unlockAdmin){ //锁定并且只有解锁权限
            			$('#fileContextMenu').find('#unlock').show();
            			$('#fileContextMenu').find('#reqUnlock').hide();
            		}else{//其他用户
            			$('#fileContextMenu').find('#unlock').hide();
            			$('#fileContextMenu').find('#reqUnlock').show();
            		}
            	}else{
            		$('#fileContextMenu').find('#lock').show();
            		$('#fileContextMenu').find('#unlock').hide();
            		$('#fileContextMenu').find('#reqUnlock').hide();
            	}
                if(e.action == 'upload' && !e.isfolder){
                	$('#fileContextMenu').hide();
                }
				//右键菜单——如果有外链，则改为查看外链，别外添加取消外链按钮
				if(e.hasDelivery){
					$(".pop-menu #share").text(_('查看外链'));
					$(".pop-menu #rmShare").show();

					if($(".pop-menu").hasClass('action-download') || $(".pop-menu").hasClass('action-preview') ||
					$(".pop-menu").hasClass('action-upload') || $(".pop-menu").hasClass('action-upload-download')){
						$(".pop-menu #rmShare").hide();
					}
				}else{
					$(".pop-menu #share").text(_('外链分享'));
					$(".pop-menu #rmShare").hide();
				}
				//渲染文件列表右侧的文件属性
				if(e.isdelete){
					var op_map = {rename:_("重命名"),'delete':_("删除"),move:_("移动")};
					FileModel.info(function(res){
						if(res.code==200){
							e['deleted_ops'] = op_map[res.data['deleted_ops']];
							fa.render(type,e);
						}
					},e.path,e.path_type,e.from, e.neid);
				}else{
					fa.render(type, e);
				}
                if(!Util.haveDirAuth(e) ||　/share_in/.test(e.path_type)){
					$('#auth').hide();
				} else {
					$('#auth').css("display","block");
                }
				if(!e.isfolder && !Util.canPreview(e.mimeType)){
                    $('#preview').hide();
                    $(".filelist-header-auth").find("span.preview").hide();
                }

				if(!e.isfolder && !Util.canEdit(e.mimeType)){
					//$('#preview').hide();
					$(".filelist-header-auth").find("span.edit").hide();
				}


				//团队文件夹隐藏右键和顶部移动/复制、重命名和删除按钮
				if(e.isfolder && e.isTeam || e.action !="edit"){
            		$('#folderContextMenu').find('#rename').hide();
            		$('#folderContextMenu').find('#remove').hide();
            		$(".filelist-header-auth").find("span.rename").hide();
            		$(".filelist-header-auth").find("span.delete").hide();
            		if(/download/.test(e.action) || (/edit/.test(e.action)) ){
            			$('#folderContextMenu').find('#copymove').show();
            			$('#fileContextMenu').find('#copymove').show();
            		    $(".filelist-header-auth").find("span.copy").css("display","block");
            		}else{
            			$('#folderContextMenu').find('#copymove').hide();
            			$('#fileContextMenu').find('#copymove').hide();
            		    $(".filelist-header-auth").find("span.copy").hide();
            		}
				}else{
					$('#folderContextMenu').find('#rename').show();
            		$('#folderContextMenu').find('#copymove').show();
            		$('#folderContextMenu').find('#remove').show();

            		$(".filelist-header-auth").find("span.rename").css("display","block");
            		$(".filelist-header-auth").find("span.copy").css("display","block");
            		$(".filelist-header-auth").find("span.delete").css("display","inline-block");
				};
				//个人文件、我的共享 下分享的文件显示移交权限和取消共享按钮
				if(e.isfolder&&!e.isTeam&&self.type!='share_in'&&self.type!='favorite'&&self.type!="ent"){
                	if(e.isShare){
                		$('#folderContextMenu').find(".transfer").show();
                		$('#folderContextMenu').find(".cancelauth").show();
                		$(".filelist-header-auth").find("span.transfer").css("display","block");
            			$(".filelist-header-auth").find("span.cancelauth").css("display","block");
                	}else{
                		$('#folderContextMenu').find(".transfer").hide();
                		$('#folderContextMenu').find(".cancelauth").hide();
                		$(".filelist-header-auth").find("span.transfer").hide();
            			$(".filelist-header-auth").find("span.cancelauth").hide();
                	}
	            }
				//定期清理
				if(!e.isfolder || e.isTeam || e.action !="edit"){
					$('#folderContextMenu').find("#cleanup").hide();
					$(".filelist-header-auth").find("span.cleanup").hide();
				}else{
					$('#folderContextMenu').find("#cleanup").css("display","block");
					$(".filelist-header-auth").find("span.cleanup").css("display","block");
				}
	             //企业空间和收到的共享 一级目录(非大管理员下) 和团队文件夹 重命名删除 隐藏
	             if((/share|ent/.test(e.path_type)&&/^\/([^\/]+)$/.test(e.path)&& !Util.isAdmin()) ||e.isTeam){
	            		$('#folderContextMenu').find('#rename').hide();
	            		$('#folderContextMenu').find('#remove').hide();
					 $(".filelist-header-auth").find('.rename').hide();
					 $(".filelist-header-auth").find('.delete').hide();
				 }
				if(("share_out"==this.type || "share_in"==this.type) && self.path=="" ){
					//我的共享根目录,隐藏删除、重命名按钮操作
					$('#folderContextMenu').find('#rename').hide();
					$('#folderContextMenu').find("#remove").hide();
					$(".filelist-header-auth").find("span.delete").hide();
					$(".filelist-header-auth").find('span.rename').hide();
				}
				//退出共享
				if("share_in"==this.type){
					if(e.share_to_personal==true&&self.path==""){
						$('#folderContextMenu').find("#exitshare").show();
						$('.filelist-header-auth').find(".fileAttribute span.exitshare").show();
					}else{
						$('#folderContextMenu').find("#exitshare").hide();
						$('.filelist-header-auth').find(".fileAttribute span.exitshare").hide();
					}
				};

				//收藏页面隐藏删除、重命名、移动/复制、收藏按钮
				if(e.path_type_old == "favorite") {
					if (e.isfolder){
						$('#folderContextMenu').find('#rename').hide();
						$('#folderContextMenu').find('#copymove').hide();
						$('#folderContextMenu').find('#remove').hide();
						$('#folderContextMenu').find('#favorite').hide();
						$(".pop-menu #cancelfavorite").show();
						$(".filelist-header-auth").find("span.rename").css("display", "none");
						$(".filelist-header-auth").find("span.copy").css("display", "none");
						$(".filelist-header-auth").find("span.delete").css("display", "none");
						$(".filelist-header-auth").find("span.favorite").css("display", "none");
					}else{
						$('#fileContextMenu').find('#rename').hide();
						$('#fileContextMenu').find('#copymove').hide();
						$('#fileContextMenu').find('#remove').hide();
						$('#fileContextMenu').find('#favorite').hide();
						$(".pop-menu #cancelfavorite").show();
						$("#auth").css("display","none");
						$(".filelist-header-auth").find("span.rename").css("display","none");
						$(".filelist-header-auth").find("span.copy").css("display","none");
						$(".filelist-header-auth").find("span.delete").css("display","none");
						$(".filelist-header-auth").find("span.favorite").css("display","none");
					}
				} else{
					//除收藏页面收藏按钮显示
					if(e.is_bookmark){
						if (e.isfolder){
							$('#folderContextMenu').find('#favorite').hide();
							$(".filelist-header-auth").find("span.favorite").css("display", "none");
							$('#folderContextMenu').find('#cancelfavorite').show();
							$(".filelist-header-auth").find("span.cancelfavorite").css("display", "inline-block");
						}else{
							$('#fileContextMenu').find('#favorite').hide();
							//$(".pop-menu #cancelfavorite").show();
							$(".filelist-header-auth").find("span.favorite").css("display","none");
							$('#fileContextMenu').find('#cancelfavorite').show();
							$(".filelist-header-auth").find("span.cancelfavorite").css("display", "inline-block");
						}
					}else{
						if (e.isfolder){
							$('#folderContextMenu').find('#favorite').show();
							$(".filelist-header-auth").find("span.favorite").css("display", "inline-block");
							$('#folderContextMenu').find('#cancelfavorite').hide();
							$(".filelist-header-auth").find("span.cancelfavorite").css("display", "none");
						}else{
							$('#fileContextMenu').find('#favorite').show();
							//$(".pop-menu #cancelfavorite").show();
							$(".filelist-header-auth").find("span.favorite").css("display","inline-block");
							$('#fileContextMenu').find('#cancelfavorite').hide();
							$(".filelist-header-auth").find("span.cancelfavorite").css("display", "none");
						}
					}
				}
				//隐藏fileMore
        		var oUl = $('.filelist-header-auth').find('ul');
        		var iMore = $('.filelist-header-auth').find('.fileMore');
            	var aSpan = oUl.find('span');
            	var count=0;
            	for(var i=0;i<aSpan.length;i++){
            		if(aSpan.eq(i).css('display') != 'none'){
            			count++;
            		}
            	}
            	if(count<1){
            		iMore.hide();
            	}
			});
			fl.on('multiSelect', function(thisref, datas){
				var folder = 0, file = '', deleted = false, undeleted = false, type;
				var e =thisref.currentData;
				$.each(e, function(index, item){
					file += item.isfolder? '1' : '0';
					item.isdelete ? deleted=true : undeleted=true;
				});
				if(deleted && undeleted){
					fa.render('multi', datas,thisref);
				} else if (deleted) {
					var result = folder^parseInt(file, 2);
					type = result==0? 'multi-filedelete': (result==1? 'multi-folderdelete': 'multi-delete');
					fa.render(type, datas,thisref);
				} else {
					if(thisref.path==''){
						fa.render('multi', datas);
					}else{
						fa.render('multi', datas,thisref);
					}
				}
				//全文搜索模式下，多文件禁止打包下载
				if(self.isSearch){
					$(".filelist-header-auth").find("span.download").hide();
				}

			});
			fl.on('unselect', function(e){
				//取消选择时，右侧动态详情，默认显示父级文件夹详情
				if(self.path !=''){
					fa.render('folder',e);
				}else{
					//取消选择时，若当前类型为 我的共享/收到的共享 && 为根路径，右侧动态详情，默认显示共享模版
					if((self.type == 'share_in' || self.type == 'share_out')&&self.path ==''){
						fa.render('shared',fl.data);
					}else if(self.type == 'favorite'){
						fa.render('favorite',fl.data);
					}else{
						fa.render('init');
					}
				};
			});
			fl.on('folderClick', function(da){
				//指定该文件的path_type
				self.type = da.path_type;

				//在收藏页面点击文件夹直接跳转到此文件夹原路径
				if(da&&(da.path_type_old == "favorite" || /^<em>/.test(da.filename))){
					Favorite.changePath(da.path_type);
				}
                if (da&&!da.isdelete) {
                	self.currentData = da;
                	if(parseInt(da.from) > 0){
                		localStorage.setItem('from',da.from);
                	}
                	if(parseInt(da.prefix_neid) > 0){
                		localStorage.setItem('prefix_neid',da.prefix_neid);
                	}
                	Util.sendDirectlyRequest('打开文件夹',$('body').data("action"),'-');
                    self.browse('/'+da.path, da.cssAction);
                    fa.render('folder', da);
                }
			});
			fl.on('afterRender', function(da){
				if(self.path != ''){
					fa.render('folder', da);
				}else{
					//fa.render();
				}
				//面包屑返回上级时，重新渲染头部
				var ca =self.currentData = fl.parentData;
				var hassearchresult = $("#fileManagerHeader>.fileManager_top").hasClass('vh');
				if(ca){
					self._renderHeader(ca.path, ca.cssAction);
				}
                if(hassearchresult){
                	self._renderHeader(self.path,self.cssAction);
                }
				if(!self.firstLoadFlag){
					self.firstLoadFlag = true;
					self.fire('loadComplete');
				}
			});

			fl.on('shareInit', function(da){
				if(self.type == 'share_in' || self.type == 'share_out'){
					if(self.path == ''){
						fa.render('shared', da,self);
					}
				}else if(self.type == 'favorite'){
					if(self.path == ''){
						fa.render('favorite', da,self);
					}
				}
			});
			fl.on("reload",function(){
				//新建文件夹时刷新列表同时刷新树结构
				self.fire("reload");
			});
			setTimeout(function(){
				fl.renderByPath(self.path);
			}, 125);
			self.filelist = fl;
			self.fa = fa;
		},

		_renderHeader: function(path, cssAction){
			var self = this;
			var names = path.split('/');
			var cname = names[names.length-1], icon;
			if(cname==''){
				icon = 'folder_global';
			}else{
				icon = 'folder';
				if(self.currentData){
					if(self.currentData.isShare&&self.currentData.team){
						icon = "folder_team";
					}else if(self.currentData.isShare){
						icon = "folder_share";
					}else{
						icon = "folder";
					}
				}
			}
			var data = {
				name: cname==''?Util.getRootDisplayName():cname,
				icon: icon,
				role: Util.isBusiness()?'admin':'user',
				cssAction: cssAction
			};
			var tmpl_head = $('#template_fileManager_head').html();
			tmpl_head = Mustache.render(tmpl_head, data);
			var header = $('#fileManagerHeader');
			header.empty();
			header.append(tmpl_head);
			if(!/upload|edit/.test(data.cssAction)){
				$(".uploadButton").css("left",0).show();
			}else{
				$(".uploadButton").css("left",Util.getElementXPos(document.getElementById("upload_button"))).show();
			}

			//动态
			var dynamicTab = $('.infoTab .infoTabHead span.infoTabDynamic');
			if(dynamicTab.hasClass('active')){
				$('.show-dynamic-button').addClass('dynamicShow');
			}else{
				$('.show-dynamic-button').removeClass('dynamicShow');
			}
			//显示已删除
			if(self.filelist&&self.path !=''){
				var trash = $('.header_bot').find('.trash');
				var text = trash.find('.i-trashBtn');
				if(self.filelist.includeDeleted == 'false'){
                	trash.removeClass('trashShow');
                    text.attr('title',_('显示已删除'));
                    $('#trash').text(_('显示已删除'));
                    Util.sendDirectlyRequest('文件列表','隐藏已删除','');
                }else{
                	trash.addClass('trashShow');
                    text.attr('title',_('隐藏已删除'));
                    $('#trash').text(_('隐藏已删除'));
                    Util.sendDirectlyRequest('文件列表','显示已删除','');
                }
			}
			$('#fileManagerHeader').height(50);
			var h = $('.page-body').height(),
				fh = h-$('#fileManagerHeader').outerHeight();
        	$('#fileManagerWraper').height(fh);
			//导航
            var fnav = new FileNavigator({cssAction: self.cssAction,path_type:self.type});
            if (names[0] !== "") {
                names.unshift("");
            }
            fnav.render(names, 430);
            fnav.on("changePath", function(path, cssAction) {
                self.browse(path, cssAction);
            });
        	var uploadbtn = header.find('.uploadButton'),
        		addfolderbtn = header.find('.addfolder');
            //当个人的quota为0的时候，根目录的上传和新建文件夹按钮不显示
            var quota = window.LenovoData && window.LenovoData.user.user_info.quota;
            var userRole = window.LenovoData && window.LenovoData.user.user_role;
//          if ((quota == 0 || names.join("") == "") && self.type =='self') {个人空间根目录下 上传按钮和新建文件夹也被隐藏了！
            if ((quota == 0 && self.type =='self')||cssAction=="list") {
                 uploadbtn.hide();
                $("#fileManagerHeader .button-area").hide();
            }
        	addfolderbtn.on('click', function(){
        		$('body').data('category','addfolder').data('action','工具栏内按钮').data('content','文件夹');
        		self.addfolder();
        	});
	        //选择文件
	        $('.path').click('click',function(event){
        		fileTree.render();
	        	var top = Util.getElementYPos(this) + $(this).outerHeight();
	        	var left = Util.getElementXPos(this);
	        	$('#filetree').css({'top':top,'left':left});
	        	if($('#filetree').css('display') != "block"){
	        		$("#filetree").show();
	        	}else{
	        		$('#filetree').hide();
	        	}
        		event?event:window.event;
				event.cancelBubble=true;
				event.stopPropagation();
	        });
            //--------------------------------------------------
            var trash = $('.header_bot').find('.trash');
            trash.on('click', function(){
                var text = trash.find('.i-trashBtn');
                if(self.filelist.includeDeleted == 'true'){
                	trash.removeClass('trashShow');
                    text.attr('title',_('显示已删除'));
                    $('#trash').text(_('显示已删除'));
                    self.filelist.includeDeleted = 'false';
                    Util.sendDirectlyRequest('文件列表','隐藏已删除','');
                }else{
                	trash.addClass('trashShow');
                    text.attr('title',_('隐藏已删除'));
                    $('#trash').text(_('隐藏已删除'));
                    self.filelist.includeDeleted = 'true';
                    Util.sendDirectlyRequest('文件列表','显示已删除','');
                }
                self.filelist._renderList();
            });
            //-----------------------------------------------------------
            var headMenu = ("#head")
            var filesearchbox = new FileSearchBox($(headMenu).find("#file-searchbox"),function(flag){
            	if(flag){
            		$('.uploadButton').hide();
            		$(header).find(".fileManager_top").addClass("vh");
            		$(header).find(".search-result").show();
					self.isSearch=true;
            	}else{
            		$('.uploadButton').show();
            		$(header).find(".fileManager_top").removeClass("vh");
            		$(header).find(".search-result").hide();
					self.isSearch=false;
            	}
            });
		},

		browse: function(path, cssAction){
			if(!path) return;
            path = path.replace('\/\/','\/');
			var self = this;
			if(path.slice(0, 1) == '/'){
				path = path.slice(1);
			}
			self.path = path;
            //为了严格控制导航部分是否显示上传和新建文件夹按钮
            if (path == ""){
            	if("/folder/shared"==location.pathname||"/folder/myshare"==location.pathname){
	            	cssAction = AuthModel.ACTION.PREVIEW;
	            }else if("/folder/favorite"==location.pathname){//我的收藏页面只有预览权限
                    cssAction = AuthModel.ACTION.PREVIEW;
                }else if("/folder/self"==location.pathname){
            	    cssAction = AuthModel.ACTION.EDIT;
                }else{
                	if(Util.isBusiness()){
                		cssAction = AuthModel.ACTION.EDIT;//大管理员在企业空间有最大权限
                	}else{
                		cssAction = AuthModel.ACTION.PREVIEW;//团队管理员和普通用户只能预览
                	}
                }
            }
            self.cssAction = cssAction;
			self._renderHeader(path, cssAction);
			self._renderList();
			//本地记录 解决F5刷新仍然回到当前目录
			if(path==""){
				localStorage.removeItem("currentPath");
				localStorage.removeItem("cssAction");
			}else{
				localStorage.setItem("currentPath",path);
				localStorage.setItem("cssAction",cssAction);
			}
			flashCheckDialog.checkFlash();
			this.upload(self.cssAction);
		},
		upload: function(cssAction){
			var self = this;
			if(swfUploadDom != null){
				swfUploadDom.setFolder(self.path,self.type,self.filelist.from,self.filelist.prefix_neid);
				return;
			}
			window.fileDialog = new FileUploadDialog(self.path,"", self.type, self.filelist.from, self.filelist.prefix_neid);
			swfUploadDom = fileDialog;
			fileDialog.on('close', function(count){
				swfUploadDom = null;
				if(count>0){px
					self._renderList();
				}
			});
			fileDialog.on('update', function(count){
				self._renderList();
			});
			var flag = false;
			fileDialog.on('completeOne', function(total){
				flag = true;
				function wait(){
					setTimeout(function(){
						if(flag){
							flag = false;
							wait();
						}else{
							self.filelist._renderList();
						}
					}, 200);
				}
				setTimeout(function(){
					flag = false;
					wait();
				}, 200);
			});
		},
		addfolder: function(){
			var self = this;
			FileController(self.filelist,'addfolder',self.path);
		},
		copymove: function(e){
			var self = this;
			FileController(self, 'copymove', e);
		},
		//删除
		'remove': function(e){
			var self = this;
			FileController(self, 'remove', e);
		},
		preview: function(e){
			var self = this;
			PreviewController(self, 'preview', e, self.filelist.data);
		},
    edit:function(e){
        var self = this;
        PreviewController(self, 'edit', e, self.filelist.data);
    },
		share: function(e){
			var self = this;
			FileController(self, 'share', e);
		},
		//取消外链
		rmShare: function(e){
			var self = this;
			FileController(self, 'rmShare', e);
		},
		label: function(e){
			var self = this;
			FileController(self, 'label', e);
		},
		exitshare:function(e){
			var self = this;
			FileController(self.filelist,'exitshare',e);
		},
		lock: function(e){
			var self = this;
			FileController(self,'lock',e);
		},
		unlock: function(e){
			var self = this;
			FileController(self,'unlock',e);
		},
		reqUnlock: function(e){
			var self = this;
			FileController(self,'reqUnlock',e);
		},
		download: function(e){
			var self = this;
			FileController( self, 'download', e);
		},
		history: function(e){
			var self = this;
			FileController( self, 'history', e);
		},
		remarkEdit:function(e){
			FileController(this,"remarkEdit",e);
		},
		favorite: function(e){
			var self = this;
			FileController( self, 'favorite', e);
		},
		cancelfavorite: function(e){
			var self = this;
			FileController( self, 'cancelFavorite', e);
		},
		cancelFavorite: function(e){
			var self = this;
			FileController( self, 'cancelFavorite', e);
		},
		rename: function(e){
			var self = this;
			FileController( self, 'rename', e);
		},
		cleanup: function(e){
			var self = this;
			FileController(self, 'cleanup', e);
		},
		recover: function(e){
			var self = this;
			FileController(self, 'recover', e);
		},
		purge: function(e){
			var self = this;
			FileController( self, 'purge', e);
		},
		auth: function(e){
			var self = this;
			FileController(self, 'auth', e);
		},
		cancelauth:function(e){
			var self = this;
			FileController(self.filelist, 'cancelauth', e);
		},
        transfer:function(e){
        	var self = this;
        	FileController(self.filelist,'transfer',e);
        },
		expire: function(e){
			var self = this;
			FileController(self, 'expire', e);
		},
		attribute: function(e){
			var self = this;
			FileController( self, 'attribute', e);
		},
		remarkEdit:function(e){
			FileController(this,"remarkEdit",e);
		},
		reload: function(){
			var self = this;
			self.filelist._renderList();
            //self.fire("reload", self);
		},
        processSearch:function(result){
        	var self = this;
        	$(".search-result>.searchNav").html(_("共搜索出{0}个结果",result));
        },
		getState: function(){
			var self = this;
			if(swfUploadDom){
				return swfUploadDom.getState();
			}
		},
		dargDownload:function(){

		}
	});
	return FileManager;
})
