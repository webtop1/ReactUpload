define('lenovodata/model/AuthUploadManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;

    var Util = require('lenovodata/util');
    var URL_PREFIX = '/v2';
    exports.authUpload = function(func, path, path_type, from,bytes,prefix_neid) {
    	var uri = URL_PREFIX + '/fileops/auth_upload/databox/';
		var get_data = {
			path_type : path_type,
			bytes : bytes
		};
		if(from)get_data.from = from;
		if(prefix_neid)get_data.prefix_neid = prefix_neid;
		var tmp = [];
		if(path != ''){
			uri += path;
		}
		for(var i in get_data){
			if(get_data[i]){
				tmp.push(i+"="+get_data[i]);
			}
		}
		uri += '?'+tmp.join('&');
//		var retVal = {
//			code : 200
//		}
//		func(retVal);
		Util.ajax_json_get_nowait(uri, function(xhr,
				textStatus) {
			var data = xhr.responseJSON ? xhr.responseJSON : {
				message : Util.unknownErrMessage
			};
			switch (xhr.status) {
			case 200:
				retVal = {
					code : 200,
					data : data,
					message : data.message
				};
				break;
			case 401:
				retVal = {
					code : xhr.status,
					data : data,
					message : data.message
				};
				break;
			case 400:
			case 403:
			case 404:
			case 405:
			case 409:
				retVal = {
					code : xhr.status,
					data : data,
					message : data.message
				};
				break;
			case 500:
				retVal = {
					code : xhr.status,
					data:{},
					message:data.message
				}
			default:
				retVal = {
					code : xhr.status,
					data : data,
					message : data.message
				};
				break;
			}
			func(retVal);
		});
    };
	/**
	 * 验证上传权限
	 * @param options
     */
	exports.checkUploadAuth = function(options) {
		var uri = URL_PREFIX + '/fileops/auth_upload/databox/';
		var get_data = {
			path_type : options.path_type,
			bytes : options.bytes?options.bytes:'0'
		};
		if(options.from)get_data.from = options.from;
		if(options.prefix_neid)get_data.prefix_neid = options.prefix_neid;
		var tmp = [];
		if(options.path != ''){
			uri += options.path;
		}
		for(var i in get_data){
			if(get_data[i]){
				tmp.push(i+"="+get_data[i]);
			}
		}
		uri += '?'+tmp.join('&');
		Util.ajax_json_get_nowait(uri, function(xhr,
												textStatus) {
			var data = xhr.responseJSON ? xhr.responseJSON : {
				message : Util.unknownErrMessage
			};
			switch (xhr.status) {
				case 200:
					retVal = {
						code : 200,
						data : data,
						message : data.message
					};
					break;
				case 401:
					retVal = {
						code : xhr.status,
						data : data,
						message : data.message
					};
					break;
				case 400:
				case 403:
				case 404:
				case 405:
				case 409:
					retVal = {
						code : xhr.status,
						data : data,
						message : data.message
					};
					break;
				case 500:
					retVal = {
						code : xhr.status,
						data:{},
						message:data.message
					}
				default:
					retVal = {
						code : xhr.status,
						data : data,
						message : data.message
					};
					break;
			}
			options.func(retVal);
		});
	};

    exports.authDeliveryUpload = function(func,deliveryCode, path,bytes,token) {
    	var uri = URL_PREFIX + '/delivery/auth_upload/'+deliveryCode;
		var get_data = {
			token : token,
			bytes : bytes
		};
		var tmp = [];
//		if(path != ''){
//			uri += path;
//		}
		for(var i in get_data){
			if(get_data[i]){
				tmp.push(i+"="+get_data[i]);
			}
		}
		uri += '?'+tmp.join('&');
//		var retVal = {
//			code : 200
//		}
//		func(retVal);
		Util.ajax_json_get_nowait(uri, function(xhr,
				textStatus) {
			var data = xhr.responseJSON ? xhr.responseJSON : {
				message : Util.unknownErrMessage
			};
			switch (xhr.status) {
			case 200:
				retVal = {
					code : 200,
					data : data,
					message : data.message
				};
				break;
			case 401:
				retVal = {
					code : xhr.status,
					data : data,
					message : data.message
				};
				break;
			case 400:
			case 403:
			case 404:
			case 405:
			case 409:
				retVal = {
					code : xhr.status,
					data : data,
					message : data.message
				};
				break;
			case 500:
				retVal = {
					code : xhr.status,
					data:{},
					message:data.message
				}
			default:
				retVal = {
					code : xhr.status,
					data : data,
					message : data.message
				};
				break;
			}
			func(retVal);
		});
    };
});
