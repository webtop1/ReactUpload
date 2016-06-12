;define('component/messageBox', function(require, exports){

	var $= require('jquery'),
        Combox = require('component/combox'),
		NoticeModel = require('model/NoticeManager'),
        MailList = require('component/mailList'),
        Util = require('util'),
        Tips = require('component/tips'),
        EventTarget = require('eventTarget');

    require('i18n');
    var _ = $.i18n.prop;

    var sort = 'desc';

    function MessageBox(editable){
        this.current = 0;
        this.pageSize = 50;
        this.editable = editable;
        this.currentId = '';
        this.currentItem = null;
        this.editMode = false;
        this.updateMode = false;
        this.data = [];
    	this._init();
    }

    $.extend(MessageBox.prototype, EventTarget, {
    	_init: function(){
    		var self = this;
            var template = '<div class="lui-messageBox"><div class="triangle border-br"></div><div class="triangle border-bgd"></div><div class="messagebox"><div class="header"><span class="tab active">'+_('公告')+'</span></div><p class="oper"><span class="combo1">'+_('发布公告')+'</span><span class="combo2 desc"><span class="i-sort"></span>'+_('最近更新')+'</span></p><div class="msgPost"><p><input id="noticeTitle" type="text" maxlength="50"/><br><textarea id="noticeContent" maxlength="250"></textarea><br><input id="post" class="button" type="button" value="'+_('确定')+'"/><input id="cancel" class="button" type="button" value="'+_('取消')+'"/></p></div><div class="msgDispay"></div></div>';
    		var mb = $(template);
    		var topIndex=null;
    		$('body').append(mb);
    		
    		//子帐户下公告箭头位置调整
			if(!(Util.isAdmin() || Util.isTeamLeader())){
    			$(".lui-messageBox").find(".triangle").css("left","285px");
    		}else{
    			if($.cookie('language') == 'en'){
	    			$(".lui-messageBox").find(".triangle").css("left","130px");
	    		}
    		}
			
    		
    		
    		var timer=null;
    		mb.on('mouseleave', function(e){
                if(!self.editMode){
                timer =	setTimeout(function(){
                		self.destory();
                	},1500);
                	
                }
    		});
    		mb.on('mouseover',function(){
    			clearTimeout(timer);
    		});
            var panelPost = mb.find('.msgPost'),
                panelDisplay = mb.find('.msgDispay'),
                combo1 = mb.find('.combo1'),
                combo2 = mb.find('.combo2'),
                title = mb.find('#noticeTitle'),
                content = mb.find('#noticeContent'),
                post = mb.find('#post'),
                cancel = mb.find('#cancel');

            var template = '<div class="list-item view-{{isviewed}}" id="{{id}}" index="{{index}}"><p class="title" title="{{titleEx}}">{{titleEx}}</p><p class="content">{{body}}</p><div class="item-menu"><span class="icon i-top" title="' + _("置顶") + '"></span><span class="icon i-edit" title="' + _("编辑") + '"></span><span class="icon i-delete" title="' + _("删除") + '"></span></div></div>';
            var list = new MailList(panelDisplay, template, function(success, size, page){
                NoticeModel.pull(function(result){
                    if(result.code == 200){
                        if(result.data.new_num == 0){
                            $('#msgCount').hide();
                        }else{
                        	if(result.data.new_num>9&&result.data.new_num<99){
			            		$('#msgCount').attr({'class':'msgMid'});
			            	}else if(result.data.new_num>99){
			            		$('#msgCount').attr({'class':'msgBig'});
			            	}else{
			            		$('#msgCount').attr({'class':'msgSmall'});
			            	}
                            $('#msgCount').text(result.data.new_num).show();
                        }
                        var datas = [];
                        for(var i=0, ii=result.data.messages.length; i<ii; i++){
                            var item = result.data.messages[i]; 
                            var d={
                                index: i,
                                ctime: item.ctime,
                                id: item.id,
                                title: item.title,
                                body: item.body,
                                account_id: item.account_id,
                                isviewed: item.isviewed,
                                status: item.status,
                                top_index: item.top_index
                            };
                            datas.push(d);
                            self.data = datas;
                        }
                        success(datas);  
                    }
                }, 500, page, sort);
            });
            list.on('open', function(data){
            	Util.sendDirectlyRequest('公告','查看','');
                if(!data.isviewed){
                    NoticeModel.viewed(function(result){
                        if(result.code == 200){
                        	//修改消息提醒数
                        	NoticeModel.pull(function(result){
                                if(result.code == 200){
                                    if(result.data.new_num == 0){
                                        $('#msgCount').hide();
                                    }else{
                                    	if(result.data.new_num>9&&result.data.new_num<99){
						            		$('#msgCount').attr({'class':'msgMid'});
						            	}else if(result.data.new_num>99){
						            		$('#msgCount').attr({'class':'msgBig'});
						            	}else{
						            		$('#msgCount').attr({'class':'msgSmall'});
						            	}
                                        $('#msgCount').text(result.data.new_num).show();
                                    }
                                }
                            }, 500, 0);
                        }
                    }, data.id);
                }
            });

            list.on('back', function(){
                list.renderList();
            });

    		combo1.on('click', function(){
    			panelPost.show();
    			panelDisplay.hide();
                self.editMode = true;
    		});
            combo2.on('click', function(){
                if(sort == 'asc'){
                    $(this).removeClass('asc');
                    $(this).addClass('desc');
                    sort = 'desc';
                }else{
                    $(this).removeClass('desc');
                    $(this).addClass('asc');
                    sort = 'asc';
                }
                list.renderList();
            });
            post.on('click', function(){
                if($.trim(title.val()) == ''){
                    Tips.warn(_('请输入公告标题'));
                    return;
                }
                if($.trim(content.val()) == ''){
                    Tips.warn(_('请输入公告内容'));
                    return;
                }
                if($.trim(content.val()).length>250){
                    Tips.warn(_('公告内容不能超过250个汉字'));
                    return;
                }
                if(self.updateMode){
                	$('body').data('category','message').data('action','修改').data('content','-');
                    NoticeModel.update(function(result){
                        if(result.code == 200){
                            title.val('');
                            content.val('');
                            panelPost.hide();
                            panelDisplay.show();
                            list.renderList();
                            self.updateMode = false;
                            self.editMode = false;
                        }
                    }, self.currentId, title.val(), content.val().replace(/\r/g, '<br>'));
                }else{
                	$('body').data('category','message').data('action','创建').data('content','-');
                    NoticeModel.create(function(result){
                        if(result.code == 200){
                            title.val('');
                            content.val('');
                            panelPost.hide();
                            panelDisplay.show();
                            list.renderList();
                            self.editMode = false;
                        }
                    }, title.val(), content.val());
                }
            });
            cancel.on('click', function(){
                panelDisplay.show();
                panelPost.hide();
                self.editMode = false;
            });

            if(self.editable){
                mb.delegate('.list-item', 'mouseenter', function(e){
                    var cur = $(e.currentTarget);
                    var menu = cur.find('.item-menu');
                    menu.show();
                    self.currentId = cur.attr('id');
                    self.currentItem = cur;
                });
                mb.delegate('.list-item', 'mouseleave', function(e){
                    var cur = $(e.currentTarget);
                    var menu = cur.find('.item-menu');
                    menu.hide();
                });

                mb.delegate('.item-menu', 'click', function(e){
                    var tar = $(e.target);
                    
                    if(tar.hasClass('i-top')){
                    	$('body').data('category','message').data('action','置顶').data('content','-');
                        NoticeModel.top(function(result){
                            if(result.code == 200){
                                list.renderList(); 
                            }
                        }, self.currentId, 1);
                      $(this).on("mouseleave",function(){
                    	  return false;
                      })
                    }else if(tar.hasClass('i-edit')){
                        var idx = self.currentItem.attr('index');
                        var d = self.data[idx];
                        title.val(d.title);
                        content.val(d.body);
                        panelPost.show();
                        panelDisplay.hide();
                        self.editMode = true;
                        self.updateMode = true;
                    }else if(tar.hasClass('i-delete')){

                        self.currentItem.find('.confirm-box').remove();
                        var cb = $('<div class="confirm-box"><span class="ok">'+_("确认删除")+'</span><span class="cancel">'+_("取消")+'</span></div>');
                        self.currentItem.append(cb);
                        cb.find('.ok').on('click', function(){
                        	$('body').data('category','message').data('action','删除').data('content','-');
                            NoticeModel.del(function(result){
                                if(result.code == 200){
                                    Tips.show(_('删除成功'));
                                    list.renderList();       
                                }
                            }, self.currentId);
                        });
                        cb.find('.cancel').on('click', function(){
                           cb.hide(500, function(){
                                cb.remove();
                           });
                        });
                    }

                   $(this).hide();
                });
            }

            panelPost.hide();

            if(!Util.isAdmin()){
                combo1.hide();
            }
            $(document).mouseup(function(e){
            	if(!mb.is(e.target)&&mb.has(e.target).length==0 &&  !$(e.target).hasClass('i-msg')&&$('.lui-mask').length==0){
            		//当前元素不是mb 并且 不是mb的子节点 并且 当前元素不包含class 并且 点击弹出框mb不会消失
            		self.destory();
            	}
            });
    		self.mb = mb;
    	},

    	destory: function(){
    		var self = this;
            self.fire('destory');
    		self.mb.remove();
    	}
    });

    return MessageBox;
})
