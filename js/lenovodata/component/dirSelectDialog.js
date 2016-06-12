;define('component/dirSelectDialog', function(require, exports, module){
	var $ = require('jquery'),
        FileTree = require('component/fileManager/fileTree'),
        CopyMoveTree = require('component/copyMoveFileTree'),
        EventTarget = require('eventTarget'),
		Util = require('util'),
		Dialog = require('component/dialog');
	require('i18n');
	var	_ = $.i18n.prop;

    /*
     * @param context {
     *    title: 对话框标题 
     *    subtitle: 对话框子标题 
     *    buttonContext: 对话框按钮
     * }
     * @param width 对话框宽度
     * @param height 对话框高度
     */

    function DirSelectDialog(context, width, height,autoOpen,isCopyMove) {
    	var self = this;
        this.context = context;
        this.width = width;
        this.height = height;
        if(isCopyMove){
    		this.isCopy = false;
			this.isMove = false;
			this.isCreateFolder = false;
			this.isCopyMove = true;
			FileTree = CopyMoveTree;
        }
        this.context.title || (this.context.title = '');
        this.context.subtitle || (this.context.subtitle = '');
        this.context.buttonContext || (this.context.buttonContext = '');
        this.autoOpen = autoOpen === false ? false : true;
        this._init();
    }

	$.extend(DirSelectDialog.prototype,EventTarget, {
        _init: function() {
            var self = this;
            self.dialog = new Dialog(self.context.title, {mask: true}, function(dialog){
                  dialog.append('<div class="selectDirWrapper" id='+(self.isCopyMove?"copy-dialog":"auth-dialog")+'><div id="dir-select-dialog"></div></div>' + self.context.buttonContext);
                  self.ft = new FileTree('#dir-select-dialog', {path_type:'ent'},{width:self.width, min_height:200, max_height:260,autoOpen:self.autoOpen?true:false, teamName:self.context.teamName});
                  self.ft.on('changePath',function(realpath, cssAction,dirData){
	            	   self.fire('changePath',realpath, cssAction,dirData);
	              });
		          if(self.autoOpen||self.isCopyMove){
		          	   self.ft._loadData(self.context.teamPath);
		          }
	              if(self.context.teamPath!=="/")
	                  self.ft.root.unbind("click");            
            });           
        },
        getSelectDir: function() {
            return this.ft.getSelectDir();
        },
        getSelectNode:function(){
        	return this.ft.getSelectNode();
        },
        setSelectDir: function(path) {
            path = path?path.replace('\/\/','\/'):"/";
            return this.ft.setSelectDir(path);
        },
        appendNode:function(node,data){
        	this.ft.appendNode(node,data);
        },
        getTree:function(){
        	return this.ft.getTree();
        },
        removeNode:function(id){
        	this.ft.removeNode(id);
        },
        insertDir: function(parentPath, childPath) {
            parentPath = parentPath?parentPath.replace('\/\/','\/'):"/";
            childPath = childPath?childPath.replace('\/\/','\/'):"/";
            return this.ft.insertDir(parentPath, childPath);
        },
        addFolder:function(parentId,childPath){
        	var parentPath = parentId,
        	childPath = childPath?childPath.replace('\/\/','\/'):"/";
        	return this.ft.insertDir(parentPath,childPath);
        },
        reload: function() {
            //this.ft.reload();
        },
        close: function() {
            this.dialog.close();
        }
    });

    return DirSelectDialog;
})
