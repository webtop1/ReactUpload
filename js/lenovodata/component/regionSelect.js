;define('component/regionSelect', function(require, exports) {
	var $= require('jquery'),
        EventTarget = require('eventTarget');
	
	

	function RegionSelect(context,json) {
		this.context = context;
		this.regions = $(json.region);
		this.count = 0;
		this.selectedClass = json.selectedClass;
		this.selectedRegion = [];
		this.selectDiv = null;
		this.startX = null;
		this.startY = null;
		this.node =  $.type(json.node) == 'string' ? $(json.node) : json.node;
		
	}
	
	 $.extend(RegionSelect.prototype, EventTarget, {
	 	select:function(){
	 		var self = this;
	 		self.node.bind('mousedown',function(ev){
	 			var oEvent = event || ev;;
	 			self.onBeforeSelect(oEvent);
				
				$(document).bind('mousemove',function(ev){
		 			var oEvent = event || ev;
		 			self.onSelect(oEvent);
					clearEventBubble(oEvent);
		 		});
				$(document).bind('mouseup',function(){
					self.onEnd();
					self.result = self.node .find('.'+self.selectedClass);
					self.fire('up',self.result);
				});
				
				clearEventBubble(oEvent);
	 		});
	 		
	 		$(document).click(function(){
	 			self.onEnd();
	 		});
	 		
			
	 	},
	 	onBeforeSelect : function(evt) {
			var self =this;
			if (!document.getElementById("selContainer")) {
				self.selectDiv = document.createElement("div");
				$(self.selectDiv).css({'position':'absolute',
				'width':0,
				'height':0, 
				'left':0,
				'top':0,
				'font-size':0,
				'margin':0,
				'padding':0,
				'border':'1px dashed #0099FF',
				'background-color':'#C3D5ED',
				'z-index':1000,
				'filter':'alpha(opacity:60)',
				'opacity':'0.6',
				'display':'none'});
				self.selectDiv.id = "selContainer";
				document.body.appendChild(this.selectDiv);
			} else {
				self.selectDiv = document.getElementById("selContainer");
			}
		
			self.startX = self.posXY(evt).x;
			self.startY = self.posXY(evt).y;
			self.isSelect = true;
		
		},
		onSelect : function(evt) {
			var  self= this;
			if (self.isSelect) {
				$(self.selectDiv).show();
				
				var posX = self.posXY(evt).x;
				var poxY = self.posXY(evt).y;
		
				var a =$(self.selectDiv)[0].style.left = Math.min(posX, this.startX) +'px';
				var b=	$(self.selectDiv)[0].style.top = Math.min(poxY, this.startY) +'px';
				var c=$(self.selectDiv)[0].style.width = Math.abs(posX - this.startX)+'px';
				var d=	$(self.selectDiv)[0].style.height = Math.abs(poxY - this.startY)+'px';
//				console.log({'a':a,'b':b,'c':c,'d':d});
				var regionList = self.regions;
				for (var i = 0; i < regionList.length; i++) {
					var r = regionList[i],
						sr = self.innerRegion(self.selectDiv, r);
					if (sr) {
						$(r).addClass( self.selectedClass);
						$(r).find('input')[0].checked = 'checked';
//						console.log(self.count);
//						
//						if(self.count == regionList.length) {
//							$('#item-selectAll')[0].checked = 'checked';
//						}else {
//							self.count++;
//						}
					} else {
						$(r).removeClass(self.selectedClass);
						$(r).find('input').removeAttr('checked');
						$('#item-selectAll').removeAttr('checked');
//						
//						if(self.count != 0){
//							self.count--;
//						}
					}
				}
				
				
				
			}
		},
	
		onEnd : function() {
			var self =this;
			if ($(self.selectDiv).length !=0) {
				self.selectDiv.style.display = "none";
			}
			self.isSelect = false;
			self.count =0;
			$(document).unbind('mousemove');
			$(document).unbind('mouseup');
			
		},
	
		// 判断一个区域是否在选择区内
		innerRegion : function(selDiv, region) {
			var self =this;
			var t1 = parseInt(selDiv.style.top);
			var l1 = parseInt(selDiv.style.left);
			var r1 = t1 + parseInt(selDiv.offsetWidth);
			var b1 = t1 + parseInt(selDiv.offsetHeight);
		
			
			var t2 = self.getPos(region).top;
			var l2 = self.getPos(region).left;
			var r2 = l2 + parseInt(region.offsetWidth);
			var b2 = t2 + parseInt(region.offsetHeight);
		
			var t = Math.max(t1, t2);
			var r = Math.min(r1, r2);
			var b = Math.min(b1, b2);
			var l = Math.max(l1, l2);
		
			if(b1<t2 || r1<l2 || t1>b2 || l1>r2) {
				return null;
			}else {
				return region;
			}
		
		},
		getPos: function(obj)
		{
		     var l=0;
		     var t=0;
		    
		     while(obj)
		     {
		          l+=obj.offsetLeft;
		          t+=obj.offsetTop;
		         
		          obj=obj.offsetParent;
		     }
		    
		     return {left: l, top: t};
		},
		posXY: function (event) {
			event = event || window.event;
			var posX = event.pageX || (event.clientX +
				(document.documentElement.scrollLeft || document.body.scrollLeft));
			var posY = event.pageY || (event.clientY +
				(document.documentElement.scrollTop || document.body.scrollTop));
			return {
				x: posX,
				y: posY
			};
		}
		
	 });

	
	function clearEventBubble(evt) {
		evt = evt || window.event;
		if (evt.stopPropagation) evt.stopPropagation();
		else evt.cancelBubble = true;
		if (evt.preventDefault) evt.preventDefault();
		else evt.returnValue = false;
		
	}

	return RegionSelect;
});

