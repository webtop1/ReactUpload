;define('component/validator', function(require, exports){

    var $ = require('jquery');
    
    var Rules = {
        mobile: function(val) {
            return /^1\d{10}$/.test(val)
        },

        // matches mm/dd/yyyy (requires leading 0's (which may be a bit silly, what do you think?)
        date: function(val) {
            return /^(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])\/(?:\d{4})/.test(val);
        },

        email: function(val) {
            return /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/.test(val);
        },

        number: function(val) {
            return /^\d+$/.test(val);
        },

        english: function(val){
            return /^[\w-]+$/.test(val);
        },

        minLength: function(val, length) {
            return val.length >= length;
        },

        maxLength: function(val, length) {
            return val.length <= length;
        },

        equal: function(val1, val2) {
            return (val1 == val2);
        }
    };

    function Validator(config) {
        this.config = config;
        this.fields = [];

        this._init(config);
    }

    $.extend(Validator.prototype, {
        _init: function(){
            var self = this, config = self.config;

            for (var item in config.fields) {
                self._processField(config.fields[item], item);
            }

            if (config.submitButton) {
                $(config.submitButton).click(self._handleSubmit);
            }
        },

        getError: function (error) {
            return $('<div id="' + error.id + '" class="lui-validator"><span class="triangle"></span><span class="triangle2"></span><span class="msg">' + error.message + '</span></div>');
        },

        _handleSubmit: function(){
            var self = this, config = self.config, fields = self.fields;

            var errors = false,
            i, l;
            for (i = 0, l = fields.length; i < l; i += 1) {
                if (!fields[i].testValid(true)) {
                    errors = true;
                }
            }
            return !errors;
        },

        _processField: function(opts, selector){
            var self = this, config = self.config, fields = self.fields;
            var item;

            var field = $(selector),
            error = {
                message: opts.message,
                id: selector.slice(1) + '_unhappy'
            },
            errorEl = $(error.id).length > 0 ? $(error.id) : self.getError(error);

            fields.push(field);
            field.testValid = function(submit) {
                var val, el = $(this),
                gotFunc,
                error = false,
                temp,
                required = !!el.get(0).attributes.getNamedItem('required') || opts.required,
                password = (field.attr('type') === 'password'),
                arg = $.isFunction(opts.arg) ? opts.arg() : opts.arg;

                // clean it or trim it
                if ($.isFunction(opts.clean)) {
                    val = opts.clean(el.val());
                } else if (!opts.trim && !password) {
                    val = $.trim(el.val());
                } else {
                    val = el.val();
                }

                // write it back to the field
                el.val(val);

                // get the value
                gotFunc = ((val.length > 0 || required === 'sometimes') && Rules[opts.rule]);

                // check if we've got an error on our hands
                if (required === true && val.length === 0) {
                    error = true;
                } else if (gotFunc) {
                    error = !gotFunc(val, arg);
                }

                if (error) {
                    var pos = el.position();
                    errorEl.css({left: pos.left+el.width()+20, top: pos.top});
                    $(self.config.form).append(errorEl);

                    el.addClass('unhappy').before();
                    return false;
                } else {
                    temp = errorEl.get(0);
                    // this is for zepto
                    if (temp.parentNode) {
                        temp.parentNode.removeChild(temp);
                    }
                    el.removeClass('unhappy');
                    return true;
                }
            };
            field.bind(config.when || 'blur', field.testValid);
        },

        addField: function(field){
            var self = this;
            self._processField(field.rule, field.selector);
        },

        removeField: function(name){
            var self = this;
            for(var i=0; i<self.fields.length; i++){
                var item = self.fields[i];
                if(item.attr('id') == name){
                    self.fields.splice(i, 1);
                }
            }
        },

        hasField: function(name){
            var self = this;
            $.each(self.fields, function(index, item){
                if(item.attr('id') == name){
                    return true;
                }
            });
        },

        isValid: function(){
            return this._handleSubmit();
        }
    });

    return Validator;

});


