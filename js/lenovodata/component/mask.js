;define('component/mask', function(require, exports, module){

    var $= require('jquery'),
        EventTarget = require('eventTarget');

    if(!window.uuid){
        window.uuid = {};
        window.uuid['z-index'] = 50;
    }

    function Mask(node){
        this.node = $.type(node) == 'string' ? $(node) : node;
        var mask = $('<div class="lui-mask"></div>');
        mask.appendTo($('body'));
        if(this.node){
            var offset = this.node.offset();
            mask.css({width: this.node.outerWidth(), height: this.node.outerHeight(), left:offset.left, top:offset.top, 'background': '#ffffff'});
        }
        mask.css('z-index', window.uuid['z-index']);
        window.uuid['z-index']+=10;
        this.mask = mask;
    }

    $.extend(Mask.prototype, EventTarget, {
        close: function(){
            var self = this;
            if(self.mask){
                self.mask.remove();
            }
        }
    });

    return Mask;
});