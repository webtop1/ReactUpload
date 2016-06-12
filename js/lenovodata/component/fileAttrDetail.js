;define('component/fileAttrDetail', function(require, exports, module){
	var $ = require('jquery'),
		Util = require('util'),
		AuthModel = require('model/AuthManager'),
		Dialog = require('component/dialog');
		require('i18n');
		var	_ = $.i18n.prop;
		require('mustache');
		
		var fileAttrTemplate = '<div><p><span>' + _("名　　称") +'：</span><span>{{filename}}</span></p><p><span>' + _("路　　径") + '：</span><span>{{path}}</span></p><p><span>' + _("大　　小") + '：</span><span>{{size}}</span></p><p><span>' + _("上传者") + '：</span><span>{{user}}</span></p><p><span>' + _("更新时间") + '：</span><span>{{modified}}</span></p><div class="remarkEdit">' + _("备　　注") + '：<span class="remark" title="{{desc}}">{{desc}}</span><a class="remark-edit" href="javascript:void(0)">' + _("编辑") + '</a></div></div>';
		var dirAttrTemplate = '<div><p><span>' + _("类　　型") + '：</span><span>{{category}}</span></p><p><span>' + _("权　　限") + '：</span><span>{{action}}</span></p><p><span>' + _("创  建  者") + '：</span><span>{{user}}</span></p><p><span>' + _("大　　小") + '：</span><span>{{size}}</span></p><p><span>' + _("包　　含") + '：</span><span>{{include}}</span></p><p><span>' + _("更新时间") + '：</span><span>{{modified}}</span></p><div class="remarkEdit">' + _("备　　注") + '：<span class="remark" title="{{desc}}">{{desc}}</span><a class="remark-edit" href="javascript:void(0)">' + _("编辑") + '</a></div></div>'
    /*
     * @param context {
     *    data: 数据
     *    isFolder: 是否是文件夹
     * }
     */
    function FileAttrDetail(context, ok_callback) {
        this.context = context;
        this.ok_callback = ok_callback;
        this._init();
    }

	$.extend(FileAttrDetail.prototype, {
        _init: function() {
            var self = this;
            var output = null;
            var title = null;
            var fileAttr = {};
            var data = self.context.data;
            var infoBox = $('.infoAuth');
            if (data.path) {
                var index = data.path.lastIndexOf('/')
                fileAttr.filename = data.path.substr(index+1);
            }
            fileAttr.path     = Util.getRootDisplayName() + data.path;
            fileAttr.size     = data.size;
            fileAttr.version  = data.version;
            fileAttr.user     = data.creator;
            fileAttr.modified = data.datetime;
            fileAttr.desc     = data.desc;
            fileAttr.action   = data.action;
            if (data.isShare&&data.team) {
            	fileAttr.category = _("团队文件夹") + "(" + AuthModel.getAuthTitle(data.action) + ")";
            } else if(data.isShare){
            	fileAttr.category = _("共享文件夹") + "(" + AuthModel.getAuthTitle(data.action) + ")";
            }else{
            	fileAttr.category = _("普通文件夹");
            }

            if (data.isfolder) {
                fileAttr.include = _("{0}个文件，{1}个文件夹", data.fileNum ,data.dirNum); 
                output = Mustache.render(dirAttrTemplate, fileAttr); 
                title = _("文件夹属性");
            } else {
                output = Mustache.render(fileAttrTemplate, fileAttr); 
                title = _("文件属性");
            }
            
            infoBox.append(output);



			var reEdit = $('.infoAuth').find(".remark-edit");
				reEdit.on("click",function(){
					self.remarkEdit("reEdit",fileAttr.desc);
				})
        },
        remarkEdit:function(context,param){
	    	var editDialog = new Dialog(_("备注编辑"),function(parent){
	    		parent.append("<div style='background:#FFFFFF;'><textarea style='margin:10px;padding:5px;width:368px;height:150px;resize:none;' placeholder='"+_("最多可输入50个汉字或100个字符")+"' maxlength=100></textarea></div><div class='dialog-button-area'><a class='dialog-button confirm-ok'>"+_("确定")+"</a><a class='dialog-button confirm-cancel'>"+_("取消")+"</a></div>");
	    		if(param.desc){
	    			$("textarea",parent).val(param.desc);
	    		}else{
	    			$("textarea").placeholder();
	    		}	
	    		parent.find(".confirm-ok").on("click",function(){
	    			var desc = $.trim($("textarea").val());
	    			if(desc&&desc==param.desc||(!desc&&!param.desc)){
	    				editDialog.close();
	    				return;
	    			}
	    			if(Util.getBytes(desc)>100){
	    				Tips.warn(_("最多可输入50个汉字或100个字符"));
	    				return;
	    			}
	    			FileModel.info_set(function(result){
	    				if(result.code==200){
	    					editDialog.close();
	    					param.desc = desc;
	    					//$(".fileAttribute .remark").attr("title",desc).text(desc);
	    					context.fa.render(param.isfolder?"folder":"file",param);
	    					Tips.show(_("备注设置成功"));
	    				}else{
	    					editDialog.close();
	    					Tips.warn(result.data.message);
	    				}
	    			},param.path,desc,'desc');			
	    		});
	    		parent.find(".confirm-cancel").on("click",function(){
	    			editDialog.close();
	    		});
	    	});
		}
	});
    return FileAttrDetail;
});



	



