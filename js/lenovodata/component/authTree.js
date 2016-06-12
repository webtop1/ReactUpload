;define("component/authTree",function(require,exports){
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
	 * 团队树
	 * 点击用户管理时候第一次按照用户id查找
	 * 之后所有地方均按照teamid查找
	 */
	function AuthTree(node,func,option){
		this.node = $.type(node)=="string"?$(node):node;
		this.func = func;
		var config = {title:_("团队和用户管理"),authTree:true};
		this.option = $.extend(config,option);
		this.max_height = this.option.max_height||150;
		this.min_height = this.option.min_height||20;
		this.type = this.option.type||TREE_TYPE.DEFAULT;
		this._index=0;
		this.pageNum = 0;
		this.pageTotal = 0;
		this.rootPageNum=0;
		this.rootPageSize=20;
		this._init();
	}
	$.extend(AuthTree.prototype,EventTarget,{
		_init : function(nodes) {
            var self = this;
            self.node.append('<div class="menu-item treeswitch" style="cursor: pointer;"><span class="icon i-user7"></span><span class="menu-text">' + this.option.title+ '</span></div><div class="sub-menu-item"><div class="treeview-wraper"><div class="treeview"></div></div> </div>');
            self.teamTree = self.node.find('.treeview');  
            self.root = self.node.find(".treeswitch");
            self.fullList = 20;
           	self.add = false;
           	self.requestFlag = true;
            self.root.remove();
            self.node.find('.treeview-wraper').css('width', self.width);
            self.teamTree.tree({
                data: [],
                //dragAndDrop: true,
                closedIcon: '<span class="icon i-fold" style="vertical-align:middle;"></span>',
                openedIcon: '<span class="icon i-expand" style="vertical-align:middle;"></span>',

                onCreateLi: function(node, $li) {
                	if(node.type && node.type == 'loading'){
                		$li.addClass('loading').html('<i class="icon i-moreList" node-data="'+node.id+'" ></i>');
                	}else{
	                	var folder_icon = '<i class="icon i-addOne" node-data="'+node.id+'" ></i><span class="icon i-user'+(node.isCer?'Cer':(node.id==-1?7:6))+'"></span>';
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
									if(message.data.total_size>30){
										nodes.push({id:'m_'+curNode.id,parentNode:curNode,'label':'loading',type:'loading'});
									}
	                                self.teamTree.tree('loadData', nodes, curNode);
	                                self.teamTree.tree('toggle', curNode);
	                                self.teamTree.tree('selectNode', curNode);
	                                self._render();    
	                            },self.rootPageNum,self.rootPageSize);
                            	return;
                            }   
							curNode.curNum=0;
                            self.getMoreData(curNode);
                        }
                    }
            ); 
            
            $(self.teamTree).delegate(".i-addOne", "click",
                    function (e) {
                    	e.stopPropagation();
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id);                        	
		                    	self.fire("selectTeam",curNode);
                        }
                    }
            ); 
            $(self.teamTree).delegate(".i-moreList", "click",
                    function (e) {
                    	e.stopPropagation();
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id),parentNode=curNode.parent;
							//根节点更多
							if(id=="m_-1"){
								self.getRootMoreData(parentNode,true);
								return;
							}
                        	if($(curNode.element).hasClass('loading')){
								parentNode.curNum++;
								self.getMoreData(parentNode,true);
							} 
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
                    curNode.curNum=0;

					
                    //单击图标展开
                    $(curNode).css("color", "#1E5D7C");
                    $(curNode).css("font-weight", "normal");
                    if(curNode.id==-1){
                            	UserManager.list_for_pages(function(message) {
	                                if (message.code != 200) {
	                                    return;
	                                }
	                                var nodes = self._dataToNodes(message.data.content);
									if(message.data.total_size>30){
										nodes.push({id:'m_'+curNode.id,parentNode:curNode,'label':'loading',type:'loading'});
									}
	                                self.teamTree.tree('loadData', nodes, curNode);
	                                self.teamTree.tree('toggle', curNode);
	                                self.teamTree.tree('selectNode', curNode);
	                                self._render();    
	                            },self.rootPageNum,self.rootPageSize);
                            	return;
                            } 
                    if(curNode.agent_type!='team'){
                    	self.fire("selectTeam",curNode);
        				return;
                    };
                    if(!self.add){
						self.getMoreData(curNode);
					};
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
                //针对授权的下拉树 ->单加一项
                if(self.option.authTree){
                	nodes.splice(0, 0, {id:-1,_id:-1,name:_("所有用户"),label:_("所有用户"),agent_type:'all',children:{length:0}});
                }
                self.teamTree.tree('loadData', nodes);
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
         	console.log(self.pageTotal,self.pageNum,1);       	
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
                this._index++;
                if(item.agent_type=="team"){
                    childNode = {
                    	_id:item._id,
                    	id:'mt_'+this._index,
                    	agent_id:item._id,
                    	description: item.description,
                    	name: item.name,
                    	label:this._getTeamName(item.path),
                    	isCer:item.from_domain_account,
                    	agent_type:'team',
                    	itemid:item._id
                    };
                }else{
                	childNode = {
                		_id:item.uid,
                		id:'mu_'+this._index, 
                		agent_id:item.uid,
                		description: item.user_name,
                		name: item.user_name, 
                		email: item.email,
                		userSlug:item.user_slug?item.user_slug:item.slug,
                		label:item.user_name,
                		isCer:item.from_domain_account,
                		agent_type:'user'
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
        },
		/**
		 * 获取根节点更多数据
		 * @param curNode
		 * @param flag
		 */
		getRootMoreData:function(curNode,flag){
			var self = this;
			self.rootPageNum++;
			UserManager.list_for_pages(function(message) {
				if (message.code != 200) {
					return;
				}
				var nodes = self._dataToNodes(message.data.content);
				var totalSize =message.data.total_size;

				var state = self.teamTree.tree('getState');
				if(message.data.content.length==self.rootPageSize){
					nodes.push({id:'m_'+curNode.id,parentNode:curNode,'label':'loading',type:'loading'});
				}

				if(!flag){
					self.teamTree.tree('loadData', nodes,curNode);
					self.teamTree.tree('toggle', curNode);
				}else{
					self.teamTree.tree('removeNode', self.teamTree.tree('getNodeById','m_'+curNode.id));
					for(var i in nodes){
						if(nodes.hasOwnProperty(i)){
							self.teamTree.tree('appendNode', nodes[i],curNode);
						}
					};
				}
				self.teamTree.tree('selectNode', curNode);
				self._render();
			}, self.rootPageNum,self.rootPageSize);
		},
        getMoreData:function(curNode,flag){
        	var self = this;
        	TeamManager.getTeamListById(function(message) {
                if (message.code != 200) {
                    return;
                }
                var nodes = self._dataToNodes(message.data.content);
                var totalSize = parseInt(message.data.total_size/self.fullList)+1;
                
                var state = self.teamTree.tree('getState');
                if(totalSize>1&&curNode.curNum!=totalSize-1){
	               nodes.push({id:'m_'+curNode.id,parentNode:curNode,'label':'loading',type:'loading'});                	
	            }
                
                if(!flag){
                	self.teamTree.tree('loadData', nodes,curNode);
                	self.teamTree.tree('toggle', curNode);
                }else{
                	self.teamTree.tree('removeNode', self.teamTree.tree('getNodeById','m_'+curNode.id));
                	for(var i in nodes){
                		if(nodes.hasOwnProperty(i)){
	                		self.teamTree.tree('appendNode', nodes[i],curNode); 
                		}
                	};
                }
                self.teamTree.tree('selectNode', curNode);
                
                self._render();
            }, curNode.itemid,true,curNode.curNum,self.fullList);
        }
	});
	return AuthTree;
});