;define('component/cleanupDialog', function(require, exports, module){
	var $ = require('jquery'),
		Tips = require('component/tips'),
		Dialog = require('component/dialog');
	    ConfirmDialog = require('component/confirmDialog');
	    FileModel = require('model/FileManager');
		require('i18n');
		Util = require('util');
	var	_ = $.i18n.prop;
	
	var cleanupTemplate = '<div id="cleanupBox"><div class="cleanupBox-head"><input type="checkbox"/>'+ _('定期清理文件夹')+'</div><div class="cleanupBox-content"><div class="cleanup-list"><p><i class="icon icon-radio"></i>'+ _('自动清理') +'</p><select id="autoSelect"><option selected="selected" value="10">'+_('清理保存10天以上的文件')+'</option><option value="30">'+_('清理保存30天以上的文件')+'</option><option value="90">'+_('清理保存90天以上的文件')+'</option></select><span>'+_('将删除该文件夹内超过时间限制的文件或子文件夹，删除的项保留30天。')+'</span></div><div class="cleanup-list"><p><i class="icon icon-radio"></i>'+_('到期清理')+'</p><input type="text" class="date" id="clearDate" readonly="true"/><span>'+_('将在确定日期彻底删除文件夹内的文件或子文件夹，删除的项保留30天。')+'</span></div><div class="cleanup-list"><p><i class="icon icon-radio"></i>'+_('定时清理')+'</p><select id="clearSelect"><option value="d">'+_('每天清理一次')+'</option><option value="w">'+_('每周清理一次')+'</option><option value="m">'+_('每月清理一次')+'</option></select><select id="selectD"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option></select><select id="selectW"><option value="0">'+_('星期日')+'</option><option value="1">'+_('星期一')+'</option><option value="2">'+_('星期二')+'</option><option value="3">'+_('星期三')+'</option><option value="4">'+_('星期四')+'</option><option value="5">'+_('星期五')+'</option><option value="6">'+_('星期六')+'</option></select><input type="text" class="date" id="clearTime" readonly="true"/><span>'+_('将在固定时间定期彻底删除文件夹内的文件或子文件夹，删除的项保留30天。')+'</span></div></div></div><div class="dialog-button-area"><a id="cleanup-ok" class="dialog-button ok">' + _('确定') +'</a><a id="cleanup-close" class="dialog-button cancel">' + _('取消') +'</a></div>';
		
    function CleanupDialog(context,param) {
    	var self = this;
    	this.param = param;
    	this.path_type = param.path_type;
    	this.from = param.from;
    	this.neid = param.neid;
        this._init();
    }

	$.extend(CleanupDialog.prototype, {
        _init: function() {
            var self = this;
            var cleanMode;
            var cleanArg;
 			var num=0;    
 			var clean_mode;
 			var clean_arg;
            self.dialog = new Dialog(_("设置定期清理"), {mask: true,'minWidth':680}, function(dialog){
                dialog.append(cleanupTemplate);
            });           
     
			function disable(){
				$("#cleanupBox select").attr('disabled',true);
				$("#cleanupBox .cleanupBox-content input").attr('disabled',true);
				$("#cleanupBox select").css({ opacity: .6 });
				$("#cleanupBox .cleanup-list input").css({ opacity: .6 });
				$("#cleanupBox span").css({ opacity: .6 });
				$("#cleanupBox .cleanup-list i").removeClass('icon-radio-selected');
				$("#cleanupBox .cleanup-list i").addClass('icon-radio');
				$("#cleanupBox .date").val('');
			};

			function enable(index){
				$("#cleanupBox .cleanup-list i").eq(index).removeClass('icon-radio');
				$("#cleanupBox .cleanup-list i").eq(index).addClass('icon-radio-selected');
				$("#cleanupBox .cleanup-list").eq(index).find('select').attr('disabled',false);
				$("#cleanupBox .cleanup-list").eq(index).find('input').attr('disabled',false);
				$("#cleanupBox .cleanup-list").eq(index).find('select').css({ opacity: 1 });
				$("#cleanupBox .cleanup-list").eq(index).find('input').css({ opacity: 1 });
				$("#cleanupBox span").eq(index).css({ opacity: 1 });

			};
			
			
			//默认选项
			disable();			
			enable(0);
			//设置勾选框默认状态
			var checkBtn=$('.cleanupBox-head input:checkbox');
			var cleanupP=$('#cleanupBox .cleanupBox-content p');
			if(checkBtn.attr('checked') == true){
				enable(0);
			}else{
				cleanupP.css('color','#d5d5d5');
				disable();
			};
			
			//选中复选框后，恢复默认选项
			var onOff=true;
			checkBtn.click(function(){
				var self=this;
				if(onOff){
					checkBtn.attr('checked',true);
					disable();
					enable(0);
					cleanupP.css('color','#000');						
					onOff=false;
				}else{
					checkBtn.attr('checked',false);
					disable();
					cleanupP.css('color','#d5d5d5');	
					onOff=true;
				}
			});
			
			FileModel.info(function(ret) {
                if (ret.code == 200) {
                	cleanMode = ret.data.clean_mode;
                	cleanArg = ret.data.clean_arg;
					if(cleanMode && cleanArg){
			        	checkBtn.attr('checked',true);
			        	switch(cleanMode){
			        		case 'time':
			        		enable(1);
			        		$('#clearDate').val(cleanArg);
			        		num=1;
			        		break;
			        		case 'period':
			        		enable(2);
			        		var clearText=cleanArg.match(/[a-z]/);
			        		var clearSelectText=cleanArg.match(/\d+/);
			        		num=2;
			        		$('#selectW').css('display','none');
			        		$('#selectD').css('display','none');
			        		$('#clearTime').css('display','none');
			        		if(clearText == 'w'){
			        			$('#clearSelect').val(clearText).attr('selected','selected');
			        			$('#selectW').css('display','inline-block');
			        			$('#selectW').val(clearSelectText).attr('selected','selected'); 		        			
			        		}else if(clearText == 'm'){
			        			$('#clearSelect').val(clearText).attr('selected','selected');
			        			$('#clearTime').val(clearSelectText); 
			        			$('#clearTime').css('display','inline-block');
			        			clean_arg = $('#clearSelect').val()+'-'+$('#clearTime').val();
			        			$('#clearTime').eq(0).calendar({
						            onClick: (function(el, cell, date, data) {
						                el.val(Util.formatDate(date, 'dd'));
						                clean_arg = $('#clearSelect').val()+'-'+$('#clearTime').val();	
						            })
							      });
			        		}else{
			        			$('#clearSelect').val(clearText).attr('selected','selected');
			        			$('#selectD').val(clearSelectText).attr('selected','selected'); 
			        			$('#selectD').css('display','inline-block');
			        		}
			        		break;
			        		default:
			        		enable(0);
			        		num=0;
			        		$('#autoSelect').val(cleanArg).attr('selected','selected');
			        		break;
			        	}
			        	cleanupP.css('color','#000');						
						onOff=false;
			        };
			        clearSelect();
                }                
            }, self.param.path,self.path_type,self.from,self.neid);			


			
			//日期控件
			var myDate=new Date();
			myDate=myDate.getFullYear()+"/"+(myDate.getMonth()+1)+"/"+myDate.getDate();
			$('#clearDate').eq(0).calendar({
            onClick: (function(el, cell, date, data) {
                el.val(Util.formatDate(date, 'yyyy-MM-dd'));
                if( new Date(myDate) >= new Date($('#clearDate').val().replace(/\-/g,'/')) ) {
			    	Tips.warn(_('请选择晚于今天的日期！'));
			    	$('#clearDate').val('');
			    	return;
			    }
            })
	        });	
			
			//选中清理按钮
			$("#cleanupBox .cleanup-list i").click(function(){
				if(checkBtn.attr('checked') == 'checked'){
					var index=$("#cleanupBox .cleanup-list i").index(this);
					num = index;
					disable();
					enable(index);
				}
			});
			
			
			function clearSelect(){
				var n=$('#clearSelect').val();
				switch(n)
				{
				case 'w':
				  $('#selectD').css('display','none');
				  $('#clearTime').css('display','none');
				  $('#selectW').css('display','inline-block');
				  clean_arg = $('#clearSelect').val()+'-'+$('#selectW').val();
				  break;
				case 'm':
				  $('#selectD').css('display','none');
				  $('#selectW').css('display','none');
				  $('#clearTime').css('display','inline-block');
				  $('#clearTime').eq(0).calendar({
				    onClick: (function(el, cell, date, data) {
				        el.val(Util.formatDate(date, 'dd'));
				  		clean_arg = $('#clearSelect').val()+'-'+$('#clearTime').val();			                
				    })
				  });			      
				  break;
				default:
				  $('#clearTime').css('display','none');
				  $('#selectW').css('display','none');
				  $('#selectD').css('display','inline-block');
				  clean_arg = $('#clearSelect').val()+'-'+$('#selectD').val();				  
				}	
			}

			$("#clearSelect").change(function(){
				clearSelect();
			});

			$("#selectD").change(function(){
				if($("#selectD").css('display') == 'inline-block'){
					clean_arg = $('#clearSelect').val()+'-'+$('#selectD').val();
				}
			});
			$("#selectW").change(function(){
				if($("#selectW").css('display') == 'inline-block'){
					clean_arg = $('#clearSelect').val()+'-'+$('#selectW').val();
				}
			});				

            $('#cleanup-ok').click(function() {
				var path=self.param.path;
				if(checkBtn.attr('checked') == 'checked'){
                    switch(num)
					{
					case 1:
					  clean_mode = 'time';
					  clean_arg = $('#clearDate').val();
						if(clean_arg ==''){
				            Tips.warn(_('请选择清理日期!'));
				            return;
						}
					  break;
					case 2:
					  clean_mode = 'period';
					  clean_arg = clean_arg;
					  if($('#clearTime').val() =='' && $('#clearTime').css('display')=='inline-block'){
							Tips.warn(_('请选择清理日期!'));
				            return;
						}
					  break;
					default:
					  clean_mode = 'auto';
					  clean_arg = $('#autoSelect').val();
					};
				}else{
					clean_arg= "";
					clean_mode= "";
				};
				var infoData = {
					neid      :self.neid,
					path      : path,
					clean_mode:clean_mode,
					clean_arg :clean_arg,
					field:'clean'
				};
				
                FileModel.info_set(function(ret) {
                    if (ret.code == 200) {
                    	Tips.show(_('定期清理设置成功！'));
                    	self.dialog.close();
                    }else{
                    	Tips.show(_(ret.message));
                    	self.dialog.close();
                    };
                },infoData);  
            });

            $('#cleanup-close').click(function() {
                self.dialog.close();
            });
            
        },
		
        close: function() {
            this.dialog.close();
        }
    });

    return CleanupDialog;
});