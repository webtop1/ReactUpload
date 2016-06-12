;define('component/chart', function(require, exports, module){
	require('echarts');
	var i18n = require('i18n');
	var _ = $.i18n.prop;
	require('datepicker');
	var options = require('component/chartOption');
	var StatModel = require('lenovodata/model/StatManager');
	var Util = require('lenovodata/util');
	var Tips = require('component/tips');
	
	var chart = function(id,type,optionType){
		if(optionType != 'pie'){
			this.node = echarts.init(document.getElementById(id));
		}else{
			this.node = [];
			for(var i in id){
				if(id.hasOwnProperty(i)){
					this.node.push({
						id:id[i],
						node:echarts.init(document.getElementById(id[i])),
						parent:$('#'+id[i]).parent()
					});
				}
			}
		}
		this.showLoading();
		this.chartOption = new options();
		this.type = type;
		this.optionType = optionType || 'line';
		this.setWeekly = [];
		this.setMonth = [];
		this.setYear = [];
		this.init();
	}
	$.extend(chart.prototype,{
		init:function(){
			var self = this;
			if(this.optionType == 'line'){
				var date = Util.formatDate(new Date(),'yyyy-MM-dd')
				this.renderLine(date,date,'hour')
			}else{
				StatModel.usage_get(function(data){
					self.renderPie(data);
				});
			};
		},
		showLoading:function(){
			if(Object.prototype.toString.call(this.node) == '[object Array]'){
				for(var i in this.node){
					if(this.node.hasOwnProperty(i)){
						this.node[i].node.showLoading({
						    text: _('正在加载数据...')
						});
					}
				}
			}else{
				this.node.showLoading({
				    text: _('正在加载数据...')
				});
			}
			
		},
		renderLine:function(from,to,statBy){
			var self = this;
			this.node.showLoading();
			if(this.type == 'space'){
				StatModel.space_get(function(retVal){
					self.node.clear();
					var data = self.filterSpaceData(retVal.data);
					var option = self.chartOption.getSpaceOption(data,self.type);
					self.node.setOption(option);
					self.node.hideLoading();
				},from,to,statBy);
			}else if(this.type == 'active'){
				StatModel.active_get(function(retVal){
					self.node.clear();
					var data = self.filterSpaceData(retVal.data);
					var option = self.chartOption.getSpaceOption(data,self.type);
					self.node.setOption(option);
					self.node.hideLoading();
				},from,to,statBy);
			}
		},
		renderPie:function(data){
            var o=data.data;
            var spaceColor=['#3d8ff4','#fc9f7b','#8fd47a'];
            var usersColor=['#3d8ff4','#fc9f7b','#8fd47a'];
            //空间
            var userSpaceUsed=o.space_used-o.enterprise_space_used;
			var space=[
                {value:userSpaceUsed, name:_('个人已用空间')},
                {value:o.enterprise_space_used, name:_('企业已用空间')},
                {value:o.space_limit- o.space_used, name:_('可用空间')}
            ];
            var arr=[];
                arr.push("<div class='title'>");
                arr.push(_('总空间：')+Util.formatBytes(o.space_limit,2)+"<br/>");
                arr.push("</div>");
                arr.push("<span style='background:"+spaceColor[0]+"'></span>");
                arr.push(_('已用个人空间：')+ Util.formatBytes(userSpaceUsed,2)+"<br/>");
                arr.push("<span style='background:"+spaceColor[1]+"'></span>");
                arr.push(_('已用企业空间：')+Util.formatBytes(o.enterprise_space_used,2)+"<br/>");
                arr.push("<span style='background:"+spaceColor[2]+"'></span>");
                arr.push(_('可用空间：')+ Util.formatBytes(o.space_limit- o.space_used,2)+"<br/>");
                $("#stat_space_txt").html(arr.join(" "));

            //用户
            var inActiveUser=o.unactive_user_num;
            var remainUser=o.user_num_limit-o.active_user_num;
            var users=[
                {value:o.active_user_num, name:_('已激活用户数')},
                {value:inActiveUser, name:_('未激活用户数')},
                {value:remainUser, name:_('可用用户数')}
            ];
            var str=[];
            str.push("<div class='title'>");
            str.push(_('总用户数：')+o.user_num_limit+"<br/>");
            str.push("</div>");
            str.push("<span style='background:"+usersColor[0]+"'></span>");
            str.push(_('已激活用户数：')+o.active_user_num+"<br/>");
            str.push("<span style='background:"+usersColor[1]+"'></span>");
            str.push(_('未激活用户数：')+inActiveUser+"<br/>");
            str.push("<span style='background:"+usersColor[2]+"'></span>");
            str.push(_('可用用户数：')+remainUser+"<br/>");
            $("#stat_user_txt").html(str.join(" "));

            var itemStyle={
                normal : {
                    label : {
                        show : false
                    },
                    labelLine : {
                        show : false
                    }
                },
                emphasis : {
                    label : {
                        show : false,
                        position : 'center',
                        textStyle : {
                            fontSize : '13'
                        }
                    }
                }
            };
            var textStyle={
                fontSize:20,
                fontWeight: 'bolder',
                fontFamily:'微软雅黑", "Microsoft Yahei", "宋体", "Arial,Tahoma,Helvetica,STHeiti',
                color: '#333'
            };

			for(var i in this.node){
				if(this.node.hasOwnProperty(i)){
					if(this.node[i].id == 'space_pie'){
                        var option = {
                            title:{
                                text:_("空间"),
                                x:'center',
                                y:'center',
                                textStyle:textStyle
                            },
                            color:spaceColor,
                            tooltip : {
                                formatter: function (params,ticket,callback) {
                                    return  params[1]+"<br/>"+Util.formatBytes(params[2],2)+"("+params[3]+"%)";
                                }
                            } ,
                            series : [
                                {
                                    name:_('空间使用情况'),
                                    type:'pie',
                                    radius : ['50%', '70%'],
                                    itemStyle : itemStyle,
                                    data:space
                                }
                            ]
                        };
					}else{
                        var option = {
                            title:{
                                text:_("账户数"),
                                x:'center',
                                y:'center',
                                textStyle:textStyle
                            },
                            color:usersColor,
                            tooltip : {
                                trigger: 'item',
                                formatter: "{b}<br/>{c} ({d}%)"
                            } ,
                            series : [
                                {
                                    name:_('账户使用情况'),
                                    type:'pie',
                                    radius : ['50%', '70%'],
                                    itemStyle : itemStyle,
                                    data:users
                                }
                            ]
                        };
                    }
					this.node[i].node.setOption(option);
					this.node[i].node.hideLoading();
				}
			}
		},
		filterSpaceData:function(data){
			var newData = [];
			for(var i in this.currentData){
				if(!this.currentData.hasOwnProperty(i)) continue;
				var fk = '';
				for(var fk in this.currentData[i]){}
				var tmp = {
					date:fk,
					value:this.currentData[i][fk]
				}
				for(var j in data){
					for(var k in data[j]){
						var _k = k;
						if(!data[j].hasOwnProperty(k)) continue;
						if(k.indexOf(' ') != -1){
							_k = k.split(' ');
							_k = _k[1];
						}
						if(fk == _k){
							tmp.value = data[j][k];
						}
					}
				}
				newData.push(tmp);
			}
			return newData;
		},
		/**
		 * 
		 * @param type 
		 */
		createTime:function(index){
			var self = this;
			var date = Util.formatDate(new Date(),'yyyy-MM-dd');
			switch(index){
				case 1:
				var d = self.initData(7);
				self.renderLine(d.from,d.to,'day');
				break;
				case 2:
				var d = self.initData(30);
				self.renderLine(d.from,d.to,'day');
				break;
				case 3:
				var d = self.initData(365);
				self.renderLine(d.from+'-01',date,'month');
				break;
				default:
				var d = self.initDataToday();
				self.renderLine(d.from,d.to,'hour');
				break;
			}
		},
		initDataToday:function(date){
			this.currentData = [];
			date || (date = Util.formatDate(new Date(),'yyyy-MM-dd'));
			for(var i=0;i<24;i++){
				var k = i<10 ? '0'+i:i;
				var tmp = {};
				tmp[k] = 0;
				this.currentData.push(tmp);
			}
			return {from:date,to:date,type:'hour'};
		},
		initData:function(index,from,to){
			var unix = new Date().getTime();
			var type = null;
			var updateFromTo = true;
			if(from || to){
				var d = this.makeDates(from,to);
				index = parseInt((d.to.getTime() - d.from.getTime()) / 86400000)+1;
				unix = d.to.getTime();
				updateFromTo = false;
			}
			if(index < 31){
				type = 'day';
			}else{
				type = 'month';
			}
			this.currentData = [];
			var _index = index;
			var format = 'yyyy-MM-dd';
			if(index >= 365 || type == 'month') {
				format = 'yyyy-MM';
			}
			do{
				var d = new Date(unix-86400000*(_index-1));
				if(this.isDayInCurrent(Util.formatDate(d,format))){
					_index--;
					continue;
				}
				var tmp = {};
				var k = Util.formatDate(d,format);
				if(updateFromTo){
					to = k;
				}
				from || (from = k);
				tmp[k] = 0;
				this.currentData.push(tmp);
				_index--;
				if(index == 365){
					if(this.currentData.length > 12){
						this.currentData.shift();
					}
				}
			}while(_index>0);
			return {from:from,to:to,type:type};
		},
		makeDates:function(from,to){
			var _from = new Date();
			var _to = new Date();
			from = from || Util.formatDate(new Date(),'yyyy-MM-dd');
			to = to || Util.formatDate(new Date(),'yyyy-MM-dd');
			from = from.split('-');
			to = to.split('-');
			_from.setFullYear(parseInt(from[0]));
			_from.setMonth(parseInt(from[1])-1);
			_from.setDate(parseInt(from[2]));
			_from.setHours(0);
			_from.setMinutes(0);
			_from.setSeconds(0);
			_to.setFullYear(parseInt(to[0]));
			_to.setMonth(parseInt(to[1])-1);
			_to.setDate(parseInt(to[2]));
			_to.setHours(23);
			_to.setMinutes(59);
			_to.setSeconds(59);
			return {from:_from,to:_to};
		},
		isDayInCurrent:function(key){
			for(var i in this.currentData){
				var k = '';
				for(k in this.currentData[i]){}
				if(k == key){
					return true;
				}
			}
			return false;
		},
		spaceDataTab:function(obj){
			var self = this;
			var btn = obj.find('.stat-header .condition');
			var start = obj.find('.startTime');
			var end = obj.find('.endTime');
			var submit = obj.find('.submit');
			self.createTime();
			btn.delegate('a','click',function(ev){
				ev.stopPropagation();
				ev.preventDefault();
				$(this).addClass('active').siblings().removeClass('active');
				
				self.createTime($(this).index());
			});
			start.datepicker({
				dateFormat:'yy-mm-dd'
			});
			end.datepicker({
				dateFormat:'yy-mm-dd'
			});
			submit.click(function(){
				var d = null;
				if(start.val() == end.val()){
					d = self.initDataToday(start.val());
				}else if(start.val() < end.val()){
					d = self.initData(0,start.val(),end.val());
				}else{
					Tips.show(_('开始时间不能大于结束时间'));
					return;
				}
				self.renderLine(d.from,d.to,d.type);
			});
		}
	})
	module.exports = chart;
})