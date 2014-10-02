define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
	], function ($, _, Backbone, channel) {

		var HelperBodyView = Backbone.View.extend ({

			// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
			// It explains why we don't need a render function

			events: {},
			initialize: function() {},

			toggle: function() {
				// First, deactivate the other tabs' content
				$("#tabs").children().each(function(i,child){
					$(child).removeClass("selected");
				});
				// Then activate this one
				this.$el.addClass('selected');
			}
		});

		var HelperTabView = Backbone.View.extend({

			// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
			// It explains why we don't need a render function

			// The DOM events we listen to
			events: {
				'click': 'delegatedToggle'
			},

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
			}
		});

		var HelperView = Backbone.View.extend({

			initialize: function() {
				channel.on('tab:toggle:helper', this.toggle, this);
				this.children = {
					tab  : new HelperTabView ({ el: $("#nav .help"), parent: this }),
					body : new HelperBodyView ({ el: $("#tabs .help"), parent: this })
				};
			},

			toggle: function() {
				this.children.tab.toggle();
				this.children.body.toggle();
			}
		});

		return HelperView;
	}
);