;define('component/selectTeamDialog', function(require, exports){
	var $ = require('jquery'),
		Validator = require('component/validator'),
		Dialog = require('component/dialog'),
		Combox = require('component/combox'),
		ListView = require('component/listview'),
        TeamModel = require('model/TeamManager'),
		Tips = require('component/tips');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function SelectTeamDialog(callback) {
        this.callback = callback;
    	this._init();
    }

    $.extend(SelectTeamDialog.prototype, {
    	_init: function() {

    		var self = this;

            var create_template = '<div id="selectTeamDialog"><div id="teamList"></div></div><div class="dialog-button-area"><a id="create" class="dialog-button ok">' + _("添加") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") + '</a></div>';
            var dialog = new Dialog(_('选择团队'), function(parent){
            	parent.append(create_template);

            	TeamModel.list(function(result){
					if(result.code == 200){
						var datas = [];
						for(var i=0, len=result.data.length; i<len; i++){
							var item = result.data[i];
							var data = {
								value: item._id,
								name: item.name,
								member_limit:(item.member_limit==-1)?false:(item.member_limit==item.member_num)?true:false
							}
							datas.push(data);
						}

                        self.listview = new ListView('#teamList');
                        self.listview.render(datas);

					}
				}, true);
            	
            	parent.find('#create').on('click', function(){
                    var items = self.listview.getSelectedItem();
                    dialog.close();
                    self.callback && (self.callback(items));
            	});

                parent.find('#cancel').on('click', function(){
                    dialog.close();
                });
            });
    	},

    	getSelectedItem: function(){
    		var self = this;
    		return self.listview.getSelectedItem();
    	}
    });

	return SelectTeamDialog;
});
