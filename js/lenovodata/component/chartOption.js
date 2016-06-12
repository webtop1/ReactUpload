;define('component/chartOption', function(require, exports, module) {
	var i18n = require('i18n');
	var _ = $.i18n.prop;
	var Util = require('lenovodata/util');
	var chartOption = function() {
		this.defaultOption = {
			space: {
				pointerColor: ['#2a7ef9'],
				baseColor: 'rgba(42,126,249,0.6)',
				axisColor: '#e8e8e8',
				areaColor: 'rgba(42,126,249,0.2)'
			},
			active: {
				pointerColor: ['#fa9260'],
				baseColor: 'rgba(250,146,96,0.6)',
				axisColor: '#e8e8e8',
				areaColor: 'rgba(250,146,96,0.2)'
			},
			pie_space:{
				color:['#2a7ef9','#ebebeb'],
				title:_('容量信息')
			},
			pie_user:{
				color:['#fa9260','#ebebeb'],
				title:_('用户信息')
			}
		};
	};
	chartOption.prototype = {
		getSpaceOption: function(data, type) {
			this.type = type;
			return this.getLineOption(data, type);
		},
		getLineOption: function(data, type) {
			var option = {
				color: this.defaultOption[type].pointerColor,
				grid: {
					x: 70,
					y: 10,
					x2: 20,
					y2: 30
				},
				tooltip: {
					trigger: 'axis',
					formatter:type == 'space' ? (function(params){
						return params[0].name+"<br/>"+params[0].seriesName+": "+Util.formatBytes(params[0].data);
					}):null,
					axisPointer: {
						lineStyle: {
							color: this.defaultOption[type].baseColor,
							width: 1
						}
					},
					backgroundColor: this.defaultOption[type].baseColor
				},
				xAxis: [{
					type: 'category',
					boundaryGap: false,
					data: this.getX(data),
					axisLine: {
						lineStyle: {
							color: this.defaultOption[type].axisColor,
							width: 1
						}
					},
					axisTick: {
						lineStyle: {
							color: this.defaultOption[type].axisColor,
							width: 1
						}
					},
					splitLine: {
						lineStyle: {
							color: this.defaultOption[type].axisColor,
							width: 1
						}
					}
				}],
				yAxis: [{
					type: 'value',
					axisLine: {
						lineStyle: {
							color: this.defaultOption[type].axisColor,
							width: 1
						}
					},
					axisTick: {
						lineStyle: {
							color: this.defaultOption[type].axisColor,
							width: 1
						}
					},
					splitLine: {
						lineStyle: {
							color: this.defaultOption[type].axisColor,
							width: 1
						}
					},
					axisLabel:{
						formatter:type == 'space' ? (function(val){
							return Util.formatBytes(val,1);
						}):null
					}
				}],
				series: [{
					name: this.getName(),
					type: 'line',
					smooth: true,
					symbol: 'emptyCircle',
					symbolSize: 3,
					itemStyle: {
						normal: {
							areaStyle: {
								color: this.defaultOption[type].areaColor
							},
							lineStyle: {
								color: this.defaultOption[type].baseColor
							}
						}
					},
					data: this.getY(data)
				}]
			};
			return option;
		},
		getName: function() {
			return this.type == 'space' ? _('容量使用情况') : _('用户活跃度');
		},
		getX: function(data) {
			var x = [];
			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					x.push(data[i].date);
				}
			}
			return x;
		},
		getY: function(data) {
			var y = [];
			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					y.push(data[i].value);
				}
			}
			return y;
		},
		getPieOption: function(data, type) {
			var option = {
				color:this.defaultOption['pie_'+type].color,
				title:{
					text:this.defaultOption['pie_'+type].title,
					subtext:this.getPercent(data,type),
					x:'center',
					y:'center',
					textStyle:{
						align:'center',
						color:'#b9b9b9',
						fontSize:12,
						fontWeight:'normal'
					},
					subtextStyle:{
						color:'#575757',
						fontSize:30
					}
				},
				series: [{
					type: 'pie',
					radius: ['55%', '70%'],
					startAngle:180,
					itemStyle: {
						normal: {
							label: {
								show: false
							},
							labelLine: {
								show: false
							}
						},
						emphasis : {
		                    label : {
		                        show : false
		                    }
		                }
					},
					data: this.getPieData(data, type)
				}]
			};
			return option;
		},
		getPieData: function(data, type) {
			if (type == 'user') {
				return [{
					value: data.userUsed,
					name: _('已使用')
				},{
					value: data.userTotal - data.userUsed,
					name: _('剩余')
				}];
			} else {
				return [{
					value: data.spaceUsed,
					name: _('已使用')
				}, {
					value: data.spaceTotal - data.spaceUsed,
					name: _('剩余')
				}];
			}
		},
		getPercent:function(data,type){
			var tmp = '';
			if (type == 'user') {
				tmp = Math.floor((data.userTotal - data.userUsed)/data.userTotal * 100)
			} else {
				tmp = Math.floor((data.spaceTotal - data.spaceUsed)/data.spaceTotal * 100)
			}
			return tmp+'%';
		}
	}
	module.exports = chartOption;
});