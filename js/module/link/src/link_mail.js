/**
 * @fileOverview 脚本文件描述
 * @author thliu-pc
 * @version 3.4.1.0
 * @updateDate 2015/8/24
 */
;
define("js/module/link/src/link_mail", function (require, exports, module) {	
	//依赖
    require("jquery");
    require('Clipboard');
    require('jquery-copy');
    require('placeholder');
    language = $.i18n.prop;
    var Tips=require('tips'),
  		Util=require("util"),
  		underscore=require("underscore"),
  		linkDao=require('module/link/src/link_dao');
  	window.language = $.i18n.prop;
   
    	

    function linkMail(self) {
    	this.self=self;
    	this.options=self.options;
    	this.link_creator=self.options.creator
    	this.link_url=self.options.url;
    	this.link_password=self.options.password;
    	this.mail_description="";
    	this.link_isfolder=self.options.isfolder;
    	this.link_filename=self.options.name;
    	this.link_path=self.options.path;
    	this.link_expiration=self.options.expiration
    	this.mails=[];	//正确的邮箱地址都保存在这个数组中
    	this.mailsWidth=0;  //邮箱输入框宽度
    	this.searchScrollTimes=0;
    }

    linkMail.prototype = {
        init: function () {
        	var self=this;
        	var link_transfer_addr=document.getElementById("link_transfer_addr"),
        		link_share_password=document.getElementById("link_share_password"),       		
		    	link_share_creator=document.getElementById("link_share_creator"),
		    	link_share_filename=document.getElementById("link_share_filename"),
		    	link_share_expireTime=document.getElementById("link_share_expireTime"),
		    	link_mail_instruction=document.getElementById("link_mail_instruction"),
		    	addr_input=	document.getElementById("addr_input"),
		    	historyList=document.querySelector("#link_mail_query ul#historyList"),
		    	queryList=document.querySelector("#link_mail_query ul#queryList"),
		    	history_head=document.querySelector("#link_mail_query #history_head");
		    this.render();
		    this.events();
            
        },
        events: function () {
        	var self=this;
			var addr=document.getElementById("addr"),
				link_mail_send=document.getElementById("link_email_send"),
				link_mail_query=document.getElementById("link_mail_query"),
				link_email_cancel=document.getElementById("link_email_cancel");
			//当获取焦点时，搜索框中出现最近5条历史纪录和所有的用户邮箱,不用focus是有其他考虑
			$(addr_input).on("click",function(e){			
				queryList.innerHTML="";
				self.searchScrollTimes=0;
				self.historyList();
				linkDao.getUserEmailList(function(res){
					if (res.data.length) {
						self.queryList( res.data.length, res.data);
						link_mail_query.style.display="block";
					}						
				}, this.value, 0, 10);
				//点击某个地址可以删除
				$("#addr span.addr i").on("click",function(e){
					var cancelIndex=self.mails.indexOf(this.parentNode.innerText);
					self.mails.splice(cancelIndex,1);
					self.removeMailAddr(this);						
				});
				//搜索框滚动到最后时再向后台请求数据
		        $(link_mail_query).on("scroll",function(e){
					var n=self.searchScrollTimes+1;
					var scrollTop = $(this).scrollTop(); //滚动高度
					var	scrollHeight = $(this)[0].scrollHeight;
					var	viewHeight = $(this).height(); 	
					if(scrollHeight - scrollTop - viewHeight <= 30){
			　　　　		var curInuptVal= $(this).parent().find("input").val();	        		
						linkDao.getUserEmailList(function(res){
						if (res.data.length) {
							self.queryList( res.data.length, res.data);
							self.searchScrollTimes++;
						}else{
							$(link_mail_query).off("scroll");
						}
						}, curInuptVal, n*10, 10);
				    }
		        });
					
			});
			//按下分号或逗号键时 生成当前邮箱地址
			$(addr_input).on("keyup",function(e){
				if(e.keyCode==188||e.keyCode==186||e.keyCode==32){					
					//去除分号、逗号还有空格
		        	var lastChar=this.value.charAt(this.value.length-1)
		        	if (lastChar==";"||lastChar==","||lastChar==" ") {
		        		this.value=this.value.substring(0,this.value.length-1);
		        		this.value=$.trim(this.value);
		        	}
					if (this.value!="") {
						self.createMailAddr(this.value);					
						self.changeMailInput();
					}
				}
			}).on("blur",function(e){
				if (this.value!=""&&e.target.nodeName!="INPUT") {
					self.createMailAddr(this.value);					
					self.changeMailInput();				
				}else {
					$(link_mail_query).hide();
				}
			});
			//结束
			//搜索		
			$(addr_input).on("keyup",function(e){
				var queryInterval=this.value
				setTimeout(function(){
					queryList.innerHTML="";
					if(queryInterval==addr_input.value){
						link_mail_query.style.display="none";
						history_head.style.display="none";
						historyList.style.display="none";
						var offset=0,limit=10; //offset为分页偏移量，limit为最多显示数；
						linkDao.getUserEmailList(function(res){
							if (res.data.length) {
								link_mail_query.style.display="block";
								self.queryList( res.data.length, res.data);
							}						
						},addr_input.value, offset, limit);
					}
				},500)

			})
			//结束
			//退格键删除前面的地址
			$(addr_input).on("keydown",function(e){
				if (e.keyCode==8&&this.value=="") {
					$(this).prev().find("i").trigger("click");
				}
			})
			//
			//鼠标移出搜索框时隐藏
			$(link_mail_query).on("mouseleave",function(e){
					this.style.display="none";
			});
			//结束
			//点击“发送邮件”时
			$(link_mail_send).on("click",function(){
				this.innerHTML=_("发送中...");
				var sendMails=self.mails.join(";");
				var currentInputValue=$.trim(addr_input.value);
				if ( currentInputValue!="") {
					if (Util.validEmail(currentInputValue)) {
						sendMails=sendMails+ currentInputValue;

					}else{
						self.createMailAddr(currentInputValue);
						self.changeMailInput();
						this.innerHTML=_("发送");
						return;
					}
				}

				if (sendMails==""&&addr_input.value==""){
					Tips.show(_("邮箱不能为空"));
					this.innerHTML=_("发送");
					return;
				}
				self.mail_description=link_mail_instruction.value;
				$(link_mail_send).css({"cursor":"pointer","background-color":"#2A7EF8","border-color":"#2872dd","color":"#ffffff"});
				linkDao.sendmail(function(ret) {
					link_mail_send.innerHTML = _("发送")
					if (ret.code == 200 && ret.data.code == 200) {
						Tips.show(_("发送成功"), 3000);
						//发送成功后关闭设置框
						$(".i-close").trigger("click");
					}
					else {
						Tips.show(_("发送失败，请重新发送"));
					}
					//将发送成功的邮件地址写进cookie
					self.addMailCookies(sendMails.split(";"));
						}, self.link_url, sendMails, self.mail_description, self.link_isfolder, self.link_filename, self.link_path);
			});

			$("#addr span.addr i").on("click",function(e){						
				self.removeMailAddr(this.parentNode);
				self.changeMailInput();	
			});

	        //清空历史纪录
	        $("#remove_all").on("click",function(){
	        	history_head.style.display="none";
	        	historyList.style.display="none";
	        	Util.removeCookie("querymails");
	        });
	        //点击取消按钮关闭设置框
	        $(link_email_cancel).on('click', function(e){
				$(".i-close").trigger("click");
        	});
        },
        
        render: function () {
        	var views = underscore.template($("#link_tmp_mail").html());
        	var html = views(this.options);       	
        	$("#link_mail_wrapper").html(html);
        	$('input, textarea').placeholder();
        	link_share_creator.innerHTML=LenovoData.user.user_info.user_name;
        	link_share_filename.innerHTML=this.link_filename;
        },
        //创建邮件地址栏中的邮件地址
        createMailAddr:function(text){
        	var self=this;
        	var span=document.createElement("span"),
        		i=document.createElement("i");
        	
        	var innerText=document.createTextNode(text);
        	span.setAttribute("class","addr");
        	i.setAttribute("class","cancel")
        	if (!Util.validEmail(addr_input.value)) {
        		span.className+=" error";
        		i.className+=" error";
        		Tips.show(_("以下标红的邮箱格式不正确，检查一下吧"),3000);
        	}
        	addr_input.value="";
        	addr_input.placeholder="";
        	//先不管格式对错，将地址放进邮件地址数组里；
        	this.mails.push(text);
        	span.appendChild(innerText);
        	span.appendChild(i);
        	addr.insertBefore(span,addr_input);
//      	//点击某个地址可以删除
//
			$("#addr span.addr i").off("click").on("click",function(e){						
				self.removeMailAddr(this.parentNode);
				self.changeMailInput();	
			});
        },
        //删除邮件地址栏中的地址以及邮件数组中的数据
        removeMailAddr:function(removeEle){
        	var self=this;
        	var cancelIndex=self.mails.indexOf(removeEle.innerText);
			self.mails.splice(cancelIndex,1);
        	removeEle.parentNode.removeChild(removeEle);
        },
        //在查询下拉框中显示查询结果列表
        queryList:function(nums,res){
        	var self=this;
        	var li=document.createElement("li");
        	for(var i=0;i<nums;i++){
        		li.innerHTML+="<input type='checkbox' /><span class='query_mail'>"+res[i].email+"</span><br>";
        	};
        	queryList.appendChild(li);
        	$(queryList).find("input").off("click").on("click",function(){
    			if (this.checked) {
    				addr_input.value=this.nextSibling.innerHTML;
    				self.createMailAddr(addr_input.value);
    				self.changeMailInput();
    				addr_input.innerHTML="";
    			}else{
    				for(var i=0;i<addr.children.length;i++){
    					if (addr.childNodes[i].innerText==this.nextSibling.innerHTML) {
    						self.removeMailAddr(addr.childNodes[i]);
    						self.changeMailInput();	
    						break;
    					}
    				}        				
    				this.checked=false;        				
    			}
        	});
        },
        //在查询下拉框中显示历史纪录列表
        historyList:function(){
        	var self=this;        	
        	if(Util.getCookie("querymails")){
        		historyList.innerHTML="";
        		history_head.style.display="block";
        		historyList.style.display="block";
        		var querymails_arr=Util.getCookie("querymails").split("&");
        		var li=document.createElement("li");
        		for(var i=0;i<querymails_arr.length;i++){
        		li.innerHTML+="<input type='checkbox' /><span class='history_mail'>"+querymails_arr[i]+"</span><br>";
        	};
        	historyList.appendChild(li);
        	$(historyList).find("input").on("click",function(){
        			if (this.checked) {
        				addr_input.value=this.nextSibling.innerHTML;
        				self.createMailAddr(addr_input.value);
        				self.changeMailInput();	
        			}else{
        				for(var i=0;i<addr.children.length;i++){
        					if (addr.childNodes[i].innerText==this.nextSibling.innerHTML) {
        						self.removeMailAddr(addr.childNodes[i]);
        						self.changeMailInput();	
        						break;
        					}
        				}        				
        				this.checked=false;        				
        			}
        	});
        	}        	
        },


        //发送的邮件地址写进cookie里，每次显示最近5条历史纪录
        addMailCookies:function(mail_arr){       	
        	//cookie里始终只保存5条
        	if (Util.getCookie("querymails")) {
        		var mailcookies=Util.getCookie("querymails").split("&");
        		var new_mail_arr=mailcookies.concat(mail_arr);
        		//去重
        		new_mail_arr=new_mail_arr.uniqueBack();
        		if (new_mail_arr.length>5) {
        			var newMailCookies=new_mail_arr.slice(-5).join("&");
        			Util.setCookie("querymails", newMailCookies, 365);
        		}else{
        			var newMailCookies=new_mail_arr.join("&");
        			Util.setCookie("querymails", newMailCookies, 365);
        		}       		
        	}else{
        		//去重
        		mail_arr=mail_arr.uniqueBack();
        		if (mail_arr.length>5) {
        			var mailVlues=mail_arr.slice(-5).join("&");
        			Util.setCookie("querymails", mailVlues, 365);
        		}else{
        			var mailVlues=mail_arr.join("&");
        			Util.setCookie("querymails", mailVlues, 365);
        		} 
        	}
        },
        //邮箱输入框的大小变化
        changeMailInput:function(){
        	if(addr_input.previousSibling){
        		this.mailsWidth+=addr_input.previousSibling.clientWidth;
        	}else{
        		this.mailsWidth=0;
        		addr_input.style.width="100%";
        		addr_input.placeholder=_("点击或输入邮箱地址，多个地址以逗号或分号分隔");
        	}       	
			if(this.mailsWidth<430){
				addr_input.style.width=link_transfer_addr.clientWidth-this.mailsWidth-20+"px";
			}else {
//				addr_input.style.width=link_transfer_addr.clientWidth-addr_input.previousSibling.clientWidth-20+"px";
				addr_input.style.width=120+"px";
			}
        }
    };

    module.exports=linkMail;
})