;define('component/importUserDialog', function(require, exports){
	var $ = require('jquery'),
        Upload = require('component/upload'),
        Table = require('component/table'),
        EventTarget = require('eventTarget'),
        Tips = require('component/tips'),
		Dialog = require('component/dialog'),
		Util = require('lenovodata/util');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');
    require("cookie");

    function ImportUserDialog() {
    	this._init();
    }

    $.extend(ImportUserDialog.prototype, EventTarget, {
    	_init: function() {
            var self = this;
    		var create_template = '<div id="importUserDialog" class="form"><p>' + _("第一步，下载模版文件") + '</p><p><img src="/img/model-excel.png"/>' + _("csv文件") + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/img/download.png"/><a href="/resource/excel-model.csv">' + _("下载模版") + '</a></p><br><p>' + _("第二步，编辑模版文件") + '</p><p><img width="526px" height="101px" src="/img/model-table.png"/></p><br><p>' + _("第三步，上传编辑好的文件") + '</p><p class="uploadArea"></p></div><div class="dialog-button-area"><a id="import" class="dialog-button ok">' + _("导入") + '</a><a id="cancel" class="dialog-button cancel">' + _("取消") + '</a></div>';
    	       
            var dialog = new Dialog(_('批量添加用户'), function(parent){
                parent.append(create_template);

                var tempP = '<span class="theFont">' + _("添加文件") + '</span>';
                
                var l_cookie = $.cookie('X-LENOVO-SESS-ID');
                var up = new Upload(parent.find('.uploadArea'), Util.getApiVersion()+'/user/batch_create', {single: true, fileType:'*.csv', buttonText: tempP, postParam:{'X-LENOVO-SESS-ID': l_cookie}});
                up.on('complete', function(serverData){
                    serverData = $.parseJSON(serverData);

                    var da=[];
                    for(var i=0; i<serverData.length; i++){
                        var item = serverData[i].src.split(',');
                        var iserror = false;
                        if(/^Error/.test(serverData[i].message)) {
                        	iserror = true;
                        	serverData[i].message = serverData[i].message.substr(12);
                        }
                        var d = {
                            index: i+1,
                            slug:item[0],
                            email: item[1],
                            phone: item[2],
                            name: item[3],
                            result: serverData[i].message,
                            'error':iserror
                        };
                        if(d.result=="")d.result=_("导入成功");
                        da.push(d);
                    }
                    $.each(SWFUpload.instances,function(i,is){
    					is.destroy();
    				});
                    dialog.close();
                    
                    var dia2 = new Dialog(_('批量添加用户'), function(parent){
                        var html='<div id="importUserDialog2"><p>' + _('总计导入{0}个用户，导入用户角色均为“普通用户”', '<span id="importedNum"></span>') + '</p><div id="importedUser"></div><div id="importedUserTeam"></div></div><div class="dialog-button-area"><a id="cancel" class="dialog-button cancel">' + _("关闭") + '</a></div>';
                        
                        parent.append(html);

                        $('#importedNum').text(da.length);

                        var tableHeader = '<li><span class="col1"></span><span class="col2">' + _("登录名") + '</span><span class="col5">' + _("姓名") + '</span><span class="col3">' + _("登录邮箱") + '</span><span class="col4">' + _("手机号码") + '</span><span class="col6">' + _("状态") + '</span></li>';
                        var tr = '<li class="{{#error}}error{{/error}}"><span class="col1">{{index}}</span><span class="col2">{{slug}}</span><span class="col5">{{name}}</span><span class="col3">{{email}}</span><span class="col4">{{phone}}</span><span class="col6">{{result}}</span></li>';
                        
                        var table = new Table({
                            node: '#importedUser',
                            template: {
                                header: tableHeader,
                                row: tr
                            },
                            data: da
                        });

                        $(".contentTable").css("height", "393px");
                        $(".contentTable .scl-content").css("width", "100%");
                        table.uiScroll.render();

                        parent.find('#cancel').on('click', function(){
                            dia2.close();
                        });
                    });

                    dia2.on('close', function(){
                        self.fire('close');
                    });
                    Util.sendBuridPointRequest();
                });
                //处理出错
                up.on("error",function(data){
                	var errorCode = data.errCode;
                	var message = data.msg;
                	if(errorCode==SWFUpload.UPLOAD_ERROR.HTTP_ERROR&&message=="400"){
                		Tips.warn(_("请用标准批量创建文档来创建你的批量注册文档！"));
                	}
                });
                parent.find('#import').on('click', function(){
                	if($(".uploadProgress").css("display")=="none"){
                		Tips.warn(_("请选择文件"));
                		return;
                	}
                    up.startUpload();
                });

                parent.find('#cancel').on('click', function(){
                	$.each(SWFUpload.instances,function(i,is){
    					is.destroy();
    				});
                    dialog.close();
                });
            });
    	}

    });
	
	return ImportUserDialog;
});
