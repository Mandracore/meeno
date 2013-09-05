(function(_, Backbone, Mousetrap) {

    var oldInitialize = Backbone.View.prototype.initialize;
    var oldRemove = Backbone.View.prototype.remove;

    _.extend(Backbone.View.prototype, {

        keyboardEvents: {},

        bindKeyboardEvents: function(events) {
            if (!(events || (events = _.result(this, 'keyboardEvents')))) return;
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method)) method = this[events[key]];
                if (!method) throw new Error('Method "' + events[key] + '" does not exist');
                method = _.bind(method, this);
                if ('bindGlobal' in Mousetrap) {
                    Mousetrap.bindGlobal(key, method);
                } else {
                    Mousetrap.bind(key, method);
                }
            }
            return this;
        },

        unbindKeyboardEvents: function() {
            for (var keys in this.keyboardEvents) {
                Mousetrap.unbind(keys);
            }
            return this;
        },

        initialize: function() {
            var ret = oldInitialize.apply(this, arguments);
            this.bindKeyboardEvents();
            return ret;
        },

        remove: function() {
            var ret = oldRemove.apply(this, arguments);
            if (this.unbindKeyboardEvents) this.unbindKeyboardEvents();
            return ret;
        }

    });
})(_, Backbone, Mousetrap);
