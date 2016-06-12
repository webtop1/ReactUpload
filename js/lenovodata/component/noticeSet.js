;define( function(require, exports){
	
	var $ =jquery= require('jquery'),
        Util = require('util'),
        Tips = require('component/tips'),
        AccountModel =require ('lenovodata/model/AccountManager')
        _ = $.i18n.prop;
		require('mustache');
		
		$(function(){
			init();
			
			//初始化数据
			function init(){
				AccountModel.get_notice_config(function(ret){
            		if(ret.code == 200){
            			var leng = ret.data.content.length;
            			var arr =[],
            			data =[],
            			team =[],
            			auth =[],
            			delivery =[],
            			elseEvent =[];
            			
            			for (var i =0; i<leng; i++){
            				var item = ret.data.content[i];
            				var d = {},str =[];
            				d.eId = item.name.substr(6); 
            				d.value = item.values;
            				d.switchBtn = (d.value[0] || d.value[1] || d.vlaue[2]);
            				d.eName = getName(d.eId);
            				(eval(d.value[0])) && str.push(_('网页动态'));
//          				(eval(d.value[1])) && str.push(_('客户端动态'));
            				(eval(d.value[2])) && str.push(_('邮件通知'));
            				
            				d.eNotice = str.join('、');
            				
            				arr[d.eId] = d;
            				
            			}
            			//数据类
            			data.push(arr['1001']); //
            			data.push(arr['1010']);
//          			data.push(arr['1003']); 下载的暂时去掉了
            			data.push(arr['1007']);
            			data.push(arr['1012']);
            			data.push(arr['1028']);
            			//团队类
            			team.push(arr['3002']);
            			team.push(arr['3003']);
            			//授权类
            			auth.push(arr['4001']);
            			auth.push(arr['4004']);
            			auth.push(arr['4007']);
            			auth.push(arr['4014']);
            			//外链类 暂时不做
//          			delivery.push(arr['6001']);
//          			delivery.push(arr['6002']);
            			//其他类 暂时不做
//          			elseEvent.push(arr['5001']);
//          			elseEvent.push(arr['5002']);
//          			elseEvent.push(arr['5013']);
            			
            			
            			
            			
            			//data
            			for (var j =0; j< data.length;j++) {
            				var temple = $('#dataTemple').html();
            				
            				var dataTemple =Mustache.render(temple,data[j]);
            				$('#data').append(dataTemple);
            				
            			}
            			//team
            			for (var j=0; j<team.length;j++) {
            				if(j == 0) {
            					var temple =$('#teamElseTemple').html();
            				}else {
            					var temple = $('#dataTemple').html();
            				}
            				
            				var dataTemple =Mustache.render(temple,team[j]);
            				$('#team').append(dataTemple);
            			}
            			//auth
            			for (var j=0; j<auth.length;j++) {
            				var temple = $('#dataTemple').html();
            				
            				var dataTemple =Mustache.render(temple,auth[j]);
            				$('#auth').append(dataTemple);
            			}
            			//delivery 暂时不做
//          			for (var j=0; j<delivery.length;j++) {
//          				var temple = $('#dataTemple').html();
//          				var dataTemple =Mustache.render(temple,delivery[j]);
//          				$('#delivery').append(dataTemple);
//          			}
            			//else 暂时不做
//          			for (var j=0; j<elseEvent.length;j++) {
//          				var temple = $('#dataTemple').html();
//          				var dataTemple =Mustache.render(temple,elseEvent[j]);
//          				$('#else').append(dataTemple);
//          			}
            			
            			addEvent();	
            		}
            			
            		
            	},'1');
			}
			
			function addEvent(){
				//展开收缩
				$('.i-shouqi').click(function() {
					var obj = $(this).parents('dl');
					
//					obj.siblings().find('.i-shouqi').removeClass('i-openup');
//					obj.siblings().children('dd').slideUp();
					obj.children('dd').slideToggle();
					$(this).toggleClass('i-openup');
					
				});
	          
	            
	            //开关
	           $('body').delegate('.noticeBtn','click',function(){
	           		var dd =$(this).parents('dd');
	           		var id = dd.attr('id').substr(1);
	           		var idArr = setEvent(id),
	           		postData =[];
	           		switchyes = dd.hasClass('false');
	           		
	           		for (var j=0; j<idArr.length;j++) {
	           			for(var i=0;i<3;i++){
	           				var postItem = {
	           					'config_type':1,
		           				'config_id':Util.getAccountId()
	           				}
	           				if(i==0){
	           					postItem.name ='event.'+idArr[j]+'.sub';
	           					
	           					if(switchyes){ //开
	           						postItem.value = true;
	           					}else { //关
	           						postItem.value = false;
	           					}
	           				}else if(i==1){
	           					postItem.name ='event.'+idArr[j]+'.client';
	           					if(switchyes){ //开
//	           						postItem.value = true; 
									postItem.value = false; //客户端暂不提示，默认设为false;
	           					}else { //关
	           						postItem.value = false;
	           					}
	           				}else if(i==2){
	           					postItem.name ='event.'+idArr[j]+'.email';
	           					postItem.value = false;
	           				}
	           				postData.push(JSON.stringify(postItem));
		           			
		           		}
	           			
	           		}
	           	//请求
	           		AccountModel.set_notice_config(function(ret){
	           			if(ret.code == 200) {
	           				if(dd.hasClass('false')) {
//	           					dd.find('.noticeStyle em').text('网页动态、客户端动态');
								dd.find('.noticeStyle em').text(_('网页动态'));
	           				}
	           				dd.toggleClass('false');
	           			}else {
	           				Tips.warn(ret.message);
	           			}
	           		},{"json":"["+postData+"]"});
	            	
	            });
	            $('body').data('category','notice').data('action','保存修改').data('content','');
	             //修改
	           $('body').delegate('.notice-modify','click',function() {
	            	if($('body').find('.notice-edit').length !=0){
	            		$('body').find('.notice-edit').remove();
	            	}
	            	
	            	
	            	var self = this;
	            	var bb = $(this).parents('dd');
	            	id = bb.attr('id').substr(1);
	            	//获取数据
	            	AccountModel.get_notice_config(function(ret){	
	            		if(ret.code ==200) {
//	            			var value = ret.data.content[0].values = [true,true,false];
							var value =ret.data.content[0].values;
	            			var temp = $('#editTemp').html();
	            			msgBox = $(temp);
	            			
			            	var t = Util.getElementYPos(self);
			            	var l = Util.getElementXPos(self)-150;
			            	var winH = $(window).height();
			            	t= t+30;
//	            			t = (t < winH-t?t+30:t-110);
			            	
			            	$('body').append(temp);
			            	$('.notice-edit').css({'left':l,'top':t});
			            	eval(value[0]) && ($('.notice-edit').find('#web')[0].checked ='checked');
			            	eval(value[1]) && ($('.notice-edit').find('#client')[0].checked ='checked');
			            	eval(value[2]) && ($('.notice-edit').find('#email')[0].checked ='checked');
	            		}
	            		
	            	},'1','event.'+id);
	            	
	            	 $(document).mouseup(function(e){
			            	if(!$('.notice-edit').is(e.target)&& $('.notice-edit').has(e.target).length==0){
			            		$('body').find('.notice-edit').remove();
			            	}
//			            	$('body').find('.notice-edit').remove();
			            	
			            });
	            	
	            
	            	
	            });
	            	 //保存
		           $('body').delegate('#save','click',function(e){
		           		var isSub = $('#web')[0].checked,
//		           		isClient =$('#client')[0].checked, //暂时去掉客户端动态提醒，默认为false
						isClient = false,
		           		isEmail =$('#email')[0].checked;
		           		
		           		var idArr = setEvent(id),
		           		postData =[];
		           		
		           		for (var j=0; j<idArr.length;j++) {
		           			for(var i=0;i<3;i++){
		           				var postItem = {
		           					'config_type':1,
			           				'config_id':Util.getAccountId()
		           				}
		           				if(i==0){
		           					postItem.name ='event.'+idArr[j]+'.sub';
		           					postItem.value = isSub;
		           				}else if(i==1){ //暂时去掉客户端动态，默认设为false
		           					postItem.name ='event.'+idArr[j]+'.client';
		           					postItem.value = isClient =false;
		           				}else if(i==2){
		           					postItem.name ='event.'+idArr[j]+'.email';
		           					postItem.value = isEmail;
		           				}
		           				postData.push(JSON.stringify(postItem));
			           		}
		           			
		           		}
		           		AccountModel.set_notice_config(function(ret){
		           			if(ret.code == 200) {
		           				
		           				var id = 'e'+ ret.data[0].name.split('.')[1];
		           				if(!isSub && !isClient && !isEmail) {
		           					$('#'+id).addClass('false');
		           				}else {
		           					var str =[];
		           					isSub && str.push(_('网页动态'));
		           					isClient && str.push(_('客户端动态'));//暂时去掉客户端
		           					isEmail && str.push(_('邮件通知'));
		           					$('#'+id).find('.noticeStyle em').text(str.join('、'));
		           				}
		            			$('body').find('.notice-edit').remove();
		           			}else {
		           				Tips.warn(ret.message);
		           			}
		           		},{"json":"["+postData+"]"});
		            	
		            	e.preventDefault();
		            	e.stopPropagation();
		           });
	            	//
	           
			}
			
			
            
           function getName(id){
           		var name ='';
	           	switch(id){
	           		case '1001':
	           			name = _('上传文件夹/文件');
	           			break;
	           		case '1010':
	           			name =_('更新文件');
	           			break;
	           		case '1003':
	           			name =_('下载/打包下载');
	           			break;
	           		case '1007':
	           			name =_('删除文件夹/文件');
	           			break;
	           		case '1012':
	           			name =_('移动/复制文件夹/文件');
	           			break;
	           		case '1028':
	           			name =_('定期清理'); //数据类里的其它
	           			break;
	           		case '3002':
	           			name = _('团队信息变更'); 
	           			break;
	           		case '3003':
	           			name = _('增加移除成员');
	           			break;
	           		case '4001':
	           			name = _('添加共享');
	           			break;
	           		case '4007':
	           			name = _('删除共享');
	           			break;
	           		case '4004':
	           			name = _('修改共享');
	           			break;
	           		case '4014':
	           			name = _('移交共享'); //团队类里的其它
	           			break;
	           		case '6001':
	           			name = _('生成外链');
	           			break;
	           		case '6002':
	           			name = _('取消外链');
	           			break;
	           		case '5001':
	           			name = _('发布公告');
	           			break;
	           		case '5002':
	           			name = _('修改公告');
	           			break;
	           		case '5013':
	           			name = _('系统升级及公告');
	           			break;
	           		case '5012':
	           			name = _('IP地址限定');
	           			break;
	           		case '5011':
	           			name = _('设备管理');
	           			break;
	           		default: 
	           			name = _('....');
	           			break;
	           		
	           	}
	           	return name;
           }
           function setEvent (id){
           	var arr=[]
           	switch(id){
	        	case "1001":
	        		arr = [1001,1002,1036];
	        		break;
	        	case "1010": //更新文件类
	        		arr = [1010,1011,1019,1020,1021,1035];
	        		break;
	        	case "1003":
	        		arr = [1003,1004,1005,1006];
	        		break;
	        	case '1007':
	        		arr =[1007,1008,1009,1033,1034];
	        		break;
	        	case '1012':
	        		arr =[1012,1013,1014,1015,1016,1017];
	        		break;
	        	case '1028':
					arr =[1028,1029,1037]; //定时清理
	        		break;
	        	case '3001':
	        		arr = [3001]; //创建团队
	        		break;
	        	case '3002':
	        		arr =[3002,3005,3006,3007,3008,3009]; //团队信息变更
	        		break;
	        	case '3003':
	        		arr =[3003,3004]; //添加移除成员
	        		break;
	        	case '4001':
	        		arr =[4001,4002,4003,4010,4016,4017]; //添加共享
	        		break;
	        	case '4007':
	        		arr =[4007,4008,4009,4011,4013,4015,4018,4020]; //删除共享
	        		break;
	        	case '4004':
	        		arr =[4004,4005,4006,4012,4019,4021]; //修改共享
	        		break;
	        	case '4014':
	        		arr =[4014]; //移交共享
	        		break;
	        	case '6001':
	        		arr =[6001,6003];
	        		break;
	        	case '6002':
	        		arr =[6002];
	        		break;
	        	case '5001':
	        		arr =[5001];
	        		break;
	        	case '5002':
	        		arr =[5002];
	        		break;
	        	case '5011':
	        		arr =[5011];
	        		break;
	        	case '5012':
	        		arr =[5012];
	        		break;
	        	case '5013':
	        		arr =[5013];
	        		break;
           	 }
           	return arr;
           		
           }
            
            
			
		});
});
