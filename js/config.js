var g_origin=location.protocol+"//"+location.host+"/React_H5Upload/";
var G_DEBUG = location.search.indexOf("debug")>0?true:false;
seajs.config({
	base: "/React_H5Upload/",
	paths: {
		'gallery'   : 'js/gallery',
		'swfupload' : 'js/gallery/swfupload',
		'lenovodata': 'js/lenovodata',
		'component' : 'js/lenovodata/component',
		'model'     : 'js/lenovodata/model',
		'touch'     : 'js/gallery/touch',
        'module'    :  'js/module',
		'upload'	: 'js/module/upload'
	},
	alias: {
		'jquery'     : 'gallery/jquery/jquery/1.10.2/jquery.js',
		'mustache'   : 'gallery/mustache/0.7.2/mustache.js',
		'i18n'       : 'gallery/i18n/jquery.i18n.properties-1.0.9.js',
		'jqunit'     : 'gallery/qunit/1.12.0/qunit.js',
		'cookie'     : 'gallery/jquery/cookie/1.3.1/jquery.cookie.js',
		'Clipboard'  : 'gallery/ZeroClipboard/ZeroClipboard.js',
		'eventTarget': 'component/eventTarget.js',
		'jqtree'     : 'gallery/jquery/jqtree/tree.jquery.js',
		'spin'       : 'gallery/jquery/spin/jquery-spin.js',
		'calendar'   : 'gallery/jquery/calendar/calendar.js',
		'scrollbar'   : 'gallery/jquery/scrollbar/scrollbar.js',
		'util'       : 'lenovodata/util.js',
		'placeholder': 'gallery/jquery/placeholder/2.0.7/jquery.placeholder.js',
		'echarts'	 : 'gallery/echarts/echarts.js',
		'datepicker' : 'gallery/jquery/ui/jquery-ui.js',
		'underscore' :  'js/gallery/underscore/underscore.js',
		'tips'       :  'component/tips',
		'jquery-copy':  'gallery/jquery/copy/jquery.copy.js',
		'link'		 :	G_DEBUG?'module/link/src/link.min.js':'module/link/src/link_main.js'
	},
    preload: ['jquery', 'swfupload/swfupload.js'],
	debug: false,
	charset: 'utf-8'
});


seajs.use(['jquery', 'i18n', 'cookie'], function($){
    var language = $.cookie('language');
	jQuery.i18n.properties({ 
		name: 'strings',        // 资源文件名称
		path: '/React_H5Upload/resource/i18n/', // 资源文件所在文件夹路径
		//mode: 'both',           // 模式：变量或 Map 
		mode: 'map',           // 模式：变量或 Map 
		language: language?language:'zh',      // 对应的语言
		cache: false, 
		encoding: 'UTF-8', 
		callback: function() {
			window.language=_=$.i18n.prop;
		}
	});
});

seajs.on('fetch', function(data) {
	if (data.uri) {
		data.requestUri = data.uri + '?v=' + G_VERSION;
	}
});

var G_VERSION=new Date().getTime();
//由打包程序生成版本号
var G_VERSION="pangu-20151013";

