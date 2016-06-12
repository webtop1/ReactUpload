define('lenovodata/model/GuideManager', function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');

    var ROOT = 'databox';
    var URL_PREFIX = Util.getApiVersion()+'/task';

    var TASK_NUM = exports.TASK_NUM = {
        GUIDE: 1,
        CREATE_USER: 2,
        CREATE_DIR: 3,
        UPLOAD_FILE: 4,
        CREATE_LINK: 5,
        INSTALL_CLIENT: 6,
        DETAILS: 7,
        SURVEY: 8
    }

    /*
     * @brief 获取任务完成状态和奖励领取情况。
     * @param func 回调函数
     * @return 
     */
    exports.get= function(func) {

        var uri = URL_PREFIX + '/info';

        Util.ajax_json_get(uri, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 完成引导操作。
     * @param func 回调函数
     * @param task_number 任务编号为1，表示引导
     * @param achieved 任务状态，有效值为false、true（默认）
     * @return 
     */
    exports.guideDone = function(func) {

        var uri = URL_PREFIX + '/status/set';

        var post_data = {
            task_number: TASK_NUM.GUIDE,
            achieved: true 
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    /*
     * @brief 兑换奖励。
     * @param func 回调函数
     * @param task_number 任务编号为1，表示引导
     * @return 
     */
    exports.reward = function(func, task_number) {

        var uri = URL_PREFIX + '/reward/exchange';

        var post_data = {
            task_number: task_number
        };

        Util.ajax_json_post(uri, post_data, function(xhr, textStatus){
                var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
                func(retVal);
            }
        );
    };

    exports.getCount = function(func){
        var uri = Util.getApiVersion()+'/lottery/count';

        Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };


    exports.draw = function(func){
        var uri = Util.getApiVersion()+'/lottery/draw';

        Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    exports.getDrawResult = function(func){
        var uri = Util.getApiVersion()+'/lottery/result/query';

        Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };

    exports.getAllDrawResult = function(func, limit){
        var uri = Util.getApiVersion()+'/lottery/result/query?query_type=all&limit='+limit;
        Util.ajax_json_get(uri, function(xhr, textStatus){
            var retVal = Util.ajax_json_process_normal_result(xhr, textStatus);
            func(retVal);
        });
    };



});
