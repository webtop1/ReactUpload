;define('component/selectUserCore', function(require, exports){
	var $ = require('jquery'),
        Util = require('util'),
		Validator = require('component/validator'),
		Combox = require('component/combox'),
		ListView = require('component/listview'),
        TeamModel = require('model/TeamManager'),
		Tips = require('component/tips'),
        EventTarget = require('eventTarget'),
		UserModel = require('model/UserManager');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function SelectUserCore(node, teamId) {
        this.node = typeof node == 'string' ? $(node) : node; 
        this.teamId = teamId;
    	this._init();
    }

    $.extend(SelectUserCore.prototype, EventTarget, {
    	_init: function() {

    		var self = this;
            var create_template = '<div id="selectUserDialog"><p><span id="teamGroup"></span><span class="search-area"><input id="search-input" placeholder="' + _("请输入搜索内容") + '"/><span class="icon i-search"></span></span></p><div id="teamUsers"></div></div>';
        	self.node.append(create_template);

        	TeamModel.list(function(result){
				if(result.code == 200){
					var datas = [];
                    /*
                    if(Util.isAdmin() && !self.teamId){
                        datas.push({value: -1, name: _('所有用户')});
                    }
                    */
                    datas.push({value: -1, name: _('所有用户')});
                    if(self.teamId){
                        for(var i=0, len=result.data.length; i<len; i++){
                            var item = result.data[i];
                            if(item._id == self.teamId){
                                var data = {
                                    value: item._id,
                                    name: item.name
                                };
                                datas.push(data);
                            }
                        }
                    }else{
                        for(var i=0, len=result.data.length; i<len; i++){
                            var item = result.data[i];
                            var data = {
                                value: item._id,
                                name: item.name
                            }
                            datas.push(data);
                        }
                    }

					self.combox = new Combox('#teamGroup', datas);
                    self.listview = new ListView('#teamUsers');

                    self.combox.on('change', function(d){
                        self.current = d.value;
                        
                        if(d.value == -1){
                            getAllUser();
                        }else{
                            TeamModel.membership_get(function(result){
                                if(result.code == 200){
                                    var datas = [];
                                    for(var i=0, len=result.data.length; i<len; i++){
                                        var item = result.data[i];
                                        var da = {
                                            index: i,
                                            uid: item.uid,
                                            name: item.user_name,
                                            role: item.role,
                                            ctime: item.ctime,
                                            team: item.team
                                        }
                                        datas.push(da);
                                    }
                                    self.listview.render(datas);
                                    self.fire('render');
                                }

                            }, d.value);
                        }
                        
                        //getAllUser();
                    });
                    
                    self.combox.change(0);
				}
			}, Util.isAdmin());

            function getAllUser(keyword){
                var key = keyword || null;
                UserModel.list(function(result){
                    if(result.code == 200){
                        var datas = [];
                        for(var i=0, len=result.data.length; i<len; i++){
                            var item = result.data[i];
                            var d = {
                                uid: item.uid,
                                name: item.user_name,
                                accountId: item.account_id,
                                role: 'admin'
                            }
                            datas.push(d);
                        }
                        self.listview.render(datas);
                        self.fire('render');
                    }
                }, UserModel.ROLE.MEMBER, key);
            }

            var input = self.node.find('#search-input'), searchBtn = self.node.find('.i-search');
            searchBtn.on('click', function(e){
                if($.trim(input.val()) == '') return;

                /*
                if(self.current == -1){
                    getAllUser(input.val());
                }else{
                    TeamModel.search(function(result){
                        if(result.code == 200){
                            var datas = [];
                            for(var i=0, len=result.data.length; i<len; i++){
                                var item = result.data[i];
                                var da = {
                                    index: i,
                                    uid: item.uid,
                                    name: item.user_name,
                                    role: item.role,
                                    ctime: item.ctime,
                                    team: item.team
                                }
                                datas.push(da);
                            }
                            self.listview.render(datas);
                        }
                    }, self.teamId, input.val());
                }
                */
                getAllUser(input.val());
            });

            input.on('keydown', function(e){
                if(e.keyCode == 13){
                    searchBtn.trigger('click');
                }
            });
        },

    	getSelectedItem: function(){
    		var self = this;
    		return self.listview.getSelectedItem();
    	}
    });

	return SelectUserCore;
});
