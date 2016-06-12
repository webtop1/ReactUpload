;define('component/selectUserDialog', function(require, exports){
	var $ = require('jquery'),
        Tips = require('component/tips'),
        Dialog = require('component/dialog'),
		SelectUserCore = require('component/selectUserCore'),
		UserTeamAuthList = require('component/userTeamAuthList'),
        TeamModel = require('model/TeamManager');
		
	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function SelectUserDialog(context, teamId,teamName) {
        this.context = context;
        this.teamId = teamId;
        this.teamName = teamName;
    	this._init();
    }

    $.extend(SelectUserDialog.prototype, {
    	_init: function() {

    		var self = this;
    		var opt={
    			'teamName':self.teamName
    		};

            var create_template = '<div class="dialog-button-area"><a id="create" class="dialog-button ok">' + _("确定") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") +'</a></div>';
            var dialog = new Dialog(_('选择用户'), function(parent, callback){

                var suc = new UserTeamAuthList(parent,0,opt); //new SelectUserCore(parent);
                parent.append(create_template);

                suc.on('render', function(){
                    callback();
                });
                $('body').data('category','adduser').data('action','工具栏内下拉按钮').data('content','成员');
            	parent.find('#create').on('click', function(){
            		var arr = suc.getSelectedItem(), user_infos=[];

                    for(var i=0; i<arr.length; i++){
                    	if(Object.prototype.toString.call(arr[i])=="[object Function]")continue;
                        user_infos.push('{"uid":'+ arr[i].uid +',"role":"'+ arr[i].role +'"}');
                    }

                    if(user_infos.length==0){
                    	//Tips.warn(_("请选择要添加的用户！"));
                        dialog.close();
                    	return;
                    }

                    TeamModel.membership_batch_creat(function(result){
                        if(result.code == 200){
                        	dialog.close();
                        	Tips.show(_('添加成功'));                         	
                            self.context.render();                           
                        } else {
                            Tips.warn(result.message);
                        }
                    },self.teamId,user_infos);
            	});

                parent.find('#cancel').on('click', function(){
                    dialog.close();
                });
                
            });
    	}
    });

	return SelectUserDialog;
});
