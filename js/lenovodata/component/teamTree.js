;define("component/teamTree",function(require,exports){
	var $ = require("jquery"),
	    Util = require("util"),
	    TeamManager = require("model/TeamManager"),
	    AuthModel = require('model/AuthManager'),
	    EventTarget = require("component/eventTarget");
	require("i18n");
	var _ = $.i18n.prop;
	require("jqtree");
	var TREE_TYPE = exports.TREE_TYPE  = {DEFAULT:0,COMBOX:1};//默认类型0 下拉列表1
	/***
	 * 团队树
	 * 点击用户管理时候第一次按照用户id查找
	 * 之后所有地方均按照teamid查找
	 */
	function TeamTree(node,func,option){
		this.node = $.type(node)=="string"?$(node):node;
		this.func = func;
		var config = {title:_("团队和用户管理")};
		this.option = $.extend(config,option);
		this.max_height = this.option.max_height||192;
		this.min_height = this.option.min_height||20;
		this.type = this.option.type||TREE_TYPE.DEFAULT;
		this._init();
	}
	$.extend(TeamTree.prototype,EventTarget,{
		_init : function(nodes) {
            var self = this;
            self.node.append('<div class="menu-item treeswitch" style="cursor: pointer;"><span class="icon i-user7"></span><span class="menu-text">' + this.option.title+ '</span></div><div class="sub-menu-item"><div class="treeview-wraper">'+
            (Util.acl('user_manager_show_all_user')?'<a class="allUser" href="/user/manage"><span class="icon i-fold" style="visibility: hidden;"></span><span class="icon i-user6"></span>'+ _("所有用户") +'</a>':'')+'<div class="treeview"></div></div> </div>');
            self.teamTree = self.node.find('.treeview');
            
            self.root = self.node.find(".treeswitch");
            if(self.option.authTree){
            	//如果是授权树更改树根图标
            	self.root.addClass("auth-tree");
            	self.root.find("span.icon").addClass("i-team-user");
            }
            if(this.type==TREE_TYPE.DEFAULT)self.root.remove();
            self.node.find('.treeview-wraper').css('width', self.width);

            self.teamTree.tree({
                data: [],
                //dragAndDrop: true,
                closedIcon: '<span class="icon i-fold" style="vertical-align:middle;"></span>',
                openedIcon: '<span class="icon i-expand" style="vertical-align:middle;"></span>',

                onCreateLi: function(node, $li) {
                	var folder_icon = '<span class="icon i-user'+(node.isCer?'Cer':(node.id==-1?7:6))+'"></span>';
                	if(!node.element||(node.element&&node.children.length==0&&!node.hasOwnProperty("load_on_demand")))
                		folder_icon = '<a class="jqtree_common jqtree-toggler"><span class="icon i-fold" node-data="'+node.id+'" style="vertical-align:middle;"></span></a>'+folder_icon;                   
                    var item = $li.find('.jqtree-title');
                    item.before(folder_icon);	
                    item.attr("title", item.text());
                }
            });
            //点击根节点回到一级目录
            $(self.root).click(function(e) {
                 self.fire("manage",e.currentTarget.innerText);
            });

            $(self.teamTree).delegate(".jqtree-title", "click",
                function (e) {
					//$(e.currentTarget).removeClass();
                    //$(e.currentTarget).addClass("icon i-expand");
                    self.selectTeam = true;
                }
            );
            $(self.teamTree).delegate(".i-fold", "click",
                    function (e) {
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id),parentNode=curNode.parent;                        	
                        	if(parentNode.element)$(parentNode.element).removeClass("jqtree-selected");
                        	$('.allUser').removeClass('allCur');
                        	//用户管理页面的展开就是点击选中团队然后跳入团队成员管理界面
                        	if(self.option.topTree){
                        		self.fire("teamSelected",curNode._id,curNode.name,curNode.path,curNode.getLevel(),curNode.isCer);
                        	}
                        	//授权下拉树  会有一个所有用户的节点  该节点设置的id = -1
                            if(curNode.id==-1){
                            	self.fire("selectAllUser",curNode.name);
                            	return;
                            }
                            self.teamTree.tree('selectNode', null);
                        	TeamManager.getTeamListById(function(message) {
                                if (message.code != 200) {
                                    return;
                                }
                                var nodes = self._dataToNodes(message.data.content);                              	
                                self.teamTree.tree('loadData', nodes, curNode);
                                self.teamTree.tree('toggle', curNode);
                                self.teamTree.tree('selectNode', curNode);
                                self._render();                                
                            }, curNode._id,false);
                        }
                    }
            ); 
            self.teamTree.bind(
                'tree.init',
                function(){
                }
            );

            self.teamTree.bind(
                'tree.click',
                function(event) {
                    //event.preventDefault();
                	self.root.css("color", "#1E5D7C");
                    self.root.css("font-weight", "normal");
                    var curNode = event.node;
                    var parentNode = curNode.parent; 
                  //授权下拉树  会有一个所有用户的节点  该节点设置的id = -1
                    if(curNode.id==-1){
                    	self.fire("selectAllUser",curNode.name);
                    	return;
                    }
                    //单击文字选中为下拉树准备
                    if(self.selectTeam&&self.type==TREE_TYPE.COMBOX){                    	
                    	self.fire("selectTeam",curNode._id,curNode.name,curNode.path,curNode.isCer);
                    	self.selectTeam = false;
                    	return;
                    } 
                    self.fire("teamSelected",curNode._id,curNode.name,curNode.path,curNode.getLevel(),curNode.isCer);   
                 	$('.allUser').removeClass('allCur');
                  //单击图标展开
                    $(curNode).css("color", "#1E5D7C");
                    $(curNode).css("font-weight", "normal");
                    TeamManager.getTeamListById(function(message) {
                        if (message.code != 200) {
                            return;
                        }
                        var nodes = self._dataToNodes(message.data.content);
                        self.teamTree.tree('loadData', nodes, curNode);
                        self.teamTree.tree('toggle', curNode);
                        self.teamTree.tree('selectNode', curNode);
                        self._render();
                    }, curNode._id,false);
                }
            );

            self.teamTree.bind(
                'tree.close',
                function(e) {
                    self._render();
                }
            );

            self.teamTree.bind(
                'tree.open',
                function(e) {
                    self._render();
                }
            );

            self.teamTree.bind(
                'tree.move',
                function(event) {
                    TeamManager.move(function(ret) {
                        event.move_info.target_node.realpath = event.move_info.target_node.realpath + "/" + event.move_info.moved_node.name;
                    }, event.move_info.moved_node.realpath, event.move_info.target_node.realpath + "/" + event.move_info.moved_node.name);
                }
            );
            
		},
		//第一次加载数据 //初始化完毕就请求数据生成树结构
		_initData: function(){
			var self = this;
			self.func.call(self,{},function(result){
				if (result.code != 200) {
					self.fire("initError");
                    return;
                }
                var nodes = self._dataToNodes(result.data.content);
                //针对授权的下拉树 ->单加一项
                if(self.option.authTree){
                	nodes.splice(0, 0, {id:-1,name:_("所有用户"),label:_("所有用户"),children:{length:-1}});
                }
                self.teamTree.tree('loadData', nodes);
                self._render();
                if(self.type==TREE_TYPE.COMBOX){
                	self.scroll.scrollTo(0,true);
                	//针对ie解决滚动条不滚到顶部的问题
                	self.scroll.scroll.find('.scl-content').css("top",0);
                }
                	
                self.fire("loadComplete",nodes[0]._id,nodes[0].name,nodes[0].path,nodes[0].isCer);
			},function(result){
				console.log("error:"+result);
			});
        },
        render:function(){
        	//针对目前的树结构和需求特此增加一个接口
        	//团队管理时第一次加载树是按照用户id加载
        	//下拉树列表时第一次加载时加载所有团队
        	this._initData();
        },
        // 重新计算并设置树的高度       
		_render : function() {
            var self = this;
            self.node.find('.treeview-wraper').show();      
            var max_height = this.max_height;
            self.max_height = (max_height>45)?max_height:45;
//          var height = self.max_height<self.teamTree.height() ? self.max_height:self.teamTree.height();
            var pHeight = $('.page-left').height(),
            	treeWraper = self.node.find('.treeview-wraper'),
            	height;
            
            
            $(window).resize(function(){
            	setTimeout(function(){
            		pHeight = $('.page-left').height();
	            	height = pHeight - 44*5;
	            	treeWraper.css('height', height-20);
            	},100)
            })
            
            height = pHeight - 44*5;
            
            if (height == 0) height = self.min_height;
            treeWraper.css('height', height-20); 
//          $('#tmenu').css('height', height); 
            if (!self.scroll) {
                self.scroll = new Scroll(self.node.find('.treeview-wraper'));
            }
            if(self.scroll){
                self.scroll.render(true);
            }
            this.fire("renderCompleted");
        },
      //添加团队到节点
        insertTeamNode: function(parentPath, childTeam) {
            var self = this;
            var teamItem = childTeam;
            var parentNode = self.teamTree.tree('getNodeById', parentPath);
            var childNode = self.teamTree.tree(
                        'appendNode',
                        {    _id     : teamItem._id,
                        	id       : teamItem.path,
                        	name     : teamItem.name,
                         description : teamItem.description, 
                         member_limit: teamItem.member_limit, 
                         member_num  : teamItem.member_num, 
                            quota    : teamItem.quota,
                            path     : teamItem.path,
                            label    : this._getTeamName(teamItem.path)
                         },
                        parentNode
             );
            self._render();
            self.teamTree.tree('selectNode', childNode);
            self.fire("teamSelected",childNode._id,childNode.name,childNode.path,childNode.getLevel(),false);
        },
        //将数据转换为节点
        _dataToNodes : function(data) {
            var nodes = [];
            for (var i=0, len=data.length; i<len; i++) {
                var teamItem = data[i];
                var childNode = {_id:teamItem._id,id:teamItem.path, description: teamItem.description, member_limit:teamItem.member_limit, member_num: teamItem.member_num, name: teamItem.name, quota: teamItem.quota,path:teamItem.path,label:this._getTeamName(teamItem.path),isCer:teamItem.from_domain_account};
                nodes.push(childNode);
            }
            return nodes;
        },
        //获取选择节点
        getSelectedNode:function(){
        	return this.teamTree.tree("getSelectedNode").path;
        },
        //设置选择节点
        setSelectedNode:function(node_path){
        	var node = this.teamTree.tree("getNodeById",node_path);
        	this.teamTree.tree("selectNode",node);
        },
        _getTeamName : function(path) {
            var index = path.lastIndexOf("/");
            var teamName = path.substr(index+1);
            return teamName;
        },
        //删除节点并返回父级目录
        gotoParentLevel:function(path){
        	var node = this.teamTree.tree("getNodeById",path),parentNode = node.parent;
        	//如果是顶级团队那么返回根目录
        	if(path.match(/^\/([^\/]+)$/)){
        		this.fire("manage");
        		return;
        	}
        	this.teamTree.tree("removeNode",node);
        	//parentNode.removeChild(node);//删除当前节点
        	this._render();       	
        	//如果是子级目录则返回父级目录               	
        	this.teamTree.tree("selectNode",parentNode);
        	this.fire("teamSelected",parentNode._id,parentNode.name,parentNode.path,parentNode.getLevel(),parentNode.isCer);
        }
	});
	return TeamTree;
});