;define('component/fileManager/fileTree', function(require, exports){
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var EventTarget = require('eventTarget'),
        Scroll = require('component/scroll'),
        Util = require('util'),
        AuthModel = require('model/AuthManager');
    require('jqtree');
    
    var fileManager = require('model/FileManager');
    String.prototype.startWith = function(regexp){
    	return new RegExp("^"+regexp).test(this);
    };    
    function FileTree(container, reqdata, conf) {
        var self = this;
		this.container = $.type(container) == 'string' ? $(container) : container;
        this.width = conf.width=="" ? 170 : conf.width;
        this.max_height = conf.max_height=="" ? 320 : conf.max_height;
        this.min_height = conf.min_height=="" ? 320 : conf.min_height;
        this.autoOpen = conf.autoOpen ? true: false;
        this.teamName = conf.teamName;
        this.isInit = true;
        this.path_type = reqdata.path_type;
        this._init();     
    }   
    $.extend(FileTree.prototype, EventTarget, {
        _getDirName : function(path) {
            var index = path.lastIndexOf("/");
            var dirName = path.substr(index+1);
            return dirName;
        },
        _loadData : function(path) {
        	var self = this;
            fileManager.metadata_no_wait(function(message) {
                if (message.code != 200) {
                    return;
                }
                var data = message.data;
                if(data.path=="/"){
                	var nodes = self._dataToNodes(message.data.content);
	                self.fileTree.tree('loadData', nodes);//根节点全部加载
                }else{
	                var curNode = {id:data.path,label:self._getDirName(data.path),cssAction:Util.resolveFileAction(data.access_mode).replace(/:/g, "-"),realpath:data.path,is_dir:data.is_dir, is_shared: data.is_shared, is_team:data.is_team};
	                self.fileTree.tree('loadData',[curNode]);	                
	                var nodes = self._dataToNodes(message.data.content);
	                curNode = self.fileTree.tree('getNodeById',curNode.id);
	                self.fileTree.tree('loadData', nodes, curNode);
	                self.fileTree.tree('toggle', curNode);
	                self.fileTree.tree('selectNode', curNode);
                }
                self._render();
            }, path,{path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC});
        },
        _dataToNodes : function(data) {
            var nodes = [];
            for (var i=0, len=data.length; i<len; i++) {
                var fileItem = data[i];
                if (fileItem.is_dir) {
                    var dir = this._getDirName(fileItem.path);
                    var childNode = {data:fileItem,
                    	               id: fileItem.path, 
                    	            label: dir, 
                    	        cssAction: Util.resolveFileAction(fileItem.access_mode).replace(/:/g, "-"),
                    	         realpath: fileItem.path, 
                    	           is_dir: true, 
                    	        is_shared: fileItem.is_shared, 
                    	          is_team: fileItem.is_team,
                    	      prefix_neid: fileItem.prefix_neid,
                    	             from: fileItem.from
                    };
                    nodes.push(childNode);
                }
            }
            return nodes;
        },
        _init : function(nodes) {
            var self = this;
            self.container.append('<div class="menu-item treeswitch" style="cursor: pointer;"><span class="icon i-fold"></span><span class="icon i-space"></span><span class="menu-text">' + _("企业空间") + '</span></div><div class="sub-menu-item"><div class="treeview-wraper"><div class="treeview"></div></div> </div>');
            self.fileTree = self.container.find('.treeview');
            self.root = self.container.find(".treeswitch");

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
            $(self.fileTree).delegate(".i-fold","click",function(e){
            	var id = $(e.target).attr("node-data");
            	if(id){
                  curNode = self.fileTree.tree("getNodeById",id),
            	  parentNode = curNode.parent;
            	  if(parentNode.element)$(parentNode.element).removeClass("jqtree-selected");
            	  fileManager.metadata_no_wait(function(message) {
                    if (message.code != 200) {
                        return;
                    }	
                    var nodes = self._dataToNodes(message.data.content);	
                    self.fileTree.tree('loadData', nodes, curNode);
                    self.fileTree.tree('toggle', curNode);
                    self.fileTree.tree('selectNode', curNode);
                    self._render();
                }, curNode.realpath, {path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC,prefix_neid:curNode.prefix_neid,from:curNode.from});        	
              }
            });
            self.fileTree.bind(
                'tree.init',
                function(){
                }
            );
            self.fileTree.bind(
                'tree.click',
                function(event) {
                    //event.preventDefault();
                    var curNode = event.node;
                    var parentNode = curNode.parent;
                    $(self.root).css("color", "#1E5D7C");
                    $(self.root).css("font-weight", "normal");
                	self.fire("changePath", curNode.realpath, curNode.cssAction,curNode.data);
                    if(curNode.realpath !== undefined && !curNode.is_new){
                    	fileManager.metadata_no_wait(function(message) {
	                        if (message.code != 200) {
	                            return;
	                        }	
	                        var nodes = self._dataToNodes(message.data.content);	
	                        self.fileTree.tree('loadData', nodes, curNode);
	                        self.fileTree.tree('toggle', curNode);
	                        self.fileTree.tree('selectNode', curNode);
	                        self._render();
	                    }, curNode.realpath, {path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC,prefix_neid:curNode.prefix_neid,from:curNode.from});
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
                self.scroll = new Scroll(self.container.find('.treeview-wraper'));
            }
            if(self.scroll){
                self.scroll.render(true);
            }
        },
		reload: function(){
            var self = this;
            fileManager.metadata_no_wait(function(message) {
                if (message.code != 200) { 
                    return;
                }
                var nodes = self._dataToNodes(message.data.content);
                self.fileTree.childCount = nodes.length;
                if (nodes.length==0) {                       	
                    return;
                }
                self.fire("loaded");              	
                self.fileTree.tree('loadData', nodes);
                self._render();
                self.container.find(".scl-content").css({'top': 0});
            }, "/",  {path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC,orderby:fileManager.ORDERBY.MTIME});
        },
		render: function(){
			var self = this;
            if (self.autoOpen) {
                 $(self.root).hide();
                 /*fileManager.metadata_no_wait(function(message) {
                        if (message.code != 200) { 
                            return;
                        }
                        var nodes = self._dataToNodes(message.data.content);
                        self.fileTree.childCount = nodes.length;
                        if (nodes.length==0) {                       	
                            return;
                        }
                        self.fire("loaded");
                        self.fileTree.tree('loadData', nodes);
                        self._render();                      
                    }, "/",  {path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC,orderby:fileManager.ORDERBY.MTIME});*/
            }
        },
        appendNode: function(node,data) {
        	if(node.id){
        		this.fileTree.tree('appendNode',data,node);
        		this.fileTree.tree('openNode',node);
        		this.scroll.render(true);
        	}else{
        		if(this.selectRoot.find('.i-fold').length > 0){
        			this.inserNewFoder = data;
        			this.selectRoot.find('.i-fold').click();
        		}else{
        			this.fileTree.tree('appendNode',data);
        		}
        	}
        },
        updateNode: function() {
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
            fileManager.metadata_no_wait(function(message) {
                if (message.code != 200) { 
                    //alert(message.message);
                    return;
                }
                var fileItem = message.data;
                if (fileItem.is_dir) { 
                    var dir = self._getDirName(fileItem.path);
                    var parentNode = self.fileTree.tree('getNodeById', parentPath);
                    var childNode = self.fileTree.tree(
                        'appendNode',
                        {id: fileItem.path, 
                         label: dir, 
                         cssAction:Util.resolveFileAction(fileItem.access_mode).replace(/:/g, "-"), 
                         realpath: fileItem.path, 
                         is_dir: fileItem.is_dir, 
                         is_shared: fileItem.is_shared, 
                         isTeam:fileItem.team==null?false:true},
                        parentNode
                    );
                    self._render();
                    self.fileTree.tree('selectNode', childNode);
                }
            }, childPath,  {path_type:self.path_type,content_type:fileManager.CONTENT_TYPE.DIR, sort:fileManager.SORT.ASC});
        }
    });
    
    return FileTree;
})
