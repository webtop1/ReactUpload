;define('component/upgradeDialog', function(require, exports){
	var $ = require('jquery'),
		Validator = require('component/validator'),
		Dialog = require('component/dialog'),
		ConfirmDialog = require('component/confirmDialog'),
		FileModel = require('model/FileManager'),
		TeamModel = require('model/TeamManager');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function UpgradeDialog(mode) {
        this.mode = mode;
        this._init();
    }

    $.extend(UpgradeDialog.prototype, {
    	_init: function() {
            var self = this;

            var domain_template = '<div id="upgradeDialog" class="clearfix"><p>' + _("通过定制企业名称和域名，您可以即刻拥有专属域名访问，只对购买正式版用户提供此功能") + '</p><p><img width="371" height="138" src="/img/upgrade-domain.png"/></p><a id="upgrade-btn" href="/upgrade.html" target="_blank" class="upgrade-btn">' + _("升级") + '</a></div>',
                info_template = '<div id="upgradeDialog" class="clearfix"><p>' + _("企业专属域名页面显示企业的基本信息，包括名称，文字描述，并支持中英文双语") + '</p><p><img width="371" height="58" src="/img/'+_('upgrade-tel.png')+'"/></p><a id="upgrade-btn" href="/upgrade.html" target="_blank" class="upgrade-btn">' + _("升级") + '</a></div>',
                logo_template = '<div id="upgradeDialog" class="clearfix"><p>' + _("通过定制企业logo，您可以即刻拥有个性化界面效果，只对购买正式版用户提供此功能") + '</p><p><img width="367" height="139" src="/img/upgrade-logo.png"/></p><a id="upgrade-btn" href="/upgrade.html" target="_blank" class="upgrade-btn">' + _("升级") + '</a></div>',
                security_template = '<div id="upgradeDialog" class="clearfix"><p><img width="375" height="193" src="/img/upgrade-security.png"/></p><a id="upgrade-btn" href="/upgrade.html" target="_blank" class="upgrade-btn">' + _("升级") + '</a></div>',
                delivery_email_template = '<div id="upgradeDialog" class="clearfix"><p>' + _("外链邮件模板，企业自定义外链邮件内容，并支持中英文双语") + '</p><p><img width="371" height="58" src="/img/'+_('upgrade-tel.png')+'"/></p><a id="upgrade-btn" href="/upgrade.html" target="_blank" class="upgrade-btn">' + _("升级") + '</a>';

            var title='', content;
            switch(self.mode){
                case 'domain':
                    title = _('企业域名及访问域名');
                    content = domain_template;
                break;
                case 'logo':
                    title = _('订购LOGO及页面');
                    content = logo_template;
                break;
                case 'info':
                    title = _('企业信息定制');
                    content = info_template;
                break;
                case 'security':
                    title = _('密码安全');
                    content = security_template;
                break;
                case 'delivery':
                	title = _('外链邮件模板定制');
                	content = delivery_email_template;
                break;
            }

            var dialog = new Dialog(title, function(parent){
            	parent.append(content);

                parent.delegate('#upgrade-btn', 'click', function(){
                    dialog.close();
                });
            });

        }

    });

	return UpgradeDialog;
});
