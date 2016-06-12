define('component/table', function(require, exports, module){

	var $=require('jquery'),
		Dialog = require('component/dialog');
		EventTarget = require('component/eventTarget');
		Scroll = require('component/scroll');

	require('mustache');

	function Table(opt){
		var DEFAULT_CONFIG = {
			node: '',
			template : {header: '', row:''},
			data: []
		};

		this.cfg = $.extend(DEFAULT_CONFIG, opt);
		this.cache={};
		this._init();
	}

	$.extend(Table.prototype, EventTarget, {
		_init: function(){
			var self = this, opt = self.cfg, node=$(opt.node),
				ul=$('<ul></ul>'),
				wraper = $('<div class="lui-table"><div class="table-head"><ul class="header-ul"></ul></div><div class="contentTable"></div><div class="foot"></div></div>');

			node.empty();

			var header = wraper.find('.header-ul'),
				contentTable = wraper.find('.contentTable');

			if(opt.template.header != ''){
				header.append(opt.template.header);
			}

			var data = opt.data;
			if(data && opt.template.row != ''){
				for(var i=0, l=data.length; i<l; i++){
					var item = data[i];
					var td = $(Mustache.render(opt.template.row, item));
					td.attr('index', i);
					td.addClass('table-tr');
					td.appendTo(ul);
				}
			}

			contentTable.append(ul);
			node.append(wraper);

			contentTable.height(node.height()-header.outerHeight());
			self.uiScroll = new Scroll(contentTable);

			wraper.find('ul').delegate('.table-tr', 'click', function(e){
				var cache = self.cache;
				var nn = $(e.currentTarget);
				wraper.find('.table-tr').removeClass('li-selected');
				nn.addClass('li-selected');

				var idx = nn.attr('index');
				var param = opt.data[idx];
				cache.selected = param;
				self.fire('select', nn, param);
				e.stopPropagation();
				e.preventDefault();
			});
		},

		reload: function(opt){
			$.extend(this.cfg, opt);
			this._init();
		}
	});
	return Table;
});
