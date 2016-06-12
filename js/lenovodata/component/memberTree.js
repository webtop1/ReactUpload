;define("component/memberTree",function(require,exports){
	var $ = require("jquery"),
	    Util = require("util"),
	    UserManager = require("model/UserManager"),
	    TeamManager = require("model/TeamManager"),
	    Scroll = require("component/scroll"),
	    EventTarget = require("component/eventTarget");
	require("i18n");
	var _ = $.i18n.prop;
	require("jqtree");
	/***
	 * 成员树
	 */
	function MemberTree(node,func,option){
		this.node = $.type(node)=="string"?$(node):node;
		this.func = func;
		var config = {title:_("团队和用户管理"),authTree:true};
		this.option = $.extend(config,option);
		this.max_height = this.option.max_height||150;
		this.min_height = this.option.min_height||20;
		this.type = this.option.type||TREE_TYPE.DEFAULT;
		this.pageTotal=0;
		this.pageNum =0;
		this._init();
	}
	$.extend(MemberTree.prototype,EventTarget,{
		_init : function(nodes) {
            var self = this;
            self.node.append('<div class="menu-item treeswitch" style="cursor: pointer;"><span class="icon i-user7"></span><span class="menu-text">' + this.option.title+ '</span></div><div class="sub-menu-item"><div class="treeview-wraper"><div class="treeview"></div></div> </div>');
            self.teamTree = self.node.find('.treeview');  
            self.root = self.node.find(".treeswitch");
            self.requestFlag = true;
            self.root.remove();
            self.node.find('.treeview-wraper').css('width', self.width);
            self.teamTree.tree({
                data: [],
                closedIcon: '<span class="icon i-fold" style="vertical-align:middle;"></span>',
                openedIcon: '<span class="icon i-expand" style="vertical-align:middle;"></span>',
                onCreateLi: function(node, $li) {
                	var folder_icon = '<span class="icon i-user'+(node.isCer?'Cer':(node.id==-1?7:6))+'"></span>';
                	if(node.agent_type=='user'){
                		folder_icon = '<span class="icon i-user'+(node.isCer?"-domain":"")+'"></span>';
                        $li.find(".jqtree-title").text(node.name+(node.userSlug?'('+node.userSlug+')':''));
                	}
                	if((!node.element&&node.agent_type!='user')||(node.element&&node.children.length==0&&!node.hasOwnProperty("load_on_demand")&&node.agent_type!='user'))
                		folder_icon = '<a class="jqtree_common jqtree-toggler"><span class="icon i-fold" node-data="'+node.id+'" style="vertical-align:middle;"></span></a>'+folder_icon;                   
                    var item = $li.find('.jqtree-title');
                    item.before(folder_icon);	
                    item.attr("title", item.text());
                }
            });
            $(self.teamTree).delegate(".jqtree-title", "click",
                function (e) {
                    self.selectTeam = true;
                }
            );
            $(self.teamTree).delegate(".i-fold", "click",
                    function (e) {
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id),parentNode=curNode.parent;                        	
                        	if(parentNode.element)$(parentNode.element).removeClass("jqtree-selected");
                        	//授权下拉树  会有一个所有用户的节点  该节点设置的id = -1
                            self.teamTree.tree('selectNode', null);
                            if(curNode.id==-1){
                            	UserManager.list_for_pages(function(message) {
	                                if (message.code != 200) {
	                                    return;
	                                }
	                                var nodes = self._dataToNodes(message.data.content);                              	
	                                self.teamTree.tree('loadData', nodes, curNode);
	                                self.teamTree.tree('toggle', curNode);
	                                self.teamTree.tree('selectNode', curNode);
	                                self._render();                                
	                            },0,10000);
                            	return;
                            }   
                        	TeamManager.getTeamListById(function(message) {
                                if (message.code != 200) {
                                    return;
                                }
                                var nodes = self._dataToNodes(message.data.content);                              	
                                self.teamTree.tree('loadData', nodes, curNode);
                                self.teamTree.tree('toggle', curNode);
                                self.teamTree.tree('selectNode', curNode);
                                self._render();                                
                            }, curNode._id,true);
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
                    var curNode = event.node;
                    var parentNode = curNode.parent; 
                    $(curNode).css("color", "#1E5D7C");
                    $(curNode).css("font-weight", "normal"); 
                    if(curNode.agent_type=="user"){                    	
                    	self.fire("selectNode",curNode);
                    	self.selectTeam = false;
                    	return;
                    }
                    if(curNode._id==-1){
                    	UserManager.list_for_pages(function(message) {
                            if (message.code != 200) {
                                return;
                            }
                            var nodes = self._dataToNodes(message.data.content);                              	
                            self.teamTree.tree('loadData', nodes, curNode);
                            self.teamTree.tree('toggle', curNode);
                            self.teamTree.tree('selectNode', curNode);
                            self._render();                                
                        },0,10000);
                    }else{
                    	TeamManager.getTeamListById(function(message) {
                                if (message.code != 200) {
                                    return;
                                }
                                var nodes = self._dataToNodes(message.data.content);                              	
                                self.teamTree.tree('loadData', nodes, curNode);
                                self.teamTree.tree('toggle', curNode);
                                self.teamTree.tree('selectNode', curNode);
                                self._render();                                
                        }, curNode._id,true); 
                    }                           
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
                nodes.splice(0, 0, {id:-1,_id:-1,name:_("所有用户"),label:_("所有用户"),agent_type:'all',children:{length:0}});
                self.teamTree.tree('loadData', nodes);
                var curNode = self.teamTree.tree("getNodeById",-1);
                UserManager.list_for_pages(function(message) {
                    if (message.code != 200) {
                        return;
                    }
                    var nodes = self._dataToNodes(message.data.content);                              	
                    self.teamTree.tree('loadData', nodes, curNode);
                    self.teamTree.tree('toggle', curNode);
                    //self.teamTree.tree('selectNode', curNode);
                    self._render();                                
                },0,10000);
                self._render();
			},function(result){
				console.log("error:"+result);
			});
        },
        render:function(){
        	this._initData();
        },
        renderList:function(){
        	var self = this;
        	self.pageNum++;
        	TeamManager.getTeamListById(function(message) {
                if (message.code != 200) {
                    return;
                }
                self.requestFlag = true;
                var nodes = self._dataToNodes(message.data.content);
                self.pageTotal = parseInt(message.data.total_size/20);
                
                if(self.pageTotal>1&&self.pageNum<=self.pageTotal){
					for(var i in nodes){
	            		if(nodes.hasOwnProperty(i)){
	                		self.teamTree.tree('appendNode', nodes[i]); 
	            		}
	            	};
	                self._render();
                }
            },'',true,self.pageNum,20);
        },
        // 重新计算并设置树的高度       
		_render : function() {
            var self = this;
            var height = this.max_height;
            self.node.find('.treeview-wraper').show();
            self.node.find('.treeview-wraper').css('height', height+20); 
            if (!self.scroll) {
                self.scroll = new Scroll(self.node.find('.treeview-wraper'));
            }
            if(self.scroll){
                self.scroll.render(true);
            }
            //滚动条触底，分页加载下一批团队
            self.scroll.on('reachEnd', function(){
            	if(self.requestFlag&&(self.pageTotal>self.pageNum||self.pageTotal==0)){
            		self.renderList();
            		self.requestFlag = false;
            	}
            });
        },
        //将数据转换为节点
        _dataToNodes : function(data) {
            var nodes = [];
            for (var i=0, len=data.length; i<len; i++) {
                var item = data[i];
                var childNode;
                if(item.agent_type=="team"){
                    childNode = {
                    	_id: item._id,
                    	 id: item.path,
                   agent_id: item._id,
                description: item.description,
                       name: item.name,
                      label: this._getTeamName(item.path),
                      isCer: item.from_domain_account,
                 agent_type: 'team'
                    };
                }else{
                	childNode = {
                		_id: item.uid,
                		 id: item.uid, 
                   agent_id: item.uid,
                description: item.user_name,
                	   name: item.user_name, 
                	  email: item.email,
                	  userSlug:item.user_slug?item.user_slug:item.slug,
                	  label: item.user_name,
                	  isCer: item.from_domain_account,
                 agent_type: 'user'
                	};
                }
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
        }
	});
	return MemberTree;
});