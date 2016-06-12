define('component/adminSetting/adminSetting',function(require, exports, module) {
    var $ = require('jquery');
    var i18n = require('i18n');
    var _ = $.i18n.prop;
    var Util = require('lenovodata/util');
    var adminManager = require('model/AdminManager');
    var addUserDialog = require('component/adminSetting/adminSettingDialog.js');
    var tips = require('component/tips');

    //dom cache
    var $main=$("#admin-setting-main");
    var $netmangerBox=$("#netmanger-box");
    var $securityBox=$("#security-box");

    //role config
    var ROLE={
        MEMBER:1,SAFETY:2,BUSINESS:4,SYSTEM:8
    };

    /**
     * page first
     */
    exports.init=function(){
        resize();
        loadData();
        initEvent();
    };

    /**
     * log tool function
     * @param str
     */
    var log=function(str){
        var isDebug=(location.search.indexOf("debug")>-1?true:false);
        if(isDebug&&console&&console.log){
            console.log(str);
        }
    };

    /**
     * all event binding ..
     */
    var initEvent=function(){
        $main.delegate('input[type="button"]','click',function(){
            var type=$(this).attr("name");
            log("start initEvent ... "+type);
            if(type==="add"){
                add(this);
            }else{
                del(this);
            }
        });

        //删除按钮颜色切换
        $main.delegate("input[type='checkbox']",'click',function(){
            var $checkbox=$(this).parent().parent();
            var $delBtn=$checkbox.parent().parent().find("input[name='del']");
            if($checkbox.find("input:checked").length!=0){
                $delBtn.removeClass("button-gray").addClass("button-blue");
            }else{
                $delBtn.removeClass("button-blue").addClass("button-gray");
            }
        });

    };

    var add=function(e){
        new addUserDialog({
            roleId: ROLE[$(e).attr("roleId")],
            callback: function (data) {
                tips.show(_("成功"));
                loadData();
            }
        });
    }

    /**
     *
     * @param e button dom object
     */
    var del=function(e){
        var params=[];
        var roleId=ROLE[$(e).attr("roleId")];
        var isExistCurrentUser=false;
        $(e).parent().find("input[type='checkbox']:checked").each(function(){
            var uid=$(this).attr("uid");
            if(uid==LenovoData.user.user_info.uid){
                isExistCurrentUser=true;
                return false;
            }
            var obj={ uid:uid ,role: roleId}
            params.push(obj);
        });

        if(isExistCurrentUser){
            tips.warn(_("不能删除当前登录用户"));
            return;
        }

        //当仅剩最后一个用户删除时，或全选删除时提示：“管理员不能为空”。
        var len=$(e).parent().find("input[type='checkbox']").not("input:checked").length;
        if(params.length>0&&!len){
            tips.warn(_("管理员不能为空"));
            return;
        }

        if(params.length===0){
            tips.warn(_("选择不能为空"));
            return;
        }
        adminManager.del(params,function(data){
            tips.show(_("成功"));
            loadData();
        });
    }

    /**
     * 加载网盘管理员、安全管理员数据
     */
    var loadData=function(){
        //role	网盘管理员:1:member; 2:safety; 4:business; 8:system
        //网盘管理员
        adminManager.loadRoleData({roleId:ROLE.BUSINESS},function(data){
            render(data,ROLE.BUSINESS);
        });
        //安全管理员
        adminManager.loadRoleData({roleId:ROLE.SAFETY},function(data){
            render(data,ROLE.SAFETY);
        });
    }

    /**
     *
     * page render
     * @param data
     * @param roleId
     */
    var render=function(data,roleId){
        log("start render ....");
        var html=[];
        html.push("<ul>");
        var arData=data.data.data;
        $(arData).each(function(){
            var txt=(this.username||"--")+"("+(this.email||"--")+")";
                txt=Util.subString(txt,20);
            html.push("<li><input uid='"+this.id+"'  type='checkbox'>"+txt+" </li>")
        });
        html.push("</ul>");
        if(roleId==ROLE.BUSINESS){
            $netmangerBox.find(".content").empty().append(html.join(" "));
        }else if(roleId==ROLE.SAFETY){
            $securityBox.find(".content").empty().append(html.join(" "));
        }
        $main.find("input[name='del']").removeClass("button-blue").addClass("button-gray");
    };

    /**
     * page resize
     */
    var resize=function(){
        var contentH = $('.page-body2').height();
        contentH = Math.max(contentH, $(window).height() - $('#head').outerHeight() - $('#foot').outerHeight());
        $('.page-left').height(contentH);
    };

});
