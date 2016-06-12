/**
 * @fileOverview 外链分享
 * @author thliu-pc
 * @version 3.4.1.0
 * @updateDate 2015/8/24
 */
;define("js/module/link/src/link_share",function(require,exports,module){
    //依赖
    require("jquery");
    require('calendar');
    require('Clipboard');

    var Util=require("util");
    var Tips=require('tips')
    var linkDao=require('module/link/src/link_dao');
    var underscore=require("underscore");

    window.language = $.i18n.prop;

    //dom
    var $link_share;
    var $link_tmp;
    var $link_txt_expiration=-1;
    var $link_password;
    var $link_desc;
    var $link_copy;
    var $link_chk_expiration;
    //复制
    var objClip;

    function linkShare(options) {
        this.options=options;
    }

    linkShare.prototype = {
        init: function () {
            var self=this;
            $link_share=$("#link_share_wrapper")
            $link_tmp=$("#link_tmp_share");
            this.render({rendered:function(){
                $link_txt_expiration=$("#link_txt_expiration");
                $link_password = $("#link_password");
                $link_desc = $("#link_desc");
                $link_copy=$("#link_copy");
                $link_chk_expiration = $("#link_chk_expiration");
                $link_upload=$("#link_upload");
                $link_download=$("#link_download");
                $link_preview=$("#link_preview");
                self.events();
            }});
        },
        events: function () {
            var self=this;
            $link_share.delegate('input','click',function(e){
                var cmd=$(e.target).attr("name");
                switch (cmd){
                    case "copy":
                        self.setCopyAndSave(e);
                        break;
                    case "code":
                        self.setTwoDimensionCode(e);
                        break;
                    case "show":
                        self.setShow(e);
                        break;
                    case "chk_expiration":
                        self.setExpiration(e);
                        break;
                    //密码开启
                    case "password":
                        self.setPassword(this);
                        break;
                    case "linkAuth":
                        self.checkAuth(this);
                        break;
                }

                self.updateSaveBtn();
            });

            //密码
            $link_password.keyup(function(){
                var strPwd=$(this).val();
                var $errMsg=$(this).parent().find(".link_err_msg");
                self.updateSaveBtn();
                if($.trim(strPwd)==""){
                    $link_share.find(".link_txt_password").text("");
                    $errMsg.text(_("密码不能为空"));
                    return;
                }
                $errMsg.empty();
                $link_share.find(".link_txt_password").text("("+_("密码：")+strPwd+")");
                self.updateClipboard();
            })

            //设置日期
            self.calendar=$link_txt_expiration.calendar({
                calendarOffset:{
                    x:139, y:3
                },
                selectableDateRange:[{ from: new Date(), to: new Date (9999, 1, 1) }],
                onClick: (function(el, cell, date, data) {
                    el.val(Util.formatDate(date, 'yyyy-MM-dd'));
                    self.setExpiration(el);
                })
            });


            //复制完成
            objClip.on('complete', function(client, args) {
                self.setCopyAndSave();
            });

            //外链说明focus out 保存
            $link_desc.focusout(function(){
                self.saveLinkSet();
            });



            $link_share.find(".link_date").on('click',function(e){
                $link_txt_expiration.trigger('click');
                e.stopPropagation();
            });

            //解决日历无法正常隐藏的问题
            var $gldp= $link_share.find("div[gldp-el='link_gldp']");
            $gldp.bind('click',function(e){
                e.stopPropagation();
                return;
            })
            $(document).unbind('click').bind('click',function(e){
                if(e.target.id=="link_txt_expiration"){
                   return;
                }
                if($gldp.is(':visible')){
                    $gldp.hide();
                }
            })
        },

        render: function (params) {
            var self=this;

            var create=function(ret){
                var views = underscore.template($link_tmp.html());
                self.setAuth(ret.data)
                ret.data["expirationDays"]="-";
                if(ret.data["expiration"]!=-1){
                    //外链已过期
                    var exp = new Date (self.options.expiration.substr(0,10).replace(/\-/g, "\/"));
                    var now = new Date (new Date().getFullYear() + '/' + (new Date().getMonth()+1) +"/"+ new Date().getDate());
                    ret.data["expiration"]= Util.formatDate(ret.data.expiration, 'yyyy-MM-dd');
                    ret.data["expirationDays"]=Util.GetDateDiff(Util.formatDate(new Date(),'yyyy-MM-dd'),ret.data["expiration"],'day');
                }

                $.extend(self.options,ret.data);
                self.options["uploadCheck"]=/^(rwp|rw|wp|w)$/.test(self.options.mode);
                self.options["downloadCheck"]=/^(rwp|rw|rp|r)$/.test(self.options.mode);
                self.options["previewCheck"]=/^(rwp|rp|wp|pw|p)$/.test(self.options.mode);

                if(self.options.action){

                }


                var html=views(self.options);
                $link_share.html(html);
                //若已过期，在日期后面显示出来
                var distance =  parseInt((exp - now)/1000/3600/24);
                if(distance<0){
                    var $link_em_days=$("#link_em_days");
                    var $errMsg=$link_em_days.next(".link_err_msg").text(_("外链已过期"));
                    $link_em_days.hide();
                    $("#link_copy").css({"background-color":"#88b7f1","border-color":"#88b7f1"});
                }
                //复制swf初始化,待复制的数据从 link_copy 的属性中读取
                objClip = new ZeroClipboard( document.getElementById("link_copy"), {
                    moviePath:"/js/gallery/ZeroClipboard/ZeroClipboard.swf"
                });

                params.rendered&&params.rendered.call(self);

            }
            //外链信息已经存在
            if(this.options.deliveryCode){
                linkDao.info(function(ret) {
                    if (ret.code != 200) {
                        Tips.warn(ret.message);
                        return;
                    }
                    $.extend(self.options,ret.data);
                    create(ret);
                }, this.options.deliveryCode);
             //创建外链信息
            }else{
                self.setAuth(self.options);
                self.saveLinkSet(function(ret){
                    create(ret);
                },true);
            }
        },

        //设置访问权限
        setAuth:function(data){
            var self=this;
            data["upload"]=Util.getPrivatePrivilege(self.options.cssAction||self.options.action).canUpload;
            data["download"]=Util.getPrivatePrivilege(self.options.cssAction||self.options.action).canDownload;
            data["preview"]=Util.getPrivatePrivilege(self.options.cssAction||self.options.action).canPreview;
        },

        //拷贝
        setCopyAndSave:function(e){
            var self=this;
            this.saveLinkSet(function(){
                Tips.show(_("链接地址已经复制到剪切板中"));
                $link_copy.val(_("复制"));
                if(self.savedCallback){
                    self.savedCallback();
                }
            });
        },

        //更新剪贴板
        updateClipboard:function(){
            var strTxt=$link_share.find(".link_url_span").text().replace(/\s/g,"");
            $("#link_copy").attr("data-clipboard-text",strTxt);
        },

        //更新保存按钮样式
        updateSaveBtn:function(){
            var isDisabled=this.checkInput();
            if(isDisabled){
                $link_copy.removeAttr("disabled");
                $link_copy.css({"background":"#2A7EF8"});
                $link_copy.css({"border-color":"#1d64d0"});
            }else{
                $link_copy.css({"background":"#88b7f1"});
                $link_copy.css({"border-color":"#88b7f1"});
                $link_copy.attr("disabled","true");
            }
             $link_copy.val(_("保存设置并复制"));
        },

        //验证数据
        checkInput:function(){
            //上传，下载，预览
            var len=$link_share.find("input[name='linkAuth']:checked");
            if(!len.length){
                return false;
            }

            //密码
            var $link_password_show = $("#link_password_show");
            if($link_password_show[0].checked&& $.trim($link_password.val())==""){
                return false;
            }

            //日期
            if ($link_chk_expiration[0].checked&& $.trim($link_txt_expiration.val())=="") {
                return false;
            }else{
                var exp = new Date($link_txt_expiration.val().replace(/\-/g, "\/"));
                var now = new Date(new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + "/" + new Date().getDate());
                if (exp < now) {
//              	$link_copy.css({"background-color":"#88b7f1","border-color":"#88b7f1"});
//                  Tips.warn(_("有效期必须不能小于当前日期"));
//                  return false;
                }
            }

            if (Util.getBytes($link_desc.val()) > 600) {
                Tips.warn(_("外链说明：最多可以输入300个汉字"));
                return false;
            }

            return true;
        },

        //外链设置
        saveLinkSet: function (fn,isFirst) {
            var self = this;
            if(!isFirst&&!this.checkInput()){
                return false;
            }
            var mode = '';
            var password = "";
            var description = $link_desc ? $link_desc.val() : "";
            var expiration = -1;
            var upload,download,preview;
            //首次创建
            if(isFirst){
                if(self.options.cssAction&&Util.getPrivatePrivilege(self.options.cssAction).canDownload){
                    mode +='r';
                }
                if(self.options.isfolder&&self.options.cssAction&&Util.getPrivatePrivilege(self.options.cssAction).canUpload){
                    mode +='w';
                }
                if(self.options.cssAction&&Util.getPrivatePrivilege(self.options.cssAction).canPreview){
                    mode +='p';
                }


            //编辑外链
            }else{
				if($link_upload[0]){
					upload = $link_upload[0].checked;
				}
				if($link_download[0]){
					download = $link_download[0].checked;
				}
				if($link_preview[0]){
					preview  = $link_preview[0].checked;
				}
                password = $.trim($link_password.val());
                if ($link_chk_expiration[0].checked) {
                    var re = /([\d]{4})\D+?([\d]{1,2})\D+?([\d]{1,2})?/;
                    expiration =$link_txt_expiration.val();
                    var matchArr = re.exec(expiration);
                    expiration = matchArr[1] + '-' + matchArr[2] + '-' + matchArr[3];
                }
                if (upload && download && preview) {
                    mode = "rwp";
                } else if (upload && download) {
                    mode = "rw";
                } else if (upload && preview) {
                    mode = "wp";
                } else if (download && preview) {
                    mode = "rp";
                } else if (upload) {
                    mode = "w";
                } else if (download) {
                    mode = "r";
                } else if (preview) {
                    mode = 'p';
                }
            }

            $.extend(self.options, {password:password,expiration:expiration,description:description});
            linkDao.create(function (ret) {
                if (ret.code != 200) {
                    Tips.warn(ret.message);
                    return;
                }
                $.extend(self.options, ret.data);
                if (fn)fn(ret);
            }, self.options.path, self.options.path_type, self.options.from, self.options.neid, self.options.prefix_neid, mode, password, expiration, description);


        },

        //查看
        setShow:function(e){
            window.open($(e.target).attr("data-clipboard-text"));
        },

        //验证外链权限
        checkAuth:function(e){
            var len=$link_share.find("input[name='linkAuth']:checked").length;
            var $errMsg=$(e).parent().find(".link_err_msg");
            if(!len){
                $errMsg.text(_('请至少选择一种权限'));
            }else{
                $errMsg.empty();
            }
        },

        //设置密码
        setPassword:function(e){
            var self=this;
            var $chk=$("#link_password_show");
            var $pwdContext=$("#link_pwd_context");
            if($chk[0].checked){
               $link_password.val(self.createPassword(4));
                $pwdContext.show();
            }else{
                $link_password.val("");
                $pwdContext.hide();
            }
            $link_password.trigger('keyup');
            self.updateClipboard();
        },

        //创建随机密码
        createPassword:function(len) {
            var seed = new Array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z');
            var lenSeed = seed.length;
            var str = "";
            for (var i = 0; i < len; i++){
                var j = Math.floor(Math.random()*lenSeed);
                str += seed[j];
            }
            return str;
        },


        //设置有效期
        setExpiration:function(e){
            var $chk=$("#link_chk_expiration");
            var $context=$("#link_exp_context");
            if ($chk[0].checked) {
                $context.show();
                if(!$.trim($link_txt_expiration.val())){
                    $link_txt_expiration.val(Util.formatDate(new Date(),'yyyy-MM-dd'));
                }
                var days=Util.GetDateDiff(Util.formatDate(new Date(),'yyyy-MM-dd'),$link_txt_expiration.val(),'day');
                $("#link_em_days").text( language('距离到期还有{0}天',days)).show().next().hide();
            } else {
                $context.hide();
            }
        },

        //析构函数，资源回收
        destory:function(){
            $link_share.find("*").unbind();
            $link_share=null;
            $link_tmp=null;
            $link_txt_expiration=-1;
            $link_desc=null;
            $link_copy=null;
            $link_chk_expiration=null;
            if(ZeroClipboard) {
                ZeroClipboard.destroy();
            }
        }
    };

    module.exports=linkShare;
})