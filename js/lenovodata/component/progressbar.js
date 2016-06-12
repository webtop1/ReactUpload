;define('component/progressbar', function(require, exports){

	var $=require('jquery');
	require('mustache');

	function ProgressBar(node, template, data){
		var node = this.node = $.type(node) == 'string' ? $(node) : node;
		var pb = $('<div class="lui-progressbar"><div class="progress"></div><div class="error"></div><div class="progress-container"></div></div>');
		node.append(pb);

		var pc = pb.find('.progress-container'), err = pb.find('.error'), proc = pb.find('.progress');
		var html = Mustache.render(template, data);
		pc.append(html);

		this.node = pb;
		this.container = pc;
		this.err = err;
		this.progress = proc;
		this.template = template;

		this.cache = {};
	}

	$.extend(ProgressBar.prototype, {
		
		render: function(data){
			var self = this, node = self.node, g = self.cache;
			var cache={};
			for(var key in data){
				if(!g[key]){
					g[key] = $('.'+key, node);
				}
				if("path"==key){
					g[key].attr("title",data[key]);
					continue;
				}					
				g[key].html(data[key]);
			}
		},
		/*
		render: function(data){
			var self = this, node = self.node, container = self.container;
			container.empty();
			var html = Mustache.render(self.template, data);
			container.append(html);
		},
		*/

		delegate: function(map){
			var self = this;
			$.each(map, function(key, func){
				self.container.delegate(key, 'click', function(e){
					func(e);
				});
			});
		},

		update: function(percent){
			var self = this, node = self.node;
			var progress = self.progress;
			if(percent == 0){
				progress.width(0);
			}else{
				progress.stop().animate({width: node.width()*percent/100}, 200, 'swing');
			}
		},

		fail: function(message){
			var self = this;
			var msg = $(message);
			if(msg&&msg.length>0)
				msg = msg.text();
			else
				msg = message;
			self.err.html(message).attr('title', msg).show();
		},

		hide: function(){
			var self = this;
			self.node.hide();
		},

		show: function(){
			var self = this;
			self.node.show();
		}
	});

	return ProgressBar;
})
