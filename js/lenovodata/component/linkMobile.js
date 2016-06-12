;define('component/linkMobile', function(require, exports){
	var $= jquery = require('jquery'),
		EventTarget = require('eventTarget'),
        Util = require('util'),
        DeliveryModel = require('model/DeliveryManager'),
		Scroll = require('component/scroll');

	require('mustache');

	function LinkMobile(node, dataFunction, noPaging){
		this.node = $.type(node) == 'string' ? $(node) : node;
		this.dataFn = dataFunction;

        this.totalSize = 0;
        this.pageSize = 50;
        this.page = 0;
        this.totalPage = 0;
        this.currentPage = 0;
        this.sortby = '';
        this.includeDeleted = 'false';
        this.currentData = [];
        this.sort = 'asc';
        this.noPaging = noPaging;
	}

	$.extend(LinkMobile.prototype, EventTarget, {
        _requestData: function(func, error){
                      var self = this;

            self.dataFn.call(self, {
					includeDeleted: self.includeDeleted, 
					offset: self.page, 
					size: self.pageSize, 
					orderby: self.orderby, 
					sort: self.sort 
				},
				function(data,total_size){
					if(total_size){
						self.totalSize = total_size;
	                    self.totalPage = total_size%self.pageSize==0?total_size/self.pageSize:parseInt(total_size/self.pageSize)+1;
					}else{
						self.totalPage=1;
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
//      	$('#listBody').height(fh);
        	func(self, headerWraper);
		},

		renderHeader: function(data){
            var self = this;

			var header_temp = $(self.headerTemplate).html();
			header_temp = Mustache.render(header_temp, data);

            var headerWraper = $('#listHeader');
			headerWraper.empty();
			headerWraper.append(header_temp);
        },
        
        initListbar: function(listbarTemplate, func){
        	var self = this;
			$('#listbar').prepend($(listbarTemplate).html());
			
			$('.select-all').on('click', function(e){
				if($(this).hasClass('down-all')){
					$(this).text('取消');
					$(this).removeClass('down-all');
					$('.list-item .item-operate').show();
              		$('.item-checkbox').each(function(idx, item){
                        item.checked = false;
                    });
				}else{
					$(this).text('下载');
					$(this).addClass('down-all');
					$('.list-item .item-operate').hide();
					$('.list-item .item-operate').find('.i-download').removeClass('i-download-hover');
              		$('.item-checkbox').each(function(idx, item){
                        item.checked = true;
                    });					
				}
            });
//			$('.select-all').on('click', function(e){
//				if($(this).hasClass('down-all')){
//					$(this).html('<div id="selectAll" onOff="true">全选</div>');
//					$(this).removeClass('down-all');
//					$('.list-item .file-select').show();
//            		$('#download-btn').stop(true,true).slideDown();
//            		$('.item-checkbox').each(function(idx, item){
//                      item.checked = false;
//                  });
//				}
//          });
//          $('#download-Cancel').on('click',function(e){
//      		$('.select-all').html('下载');
//				$('.select-all').addClass('down-all');
//				$('.list-item .file-select').hide();
//        		$('#download-btn').stop(true,true).slideUp();	
//        		$('.list-item').removeClass('item-selected');
//              $('.item-checkbox').each(function(idx, item){
//                  item.checked = false;
//              });
//          })
//          $('.select-all').delegate('#selectAll','click',function(e){
//          	var tar = $(e.target).attr('onOff');
//              if(tar == 'true'){               	
//                  $('.list-item').addClass('item-selected');
//                  $(e.target).text('全不选');
//                  $('.item-checkbox').each(function(idx, item){
//                      item.checked = true;
//                      $(e.target).attr('onOff','false');
//                  });
//              }else{
//                  $('.list-item').removeClass('item-selected');
//                  $(e.target).text('全选');
//                  $('.item-checkbox').each(function(idx, item){
//                      item.checked = false;
//                      $(e.target).attr('onOff','true');
//                  });
//              }
//              self._select();
//          })
        },
        renderListbar: function(){
        	$('#download-btn').stop(true,true).slideUp();
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
            self._initDisplayModel(uilist);
            self.paging = false;
						
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
                }
                self._select();
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
            var lview = $('.oper .list-view', uilist), iview = $('.oper .icon-view', uilist);
            lview.on('click', function(){
                var wraper = $('.list-wraper', uilist);
                lview.addClass('list-view-on');
                iview.removeClass('icon-view-on');
                wraper.removeClass('icon-view');
                wraper.addClass('list-view');
                self.mode = 'list';
                wraper.find(".list-item").removeClass("thumb-nail");

                if(self.scroll){
                    self.scroll.render();
                }
            });

            iview.on('click', function(){
                var wraper = $('.list-wraper', uilist);
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
            });

            lview.trigger('click');
        },
		//外链图标视图生成缩略图
        _generateThumbs:function(callback){
        	var self = this;
        	var data = self.data;
        	for(var i=0;i<data.length;i++){
        		var cur = data[i];
        		if(!cur.thumbExist || !cur.isDelivery || !/[rp]/gi.test(cur.mode)){
//      			continue;//针对不能预览的文件或者一般文件夹 或者 不是外链 或者 外链没有预览权限直接跳过 .
					// 截取后缀名
		          	var ImgType = cur.type;
		            var jar = {"folder":"folder","doc":"word","docx":"word","rtf":"word","txt":"text","jpg":"pic","jpeg":"pic","png":"pic","bmp":"pic","gif":"pic","tiff":"pic","pcx":"pic","psd":"pic","thm":"pic","yuv":"pic","pps":"ppt","ppsx":"ppt","ppt":"ppt","pptx":"ppt","xls":"excel","xlsx":"excel","csv":"excel","lock":"lock","pct":"pdf","pdf":"pdf","pmd":"pdf","mp3":"music","wma":"music","ra":"music","wav":"music","mid":"music","vqf":"music","aif":"music","au":"music","dsp":"music","cmf":"music","cda":"music","mod":"music","iff":"music","m3u":"music","m4a":"music","mpa":"music","aiff":"music","avi":"video","mov":"video","mpg":"video","mp4":"video","xv":"video","3gp":"video","divx":"video","dat":"video","rm":"video","rmvb":"video","asf":"video","wmv":"video","vob":"video","mkv":"video","flv":"video","3g2":"video","asx":"video","exe":"exe","rar":"zip","zip":"zip","zipx":"zip","7z":"zip","cab":"zip","arj":"zip","jar":"zip","lzh":"zip","bin":"zip","deb":"zip","gz":"zip","rpm":"zip","sit":"zip","sitx":"zip","tar":"zip","cad":"cad","dxf":"cad","psd":"ps","ai":"ai","dw":"dw","fil":"fl","id":"id","ae":"ae","3d":"3d","eps":"svg","svg":"svg","cdr":"svg","cdr":"svg","pages":"other","log":"other","msg":"other","wps":"other","xps":"other","chm":"other","pdg":"other","key":"other","dat":"other","efx":"other","sdf":"other","vcf":"other","wks":"other","munbers":"other","3dm":"other","max":"other","com":"other","bat":"other","scr":"other","lib":"other","app":"other","cgi":"other","gadget":"other","vb":"other","wsf":"other","accdb":"other","db":"other","dbf":"other","mdb":"other","pdb":"other","sql":"other","cpl":"setting","cur":"setting","dll":"setting","dmp":"setting","drv":"setting","lnk":"setting","sys":"setting","cfg":"setting","ini":"setting","keychain":"setting","prf":"setting","c":"cpp","class":"cpp","cpp":"cpp","cs":"cpp","dtd":"cpp","fla":"cpp","java":"cpp","m":"cpp","pl":"cpp","py":"cpp","html":"html","htm":"html","xhtml":"html","php":"html","css":"html","js":"html","xml":"html","asp":"html","cer":"html","rss":"html","ttf":"font","fnt":"font","otf":"font","fon":"font","dmg":"iso","toast":"iso","vcd":"iso","iso":"iso"};
					var Extension;
					$.map( jar, function(key, value){
						if(ImgType == value){
							Extension = key;
						}
					});
					
					if(Extension == undefined){
						Extension ='other';
					}					
					$("div.item-area-box").eq(i).find('img').attr("src",'/img/fileicon/'+Extension+'_50.png');	
					Extension =null;
        		}
        			
        		(function(param,index){
        			var imgUrl = FileModel.thumbnails(Util.getStorageUrl(),param.path,'','','',50,50,param.hash,param.rev,cur.isDelivery,param.deliveryCode,param.token,param.previewUrl);//缩略图大小130*70
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
                    	menu.css({left: px-5, top: top-65});
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
                    }else if(tar.hasClass('cmd')){
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = $.trim(tar.get(0).className.replace('cmd', ''));
                    }else if(tar.hasClass('icon')){
                    	tar.addClass('i-download-hover');
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = $.trim(tar.parent().get(0).className.replace('cmd', ''));
                    }else if(tar.hasClass('item-icon')){
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'item-icon';
                    }else{
                        cbx = ctar.find('.item-checkbox');
                        flag = 2;
                        cmd = 'item-area';
                    }
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
                    if(!cbox.checked){//!check_all||e.button!=2
                        $('.item-checkbox', self.uilist).each(function(idx, itm){
                            itm.checked = false;
                        });
                        $('.list-item', self.uilist).removeClass('item-selected');
                        ctar.addClass('item-selected');
                        cbox.checked = true;
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
                }
                self._select();

                var fn = eve[cmd];
                if(fn){
                	fn(self, self.currentData);
                }
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

        render: function(fn){
        	var self = this;
        	self._renderList();
        	fn && fn();
		},

        reload: function(){
            var self = this;
            self._renderList();
            self.fire('reload');
        },
        gotoParentLevel:function(path){
        	this.fire("gotoParentLevel",path);
        },
        _renderList: function(path){
            var self = this;
            var path=path;
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
			if(checkbox_all.length>0)checkbox_all.get(0).checked = false;
			self.data = data;
            var h = self.listBody.height()-self.node.find('.list-header').outerHeight();

            if(data.length == 0){
//              list.height(h-1);
                self._empty(list);
                self.fire('render');
                return;
            }
			
			$('.select-all').html('下载');
			var scrollWraper = $('<div class="scrollWraper"></div>');
//			scroll_wraper.height(h);

			for(var i=0, ii=data.length; i<ii; i++){
                var cda = data[i],
                    temp = cda.isfolder == true ? self.templates['folder'] : self.templates['default'],
                    itm = $(Mustache.render($(temp).html(), cda));
				itm.attr('index', i);
                var diff = (cda.expiration && cda.expiration!= -1) ? (new Date(cda.expiration.replace(/[年月日]/g, '/')).getTime()+86400000-new Date()):1;
				diff<0 && (itm.addClass('changeGrey'))
                scrollWraper.append(itm);
			}
			var pageButton = self.generatePage();
			if(pageButton.length>0&&this.noPaging)
				scrollWraper.append(pageButton);
			
            list.append(scrollWraper);
            self.scroll = new Scroll(scrollWraper);
                               
			//每次渲染时都要重新加载缩略图
            //如果是图标视图就直接更改样式使缩略图显示出来
        	self._generateThumbs(function(flag,index,url){
            	if(flag){
            		var fileItem = list.find(".list-item").eq(index);
            		$(fileItem).find("span.item-area img").attr("src",url);
            		$(fileItem).find("div.item-area-box").css('background','#d2d2d2');
            		var oImg=$(fileItem).find("span.item-area img");
            		oImg.load(function(){
	         			var w = oImg.width();
	        			var h = oImg.height();
	        			if(w<50){
	        				$(fileItem).find("span.item-area img").css({"paddingLeft":(50-w)/2,"paddingRight":(50-w)/2});//图片很小或者是图标的小图片就水平和垂直居中显示
	        			}
	        			if(h<50){
	        				$(fileItem).find("span.item-area img").css("marginTop",(50-h)/2);//图片很小或者是图标的小图片就水平和垂直居中显示
	        			}
	            		if(self.mode=="icon"){
	            			$(fileItem).addClass("thumb-nail");          			
	            		}            			
            		})
           			
            	}else{
            		list.find(".filelist-item").eq(index).find("span.item-area img").remove();
            	}
            }); 
			
			if(self.isMobile()){
//				$(".item-operate").remove();
			}
            self.fire('render');
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
//          self.uilist.find(".scroll-wrapper").height(self.listBody.height()-self.node.find('.list-header').outerHeight());           
            self.scroll.render(true);
        },

        nextPage: function(){
            var self = this;
            if(self.page >= self.totalSize){
                //self.removeLoading();
                self.paging = false;
                return;
            }else{
                self.page += 1;
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
        isMobile:function(){
		  var regex_match = /(iphone|ipad)/i;
		  var u = navigator.userAgent;
		  if (null == u) {
		  	return true;
		  }
		  
		  var result = regex_match.exec(u);
		 
		  if (null == result) {
		  	return false
		  }else{
		  	return true
		  }
       }

	});

	return LinkMobile;
})
