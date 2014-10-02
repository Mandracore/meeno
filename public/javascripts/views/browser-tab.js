define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {

		/**
		 * This backbone view holds the browser tab (simple button) controlling the display of the body rendered by {{#crossLink "BrowserBodyView"}}{{/crossLink}}
		 * 
		 * @class BrowserTabView
		 * @extends Backbone.View
		 */
		var BrowserTabView = Backbone.View.extend({

			// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
			// It explains why we don't need a render function

			// The DOM events we listen to
			events: {
				'click': 'delegatedToggle'
			},

			initialize: function() {},

			delegatedToggle: function() {
				this.options.parent.toggle();
			},

			toggle: function() {
				// First, deactivate the other tabs
				$("#nav").children().each(function(i,child){
					$(child).removeClass("selected");
				});
				// Then activate this one
				this.$el.addClass('selected');
			},
		});

		return BrowserTabView;
	}
);