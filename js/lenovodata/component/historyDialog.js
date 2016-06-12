;define('component/historyDialog', function(require, exports, module){
	var $ = require('jquery'),
		Dialog = require('component/dialog'),
        EventTarget = require('eventTarget'),
		Table  = require('component/table');
	require('i18n');
	var	_ = $.i18n.prop;

    /*
     * @param context {
     *    title: 对话框标题 
     *    content: 内容 
     * }
     */
    function HistoryDialog(context, callback) {
        this.context = context;
        this.context.title;
        this.context.content || (this.context.content = '');
        this._callback = callback;
        this._init();
    }

	$.extend(HistoryDialog.prototype, EventTarget, {
        _init: function() {
            var self = this;
            self.dialog = new Dialog(_("历史版本"), {mask: true, 'minWidth':300,conPadding:'0px'}, function(dialog){
            	//ie8 hack
//          	if(window.navigator.userAgent.indexOf("MSIE 8.0")!=-1){
//          		dialog.parent(".lui-dialog").css({"max-width":"320"});
//          	}
                dialog.append('<div id="history-dialog-id"></div>' + '<div class="dialog-button-area"><a id="history-close" class="dialog-button cancel">' + _('关闭') +'</a></div>');
            });

            self.dialog.on('close', function(){
                self.fire('close');
            });
			var title = self.context.title;
			var file = {};
			file.type = title.substring(title.lastIndexOf('.'));
			file.name = title.substring(0,title.lastIndexOf('.'));
			
            var table = new Table({
                node: '#history-dialog-id',
                template: {
                    header: '<li title="'+self.context.title+'"><span style="text-overflow: ellipsis;overflow: hidden;max-width:206px;white-space: nowrap;">'+ file.name +'</span><span style="vertical-align: top;">'+file.type+'</span></li>',
                    row: '<li class="row">'+
                    		  '<p class="rowline"><span class="col1">{{version}}</span>' +
                              '<span class="col2"><a>{{user}}</a> ' +_('于 {0} {1}',"{{modified}}","{{revop}}")+'<span class="{{curVer}}">'+_('当前版本')+'</span></span></p>' + 
                              '<span class="col3">' + '<a path="{{path}}" rev="{{rev}}" neid="{{neid}}" op="download">' + _("下载") + '</a><a path="{{path}}" rev="{{rev}}" neid="{{neid}}" op="restore" class="dis-{{curVer}}">' + _("设为当前") + '</a></span>' +
                         '</li>'
                },
                data: self.context.content
            });

			
            $('#history-dialog-id .row .col3 a').click(function(e) {
                self._callback($(this).attr("op"), $(this).attr("path"),$(this).attr("neid"), $(this).attr("rev"));
            });
            
           

//          $('#history-dialog-id .row').mouseout(function(e) {
//              var elem = $(e.currentTarget).find(".col3 a");
//              if (elem.css('display') == 'inline') {
//                  elem.hide();
//              }
//          });

            $('#history-close').click(function() {
                self.close();
            });
        },
        close: function() {
            var self = this;
            self.dialog.close();
        }
    });

    return HistoryDialog;
});
