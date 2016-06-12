;define('component/eventTarget', function(require, exports){

	var EventTarget = {
		on: function(type, handler){
			this.handlers || (this.handlers = {});
			this.handlers[type] = handler;
		},
		fire: function(type){
			var args = Array.prototype.slice.call(arguments, 1);
			this.handlers || (this.handlers = {});
			var handler = this.handlers[type];
			if(handler){
				handler.apply(this, args);
			}
		},
		syncFire: function(type){
			var args = Array.prototype.slice.call(arguments, 1);
			this.handlers || (this.handlers = {});
			var handler = this.handlers[type];
			if(handler){
				return handler.apply(this, args);
			}
			return null;
		},
		off: function(type, handler){
			this.handlers || (this.handlers = {});
			var handler = this.handlers[type];
			if(handler){
				this.handlers[type] == null;
			}
		},
		broadcast: function(type){
			var cache = broadcast_cache;
			var args = Array.prototype.slice.call(arguments, 1);
			if(cache){
				var fn = cache[type];
				if(fn){
					var i=0; len=fn.length;
					for(; i<len; i++){
						fn[i].apply(this, args);
					}
				}
			}
		},
		onbroadcast: function(type, func){
			var cache = broadcast_cache;
			if(cache){
				var handlers = cache[type] || [];
				handlers.push(func);
			}
		}
	};

	return EventTarget;
})
