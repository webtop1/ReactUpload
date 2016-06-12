define("component/addfolder",function(require,exports,module){
	$ = require("jquery"),
	Util = require("util"),
	_  = $.i18n.prop,
	FileModel = require("model/FileManager");
	
	Tips = require('component/tips');
	/**
	 * 新建文件夹组件
	 * @param context
	 */
	function AddFolder(context,path,callback){
		this.context = context;  //当前上下文对象FileList
		this.path = path;//新建文件夹的相对路径
		this.callback = callback;
		this.render();
	}
	AddFolder.prototype = {
		render:function(){
			var self = this;
			var template = $(['<div class="new-item clearfix" isfolder="true">',
			                  '<span class="file-select"><input type="checkbox"/></span>',
			                  '<span class="file-area"><i class="file-icon icon-file folder"></i>',
			                  '<span class="file-info">',
			                  '<div class="edit-name"><input class="box" type="text" value="'+ _("新建文件夹") +'">',
			                  '<span class="icon sure"></span>',
			                  '<span class="icon cancel"></span>',
			                  '</div></span></span></div>'].join(""));
		   var template2 = $(['<li class="new-item clearfix" isfolder="true">',
			                  '<span class="file-area"><i class="file-icon icon-file folder"></i>',
			                  '<span class="file-info">',
			                  '<div class="edit-name"><input class="box" type="text" value="'+ _("新建文件夹") +'">',
			                  '<span class="icon sure"></span>',
			                  '<span class="icon cancel"></span>',
			                  '</div></span></span></li>'].join(""));
		   if($(".new-item").length>0){
		   	  return this;
		   }
	       var mask = $(".lui-mask");
		   if(mask.length==1){
		   	  var $parent = $(".lui-dialog li.jqtree-selected");
              if($parent.find('ul>li').length>0){
			       if($('.new-item').length ==0){
			         $parent.find('li').eq(0).before(template2)       	
			       }      	
		       }else{
		       		$parent.append(template2);
		       }
		   }else{
		   	  if($('.list-wraper').find('.scroll-wraper').length>0){
			       if($('.new-item').length ==0){
			        $('.scl-content .filelist-item').eq(0).before(template)       	
			       }      	
		       }else{
		       		$('.list-wraper').html(' ');
		       		$('.filelist-header').css({'visibility':'inherit'});
		       		$('.list-wraper').append(template);
		       }
		   }
	       if($('.new-item .edit-name').length>0){
	       	   $('.new-item .edit-name input').focus().select(); 
	       }
	       $('.new-item .edit-name').find('.box').click(function(){
//	       	   $('.new-item .edit-name input').focus().select(); 
	       }).on("keypress",function(ev){
	       	   if(ev.keyCode==13){
	       	   	  createfolder();
	       	   }
	       });
	       function createfolder(){
	       	   var name =$.trim($('.new-item .edit-name .box').val());
		    	if(name == ''){
		    		Tips.warn(_('文件夹名不能为空或空格'));
		    		return;
		    	}
		        if (!Util.validFilename(name)) {
		            return;
		        }      
		        var newpath = "/" + self.path + '/' + name;
		        FileModel.create_folder(function(ret){
		            if (ret.code != 200) {
		                Tips.warn(ret.message);
		                return;
		            }else{
		            	var curPath = ret.data.path;
		            	Tips.show(Mustache.render(_('成功创建“{{name}}”文件夹'),{name:curPath.substring(curPath.lastIndexOf('/')+1)}));
		                self.context.reload();
		                self.callback&&self.callback(curPath);
		            }            
		        }, newpath,self.context.type?self.context.type:'ent',self.context.from,self.context.neid,self.context.prefix_neid);
	       }
	       var create = $('.new-item .edit-name').find('.sure'),
	       	   cancel = $('.new-item .edit-name').find('.cancel');	       
		   create.on('click', function(e){		
		    	createfolder();
		    });   
	        cancel.on('click', function(){
	            $('.new-item').remove();
	            self.context.reload();
	        });
		}	
	}
	return AddFolder;
});
