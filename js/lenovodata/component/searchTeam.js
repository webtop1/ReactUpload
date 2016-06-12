;define("component/searchTeam",function(require,exports,module){
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
	function SearchTeam(node,option){
		this.node = $.type(node)=="string"?$(node):node;
		var config = {};
		this.option = $.extend(config,option);
		this.max_height = this.option.max_height||150;
		this._init();
	}
	$.extend(SearchTeam.prototype,EventTarget,{
		_init : function(nodes) {
            var self = this;
            var onOff = true;
            self.node.append('<div class="menu-item treeswitch" style="cursor: pointer;"><span class="icon i-user7"></span><span class="menu-text">' + this.option.title+ '</span></div><div class="sub-menu-item"><div class="treeview-wraper"><div class="treeview"></div></div> </div>');
            self.teamTree = self.node.find('.treeview');  
            self.root = self.node.find(".treeswitch");
            self.fullList = 20;
           	self.add = false;
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
	                    item.attr("title", node.email?node.email:item.text());
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
                    	e.stopPropagation();
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id),parentNode=curNode.parent;                        	
                        	if(parentNode.element)$(parentNode.element).removeClass("jqtree-selected");
                        	//授权下拉树  会有一个所有用户的节点  该节点设置的id = -1
                            self.teamTree.tree('selectNode', null);
                            curNode.curNum=0;
                            self.getMoreData(curNode);
                        }
                        
                        onOff = false;
                    }
            ); 
            $(self.teamTree).delegate(".i-addOne", "click",
                    function (e) {
                    	e.stopPropagation();
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id);                        	
                        	self.fire("item-user",curNode);
        					self.fire("item-list",curNode);  
                        }
                    }
            ); 
            $(self.teamTree).delegate(".i-moreList", "click",
                    function (e) {
                    	e.stopPropagation();
    					var id = $(e.target).attr("node-data");
                        if(id){
                        	var curNode = self.teamTree.tree('getNodeById', id),parentNode=curNode.parent;
                        	
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
                    var curNode = event.node;
                    var parentNode = curNode.parent;
                    curNode.curNum=0;

					//单击图标展开
                    $(curNode).css("color", "#1E5D7C");
                    $(curNode).css("font-weight", "normal");
                    if(curNode.agent_type=='user'||curNode.agent_type=='all'){
                    	self.fire("item-user",curNode);
        				self.fire("item-list",curNode);
        				return;
                    };
					
					if(!self.add){
						self.getMoreData(curNode);
					};
					 onOff = false;
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
		
			$('.pearsonList').on('mouseleave',function(ev){
				ev.stopPropagation();
				if(onOff){
					self.fire("item-close");					
				};
				 onOff = true;
			});
		},
		//第一次加载数据 //初始化完毕就请求数据生成树结构
		_initData: function(datas){
			var self = this;
            var nodes = self._dataToNodes(datas);
            self.teamTree.tree('loadData', nodes);
            self._render();
        },
        render:function(datas){
        	this._initData(datas);
        },
        // 重新计算并设置树的高度       
		_render : function() {
            var self = this;
            var height = this.max_height;
            self.node.find('.treeview-wraper').show();
            self.node.find('.treeview-wraper').css('height', height+20); 
            setTimeout(function(){
            	if (!self.scroll) {
	                self.scroll = new Scroll(self.node.find('.treeview-wraper'));
	            }
	            if(self.scroll){
	                self.scroll.render(true);
	            }
            },200)
        },
        //将数据转换为节点
        _dataToNodes : function(data) {
            var nodes = [];
            for (var i=0, len=data.length; i<len; i++) {
                var item = data[i];
                var childNode;
                if(item.agent_type=="team"){
                    childNode = {
                    	_id:item._id,
                    	id:'t_'+item._id,
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
                		id:'u_'+item.uid, 
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
	return SearchTeam;
});