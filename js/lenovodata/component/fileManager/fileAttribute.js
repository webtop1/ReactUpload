;define('component/fileManager/fileAttribute', function(require, exports){
	var $=require('jquery'),
		EventTarget = require('eventTarget'),
		UserModel = require('model/UserManager'),
		AccountModel = require('model/AccountManager'),
		Scroll = require('component/scroll'),
		AuthModel = require('model/AuthManager'),
		Tips = require("component/tips"),
		ShareMemberDialog = require("component/shareMemberDialog"),
		Dynamic = require('component/dynamic'),		
		Util = require('util');
	require('i18n');
	var	_ = $.i18n.prop;
	require('mustache');

	function FileAttribute(node,path_type,path){
		this.node = $.type(node) == 'string' ? $(node) : node;
		this.path_type = path_type || '';
		this.path = path||'';
		this.render();
	}

	$.extend(FileAttribute.prototype, EventTarget, {
		render: function(type, data,selfData){
			var self = this;
			var headerAuth = $('.filelist-header-auth');

			self.node.empty();
			if(data&&data.name){
				data.name=data.name.replace(/\<em\>/g,"").replace(/\<\/em\>/g,"");
			}
			if(data&&data.filename){
				data.filename=data.filename.replace(/\<em\>/g,"").replace(/\<\/em\>/g,"");
			}
			self.data = data;
			function computeSize(da){
				var tot=0;
				for(var i=0, ii=data.length; i<ii; i++){
					var sizeStr = data[i].size;
//					if(sizeStr.indexOf('KB') != -1){
//						sizeStr = sizeStr.replace(/\s*KB\s*$/, '')*1024;
//					}else if(sizeStr.indexOf('MB') != -1){
//						sizeStr = sizeStr.replace(/\s*MB\s*$/, '')*1024*1024;
//					}else if(sizeStr.indexOf('G') != -1){
//						sizeStr = sizeStr.replace(/\s*G\s*$/, '')*1024*1024*1024;
//					}
					tot += parseInt(sizeStr);
				}
				return Util.formatBytes(tot);
			}

			if(!type && (self.path_type == 'share_in' || self.path_type == 'share_out')&& self.path == '' ){
				type = 'shared';
			}
			//收藏
			if(!type && self.path_type == 'favorite' && self.path == ''){
				type = 'favorite';
			}

			var template, temp, templateDetail, tempDetail;
			switch(type){
				case 'folder':
					tempDetail = $('#template_folderAttribute_detail').html();
					temp = $('#template_folderAttribute').html();
				break;
				case 'file':
					tempDetail = $('#template_fileAttribute_detail').html();
					temp = $('#template_fileAttribute').html();
				break;
				case 'folderdelete':
					tempDetail = $('#template_folderAttribute_deleteDetail').html();
					temp = $('#template_folderAttribute_delete').html();
				break;
				case 'filedelete':
					tempDetail = $('#template_fileAttribute_filedelete').html();
					temp = $('#template_folderAttribute_delete').html();		
				break;
				//收藏页面列表头部显示操作按钮
				case 'favorite':
					var obj={};
					if(data){
						obj.countAll = data.length;
						obj.folderCounts = 0;
						obj.fileCounts = 0;
						for(var i = 0,len = data.length;i<len;i++){
							if(data[i].isfolder){
								obj.folderCounts ++;
							}else{
								obj.fileCounts ++;
							}
						}
					}else{
						obj.countAll = 0;
						obj.folderCounts = 0;
						obj.fileCounts = 0;
					}
					//tempDetail = $('#template_folderAttribute_favorite_detail').html();
					//tempDetail = Mustache.render(tempDetail,obj);
					break;
				case 'shared':
					var obj={};
					if(data){
						obj.countAll = data.length;
					}else{
						obj.countAll = 0;
					}
					if(data&&data.path !=''&& selfData&& selfData.type !='share_in' && selfData.type !='share_out'){
						tempDetail = $('#template_folderAttribute_detail').html();
						tempDetail = Mustache.render(tempDetail,data);						
					}else{		
						tempDetail = $('#template_fileAttribute_shared').html();
						if(obj.countAll<2){
							tempDetail = tempDetail.replace(/<p>(.)+<\/p>/,"<p>"+_('共有{0}个共享文件夹',obj.countAll)+"</p>");
						}
						tempDetail = Mustache.render(tempDetail,obj);
					}
					
				break;
				case 'multi':
					var curData,parentData;
					if(self.path_type == "favorite"){
						var obj={};
						if(data){
							obj.countAll = data.length;
							obj.cssAction = data.cssAction;
							obj.folderCounts = 0;
							obj.fileCounts = 0;
							for(var i = 0,len = data.length;i<len;i++){
								if(data[i].isfolder){
									obj.folderCounts ++;
								}else{
									obj.fileCounts ++;
								}
							}
						}else{
							obj.countAll = 0;
							obj.folderCounts = 0;
							obj.fileCounts = 0;
						}
						temp = $('#template_fileAttribute_favorite_multi').html();
						tempDetail = $('#template_folderAttribute_favorite_detail').html();
						template = Mustache.render(temp,obj);
						tempDetail = Mustache.render(tempDetail,obj);
						break;
					}else if(!selfData){
						templateDetail = $('#template_fileAttribute_init').html();
					}else{
						curData = selfData.currentData;
						parentData = selfData.parentData;
						tempDetail = $('#template_folderAttribute_detail').html();
					}
					//判断所选的多个文件有几个是已经收藏的
					var showFavoriteBtnStatus = false;
					for(var i = 0,len = data.length;i<len;i++){
						if(!data[i].is_bookmark){
							showFavoriteBtnStatus = true;
							break;
						}
					}
					temp = $('#template_fileAttribute_multi').html();
					var obj = {}, actionObj={}, allStatus={hasDeleted:false, hasNoDeleted:false,hasTeam:false};
						obj.count = data.length;
						for(var i=0, ii=data.length; i<ii; i++){
	                        var action = data[i].action;
	                        actionObj[action] = action; 
	                        if (data[i].isdelete) {
	                            allStatus.hasDeleted = true;
	                        } else {
	                            allStatus.hasNoDeleted = true;
	                        }
							if(data[i].isTeam&&!allStatus.hasTeam){//是否包含团队
								allStatus.hasTeam = true;
							}
						}
						obj.size = computeSize(curData);
	                    obj.cssAction = AuthModel.getContextAction(actionObj);
	                    //删除文件和未被删除文件同时选择时，上下文不显示
	                    if (allStatus.hasDeleted && allStatus.hasNoDeleted) {
	                       obj.cssAction = AuthModel.ACTION.LIST; 
	                    }

					template = Mustache.render(temp, obj);
					tempDetail = Mustache.render(tempDetail, parentData);
				break;
				case 'multi-filedelete':
					temp = $('#template_fileAttribute_multifiledelete').html();
					if(data){
						var obj = {count: data.length, size: computeSize(data), cssAction: AuthModel.ACTION.DELETE};
						template = Mustache.render(temp, obj);
					} 
				break;
				case 'multi-folderdelete':
					temp = $('#template_fileAttribute_multifolderdelete').html();
					if(data){
						var obj = {count: data.length, size: computeSize(data), cssAction: AuthModel.ACTION.DELETE};
						template = Mustache.render(temp, obj);
					}
				break;
				case 'multi-delete':
					var curData,parentData;
					if(!data.path){
						curData = data;
						templateDetail = $('#template_fileAttribute_init').html();
					}else{
						curData = data.currentData;
						parentData = data.parentData;
						tempDetail = $('#template_folderAttribute_detail').html();
					}				
					temp = $('#template_fileAttribute_multifiledelete').html();
					if(data){
						var obj = {count: data.length, size: computeSize(data), cssAction: AuthModel.ACTION.DELETE};
						template = Mustache.render(temp, obj);
						tempDetail = Mustache.render(tempDetail, parentData);
					}
				break;
				default:
					if((!type || type == 'init') && self.path ==''){
						templateDetail = $('#template_fileAttribute_init').html();
						headerAuth.hide();
						if(data) data.cssAction = AuthModel.ACTION.DELETE; 
					}
				break;
			}
			if(!template){
				template = Mustache.render(temp, data);
			};	
			if(!templateDetail){
				templateDetail = Mustache.render(tempDetail, data);
			};	
			headerAuth.html('');
			headerAuth.append(template);
			self.node.append(templateDetail);

			if(showFavoriteBtnStatus){
				$(".filelist-header-auth .file-operate").find('.favorite').show();
				$(".filelist-header-auth .file-operate").find('.cancelfavorite').hide();
			}else{
				$(".filelist-header-auth .file-operate").find('.favorite').hide();
				$(".filelist-header-auth .file-operate").find('.cancelfavorite').show();
			}
			if(allStatus&&allStatus.hasTeam){//如果多选选中的包含团队文件夹，则隐藏删除按钮
				headerAuth.find('.delete').css("display","none");
			}
			if(Object.prototype.toString.call(data) != "[object Array]" && data&& data.hasOwnProperty('path')){
				new Dynamic('#file-attr-wraper',self.data.path_type,self.data.path,self.data.neid,self.data.prefix_neid,self.data.from);
			}
			var dynamicTab = $('.conright').find('.infoTab .infoTabHead span.infoTabDynamic');
			if(dynamicTab.hasClass('active')){
				$('.show-dynamic-button').addClass('dynamicShow');
			}else{
				$('.show-dynamic-button').removeClass('dynamicShow');
			}
            if (type == 'init' || type == undefined || type == 'multi' || type == 'multi-delete'  ) {
                var _updateQuota = function(used, quota) {
                	$('.space-bar').eq(0).html('<span style="width:' + (used/quota*200) + 'px"></span>');
                    var quota = Util.formatBytes(quota);
                    var used = Util.formatBytes(used);
                    $("#space-used").html(used);
                    $("#space-quota").html(quota);                
                }
                if (Util.isAdmin()) {
                    AccountModel.quota_get(function(ret) {
                        var quota = ret.data.space.limit;
                        var used = ret.data.space.used;
                        _updateQuota(used, quota);
                    });
                } else {
                    UserModel.quota(function(space) {
                        var quota = space.quota;
                        var used = space.used;
                        _updateQuota(used, quota);
                    });
                }
            }
			
			
			var auth = headerAuth.find('.auth');
            if(self.data && Util.haveDirAuth(self.data) &&　!(/share_in/.test(self.data.path_type))){
				auth && (auth.css("display","inline-block"));
			}else{
				auth && (auth.css("display","none"));
			}
            
            if(self.data&&self.data.isfolder && (self.data.action == "upload:delivery" ||  self.data.action == "download:delivery" ||  self.data.action == "upload:download:delivery")){
            	//$('#folderContextMenu').find('#share').css("display","block");
            	$(".action-upload-delivery .link").css("display","inline-block");
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
			
			//控制备注编辑显示  (没有创建者不让修改备注|非创建者本人不让修改备注)
			if(self.data&&self.data.creator_uid){
				if(self.data&&(self.data.creator_uid==Util.getUserID()||(Util.isAdmin() && !(/share_in/.test(self.data.path_type))))){
					$('.fileAttribute').find(".remark-edit").show();
				};
				if(self.data&&(self.data.creator_uid==Util.getUserID()||Util.isAdmin())&& self.data.isfolder && !self.data.team ){
					$('.fileAttribute').find(".cleanup").css('display','inline-block');
				}else{
					$('.fileAttribute').find(".cleanup").hide();
				};
			}else{
				if(self.data&&(self.data.creator==Util.getUserName()||(Util.isAdmin() && !(/share_in/.test(self.data.path_type))))){
					$('.fileAttribute').find(".remark-edit").show();
				};
				if(self.data&&(self.data.creator==Util.getUserName()||Util.isAdmin())&& self.data.isfolder && !self.data.team ){
					$('.fileAttribute').find(".cleanup").css('display','inline-block');
				}else{
					$('.fileAttribute').find(".cleanup").hide();
				};				
			}
//			if((self.data&&self.data.creator)||(self.data&&self.data.creator&&self.data.creator!=Util.getUserName())){
//				$('.fileAttribute').find(".remark-edit").remove();
//			}
            //显示共享文件夹的成员数
            if(self.data&&self.data.isShare){
            	var entrys = [{neid:self.data.neid}],members;
            	AuthModel.list_by_batch_resource(function(ret){
            		if(ret.code==200){
            			members = ret.data;
            			self.node.find(".file-share-user .user-num").html(members.length>99?"99+":members.length);
            		}
            	},JSON.stringify(entrys),(this.path_type=='ent')?0:1);
            	self.node.find(".file-share-user").on("click",function(e){
            		if($("body").find(".lui-hover-dialog").length!=0){
            			$("body").find(".lui-hover-dialog").remove();
            		}else{
            			Util.sendDirectlyRequest("主页面","点击右侧栏成员数","-");
            			var memberDialog = new ShareMemberDialog(self.node.find(".file-share-user"),{data:members});
            		}
            	});
            }
			
			var preview = headerAuth.find('.preview'),
                edit=headerAuth.find(".edit"),
				link = headerAuth.find('.link'),
				_delete = headerAuth.find('.delete'),
				rename = headerAuth.find('.rename'),
                favorite = headerAuth.find('.favorite'),
				cancelFavorite = headerAuth.find('.cancelfavorite'),
				cleanup = headerAuth.find('.cleanup'),
				download = headerAuth.find('.download'),
				copy = headerAuth.find('.copy'),
				history = headerAuth.find('.history'),
				recovery = headerAuth.find('.undo'),
				purge = headerAuth.find('.purge'),
				auth = headerAuth.find('.auth'),
				transfer = headerAuth.find(".transfer"),
				attribute = headerAuth.find('.attribute'),
				cancelauth = headerAuth.find('.cancelauth'),
				remarkEdit = self.node.find(".remark-edit"),
				attribute = self.node.find('.attribute'),
				rmShare = headerAuth.find('.rmShare'),
				exitShare = headerAuth.find('.exitshare'),
				lock = headerAuth.find('.lock'),
				unlock = headerAuth.find('.unlock'),
				reqUnlock = headerAuth.find('.reqUnlock');

			if(preview){
				preview.on('click', function(){
					self.fire('preview', self.data);
				});
			}
            if(edit.length>0){
                edit.on('click', function(){
                    self.fire('edit', self.data);
                });
            }
			if(link){
				link.on('click', function(){
					self.fire('share', self.data);
				});
			}
			if(_delete){
				_delete.on('click', function(){
					self.fire('remove', self.data);
				});
			}
			if(copy){
				copy.on('click', function(){
					self.fire('copymove', self.data);
				});
			}
			if(favorite){
                favorite.on('click', function(){
					self.fire('favorite', self.data);
				});
			}
			if(cancelFavorite){
				cancelFavorite.on('click', function(){
					self.fire('cancelFavorite', self.data);
				});
			}
			if(rename){
				rename.on('click', function(){
					self.fire('rename', self.data);
				});
			}
			if(cleanup){
				cleanup.on('click', function(){
					self.fire('cleanup', self.data);
				});
			}
			if(history){
				history.on('click', function(){
					self.fire('history', self.data);
				});
			}
			if(recovery){
				recovery.on('click', function(){
					self.fire('recover', self.data);
				});
			}
			if(purge){
				purge.on('click', function(){
					self.fire('purge', self.data);
				});
			}
			if(download){
				download.on('click', function(){
					self.fire('download', self.data);
				});
			}
			if(auth){
				auth.on('click', function(){
					self.fire('auth', self.data);
				});
			}
			if(transfer){
				transfer.on("click",function(){
					self.fire('transfer', self.data);
				});		
			}
			if(cancelauth){
				cancelauth.on("click",function(){
					self.fire('cancelauth', self.data);
				});		
			}
			if(rmShare){
				rmShare.on('click',function(){
					self.fire('rmShare',self.data);
				});
			}
			if(exitShare){
				exitShare.on('click',function(){
					self.fire('exitshare',self.data);
				})
			}
			if(remarkEdit){
				remarkEdit.on("click",function(){
					self.fire("remarkEdit",self.data);
				})
			}
			if(lock){
				lock.on('click', function(){
					self.fire('lock',self.data);
				});
			}
			if(unlock){
				unlock.on('click', function(){
					self.fire('unlock',self.data);
				});
			}
			if(reqUnlock){
				reqUnlock.on('click',function(){
					self.fire('reqUnlock',self.data);
				});
			}
			if(attribute){
				attribute.on('click',function(){
					var onOff = true;
					self.fire('attribute',self.data,onOff);
				});
			}
		}
	});

	return FileAttribute;

})
