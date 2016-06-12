;define('component/deliveryDialog', function(require, exports, module){
	var $ = require('jquery'),
		DeliveryModel = require('model/DeliveryManager'),
		ConfirmDialog = require('component/confirmDialog'),
        EventTarget = require('eventTarget'),
		AuthModel = require('model/AuthManager'),
		Util = require('util'),
        Tips = require('component/tips'),
		Dialog = require('component/dialog'),
		EmailTipList = require('component/emailtipList'),
		Placeholder = require('js/gallery/jquery/placeholder/2.0.7/jquery.placeholder');
	require('i18n');
    require('calendar');
    require('Clipboard');
	var	_ = $.i18n.prop;

    /*@brief “发送外链弹出框”  和  “发送外链邮件弹出框”
     */
    function DeliveryDialog(param, ok_callback) {
        var self = this;
        self.fileAttr= param;
        self.ok_callback = ok_callback;
        self.fileAttr.delivery_info = {};

        self._init();
    }

	$.extend(DeliveryDialog.prototype, EventTarget, {
        _render: function(dialog, dialog_cb)  {
            var self = this;
            var htmlArr = [];
            htmlArr.push('<div class="delivery-dialog">');
                htmlArr.push('<div>');
                    htmlArr.push('<span class="delivery-label">' + _('链接地址') + '</span>');
                    htmlArr.push('<input class="delivery-text-addr" type="text" value="' + self.fileAttr.delivery_info.url + '" readOnly/>');
                    htmlArr.push('<button class="delivery-button-copy" id="delivery-copy" data-clipboard-text="' + self.fileAttr.delivery_info.url + '">' + _('复制') + '</button>');
                    htmlArr.push('<button class="delivery-button-look" id="delivery-look" type="button">' + _('查看') + '</button>');
                htmlArr.push('</div>');
                htmlArr.push('<div>');
                	htmlArr.push('<span class="delivery-label">' + _("访问权限") + '</span>');
                	if(self.fileAttr.isfolder){
                		if(self.fileAttr.action && 
                           (self.fileAttr.action == AuthModel.ACTION["UPLOAD:DELIVERY"] || 
                            self.fileAttr.action == AuthModel.ACTION["UPLOAD:DOWNLOAD:DELIVERY"] || 
                            self.fileAttr.action == AuthModel.ACTION.EDIT) ){
                				htmlArr.push('<input id="delivery-upload" type="checkbox" />&nbsp;' + _("上传"));
                		 }else{
                		 	htmlArr.push('<input id="delivery-upload" type="checkbox" checked="false" disabled="disabled" onclick="return false"/>&nbsp;<span style="color:#ccc">' + _("上传") +'</span>');
                		 }
                            
                        if (self.fileAttr.action && 
                            (self.fileAttr.action == AuthModel.ACTION["DOWNLOAD:DELIVERY"] || 
                            self.fileAttr.action == AuthModel.ACTION["UPLOAD:DOWNLOAD:DELIVERY"] || 
                            self.fileAttr.action == AuthModel.ACTION.EDIT) ) {
		                    	htmlArr.push('<input id="delivery-download"  type="checkbox" style="margin-left:20px;" checked="true"/>&nbsp;' +_("下载"));
		                    	htmlArr.push('<input id="delivery-preview"  type="checkbox" style="margin-left:20px;" />&nbsp;' +_("预览"));
		                    }else{
		                    	htmlArr.push('<input id="delivery-download"  type="checkbox" style="margin-left:20px;" disabled="disabled" onclick="return false"/>&nbsp;<span style="color:#ccc">' +_("下载")+ '</span>');
		                    	htmlArr.push('<input id="delivery-preview"  type="checkbox" style="margin-left:20px; " disabled="disabled" onclick="return false" />&nbsp;<span style="color:#ccc">' +_("预览")+ '</span>');
		                    }
                		
                	}else{
                		htmlArr.push('<input id="delivery-upload" type="checkbox" disabled="disabled" onclick="return false"/>&nbsp;<span style="color:#ccc">' + _("上传") + '</span>');
                		htmlArr.push('<input id="delivery-download"  type="checkbox" style="margin-left:20px;"/>&nbsp;' +_("下载"));
                		if( Util.canPreview(self.fileAttr.mimeType) ){
                			htmlArr.push('<input id="delivery-preview"  type="checkbox" style="margin-left:20px;" checked="true"/>&nbsp;' +_("预览"));
                		}else{
                			htmlArr.push('<input id="delivery-preview"  type="checkbox" style="margin-left:20px;" checked="false" disabled="disabled" onclick="return false"/>&nbsp;<span style="color:#ccc">' +_("预览")+ '</span>');
                		}
                	}
                    
                htmlArr.push('</div>');
                htmlArr.push('<div id="password-protocal">');
                	htmlArr.push('<span class="delivery-label">' + _("密码保护") + '</span>');
                    htmlArr.push('<select>');
                        htmlArr.push('<option value="close">' + _("关闭") + '</option>');
                        htmlArr.push('<option value="open">' + _("开启") + '</option>');
                    htmlArr.push('</select> ');
                    htmlArr.push('<span id="display-password" style="display:none;">');
	                    htmlArr.push('<input id="delivery-password" type="password" onpaste="return false"/> '+'&nbsp;&nbsp;');
	                    htmlArr.push('<input id="delivery-password-show" type="checkbox"/>');
	                    htmlArr.push(' <span>'+_("显示密码")+'</span>');
                    htmlArr.push('</span>');
                htmlArr.push('</div>');
                htmlArr.push('<div>');
                	htmlArr.push('<span class="delivery-label">' + _("有效期至") + '</span>');
                    htmlArr.push('<input id="expiration" type="text" style="width:160px;"  readonly="readonly"/>&nbsp;');
                    htmlArr.push('<input id="ulimit-expiration" type="checkbox" />&nbsp;' + _("无限制"));
                    htmlArr.push('<span id="distanceDays" style="display:none;color:#999">&nbsp;&nbsp;'+_('距离到期还有&nbsp;<em></em>&nbsp;天')+'</span>');
                htmlArr.push('</div>');
				htmlArr.push('<div>');
                    htmlArr.push('<span class="delivery-label vertical-a">' + _("外链说明") + '</span>');
                    htmlArr.push('<textarea id="description" value="" style="width: 376px; height: 149px; resize:none " placeholder="'+_('最多可以输入300个汉字')+'" maxlength="600"></textarea>');
                htmlArr.push('</div>');
                htmlArr.push('<div style="clear:both"></div>');
            htmlArr.push('</div>');
            
			dialog.append(htmlArr.join('') + '<div class="dialog-button-area"><a id="open-send-delivery-dialog" class="dialog-button cancel" style="float:left;">' + _('发送外链') +'</a><a id="delivery-setting-ok" class="dialog-button ok">' + _('确定') +'</a> <a id="auth-dialog-id-cancel" class="dialog-button cancel">' + _('取消') + '</a></div>');
dialog_cb();
			//初始化数据start
			$("#description").val(self.fileAttr.delivery_info.description); 
            if (self.fileAttr.delivery_info.expiration && (self.fileAttr.delivery_info.expiration != -1)) {
                $("#expiration").val(self.fileAttr.delivery_info.expiration.substr(0,10));
                var exp = new Date (self.fileAttr.delivery_info.expiration.substr(0,10).replace(/\-/g, "\/"));
                var now = new Date (new Date().getFullYear() + '/' + (new Date().getMonth()+1) +"/"+ new Date().getDate());
                var distance =  parseInt((exp - now)/1000/3600/24);
                $("#distanceDays").css('display','inline-block');
                if(distance<0){
                	$("#distanceDays").html('&nbsp;<span style="color:#FF0000">' + _("外链已过期") + '</span>');
                }else{
                	$("#distanceDays em").text(distance);
                }
                
            } else {
                $("#ulimit-expiration").get(0).checked = true;
                $("#expiration")[0].value='';
                $("#expiration").attr('disabled', true);
            }
			
            $("#delivery-upload").get(0).checked = false;
            $("#delivery-download").get(0).checked = false;
            $("#delivery-preview").get(0).checked = false;
            
            switch (self.fileAttr.delivery_info.mode) {
                case 'rw':
                    $("#delivery-upload").get(0).checked = true;
                    $("#delivery-download").get(0).checked = true;
                    $("#delivery-preview").get(0).checked = true;
                    break;
                case 'r':
                    $("#delivery-download").get(0).checked = true;
                    $("#delivery-preview").get(0).checked = true;
                    if( !self.fileAttr.isfolder && !Util.canPreview(self.fileAttr.mimeType)){
                    	$("#delivery-preview").get(0).checked = false;
                    }
                    break;
                case 'wp':
                	$("#delivery-upload").get(0).checked = true;
                	$('#delivery-preview').get(0).checked = true;
                    break;
                case 'w':
                    $("#delivery-upload").get(0).checked = true;
                    break;
                case 'p':
                	$('#delivery-preview').get(0).checked = true;
                	break;
            }

            if (self.fileAttr.delivery_info.has_password == true) {
                $("#display-password").show();
                $("#delivery-password").val(self.fileAttr.delivery_info.password);
                $("#password-protocal select").val("open");
            }
            $('input, textarea').placeholder();
			//初始化数据end
			
			//复制
            var clip = new ZeroClipboard( document.getElementById("delivery-copy"), {
                moviePath: "/js/gallery/ZeroClipboard/ZeroClipboard.swf"
            } );

            clip.on( 'complete', function(client, args) {
                //Tips.show(args.text);
                Util.sendDirectlyRequest("设置外链","复制外链","-");
                Tips.show(_("链接地址已经复制到剪切板中"));
            });
	
			

            $("#delivery-copy").click(function() {
                var link_addr = $(".delivery-text-addr").val();
                $.copy(link_addr);
            });

			//查看
			$('#delivery-look').click(function(){
				var uri = $('.delivery-text-addr').val();
				Util.sendDirectlyRequest('设置外链',($('body').data('action')+'访问'),'');
				window.open(uri);
			});
			
			//权限
			$('#delivery-download').change(function(){
				Util.sendDirectlyRequest("外链",'"访问权限"选择',"-");
				if($('#delivery-download').get(0).checked == true){
					$('#delivery-preview').get(0).checked = true;
				}
			});
			$('#delivery-preview').change(function(){
				Util.sendDirectlyRequest("外链",'"访问权限"选择',"-");
				if($('#delivery-preview').get(0).checked == false){
					$('#delivery-download').get(0).checked = false;
				}
			});
			$('#delivery-upload').change(function(e){
				Util.sendDirectlyRequest("外链",'"访问权限"选择',"-");
			});
			
			//开启、关闭密码
            $("#password-protocal select").change(function(e) {
                var value = $(this).val();
                var elem = $("#display-password");
                if (value === 'open') {
                	Util.sendDirectlyRequest("外链",'"密码保护"开启',"-");
                    elem.show();
                } else if (value === 'close') {
                	replacePass('delivery-password','password');
                	Util.sendDirectlyRequest("外链",'"密码保护"关闭',"-");
                    elem.hide();
                }
            });
            
            function replacePass (id,type){
            	var obj = document.getElementById(id);
            	var obj2 = $('<input type ="'+type+'" value="'+obj.value+'" id="'+id+'">')[0];
            	obj.parentNode.replaceChild(obj2,obj);
            }
            //显示密码
			$('#delivery-password-show').change(function(){
            	if($('#delivery-password-show').get(0).checked == true){
//          		$('#delivery-password').attr('type',"text");
                    Util.sendDirectlyRequest("外链",'"显示密码"勾选',"-");
					replacePass('delivery-password','text');
            	}else{
//          		$('#delivery-password').attr('type',"password");
            		replacePass('delivery-password','password');
            	}
            });
			
			//有效日期
            $("#ulimit-expiration").click(function() {
            	Util.sendDirectlyRequest("外链",'"有效期至"无限制',"-");
                if ($(this).get(0).checked == true) {
                    $("#expiration").val('');
                    $("#expiration").attr('disabled', true);
                    $('#distanceDays').css('display','none');
                } else {
                    $("#expiration").attr('disabled', false);
                }
                
                //隐藏日期控件
                $('.gldp-default').hide();
                $('#expiration').calendar({
	                onClick: (function(el, cell, date, data) {
	                    el.val(Util.formatDate(date, 'yyyy-MM-dd'));
	                })
	            });
            });
			
			//外链设置
			function saveSet(fn){
				var mode = ''; 
                var password = "";
                var description = $("#description").val(); 
                var expiration = $("#expiration").val();
                
				var re = /([\d]{4})\D+?([\d]{1,2})\D+?([\d]{1,2})?/;
				
                var display_password = $("#display-password");
                
                //隐藏日期控件
                $('.gldp-default').hide();

                if($("#delivery-upload").get(0).checked == true){
                	var upload = true;
                }
                if($("#delivery-download").get(0).checked == true){
                	var download = true;
                }
                if($("#delivery-preview").get(0).checked == true){
                	var preview = true;
                }
                if (upload && download) {
                    mode = "rw";
                } else if(upload && preview){
                	mode = "wp";
                }else if (upload) {
                    mode = "w";
                } else if (download) {
                    mode = "r";
                } else if (preview){
                	mode = 'p';
                }else {
                	Tips.warn(_("访问权限至少选择一种"));
                    return;
                }
                

                if (display_password.css('display') != 'none' && $("#delivery-password").val() == "") {
                    Tips.warn(_("密码不能为空"));
                    return;
                }else if(display_password.css('display') != 'none' && $("#delivery-password").val() != ""){
                	password = $("#delivery-password").val(); 
                } 
				
                if ($("#ulimit-expiration").get(0).checked == true) {
                    expiration = -1;
                } else {
                    if (expiration == "") {
                        Tips.warn(_("有效期不能为空"));
                        return;
                    }

                    var matchArr = re.exec(expiration);

                    if (matchArr.length == 4) {
                        expiration = matchArr[1] + '-' + matchArr[2] + '-' + matchArr[3];
                    } else {
                        Tips.warn(_("日期格式不正确"));
                        return;
                    }

                    var exp = new Date (expiration.replace(/\-/g, "\/"));
                    var now = new Date (new Date().getFullYear() + '/' + (new Date().getMonth()+1) +"/"+ new Date().getDate());
                    if (exp<now) {
                        Tips.warn(_("有效期必须不能小于当前日期"));
                        return;
                    }
                }
				
				if( Util.getBytes(description) > 600 ) {
                	Tips.warn(_("外链说明：最多可以输入300个汉字"));
                	return;
                }
				
				$('body').data('category','modify');
                DeliveryModel.create(function(ret) {
                    if (ret.code != 200) {
                        Tips.warn(ret.message);
                        return;
                    }
                    self.fileAttr.delivery_info = ret.data;
                    if(fn)fn();
                    self.dialog.close();
                }, self.fileAttr.path,self.fileAttr.path_type,self.fileAttr.from,self.fileAttr.neid, self.fileAttr.prefix_neid,mode, password, expiration, description);
                
               
			}
			
			//确定
            $("#delivery-setting-ok").click(function() {
                saveSet(function(){
                	 self.ok_callback && (self.ok_callback());
                });
            });


//          self.dialog.on('close', function(){
//          	self.ok_callback && (self.ok_callback());
////              self.fire('close');
//          });

			//发送外链
			$('#open-send-delivery-dialog').click(function(){
				saveSet(function(){
					var link_addr = $(".delivery-text-addr").val();
//					self.ok_callback && (self.ok_callback());
//	                self.dialog.close();
					self.sendDeliveryDialog = new Dialog(_('发送外链'), {mask: true}, function(dialog, dialog_cb){
						var sendHtml =[];
						sendHtml.push('<div class="delivery-send-dialog">');
						sendHtml.push('<p  class="sendTitle">'+_('发送邮件')+'</p>');
		                sendHtml.push('<div class="sendCon">');
		                    sendHtml.push('<p class="sendLabel">' + _('收件人') + '</p>');
		                    sendHtml.push('<p id="sendTo"><input class="delivery-text-email" id="delivery-email" type="text" value="" placeholder="' + _("邮箱地址以逗号或者分号分隔") + '"/></p>');
		                    sendHtml.push('<p class="sendLabel">' + _('邮件内容') + '</p>');
		                    sendHtml.push('<p><textarea class="delivery-send-content" id="delivery-info" value=""></textarea></p>');
			            sendHtml.push('</div>');
						sendHtml.push('</div>');
	            		dialog.append(sendHtml.join('') + '<div class="dialog-button-area"><a id="auth-dialog-id-ok" class="dialog-button ok">' + _('发送') +'</a> <a id="auth-dialog-id-cancel2" class="dialog-button cancel">' + _('取消') + '</a></div>');
						dialog.append('<div>');
						
						//邮箱提示
						EmailTipList.emailTipList($("#sendTo"),$("#delivery-email"));
						
						$('input, textarea').placeholder();
						
						$('#auth-dialog-id-ok').click(function(e) {
			              var delivery_email = $.trim($("#delivery-email").val());
			              var delivery_info = $.trim($("#delivery-info").val());
			              //var link_addr = $(".delivery-text-addr").val();
			
			              if (delivery_email == "" ) {
			                  Tips.warn(_("邮箱不能为空"));
			                  return;
			              }
			                 
			              var emailArr = delivery_email.split(/[;,]/); 
			              
			              var arr = [];
			              for (var i=0, len=emailArr.length; i<len; i++) {
			              	if( emailArr[i] == '' ){
			              		
			              	}else{
			              		if (!Util.validEmail(emailArr[i])) {
				                        Tips.warn(_("邮箱格式不正确"));
				                        return;
				                    }else{
				                    	arr.push(emailArr[i]);
				                    }
			              	}
			                  
			              }
			              delivery_email = arr.join(";");
			              $(e.currentTarget).html(_("发送中..."));
			              $(e.currentTarget).attr("disabled", "disabled");
			              $('body').data('category','send');
			              DeliveryModel.sendmail(function(ret) {
			                  $(e.currentTarget).html(_("发送"));
			                  $(e.currentTarget).removeAttr("disabled");
			                  if (ret.code == 200&&ret.data.code==200) {
			                      Tips.show(_("发送成功"));
//			                      self.ok_callback && (self.ok_callback());
			                      self.sendDeliveryDialog.close();
			                  }else if(ret.code==502){
			                  	Tips.warn(ret.message);
			                  	return;
			                  }
			                  else {
			                      Tips.warn(_("发送失败，请重新发送"));
			                  }
			              }, link_addr, delivery_email, delivery_info, self.fileAttr.isfolder, self.fileAttr.name, self.fileAttr.path);
			          });
			
						//取消
						$('#auth-dialog-id-cancel2').click(function(){
							//dialog_cb && (dialog_cb());
							self.sendDeliveryDialog.close();
						});
			
					});
				});
				

			});
			
			//取消外链
            $("#auth-dialog-id-cancel-link").click(function() {
                new ConfirmDialog({content: _("您确认要取消文件外链吗？")}, function() {
                    DeliveryModel.del(function(ret) {
                        Tips.show(ret.message);
                        if (ret.code != 200) {
                            return;
                        }
                        self.dialog.close(); 
                        self.ok_callback && (self.ok_callback());
                    }, self.fileAttr.path);
                });
            });
			
			//取消
            $('#auth-dialog-id-cancel').click(function() {
//              self.ok_callback && (self.ok_callback());
                self.dialog.close();
            });


        },
        _init: function() {
            var self = this;
            var title =  _("外链分享");   
              
            if (self.fileAttr.deliveryCode) {
            DeliveryModel.info(function(ret) {
                if (ret.code != 200) {
                    Tips.warn(ret.message);
//                      self.dialog.close();
                    return;
                }
                self.fileAttr.delivery_info = ret.data;
                
                self.dialog = new Dialog(title, {mask: true}, function(dialog, dialog_cb){
            		self._render(dialog, dialog_cb);
        		});
                
                
                $('#expiration').calendar({
	                onClick: (function(el, cell, date, data) {
	                    el.val(Util.formatDate(date, 'yyyy-MM-dd'));
	                })
	            });
	            
            }, self.fileAttr.deliveryCode);
	        } else {
	            var mode = 'r';
	            if (self.fileAttr.action == AuthModel.ACTION["UPLOAD:DELIVERY"]) {
	              mode = 'w';
	            }
	            DeliveryModel.create(function(ret) {
	                if (ret.code != 200) {
	                    Tips.warn(ret.message);
	//                      self.dialog.close();
	                    return;
	                }
	                self.fileAttr.delivery_info = ret.data;
	                 self.dialog = new Dialog(title, {mask: true}, function(dialog, dialog_cb){
	            		self._render(dialog, dialog_cb);
	        		});
	            }, self.fileAttr.path, self.fileAttr.path_type,self.fileAttr.from,self.fileAttr.neid,self.fileAttr.prefix_neid,mode, '');
	        }
                
            
        },
        _delivery_info: function(container, has_password, permission, expiration) {
            var self = this;
            var passwordText = self._hasPasswordText(has_password);
            var permissionText = self._permissionText(permission);
            var htmlArr = []; 

            if (expiration == -1) {
                expiration = _("无限制");
            } else {
                expiration = Util.formatDate(expiration, 'yyyy年MM月dd日'); 
            }
            htmlArr.push('<span>' + _('密码') + ":" + passwordText + '</span>');
            htmlArr.push('<span>' + _('权限' ) + ":" + permissionText + '</span>');
            htmlArr.push('<span>' + _('有效期至') + ":" + expiration + '</span>');

            $(container).empty();
            $(container).append(htmlArr.join(''));
        },
        _hasPasswordText: function(has_password) {
            var passwordText = _("无");

            if (has_password) {
                passwordText = _("有");
            }

            return passwordText;
        },
        _permissionText: function(mode) {
            var permission = _("下载");
            switch(mode) {
                case "r":
                permission = _("下载");
                break;
                case "w":
                permission = _("上传");
                break;
                case "rw":
                permission = _("上传/下载");
                break;
            }
            return permission;
        }
    });
    return DeliveryDialog;
});
