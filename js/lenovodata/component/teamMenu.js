;define('component/teamMenu', function(require, exports){
	var $= jquery = require('jquery'),
		TeamModel = require('model/TeamManager'),
		EventTarget = require('eventTarget'),
		Scroll = require('component/scroll');
	require('i18n');
	var	_ = $.i18n.prop;

	function TeamMenu(node, selectId, isAdmin){
		this.node = $(node);
		this.selectId = selectId;
        this.isAdmin = isAdmin;

		this._render();
	}

	$.extend(TeamMenu.prototype, EventTarget, {
		_render: function(){
			var self = this;
			//var	topItem = '<div class="menu-item" teamId="-1"><span class="icon i-user2"></span><a href="user_admin.html" class="menu-text">所有用户{{total}}</a></div>',
			var	topItem = '<div class="menu-item" teamId="-1"><span class="icon i-user7"></span><a href="/user/manage" class="menu-text">' + _("团队和用户管理") + '</a></div>',
				subc = $('<div class="sub-container"></div>'),
				mItem = '<div class="sub-item" teamId="{{_id}}" teamPath="{{}}"><span class="icon i-user6"></span><span class="menu-text" title="{{name}}">{{name}}{{number}}</span></div>';
			
			TeamModel.list(function(result){
				if(result.code == 200){
					self.node.empty();

                    if (self.isAdmin) {
					    self.node.append(Mustache.render(topItem, {total: result.data.length}));
                    }

					for(var i=0, len=result.data.length; i<len; i++){
						subc.append(Mustache.render(mItem, result.data[i]));
					}
					self.node.append(subc);

					var h = subc.outerHeight()+20;
					if(h>$('.page-left').height()-90){
						h = $('.page-left').height()-90;
					}
					subc.height(h);	
					new Scroll(subc);

					self.node.delegate('.sub-item', 'click', function(e){
						var tar = $(e.currentTarget), id=tar.attr('teamId');
						self._select(id);
						self.fire('change', id, tar.find('.menu-text').text());
					});

					self._select(self.selectId);
				}
			}, true);
		},

		_select: function(id){
			var self = this;
			if(id == -1){
				var topm = $(self.node.children()[0]);
				topm.addClass('active');
			}else{
				var found = false;
				self.node.find('.sub-item').each(function(index, item){
					var itm = $(item);
					if(itm.attr('teamId') == id){
						found = true;
						itm.addClass('active');
					}else{
						itm.removeClass('active');
					}
				});
				if(!found){
					var first = self.node.find('.sub-item').eq(0);
					first.addClass('active');
					self.fire('change', first.attr('teamId'), first.find('.menu-text').text());
				}
			}
		},

		render: function(){
			var self = this;
			self._render();
		}

	});

	return TeamMenu;
});
