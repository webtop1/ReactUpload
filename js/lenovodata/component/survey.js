;define('component/survey', function(require, exports){
	var $ = require('jquery');

	require('i18n');
	var	_ = $.i18n.prop;
    require('mustache');

    function Survey(node, data) {
        var DEFAULT_CONFIG = [{
            subject: '',
            postName: '',
            multiSelect: false,
            options: [
                {value: '1', text: '使用过'},
                {value: '0', text: '未使用过'}
            ]
        }];

        this.node = $.type(node) == 'string' ? $(node) : node;
        this.data = data;
        this.uuid = 0;

        this._init();
    }

    $.extend(Survey.prototype, {
    	_init: function() {
            var self = this;

            var template = '<tr><td>{{index}}</td><td>{{subject}}</td><td>{{&options}}</td></tr>',
                radio_temp = '<input name="{{postName}}" type="radio" value="{{value}}" id="in_{{id}}"/><label for="in_{{id}}">{{text}}</label>',
                checkbox_temp = '<input name="{{postName}}" type="checkbox" value="{{value}}" id="in_{{id}}"/><label for="in_{{id}}">{{text}}</label>',
                other_temp = '<input type="checkbox" class="other" id="in_{{id}}"/><label for="in_{{id}}">{{text}}</label><input type="text" name="{{postName}}" disabled/>',
                suggest_temp = '<textarea name="{{postName}}"></textarea>';
            
            var html = ['<table class="lui-survey"><tbody>'];

            for(var i=0, ii=self.data.length; i<ii; i++){
                var item = self.data[i];

                var itemData={
                    index: i+1,
                    subject: item.subject
                };

                var opts=[];
                if(item.multiSelect){
                    for(var j=0, jj=item.options.length; j<jj; j++){
                        var itm = item.options[j];
                        if(itm.mode && itm.mode == 'other'){
                            var d = {
                                id: self.guid(),
                                postName: item.postName,
                                text: itm.text,
                                type: 'multi'
                            }
                            opts.push(Mustache.render(other_temp, d));
                        }else{
                            var d = {
                                id: self.guid(),
                                postName: item.postName,
                                value: itm.value,
                                text: itm.text,
                                type: 'multi'
                            }
                            opts.push(Mustache.render(checkbox_temp, d));
                        }
                    }
                }else{
                    for(var j=0, jj=item.options.length; j<jj; j++){
                        var itm = item.options[j];
                        if(itm.mode && itm.mode == 'other'){
                            var d = {
                                id: self.guid(),
                                postName: item.postName,
                                text: itm.text,
                                type: 'single'
                            };
                            opts.push(Mustache.render(other_temp, d));
                        }else if(itm.mode && itm.mode == 'suggest'){
                            var d = {
                                id: self.guid(),
                                postName: item.postName,
                                text: itm.text,
                                type: 'suggest'
                            };
                            opts.push(Mustache.render(suggest_temp, d));
                        }else{
                            var d = {
                                id: self.guid(),
                                postName: item.postName,
                                value: itm.value,
                                text: itm.text,
                                type: 'single'
                            }
                            opts.push(Mustache.render(radio_temp, d));
                        }
                    }
                }
                itemData.options = opts.join('');
                html.push(Mustache.render(template, itemData));
            }

            html.push('</tbody></table>');
            self.node.html(html.join(''));

            $('.other').click(function(){
                var me = $(this);
                if(this.checked == true){
                    me.siblings('input[type=text]').removeAttr('disabled');
                }else{
                    me.siblings('input[type=text]').val('').attr('disabled', true);
                }
            });
        },


        validate: function(){
            var self = this, flag = true;
            $('.lui-survey tr').each(function(index, item){
                var tar = $(item);
                if(tar.find('input[type=radio]').length>0 || tar.find('input[type=checkbox]').length>0){
                    if(tar.find('input:checked').length == 0){
                        self.glint(tar);
                        flag = false;
                        return false;
                    }else{
                        tar.css('background-color', '#fff');
                    }
                }
            });
            return flag;
        },

        glint: function(obj){
            var bgc = obj.css('background-color');
            obj.css('background-color', '#ff0000');
            /*
            obj.animate({'background-color': '#ff0000'}, 500, 'swing', function(){
                //obj.animate({'background-color': bgc}, 500, 'swing');
            });
            */
        },

        guid: function(){
            return ++this.uuid;
        }
        
    });

	return Survey;
});
