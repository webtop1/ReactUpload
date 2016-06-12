;define('component/mailList', function(require, exports){
	var $= jquery = require('jquery'),
		EventTarget = require('eventTarget'),
        Util = require('util'),
		Scroll = require('component/scroll');

	require('mustache');
    require('i18n');
    var _ = $.i18n.prop;

	function MailList(node, template, dataFunc){
		this.node = $.type(node) == 'string' ? $(node) : node;

        this.template = template;

        this.totalSize = 0;
        this.pageSize = 50;
        this.current = 0;
        this.sort = 'desc';
        this.dataFunc = dataFunc;

		this._init();
	}

	$.extend(MailList.prototype, EventTarget, {

        _requestData: function(func){
            var self = this;
            self.dataFunc(function(data){
                func(data);
            }, self.pageSize, self.current);
        },

        _renderList: function(){
            var self = this;
            self._requestData(function(datas){
                self.render(datas);
            });
        },

        renderList: function(){
            var self = this;
            self._renderList();
        },

		_init: function(){
			var self = this;
			var mailList = $('<div class="lui-mailList"></div>');
            self.node.append(mailList);
            self.mailList = mailList;

            self.paging = false;
            self._renderList();
            self._bindListItemEvent();
        },

       
        _bindListItemEvent: function(){
            var self = this;
            var listWraper = self.node.find('.lui-mailList');
            listWraper.delegate('.list-item', 'click', function(e){

                var ctar = $(e.currentTarget), tar = $(e.target);
                var da = self.data[ctar.attr('index')];
                var flag, cmd;
                
                if(tar.hasClass('title')){

                    self.mailList.remove('.displayPanel');
                    var displayPanel = $('<div class="displayPanel"></div>');
                    var temp = '<div class="head" title={{head}}>{{head}}<span class="icon i-delete"></span></div><div class="body"><pre>{{body}}</pre></div>',
                    tempNormal = '<div class="head" title={{head}}>{{head}}<span class="icon i-delete"></span></div><div class="body" style="word-wrap:break-word;"><div>{{body}}</div></div>';
                    
                    displayPanel.append(Mustache.render(/[\n]/.test(da.body)?temp:tempNormal, {head: da.title, body: da.body}));
                    
                    self.mailList.append(displayPanel);

                    displayPanel.width(self.mailList.outerWidth()+10); 
                    displayPanel.height(self.mailList.height()+80);

                    new Scroll(displayPanel);

                    self.fire('open', da);

                    displayPanel.find('.i-delete').on('click', function(){
                        displayPanel.hide(300, function(){
                            displayPanel.remove();
                            self.fire('back');
                        });
                    });
                }
                
            });

        },

		render: function(data){
			var self = this, list = self.mailList;
			list.empty();

			self.data = data;

            if(data.length == 0){
                self._empty(list);
                return;
            }

			for(var i=0, ii=data.length; i<ii; i++){
                var cda = data[i];
                
                if(cda.top_index>-1&&i==0){
                    cda.titleEx = _("【置顶:{0}】", cda.title) ;
                    
                }else{
                    cda.titleEx = cda.title;
                } 
                var itm = $(Mustache.render(self.template, cda));
                itm.attr('index', i);
                
				list.append(itm);
			}
            self.scroll = new Scroll(list);

            self.scroll.on('reachEnd', function(){
                if(self.current + self.pageSize <= self.totalSize){
                    if(!self.paging){
                        self.paging = true;
                        self.loading();

                        setTimeout(function(){
                            self.nextPage();
                        }, 2000);
                    }
                }
            });
		},

        add: function(data){
            var self = this;
            var container = self.filelist.find('.scl-content');
            var len = self.data.length;

            self.removeLoading();

            for(var i=0, ii=data.length; i<ii; i++){
                var itm = $(Mustache.render(self.template, data[i]));
                itm.attr('index', len+i);
                container.append(itm);
            }
            self.scroll.render(true);
        },

        nextPage: function(){
            var self = this;
            if(self.current + self.pageSize > self.totalSize){
                self.removeLoading();
                self.paging = false;
                return;
            }else{
                self.current += self.pageSize;
            }

            self._requestData(function(datas){
                self.add(datas);
                self.paging = false;
            }, function(){
                self.removeLoading();
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
            var loader = $('<div id="cur-loading"><img src="img/loading3.gif"/></div>');
            var container = self.filelist.find('.scl-content');
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
            parent.append($(self.empty_template).html());

            var upload = parent.find('#first-upload'),
                addfolder = parent.find('#first-addfolder');

            if(upload){
                upload.on('click', function(){
                    self.fire('upload');
                });
            }
            if(addfolder){
                addfolder.on('click', function(){
                    self.fire('addfolder');
                });
            }
        }

	});

	return MailList;
})
