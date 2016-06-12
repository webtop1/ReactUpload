;define('component/list', function(require, exports){
	var $= jquery = require('jquery'),
		EventTarget = require('eventTarget'),
        Util = require('util'),
        Tips = require('component/tips'),
		Scroll = require('component/scroll'),
		RegionSelect = require('component/regionSelect');
	var _ = $.i18n.prop;
	require('mustache');
	require('Clipboard');

	function List(node, dataFunction, noPaging,pagesize,scrollBottom){
		this.node = $.type(node) == 'string' ? $(node) : node;
		this.dataFn = dataFunction;
        this.totalSize = 0;
        this.pageSize = pagesize || 50;
        this.page = 0;
        this.totalPage = 0;
        this.currentPage = 0;
        this.sortby = '';
        this.includeDeleted = 'false';
        this.currentData = [];
        this.sort = 'asc';
        this.noPaging = noPaging;
        this.scrollBottom = scrollBottom===true?true:false;
	}

	$.extend(List.prototype, EventTarget, {
        _requestData: function(func, error){
            var self = this;

            //初始化和对不是第一页用户操作的时候，将数据刷新到第一页
            (self.scrollBottom||self.paging||self.noPaging)?self.page:self.page=0;

            self.dataFn.call(self, {
					includeDeleted: self.includeDeleted,
					offset: (self.scrollBottom||self.paging||self.noPaging)?self.page:0,
					size: self.pageSize,
					orderby: self.orderby,
					sort: self.sort
				},
				function(data,total_size,newSplitPage){
                    if(newSplitPage){
                        self.newSplitPage = true;
                        self.noNextPage= false;
                        if(total_size!==50){
                            self.paging= true;
                            self.noNextPage= true;
                            self.newSplitPage = false;
                        }
                    }else{
                        if(total_size){
                            self.totalSize = total_size;
                            self.totalPage = Math.ceil(parseInt(total_size)/self.pageSize);
                        }else{
                            self.totalPage=1;
                        }
                    }
                    if(func) func(data);
                },
            	function(){
        			if(error) error();
            	}
            );
        },

        initHeader: function(headerTemplate, func){
			var self = this;

			self.headerTemplate = headerTemplate;
			var header_temp = $(headerTemplate).html();
			header_temp = Mustache.render(header_temp, {});
			header = $(header_temp);
			var headerWraper = $('#listHeader');
			headerWraper.empty();
			headerWraper.append(header);

			var h = $('.page-body').height(),
				fh = h-$('#listHeader').outerHeight();

			if($('#listBody').hasClass('mobile_listBody')){
				$('#listBody').height('');
			}else{
				$('#listBody').height(fh);
			}

        	func(self, headerWraper);
		},

		renderHeader: function(data,fn){
            var self = this;

			var header_temp = $(self.headerTemplate).html();
			header_temp = Mustache.render(header_temp, data);

            var headerWraper = $('#listHeader');
			headerWraper.empty();
			headerWraper.append(header_temp);
			fn && fn();
        },

		singlePage: function(singleTem,data){
            var self = this;
			self.singleTem = singleTem;
			var single_temp = $(self.singleTem).html();
			single_temp = Mustache.render(single_temp, data);

            var singleWraper = $('#link-single');
			singleWraper.empty();
			singleWraper.append(single_temp);
        },

		initList: function(models){
			var self = this;
			var uilist = $('<div class="lui-list"></div>'),
				listHeader = $(models.head).html(),
				list_wraper = $('<div class="list-wraper list-view"></div>'),
				listBody = $('#listBody');
			self.templates = models;

            uilist.append(listHeader);
            uilist.append(list_wraper);

            listBody.append(uilist);

            self.uilist = uilist;
            self.mode = 'list';
            self.listBody = listBody;

            self._initSortMenu();
            self._initCommandMenu();
            self._initDisplayModel(uilist);
            self.paging = false;
			if(location.pathname !='/' && !/^\/folder/.test(location.pathname)){
				$('#item-selectAll').on('click', function(e){
	                var tar = $(e.target).get(0);
	                if(tar.checked){

	                    $('.list-item').addClass('item-selected');
	                    $('.item-checkbox').each(function(idx, item){
	                        item.checked = true;
	                    });
	                }else{
	                    $('.list-item').removeClass('item-selected');
	                    $('.item-checkbox').each(function(idx, item){
	                        item.checked = false;
	                    });
	                    self.fire('unselect');
	                }
	                self._select();
	            });
			}

        },

        _initCommandMenu: function(){
        	var self = this;
        	$('.command', self.listBody).on('click', function(e){
        		var tar = e.target;
        		if(tar.nodeName.toLowerCase() == 'span'){
        			var clas = tar.className;
        			$('body').data('action',(self.currentData[0]?(self.currentData[0].hasOwnProperty('path')?'文件夹':'用户'):'')+'列表头').data('category',clas);
        			self.fire(clas, self, clas, self.currentData);
        		}
        	});
        },

        _initSortMenu: function(){
        	var self = this;

        	var sm = $('#sortMenu');
            sm.on('click', function(e){
                var tar = e.target;
                if(tar.nodeName.toLowerCase() == 'a'){
                    var clas = tar.className.split(' ');
                    doNext(clas);
                }
                function doNext(clas){
                	tar = $(tar);
                	if(clas.length == 2){
                		if(clas[1] == 'asc'){
                			self.sort = 'asc';
	                        tar.removeClass('asc');
	                        tar.addClass('desc');
                		}else if(clas[1] == 'desc'){
                			self.sort = 'desc';
	                        tar.removeClass('desc');
	                        tar.addClass('asc');
                		}
                	}
                    self.doSort(clas[0]);
                    $('.sort-text').html('<a class="'+ self.sort +'"><span class="i-sort"></span></a>'+ tar.text());
                    $('#sortMenu').hide();
                }
            });
            sm.on('mouseleave', function(e){
                sm.hide();
            });
            $('.cur-sort').click(function(){
                sm.toggle(400);
            });
        },

        addContextMenu: function(contexts){
            var self = this;
            self.contextMenu = {};
            for(var key in contexts){
            	(function(k){
            		var contextMunu = $($(contexts[k]).html());
	            	self.listBody.append(contextMunu);
	            	contextMunu.off('click');
		            contextMunu.on('click', function(e){
		                var tar = $(e.target).get(0), cn = tar.className;
		                if(cn == 'menu-item' || $(tar).hasClass("menu-item")){
		                    var clas = tar.id;
                            self.currentData = [];
                            $('.item-checkbox:checked').each(function(idx, item) {
                                var index = $(item).parent().parent().attr('index');
                                self.currentData.push(self.data[index]);
                            });
                            //$('body').data('category',clas).data('action','右键菜单').data('content',(self.currentData[0].hasOwnProperty('path')?'文件':'用户'));
		                    self.fire(clas, self, clas,self.currentData);
		                    e.preventDefault();
		                    e.stopPropagation();
		                }
		                contextMunu.hide();
		            });
		            contextMunu.on('mouseleave', function(e){
		                $(this).hide();
		            });
		            self.contextMenu[k] = contextMunu;
            	})(key);
            }
        },

        _initDisplayModel: function(uilist){

        	var self = this;
//			var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
            $('.list-header').delegate('.oper .list-view','click', function(){
            	Util.sendDirectlyRequest("主页面","列表显示方式选择","-");
                fnList();
            });

           $('.list-header').delegate('.oper .icon-view','click', function(){
           	    Util.sendDirectlyRequest("主页面","图标显示方式选择","-");
                fnicon ();
            });
            function fnList(){
            	var wraper = $('.list-wraper', uilist);
            	var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
            	var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
                lview.addClass('list-view-on');
                iview.removeClass('icon-view-on');
                wraper.removeClass('icon-view');
                wraper.addClass('list-view');
                self.mode = 'list';
                wraper.find(".list-item").removeClass("thumb-nail");

                if(self.scroll){
                    self.scroll.render();
                }
            }
            function fnicon (){
            	 var wraper = $('.list-wraper', uilist);
            	 var lview = $('.oper .list-view'), iview = $('.oper .icon-view');
                lview.removeClass('list-view-on');
                iview.addClass('icon-view-on');
                wraper.removeClass('list-view');
                wraper.addClass('icon-view');
                self.mode = 'icon';
                //缩略图视图点击时，更改样式，使渲染的时候添加的图片显示出来
                //图片早在渲染的时候已经加入页面只是没有显示出来。
                if(self.data){
                	self._generateThumbs(function(flag,index,url){
                    	if(flag){
                    		var parentFileItem = wraper.find(".list-item");
                    		$(parentFileItem).eq(index).addClass("thumb-nail");
                    	}
                    });
                }

                if(self.scroll){
                    self.scroll.render();
                }
           }
            if(self.mode=="list")
//              lview.trigger('click');
				fnList();
            else
//          	iview.trigger("click");
				fnicon();

        },
		//外链图标视图生成缩略图
        _generateThumbs:function(callback){
        	var self = this;
        	var data = self.data;
        	for(var i=0;i<data.length;i++){
        		var cur = data[i];
        		if(!cur.thumbExist || !cur.isDelivery || !/[rp]/gi.test(cur.mode))
        			continue;//针对不能预览的文件或者一般文件夹 或者 不是外链 或者 外链没有预览权限直接跳过
        		(function(param,index){
        			var imgUrl = FileModel.thumbnails(Util.getStorageUrl(),param.path,'','','',130,70,param.hash,param.rev,cur.isDelivery,param.deliveryCode,param.token,param.previewUrl);//缩略图大小130*70
        			var image = new Image();
        			image.src = imgUrl;
        			if(image.complete){
        				callback(true,index,imgUrl);//能够加载的图片显示缩略图
        			}else{
        				try{
        					image.onload = function(){callback(true,index,imgUrl);}//能够加载的图片显示缩略图
        					image.onerror = function(){callback(false,index);}//不能够加载的图片原样显示
        				}catch(e){
        					callback(false,index);
        				}
        			}
        		})(cur,i);
        	}
        },
        bindItemEvent: function(eve){
            var self = this;
            var list_wraper = $('.list-wraper', self.uilist);

            list_wraper.delegate('.list-item', 'mousedown', function(e){

                var ctar = $(e.currentTarget), tar = $(e.target);
                var da = self.data[ctar.attr('index')];
                var isf = ctar.attr('isfolder');

                var cbx, flag, cmd;
                if(e.button == 2){
                    var px = e.pageX, py = e.pageY;

                    var menu, md;
                    if(Object.prototype.toString.call(self.currentData) == '[object Array]' && self.currentData.length>1){
                        menu = self.contextMenu.multi;
                        md = 'multi';
                    }else{
                    	menu = self.contextMenu["default"];
                        md = 'default';
                    }
                    if(menu){
                    	self.fire('contextMenu', menu, da);
                    	var top = py;
                        top+$("#head").height()+$("#foot").height()+menu.outerHeight()>$(window).height() && (top-=menu.height())
                    	menu.css({left: px-5, top: top});
                        menu.show();
                    }
                    cbx = ctar.find('.item-checkbox');
                    flag = 2;
                    cmd = '';
                }else{
                    if(tar.hasClass('item-checkbox')){
                        cbx = tar;
                        flag = 1;
                        cmd = '';
                    }else if(tar.hasClass('item-select')){
                        cbx = tar.find("input:checkbox");
                        flag = 4;
                        cmd = '';
                    }else if(tar.hasClass('cmd')){
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = $.trim(tar.get(0).className.replace('cmd', ''));
                    }else if(tar.hasClass('icon')){
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = $.trim(tar.parent().get(0).className.replace('cmd', ''));
                    }else if(tar.hasClass('display-name')){
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'display-name';
                    }else if(tar.hasClass('item-icon')){
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'item-icon';
                    }else{
                        cbx = ctar.find('.item-checkbox');
                        flag = 3;
                        cmd = '';
                    }
                    $('body').data('category',cmd.replace('cmd-','')).data('action',(da.hasOwnProperty('path')?'文件':'用户')+'列表按钮').data('content',(da.hasOwnProperty('path')?'文件夹':'用户'));
                }

                var cbox = cbx.get(0);
                if(flag == 1){
                    if(!cbox.checked){
                        ctar.addClass('item-selected');
                    }else{
                        ctar.removeClass('item-selected');
                    }
                }else if(flag == 2){
                	var check_all = $("#item-selectAll").length>0?$("#item-selectAll")[0].checked:false;
                	//如果当前节点没有被选中，那右键的话就只是单选该节点
//                  if(!cbox.checked){//!check_all||e.button!=2
					if(!check_all || e.button !=2){
                        $('.item-checkbox', self.uilist).each(function(idx, itm){
                            itm.checked = false;
                        });
                        $('.list-item', self.uilist).removeClass('item-selected');
                        ctar.addClass('item-selected');
                        cbox.checked = true;

                        if(ctar.next().is(":hidden")){
		                	$(".cp-delivery").slideUp(200);
		                	ctar.next().slideDown(200);
		                }
                    }
                }else if(flag == 4){
                    if(!cbox.checked){
                        cbox.checked = true;
                        ctar.addClass('item-selected');
                    }else{
                        cbox.checked = false;
                        ctar.removeClass('item-selected');
                    }
                }else{
                    if(cbox.checked){
                        ctar.removeClass('item-selected');
                        cbox.checked = false;
                    }else{
                        $('.item-checkbox', self.uilist).each(function(idx, itm){
                            itm.checked = false;
                        });
                        $('.list-item', self.uilist).removeClass('item-selected');
                        ctar.addClass('item-selected');

                        cbox.checked = true;
                    }
                    if(ctar.next().is(":hidden")){
	                	$(".cp-delivery").slideUp(200);
	                	ctar.next().slideDown(200);
	                }
                }


                self._select();

                var fn = eve[cmd];
                if(fn){
                	fn(self, self.currentData);
                }

                e.preventDefault();
                e.stopPropagation();
            });

            list_wraper.delegate(".list-item","mouseenter",function(e){
            	self.fire("mouseenter",e.currentTarget);
            });
            list_wraper.delegate(".list-item","mouseleave",function(e){
            	self.fire("mouseleave",e.currentTarget);
            });
            list_wraper.delegate('', 'mousedown', function (e) {
                self.showWholeRightContextMenu(e);
                e.stopPropagation();
            });
             $('#listHeader').bind('mousedown', function (e) {
                self.showWholeRightContextMenu(e);
                e.stopPropagation();
            });
        },

        _select: function(){
            var self = this;
            var coll = $('.item-selected', self.uilist);
            if(coll.length>1){
                var datas = [];
                $.each(coll, function(idx, item){
                    var d = self.data[$(item).attr('index')];
                    datas.push(d);
                });
                self.currentData = datas;
                self.fire('multiSelect', datas);

            }else if(coll.length == 1){
                var d = self.data[coll.attr('index')];
                self.currentData.length = 1;
                self.currentData[0] = d;
                self.fire('select', d);
            }else if(coll.length == 0){
                self.currentData = [];
                self.fire('unselect');
            }
            if(self.currentData.length==self.uilist.find(".item-checkbox").length)
                $('#item-selectAll').prop("checked",true);
            else
                $('#item-selectAll').prop("checked",false);
            self.fire("selectItem",self.currentData);
        },

        render: function(){
        	var self = this;
        	self._renderList();
        },

        reload: function(){
            var self = this;
            self._renderList();
            self.fire('reload');
        },
        gotoParentLevel:function(path){
        	this.fire("gotoParentLevel",path);
        },
        _renderList: function(){
            var self = this;
            self._requestData(function(datas){
                self.renderList(datas);
            });
        },

		renderList: function(data){
            if (data === undefined) return;
			var self = this, uilist = self.uilist;
			var list = $('.list-wraper', uilist);
			list.empty();
			self.currentData = [];
			var checkbox_all = $("#item-selectAll");
			//点击动态后，全选按钮选不中
//			if(checkbox_all.length>0)checkbox_all.get(0).checked = false;
			self.data = data;
            var h = self.listBody.height()-self.node.find('.list-header').outerHeight();
            if(data.length == 0){
                list.height(h-1);
                self._empty(list);
                self.fire('render');
                return;
            }

			var scroll_wraper = $('<div class="scroll-wraper"></div>');

			if($('#listBody').hasClass('mobile_listBody')){
				scroll_wraper.height('');
			}else{
				scroll_wraper.height(h);
			}
			for(var i=0, ii=data.length; i<ii; i++){
                var cda = data[i],
                    temp = cda.isfolder == true ? self.templates['folder'] : self.templates['default'],
                    itm = $(Mustache.render($(temp).html(), cda));
				itm.attr('index', i);
                var diff = (cda.expiration && cda.expiration!= -1) ? (new Date(cda.expiration.replace(/[年月日]/g, '/')).getTime()+86400000-new Date()):1;
				diff<0 && (itm.addClass('changeGrey'))
                scroll_wraper.append(itm);
			}
			var pageButton = self.generatePage();
			if(pageButton.length>0&&this.noPaging)
				scroll_wraper.append(pageButton);
            list.append(scroll_wraper);
            self.scroll = new Scroll(scroll_wraper,self.scrollBottom);

            if(!this.noPaging){
            	//滚动分页主要针对用户管理列表,只有用户列表需要滚动分页
                self.scroll.on('reachEnd', function(){
            		if(self.page < self.totalPage-1||self.newSplitPage){
                        if(!self.paging){
                            self.paging = true;
                            //self.loading();
                            setTimeout(function(){
                            	self.scrollFlug = true;
                                self.nextPage();
                            }, 100);
                        }
                    }
                });
            }

				//每次渲染时都要重新加载缩略图
	            //如果是图标视图就直接更改样式使缩略图显示出来
	        	self._generateThumbs(function(flag,index,url){
	            	if(flag){
	            		var fileItem = list.find(".list-item").eq(index);
	            		$(fileItem).find("span.item-area>img").attr("src",url);
	        			var h = $(fileItem).find("span.item-area>img").height();
	        			if(h<70){
	        				$(fileItem).find("span.item-area>img").css("marginTop",(70-h)/2);//图片很小或者是图标的小图片就水平和垂直居中显示
	        			}
	            		if(self.mode=="icon"){
	            			$(fileItem).addClass("thumb-nail");
	            		}
	            	}else{
	            		list.find(".filelist-item").eq(index).find("span.item-area>img").remove();
	            	}
	            });

            self.fire('render');
//            self.addDragselect('.list-wraper');
		},
		addDragselect:function(node){
			var self =this;
			(new RegionSelect(self,{
				'node':node,
				'region': '.list-item',
				'selectedClass': 'item-selected'
			})).select();

		},

        addItem: function(data){
            var self = this;
            var container = self.uilist.find('.scl-content');
            var len = self.data.length;

            //self.removeLoading();

            for(var i=0, ii=data.length; i<ii; i++){
                var itm = $(Mustache.render($(self.templates['default']).html(), data[i]));
                itm.attr('index', len+i);
                self.data[len+i] = data[i];
                container.append(itm);
            }
            self.uilist.find(".scroll-wrapper").height(self.listBody.height()-self.node.find('.list-header').outerHeight());
            self.scroll.render(true);
        },

        nextPage: function(){
            var self = this;
            if(self.newSplitPage){
                if(self.noNextPage){
                    //self.removeLoading();
                    self.paging = false;
                    self.newSplitPage = false;
                }else{
                    self.page += 1;
                }
            }else{
                if(self.page >= self.totalSize){
                    //self.removeLoading();
                    self.paging = false;
                }else{
                    self.page += 1;
                }
            }
            self._requestData(/*self.path, self.current,*/ function(datas){
                self.addItem(datas);
                self.paging = false;
            }, function(){
                //self.removeLoading();
                self.paging = false;
            });
        },

        doSort: function(key){
            var self = this;
            self.orderby = key;
            self._renderList();
        },

        loading: function(){
            var self = this;
            var loader = $('<div id="cur-loading"><img src="/img/loading3.gif"/></div>');
            var container = self.uilist.find('.scl-content');
            container.append(loader);
            self.scroll.render(true);
            self.scroll.scrollTo(1, true);
        },

        removeLoading: function(){
            var self = this;
            $('#cur-loading').remove();
            self.scroll.render();
            self.scroll.scrollTo(1, true);
        },

        _empty: function(parent){
            var self = this;
            parent.append($(self.templates['empty']).html());
        },
        addData:function(data){
        	var self = this;
            var container = self.uilist.find('.list-wraper').find('.scl-content').empty();
            var len = self.data.length;

            self.removeLoading();

            for(var i=0, ii=data.length; i<ii; i++){
                var itm = $(Mustache.render($(self.templates['default']).html(), data[i]));
                itm.attr('index', len+i);
                container.append(itm);
            }
            var pageButton = self.generatePage();
			if(pageButton.length>0)
				container.append(pageButton);
            self.scroll.render(true);
        },
        toPage:function(page){
        	var self = this;
        	if(page<0||page>parseInt(self.totalSize/self.pageSize))
        		return;
        	self.currentPage = page;
        	self.page = self.pageSize*page;
            self._requestData(function(datas){
                self.addData(datas);
            }, function(){
                self.removeLoading();
            });
        },
        generatePage:function(){
        	var self = this;
        	var pageNumber = parseInt(self.totalSize/self.pageSize) +1;
        	var container = "",pre = $('<span class="preGrouppage"></span><span class="prePage"></span>'),
        	                   point = $("<span class='point'>...</span>"),
        	                   next = $('<span class="nextPage"></span><span class="nextGrouppage"></span>'+
        	                		   '<input type="text" class="pageInput"/><span class="button"></span>');
        	if(pageNumber>1){
        		container = $("<div class='list-foot'></div>");
        		container.append(pre);
        		if(pageNumber<=11){
                    for(var i=0;i<pageNumber;i++){
                        if(i==self.currentPage)
                           container.append($("<a class='active' href='javascript:void(0);'>"+(i+1)+"</a>"));
                        else
                           container.append($('<a href="javascript:void(0);">'+(i+1)+'</a>'));
                    }
                }else{
                    for(var i=0;i<9;i++){
                        if(i==self.currentPage)
                           container.append($("<a class='active' href='javascript:void(0);'>"+(i+1)+"</a>"));
                        else
                           container.append($('<a href="javascript:void(0);">'+(i+1)+'</a>'));
                    }
                    container.append(point);
                    for(var j=pageNumber-2;j<pageNumber;j++){
                        if(j==self.currentPage)
                           container.append($("<a class='active' href='javascript:void(0);'>"+(j+1)+"</a>"));
                        else
                           container.append($('<a href="javascript:void(0);">'+(j+1)+'</a>'));
                    }
                }
        		container.append(next);
        		container.delegate(".prePage","click",function(e){
            		self.toPage(self.currentPage-1);
            	});
            	container.delegate(".nextPage","click",function(e){
            		self.toPage(self.currentPage+1);
            	});
            	container.delegate(".preGrouppage","click",function(e){
                    self.toPage(0);
                });
                container.delegate(".nextGrouppage","click",function(e){
                    self.toPage(parseInt(self.totalSize/self.pageSize));
                });
                container.delegate("a","click",function(e){
                    var page = $(this).text();
                    if(!isNaN(page)){
                        page = parseInt(page)-1;
                        self.toPage(page);
                    }
                });
                container.delegate("span.button","click",function(e){
                    var page = $('.pageInput',container).val();
                    if(!isNaN(page)){
                        page = parseInt(page)-1;
                        self.toPage(page);
                    }
                });
        	}
        	return container;
        },
        //显示全局右键菜单
        showWholeRightContextMenu:function(event){
            if (event.button == 2) {
                var px = event.pageX, py = event.pageY;
                var self = this;
                var menu = $('#contextMenuRight');
                menu.removeClass();
                menu.addClass("pop-menu action-preview");
                if('/link/list' == location.pathname || '/auth/list' == location.pathname){
                    menu.find('#trash').css("display","none");
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
            if(clas == 'refresh')self.reload();
        }
	});
	return List;
})
