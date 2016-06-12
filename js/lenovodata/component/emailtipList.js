;define('component/emailtipList', function(require, exports, module){
	
	var $ = require('jquery'),
	Util = require("util");
	UserModel = require('model/UserManager');
	
	 return {
	 	emailTipList : function (node,nodeinput){
	 			var $search = node;
				var $searchInput = $search.find(nodeinput);
				//关闭浏览器提供给输入框的自动完成
				$searchInput.attr('autocomplete', 'off');
				//创建自动完成的下拉列表，用于显示服务器返回的数据,插入在输入框的后面
				var $autocomplete = $('<div class="autocomplete"></div>').hide().insertAfter(nodeinput);
				//清空下拉列表的内容并且隐藏下拉列表区
				var clear = function() {
					$autocomplete.empty().hide();
				};
				
				$searchInput.blur(function() {
					setTimeout(clear, 500);
				});
				
				//下拉列表中高亮索引
				var selectedItem = null;
				//timeout的ID
				var timeoutid = null;
				
				//设置下拉项的高亮背景
				var setSelectedItem = function(item) {
					selectedItem = item;
					//按上下键是循环显示的，小于0就置成最大的值，大于最大值就置成0
					if (selectedItem < 0) {
						selectedItem = $autocomplete.find('li').length - 1;
					} else if (selectedItem > $autocomplete.find('li').length - 1) {
						selectedItem = 0;
					}
					$autocomplete.find('li').removeClass('highlight').eq(selectedItem).addClass('highlight');
				};
				var _request = function(key) {
						UserModel.getUserEmailList(function(ret){
							if(ret.code == 200){
								if (ret.data.result) {
									//最多显示10条
									if(ret.data.result.length > 10){
										ret.data.result.splice(10,ret.data.result-10);
									} 
									$.each(ret.data.result, function(index, term) {
										$('<li></li>').text(term.email).appendTo($autocomplete).addClass('clickable').hover(function() {
											$(this).siblings().removeClass('highlight');
											$(this).addClass('highlight');
											selectedItem = index;
										}, function() {
											$(this).removeClass('highlight');
											//当鼠标离开时索引置-1，当作标记
											selectedItem = -1;
										}).click(function() {
											
											//取最后一个分号（逗号）前面的所有值;
											var arr = $searchInput.val().split(/[;,]/);
											arr.pop();
											var str = arr.join(';');
											str == ''? str : str+=';';
											
											$searchInput.val(str + term.email +';');
											$autocomplete.empty().hide();
										}).keyup(function(event){
											if(event.keyCode == 38){
												//取最后一个分号（逗号）前面的所有值;
												var arr = $searchInput.val().split(/[;,]/);
												arr.pop();
												var str = arr.join(';');
												str == ''? str : str+=';';
												
												$searchInput.val(str + term.email +';');
												$autocomplete.empty().hide();
											}
										});
									})
									setPos();
							 	}
							}
							
						},key)
				};
				
				function setPos(){
					var ypos = $searchInput.position().top +  $searchInput.outerHeight();
					var xpos = $searchInput.position().left;
					var width = $searchInput.width()+2;
					$search.css('posotion','relative');
					$autocomplete.css({
						'position' : 'absolute',
						'left' : xpos + "px",
						'top' : ypos + "px",
						'width': width
					});
					setSelectedItem(0);
					//显示下拉列表
					$autocomplete.show();
				}
				$searchInput.keyup(function(event) {
					//取最后一个分号（逗号）后的值 
					var key = $(this).val().split(/[;,]/).pop();
					
					//字母数字，退格，空格
					if (event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {
						//首先删除下拉列表中的信息
						$autocomplete.empty().hide();
						clearTimeout(timeoutid);
						timeoutid = setTimeout(function(){
							_request(key);
						}, 100);
						event.preventDefault();
					} else if (event.keyCode == 38) {
						//上
						//selectedItem = -1 代表鼠标离开
						if (selectedItem == -1) {
							setSelectedItem($autocomplete.find('li').length - 1);
						} else {
							setSelectedItem(selectedItem - 1);
						}
						event.preventDefault();
					} else if (event.keyCode == 40) {
						//下
						//selectedItem = -1 代表鼠标离开
						if (selectedItem == -1) {
							setSelectedItem(0);
						} else {
							setSelectedItem(selectedItem + 1);
						}
						event.preventDefault();
					}
				}).keypress(function(event) {
					//enter键
					if (event.keyCode == 13) {
						//列表为空或者鼠标离开导致当前没有索引值
						if ($autocomplete.find('li').length == 0 || selectedItem == -1) {
							return;
						}
						//取最后一个分号（逗号）前面的所有值;
						var arr = $searchInput.val().split(/[;,]/);
						arr.pop();
						var str = arr.join(';');
						str == ''? str : str+=';';
						
						$searchInput.val(str + $autocomplete.find('li').eq(selectedItem).text() + ';');
						$autocomplete.empty().hide();
						event.preventDefault();
		                window.event.cancelBubble = true;
		                event.stopPropagation();
		             }
				});
//				//注册窗口大小改变的事件，重新调整下拉列表的位置
//				$(window).resize(function() {
//					var ypos = $searchInput.position().top;
//					var xpos = $searchInput.position().left;
//					$autocomplete.css('width', $searchInput.css('width'));
//					$autocomplete.css({
//						'position' : 'relative',
//						'left' : xpos + "px",
//						'top' : ypos + "px"
//					});
//				});
	 	}
	 }
	
})