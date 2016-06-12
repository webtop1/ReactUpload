;define('component/copyMoveFileTree', function(require, exports){
    var $ = require('jquery'),
    EventTarget = require('eventTarget'),
    Scroll = require('component/scroll'),
    Util = require('util'),
    fileManager = require('model/FileManager'),
    AuthModel = require('model/AuthManager');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    require('jqtree');
    String.prototype.startWith = function(regexp){
    	return new RegExp("^"+regexp).test(this);
    };
    var FILTER = {content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC};
    function copyMoveFileTree(container, reqdata, conf) {
        var self = this;
		this.container = $.type(container) == 'string' ? $(container) : container;
        this.width = conf.width=="" ? 170 : conf.width;
        this.max_height = conf.max_height=="" ? 320 : conf.max_height;
        this.min_height = conf.min_height=="" ? 320 : conf.min_height;
        this.autoOpen = conf.autoOpen ? true: false;
        this.teamName = conf.teamName;
        //用户管理页面使用
        this.authOfUserDialog = conf.authOfUserDialog;
        this.isInit = true;
        this.path_type = reqdata.path_type;
        this._init();
    }
    
    $.extend(copyMoveFileTree.prototype, EventTarget, {
        _getDirName : function(path) {
            var index = path.lastIndexOf("/");
            var dirName = path.substr(index+1);
            return dirName;
        },
        /*
         * 初始化树节点
         */
        _loadData : function(path) {
        	var self = this;
            var nodes = [];
//          if(this.autoOpen){
//              var curNode  = {id:-1,label:_("企业空间"),name:_("企业空间"),is_dir:false,is_shared:false,path:"/",path_type:"ent",data:{path_type:"ent",access_mode:2047,realpath:"/",path:"/"}};
//              nodes.push(curNode);
//              self.fileTree.tree("loadData",nodes);
//              fileManager.metadata(function(message) {
//                  if (message.code != 200) {
//                      return;
//                  }                                     
//                  var nodes = self._dataToNodes(message.data.content);
//                  curNode = self.fileTree.tree('getNodeById',curNode.id);
//                  //把查到当前团队的子团队挂载到该树节点上，并选中该节点
//                  self.fileTree.tree('loadData', nodes, curNode);
//                  self.fileTree.tree('toggle', curNode);
//                  self.fileTree.tree('selectNode', curNode);
//                  self._render();
//                  if(self.isInit){
//                  	self.fire('changePath','/', 'edit', {realpath:'/','path_type':'ent'});
//                  	self.isInit = false;
//                  }
//              }, path,{path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC});
//          }else{
            if(self.authOfUserDialog){
                var curNode = {id:-1,label:_("企业空间"),name:_("企业空间"),is_dir:false,is_shared:false,path:"/",path_type:"ent",data:{path_type:"ent",access_mode:1025,realpath:"/",path:"/"}};
                nodes.push(curNode);
                fileManager.metadata(function(message) {
                      if (message.code != 200) {
                          return;
                      }
                      var nodes = self._dataToNodes(message.data.content);
                      curNode = self.fileTree.tree('getNodeById',curNode.id);
                      //把查到当前团队的子团队挂载到该树节点上，并选中该节点
                      self.fileTree.tree('loadData', nodes, curNode);
                      self.fileTree.tree('toggle', curNode);
                      self.fileTree.tree('selectNode', curNode);
                      self._render();
                      if(self.isInit){
                        self.fire('changePath','/', 'edit', {realpath:'/','path_type':'ent'});
                        self.isInit = false;
                      }
                }, path,{path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC});
                self.fileTree.tree("loadData",nodes);
            }else{
                var curNode = {id:-1,label:_("企业空间"),name:_("企业空间"),is_dir:false,is_shared:false,path:"/",path_type:"ent",data:{path_type:"ent",access_mode:1025,realpath:"/",path:"/"}};
                nodes.push(curNode);
                curNode = {id:-2,label:_("个人文件"),name:_("个人文件"),is_dir:false,is_shared:false,path:"/",path_type:'self',data:{path_type:"self",access_mode:2047,realpath:"/",path:"/"}};
                nodes.push(curNode);
                curNode = {id:-3,label:_("我的共享"),name:_("我的共享"),is_dir:false,is_shared:false,path:"/",path_type:'share_out',data:{path_type:"share_out",access_mode:1025,realpath:"/",path:"/"}};
                nodes.push(curNode);
                curNode = {id:-4,label:_("我收到的共享"),name:_("收到的共享"),is_dir:false,is_shared:false,path:"/",path_type:'share_in',data:{path_type:"share_in",access_mode:1025,realpath:"/",path:"/"}};
                nodes.push(curNode);
                self.fileTree.tree("loadData",nodes);
            }
            self._render();
//          }          
        },
        _dataToNodes : function(data) {
            var nodes = [];
            for (var i=0, len=data.length; i<len; i++) {
                var fileItem = data[i];
                if (fileItem.is_dir) {
                    var dir = this._getDirName(fileItem.path);
                    var childNode = {
                                     data:fileItem,
                                     id: fileItem.neid,
                                     path_type:fileItem.path_type, 
                                     label: dir, 
                                     cssAction:Util.resolveFileAction(fileItem.access_mode).replace(/:/g, "-"),
                                     realpath: fileItem.path,
                                     path:fileItem.path,
                                     from:fileItem.from,
                                     prefix_neid:fileItem.prefix_neid, 
                                     is_dir:true, 
                                     is_shared: fileItem.is_shared, 
                                     is_team:fileItem.is_team
                                  };
                    nodes.push(childNode);
                }
            }
            return nodes;
        },
        _init : function(nodes) {
            var self = this;
            self.container.append('<div class="menu-item treeswitch" style="cursor: pointer;"><span class="icon i-user7"></span><span class="menu-text"></span></div><div class="sub-menu-item"><div class="treeview-wraper"><div class="treeview"></div></div> </div>');
            self.fileTree = self.container.find('.treeview');
            self.root = self.container.find(".treeswitch");
            self.root.remove();
            self.container.find('.treeview-wraper').css('width', self.width);

            self.fileTree.tree({
                data: [],
                closedIcon: '<span class="icon i-fold" style="vertical-align:middle;"></span>',
                openedIcon: '<span class="icon i-expand" style="vertical-align:middle;"></span>',
                onCreateLi: function(node, $li) {
                    var folder_icon = '<span class="icon-file folder"></span>';
	                if (node.is_shared && node.is_team) {
	                  	folder_icon = '<span class="icon-file folder_team"></span>';
	                }else if (node.is_shared) {
	                    folder_icon = '<span class="icon-file folder_share"></span>';
	                }
	                if(!node.element||(node.element&&node.children.length==0&&!node.hasOwnProperty("load_on_demand")))
	            		folder_icon = '<a class="jqtree_common jqtree-toggler"><span class="icon i-fold" node-data="'+node.id+'" style="vertical-align:middle;"></span></a>'+folder_icon;
                    var item = $li.find('.jqtree-title');
                    item.before(folder_icon);
                    item.attr("title", item.text());
                }
            });
            $(self.fileTree).delegate(".i-fold", "click",
                function (e) {
                    var id = $(e.target).attr("node-data");
                    if(id){
                        var curNode = self.fileTree.tree("getNodeById",id),
                        parentNode = curNode.parent
                        filter = $.extend({path_type:curNode.path_type,prefix_neid:curNode.prefix_neid},FILTER);
                        if(curNode.path_type=="share_in"){
                            filter.from = curNode.from;
                        }
                        fileManager.metadata(function(message) {
                            if (message.code != 200) { 
                                return;
                            }
                            var nodes = self._dataToNodes(message.data.content);
                            self.fileTree.tree('loadData', nodes,curNode);
                            self.fileTree.tree("toggle",curNode);
                            self.fileTree.tree("selectNode",curNode);
                            self._render();
                            self.fire("changePath",curNode.path,curNode.cssAction,curNode.data);
                        }, curNode.path,filter);
                    }					
                }
            );
            self.fileTree.bind(
                'tree.init',
                function(){
                }
            );
            self.fileTree.bind(
                'tree.click',
                function(event) {
                    //event.preventDefault();
                    var curNode = event.node,parentNode = curNode.parent,
                    filter = $.extend({path_type:curNode.path_type,prefix_neid:curNode.prefix_neid},FILTER);
                    if(curNode.path_type=="share_in"){
                        filter.from = curNode.from;
                    }               	
                    if(curNode.path !== undefined && !curNode.is_new){
                    	fileManager.metadata(function(message) {
	                        if (message.code != 200) {
	                            return;
	                        }
	                        var nodes = self._dataToNodes(message.data.content);
	                        self.fileTree.tree('loadData', nodes, curNode);
	                        self.fileTree.tree('toggle', curNode);
	                        self.fileTree.tree('selectNode', curNode);
	                        self._render();
                            self.fire("changePath", curNode.path, curNode.cssAction,curNode.data);
	                    }, curNode.path,filter);
                    }
                }
            );

            self.fileTree.bind(
                'tree.close',
                function(e) {
                	self._render();
                }
            );

            self.fileTree.bind(
                'tree.open',
                function(e) {
                	self._render();
                }
            );

            self.fileTree.bind(
                'tree.move',
                function(event) {
                    fileManager.move(function(ret) {
                        event.move_info.target_node.realpath = event.move_info.target_node.realpath + "/" + event.move_info.moved_node.name;
                    }, event.move_info.moved_node.realpath, event.move_info.target_node.realpath + "/" + event.move_info.moved_node.name);
                }
            );
        },
        _render : function() {
            var self = this;
            self.container.find('.treeview-wraper').show();
            self.max_height = (self.max_height>45)?self.max_height:45;
            var height = self.max_height<self.fileTree.height() ? self.max_height:self.fileTree.height();
            if (height == 0) height = self.max_height;
            if (height<self.min_height)  height = self.min_height;
            self.container.find('.treeview-wraper').css('height', height);           
            if (!self.scroll) {
                self.scroll = new Scroll(self.container.find(".treeview-wraper"));
            }
            if(self.scroll){
                self.scroll.render(true);
            }
        },
		render: function(){
			this._loadData();
        },
        removeNode: function(id) {
        	this.fileTree.tree('removeNode',this.fileTree.tree('getNodeById',id));
        },
        getSelectDir: function() {
            var node = this.fileTree.tree('getSelectedNode');
            var dir = node.realpath;
            return dir;
        },
        getSelectNode:function(){
        	var self=this,node = this.fileTree.tree('getSelectedNode');
        	if(node === false){
        		return {data:{path_type:self.path_type,path:'/',neid:0,from:0}};
        	}
        	return node;
        },
        setSelectDir: function(path) {
            var node = this.fileTree.tree('getNodeById', path);
            this.fileTree.tree('selectNode', node);
        },
        insertDir: function(parentPath, childPath) {
            var self = this;
            var parentNode = self.fileTree.tree('getNodeById', parentPath);
            var filter = $.extend({path_type:parentNode.path_type,prefix_neid:parentNode.prefix_neid},FILTER);
            if(parentNode.path_type=="share_in"){
                filter.from = parentNode.from;
            }
            fileManager.metadata(function(message) {
                if (message.code != 200) { 
                    return;
                }
                var fileItem = message.data;
                if (fileItem.is_dir) { 
                    var dir = self._getDirName(fileItem.path);                  
                    var childNode = self.fileTree.tree(
                        'appendNode',
                        {    id: fileItem.neid, 
                             label: dir, 
                             cssAction:Util.resolveFileAction(fileItem.access_mode).replace(/:/g, "-"), 
                             realpath: fileItem.path, 
                             path:fileItem.path,
                             path_type:fileItem.path_type,
                             is_dir: fileItem.is_dir, 
                             is_shared: fileItem.is_shared, 
                             isTeam:fileItem.is_team,
                             from:fileItem.from,
                             prefix_neid:fileItem.prefix_neid,
                             data:fileItem
                        },
                        parentNode
                    );
                    self._render();
                    self.fileTree.tree('selectNode', childNode);
                }
            },childPath,filter);
        }
    });   
    return copyMoveFileTree;
});
