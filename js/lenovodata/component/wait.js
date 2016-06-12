;define('component/wait', function(require, exports){

    var $= require('jquery'),
        EventTarget = require('eventTarget');

    function Wait(){
        var wait = $('<div class="lui-wait"><img width="32" height="32" src="/img/loading3.gif"/></div>');
        wait.appendTo($('body'));
        this.wait = wait;
    }

    $.extend(Wait.prototype, EventTarget, {
        close: function(){
            var self = this;
            if(self.wait){
                self.wait.remove();
            }
        }
    });

    return Wait;
});