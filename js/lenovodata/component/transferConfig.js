;define("component/transferConfig",function(require,exports){
	var $ = require("jquery"),
		Tips = require('component/tips'),
		Dialog = require("component/dialog"),
		AccountModel =require ('model/AccountManager'),
	    Util = require("util");
		require("scrollbar");
		require("i18n");
	var _ = $.i18n.prop;
	
	function TransferConfig(){
		this.uploadSpeedLimit = '';
		this.downloadSpeedLimit = '';
		this.fileRestriction = [];
		this.sensitiveWord = ['ship','v','s'];
		this.map = [_('所有类型'),_('视频'),_("音频"),_("图片"),_("自定义")];
		this._init();
	}
	$.extend(TransferConfig.prototype,{
		_init : function(){
			var self = this;
			self.z= /^[0-9]*$/;
			
			//初始化页面
//			AccountModel.get_transfer_config(function(ret){
//				if(ret.code == 200){
//					
//				}
//			});
			
			
			self.speedFn();
			self.fileFn();
			self.keyWordFn();
       },
       speedFn:function(){
       		var self = this;
       		var limit_btn = $('.limit_btn');
       		var transfer_limit = $('.transfer_limit');
       		
       		//初始化速度限制
       		if(self.uploadSpeedLimit !='' || self.downloadSpeedLimit !=''){
       			limit_btn.attr('checked','checked');
       			transfer_limit.find('input').prop('disabled',!limit_btn.prop('checked'));
       			transfer_limit.find('input').eq(0).val(self.uploadSpeedLimit);
       			transfer_limit.find('input').eq(1).val(self.downloadSpeedLimit);
       		}else{
       			limit_btn.removeAttr('checked');
       		}
       		
       		limit_btn.on('click',function(){
       			//点击开关按钮，来设置input标签能否输入
       			transfer_limit.find('input').prop('disabled',!$(this).prop('checked'));
       			if($(this).prop('checked')){
       				transfer_limit.find('input').eq(0).val(self.uploadSpeedLimit);
       				transfer_limit.find('input').eq(1).val(self.downloadSpeedLimit);
       			}else{
       				transfer_limit.find('input').val('');
       			}
       		});
       		transfer_limit.find('input').blur(function(){
       			var val=$(this).val();
       			var that = $(this);
       			if(!self.z.test(val)){
       				Tips.warn(_('请输入正确的数字'),function(){
       					that.focus();
       				});
       			}
       		});
       },
       fileFn:function(){
       		var self = this;
       		var fileType_btn = $('.fileType_btn');
       		var file_type= $('.file_type');
       		var addType = $('.edit-fileType');
       		var listEmpty = file_type.find('.list-empty').clone();
       		var listTemp = '<li class="list-item {{disable}}" index="{{index}}"><span class="cos1" title="{{title}}">{{name}}</span><span class="cos2"><span><i class="icon i-edit"></i><i class="icon i-delete"></i></span><em>{{size}}</em></span></li>';
       		
       		//初始化文件类型限制
       		if(self.fileRestriction.length>0){
       			fileType_btn.attr('checked','checked');
       			file_type.removeClass('unFile');
       			//编辑文件类型开关
       			addType.on('click',function(){
       				addFnDialog();
       			});
       			
				var listBox = '',data={};   
				//初始化页面显示
				for(var i=0,len=self.fileRestriction.length;i<len;i++){
					data.name = self.fileRestriction[i].name;
					data.title = self.fileRestriction[i].types;
					data.disable = 'list-false';
					data.size = self.fileRestriction[i].sizeLimit>0?'<'+Util.formatBytes(self.fileRestriction[i].sizeLimit):'禁止上传';
					
					switch(self.fileRestriction[i].name){
						case '*':
						data.name = '所有类型';
						data.index = 0;
						data.disable = '';
						file_type.find('ul').addClass('typeBox');
						break;
						case '视频':
						data.index = 1;
						break;
						case '音频':
						data.index = 2;
						break;
						case '图片':
						data.index = 3;
						break;
						case '自定义':
						data.index = 4;
						break;
					}
					
					file_type.find('.list-empty').remove();
					listBox +=  Mustache.render(listTemp,data);
				}
       			file_type.find('ul').append(listBox);
       			
       			file_type.find('.i-delete').undelegate('click');
	       		file_type.find('.i-edit').undelegate('click');
       		}else{
       			fileType_btn.removeAttr('checked');
       		};
       		
       		//文件限制按钮开关
       		fileType_btn.on('click',function(){
       			if(file_type.hasClass('unFile')){
	       			file_type.removeClass('unFile');
	       			fileType_btn.attr('checked','checked');
	       			
	       			//编辑文件类型开关
	       			addType.on('click',function(){
	       				addFnDialog();
	       			});
	       		}else{
	       			file_type.addClass('unFile');
	       			addType.unbind('click');
	       			fileType_btn.removeAttr('checked');
	       		};
       		});
       		
       		//编辑文件类型弹出框
       		function addFnDialog(objData){
       			var temp = ['<ul class="addFileBox">',
	       						'<li><span class="cos1">' + _("文件类型") + ':</span><span class="cos2">',
	       							'<select id="select_type">',
	       							'{{options}}',
	                                '</select>',
	                                '<textarea disabled="disabled"></textarea>',
	                                '<p class="notes">' + _("多个类型后缀使用分号分隔，如：.txt;.doc;.jpg") + '</p>',
	       						'</span></li>',
	       						'<li><span class="cos1">' + _("文件大小") + ':</span><span class="cos2">',
	       							'<input class="sizeNum" type="text" disabled="disabled" /><select id="select_size">',
	                                  '<option value="-1">' + _("禁止上传") + '</option>',
	                                  '<option value="MB">MB</option>',
	                                  '<option value="GB">GB</option>',
	                                '</select>',
	       						'</span></li>',
       						'</ul>',
       						'<div class="dialog-button-area">',
				                  '<a class="dialog-button ok">'+_("确定")+'</a><a class="dialog-button cancel">'+_("取消")+'</a>',
				            '</div>'].join("");
				//下拉选择文件类型
				var options = '';
				for(var i in self.map){
					options+='<option value="'+i+'" title="'+self.map[i]+'">'+self.map[i]+'</option>';
				}
				temp = temp.replace('{{options}}',options);
				
	       		var dialog = new Dialog(_("编辑文件类型"),function(parent){
					parent.append(temp);
				});
				
				self.dialog = dialog;
				
				
				//默认类型
				var selectType = $('#select_type');
				var textareaBox = $('textarea');
				var selectSize = $('#select_size');
				var sizeInput = $('.sizeNum');	
				
				//编辑文件后缀类型
				if(objData){
       				selectType.val(objData.index);
       				textareaBox.val(objData.types);
       				sizeInput.val(objData.size);
       				selectSize.val(objData.unit);
       				selectType.attr('disabled','disabled');
       				
       				if(objData.index!=0||objData.types !=''){
       					textareaBox.removeAttr('disabled');
       				};
       				if(objData.types =='*'){
       					textareaBox.attr('disabled','disabled').val('');
       				};
       				if(objData.size =='*'){
       					sizeInput.attr('disabled','disabled').val('');
       				};
       				if(objData.size !=''&&objData.size !='*'){
       					sizeInput.removeAttr('disabled');
       				};
       			}
				
				//切换默认类型，显示相应的后缀
				selectType.change(function(){
					switch(selectType.val()){
						case '1' : 
							textareaBox.removeAttr('disabled');
							textareaBox.val('.mkv;.mp4;.avi;.rm;').focus();
							break;
						case '2' : 
							textareaBox.removeAttr('disabled');
							textareaBox.val('.txt').focus();
							break;
						case '3' : 
							textareaBox.removeAttr('disabled');
							textareaBox.val('.exe').focus();
							break;
						case '4' : 
							textareaBox.removeAttr('disabled');
							textareaBox.val('').focus();
							break;
						default : 
							textareaBox.attr('disabled','disabled');
							textareaBox.val('');
							break;
					}
				});
				
				//默认大小
				selectSize.change(function(){
					switch(selectSize.val()){
						case 'MB' : 
							sizeInput.removeAttr('disabled');
							sizeInput.focus();
							break;
						case 'GB' : 
							sizeInput.removeAttr('disabled');
							sizeInput.focus();
							break;
						default : 
							sizeInput.attr('disabled','disabled');
							sizeInput.val('');
							break;
					}
				});
				
				var okBtn = $('.dialog-button-area').find('.ok');
				var cancelBtn = $('.dialog-button-area').find('.cancel');
				
				okBtn.on('click',function(){
					var sizeNum = $('.sizeNum').val();
					var textareaType = $('textarea').val();
					var selectTypeVal = selectType.val();
					var textReg = /^(\.[a-zA-Z0-9]+;)+$|\.[a-zA-Z0-9]+$|^(\.[a-zA-Z0-9]+;)+\.[a-zA-Z0-9]+$/;//判断后缀类型
					
					//后缀类型判断
					if(!textReg.test(textareaType) && selectTypeVal !=0){
						Tips.warn(_('请输入正确的后缀类型'));
						return;
					};
					
					//大小判断
					if((!self.z.test(sizeNum)||sizeNum =='')&&selectSize.val() !='-1' ){
						Tips.warn(_('请输入正确的数字'));
						return;
					};
					
					//获取当前数据
					var data={};
					data.index = selectTypeVal;
					data.title = textareaType;
					data.disable = 'list-false';
					data.name =  self.map[selectTypeVal];
					
					//如果添加的为所有类型
					if(selectTypeVal == 0){
						file_type.find('ul').addClass('typeBox');
						data.disable = '';
						data.title = '*';
						data.allType = '*';
					}
					//如果大小限制为'禁止上传'
					if(selectSize.val() =='-1'){
						data.size =  _('禁止上传');
					}else{
						switch(selectSize.val()){
							case 'MB' :
								sizeNum = sizeNum*1024*1024;
								data.size = '<'+ Util.formatBytes(sizeNum);
								break;
							case 'GB' : 
								sizeNum = sizeNum*1024*1024*1024;
								data.size = '<'+ Util.formatBytes(sizeNum);
								break;
						}
					}
					
					
					var listBox =  $(Mustache.render(listTemp,data));
					listBox.data('curData',{index:selectTypeVal,types:textareaType!==''?textareaType:'*',size:$('.sizeNum').val()!==''?$('.sizeNum').val():'*',unit:selectSize.val()});
					
					//数据追加到页面前，删除旧的数据
					var lists = file_type.find('ul li');
					var flag = false;
					for(var i=0,len= lists.length;i<len;i++){
						if(!lists.eq(i).attr('index')){
							flag = true;
						}else{
							flag = false;
						};
						if(lists.eq(i).attr('index') == selectTypeVal){
							lists.eq(i).remove();
						};
					}
					if(flag){
						file_type.find('.list-empty').remove();
					}
					
					file_type.find('ul').append(listBox);
					
					//将需要提交的数据保存起来
					var onOff = false;
					for(var i=0,len=self.fileRestriction.length;i<len;i++){
						if(self.fileRestriction[i].name == data.name || (data.allType&& self.fileRestriction[i].name == data.allType)){
							onOff = true;
							self.fileRestriction[i].types = selectTypeVal ==0?'*':textareaType;
							self.fileRestriction[i].sizeLimit = selectSize.val()!=-1?sizeNum:-1;
						};
					}
					if(!onOff){
						if(data.allType){
							data.name = '*';
							textareaType = '*';
						}
						self.fileRestriction.push({name:data.name,types:textareaType,sizeLimit:selectSize.val()!=-1?sizeNum:-1});
					}
					self.dialog.close();
				});
				cancelBtn.on('click',function(){
					self.dialog.close();
				});

       		};
       		
       		//文件类型限制删除
       		file_type.delegate('.i-delete','click',function(){
       			if(fileType_btn.attr('checked') !='checked')return;
       			var del_obj = $(this).parents('.list-item');
       			var index = del_obj.attr('index');
       			var name = '';
       			del_obj.remove();
       			if(index==0){
       				file_type.find('ul').removeClass('typeBox');
       			}
       			switch(index){
						case '1' : 
							name = '视频';
							break;
						case '2' : 
							name = '音频';
							break;
						case '3' : 
							name = '图片';
							break;
						case '4' : 
							name = '自定义';
							break;
						default : 
							name = '*';
							break;
					}
       			for(var i=0,len=self.fileRestriction.length;i<len;i++){
       				if(self.fileRestriction.hasOwnProperty(i)&&self.fileRestriction[i].name == name){
       					self.fileRestriction.splice(i,1);
       				}
       			};
       			if(self.fileRestriction.length==0){
       				file_type.append(listEmpty);
       			};
       		});
       		//文件类型限制编辑
       		file_type.delegate('.i-edit','click',function(){
       			if(fileType_btn.attr('checked') !='checked')return;
       			var del_obj = $(this).parents('.list-item');
       			var index = del_obj.attr('index');
       			var editData = $(del_obj).data('curData');
       			addFnDialog(editData);
       		});
     },
	   keyWordFn:function(){
	   		var self = this;
	   		var keywordBtn = $('.keyword_btn');
	   		var addKeyword = $('.add-keyword');
	   		var keyBox = $('.key_word');
	   		var temp = '<li class="list-item" index={{index}}><span><i class="icon i-edit"></i><i class="icon i-delete"></i></span><em>{{keyTxt}}</em><input type="text" class="keyInput" /></li>';
	   		var num = 0;
	   		
	   		if(self.sensitiveWord.length>0){
	   			keyBox.removeClass('unKey');
	   			keywordBtn.attr('checked','checked');
				//编辑文件类型开关
       			addKeyword.on('click',function(){
       				keyFnDialog();
       			});
	   			
	   			var html = '';
	   			var oUl = keyBox.find('ul');
	   			keyBox.find('.list-empty').remove();
	   			
	   			for(var i=0,len=self.sensitiveWord.length;i<len;i++){
	   				self.sensitiveWord[i] = {
	   					keyTxt:self.sensitiveWord[i],
	   					index:num++
	   				}
	   				var obj = Mustache.render(temp,self.sensitiveWord[i]);
	   				html+=obj;
	   			}
	   			oUl.append(html);
	   		}else{
	   			keyBox.addClass('unKey');
	       		addKeyword.unbind('click');
	       		keywordBtn.removeAttr('checked');
	   		}
	   		
	   		
	   		
	   		//文件限制按钮开关
       		keywordBtn.on('click',function(){
       			if(keyBox.hasClass('unKey')){
	       			keyBox.removeClass('unKey');
	       			
	       			//编辑文件类型开关
	       			addKeyword.on('click',function(){
	       				keyFnDialog();
	       			});
	       			
	       		}else{
	       			keyBox.addClass('unKey');
	       			keyBox.find('.item').remove();
	       			addKeyword.unbind('click');
	       		};
       		});
       	    
	   		function keyFnDialog(keyData){
	   			var data = {};
	   				data.keyTxt = '';
	   			var listBox =  $(Mustache.render(temp,data));
	   			if(keyBox.find('.item').length==0){
	   				keyBox.find('.list-empty').remove();
	   				keyBox.find('ul').append(listBox);
	   				listBox.addClass('item');
	   				listBox.find('.keyInput').val(_('自定义')).focus().select();
	   			}else{
	   				return false;
	   			};
	   			
	   			keyBox.find('.item').on("keypress",function(ev){
		       	   if(ev.keyCode==13){
		       	   	    var keyInput = $('.item .keyInput');
			   			var keyTxt =  $('.item em');
			   			var keyVal = keyInput.val();
			   			if(keyVal ==''){
			   				Tips.warn(_('请输入关键词'));
			   				keyInput.focus().select();
							return;
			   			};
			   			if(keyVal !=''&& keyVal.length >16){
			   				Tips.warn(_('关键字长度请小于16字符'));
			   				keyInput.focus().select();
							return;
			   			};
			   			
			   			keyTxt.text(keyVal);
			   			self.sensitiveWord.push(keyVal);
			   			keyInput.parent('.list-item').removeClass('item');
		       	   	    
		       	   	    num++;
		       	   	    listBox.data('curKey',{index:num,val:keyVal});
		       	   }
		       });
	   		};
	   		
//	   		keyBox.delegate('.i-delete','click',function(){
//	   			var index = $(this).parents('.list-item').attr('index');
//	   			alert(index);
//	   			//$(this).parents('.list-item').remove();
//	   		});
//	   		keyBox.delegate('.i-edit','click',function(){
//	   			$(this).val().parents('.list-item').addClass('item');
//	   		});
	   		keyBox.find('ul').perfectScrollbar({suppressScrollX: true});
	   }
	});
	return TransferConfig;
});