;define('component/teamInfoDialog', function(require, exports){
	var $ = require('jquery'),
		Validator = require('component/validator'),
		Dialog = require('component/dialog'),
		ConfirmDialog = require('component/confirmDialog'),
		FileModel = require('model/FileManager'),
		TeamModel = require('model/TeamManager');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function TeamInfoDialog(teamId, teamFolder) {
        this.teamId = teamId;
        this.teamFolder = teamFolder;
        this.current = {};
    	this._init();
    }

    $.extend(TeamInfoDialog.prototype, {
    	_init: function() {
            var self = this;

            TeamModel.info_get(function(result){
                if(result.code == 200){
                	self.data={};
                	self.data.name=result.data.name;
                	self.data.quota = result.data.quota? (result.data.quota/1024/1024) : 0;
                    self.data.member_limit = result.data.member_limit == -1 ? _("无限制") : result.data.member_limit;
                    self.data.description = result.data.description;
                    render();
                }
            }, self.teamId);

            function render(){
                var step1_template = '<div id="teamInfoDialog" class="form"><p><span class="label">' + _("团队名称") + '</span><span class="desc">{{name}}</span></p><p><span class="label">' + _("团队空间") + '</span><span class="desc">{{quota}}&nbsp;MB</span></p><p><span class="label">' + _("团队人数上限") + '</span><span class="desc">{{member_limit}}&nbsp;&nbsp;</span></p><p><span class="label">' + _("备注") + '</span><span class="desc" title="{{description}}">{{description}}</span></p></div><div class="dialog-button-area"><a id="cancel" class="dialog-button cancel">' + _("关闭") + '</a></div>';
                var dialog = new Dialog(_('团队信息'), function(parent){            	
                	parent.append(Mustache.render(step1_template, self.data));

                    parent.delegate('#cancel', 'click', function(){
                        dialog.close();
                    });
                });
            }

        }

    });

	return TeamInfoDialog;
});
