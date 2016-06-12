var g_origin=location.protocol+"//"+location.host;
var G_DEBUG = location.search.indexOf("debug")>0?true:false;
seajs.config({
	base: "/React_H5Upload/",
	paths: {
		upload:'src/'
	},
	alias: {

	},
    preload: [],
	debug: false,
	charset: 'utf-8'
});

