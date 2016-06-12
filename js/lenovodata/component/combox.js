;define('component/combox', function(require, exports){
	var $= jquery = require('jquery'),
		EventTarget = require('eventTarget'),
		Scroll = require('component/scroll');

	require('mustache');

	function Combox(node, data){
		this.node = $.type(node) == 'string' ? $(node) : node;
		this.data = data;
		this.selected = {};
		this._init();
	}

	$.extend(Combox.prototype, EventTarget, {
		_init: function(){
			var self = this;
			var combo = $('<div class="lui-combox"></div>'),
				curli = $('<div class="curli"><span class="curtext"></span><span class="triangle"></span></div>'),
				ul = $('<ul class="combox-ul"></ul>'),
				li = '<li class="combox-item" index="{{index}}">{{name}}</li>';

			$.each(self.data, function(idx, item){
				item.index = idx;
				ul.append(Mustache.render(li, item));
			});

			combo.append(curli);
			combo.append(ul);
			self.node.append(combo);

			self.scroll = new Scroll(ul);

			curli.on('click', function(){
				ul.show();
				self.scroll.render();
			});

			$('.lui-combox').on('mouseleave', function(){		
				ul.hide();
			});

			combo.delegate('.combox-item', 'click', function(e){
				var tar = $(e.target), idx = tar.attr('index');
				curli.find('.curtext').html(tar.html());
				ul.hide();

				var da = self.data[idx];
				self.selected = da;

				self.fire('change', da);
			});

			combo.delegate('.combox-ul', 'mouseleave', function(e){
				var tar = $(e.currentTarget);
				tar.hide();
			});

			$($('.combox-item', combo).eq(0)).trigger('click');
		},

		render: function(da){
			var self = this;
			self.node.empty();
			self.data = da;
			this.selected = {};

			self._init();
		},

		change: function(index){
			var self = this;
			var item = self.node.find('.combox-item').eq(index);
			if(item) $(item).trigger('click');
		},

		val: function(value){
			var self = this;

			if(value != undefined){
				$.each(self.data, function(index, item){
					if(item == value){
						self.change(index);
					}
				});
			}else{
				return self.selected;
			}
		}

	});

	return Combox;
});
