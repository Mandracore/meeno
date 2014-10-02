define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {
		/**
		 * This backbone view holds the editor tab (simple button) controlling the display of the body rendered by {{#crossLink "EditorBodyView"}}{{/crossLink}}
		 * 
		 * @class EditorTabView
		 * @extends Backbone.View
		 */
		var EditorTabView = Backbone.View.extend({

			tagName   : 'li', // The View will generate itself within a <tagName> element (its top-level element)...
			className : 'object note', // ... and will apply itself those classes : <tagName class="className1 className2[...]"
			template  : '#editor-tab-template', // ... and will finally use this template to render the related model with passed to the constructor

			// The DOM events we listen to
			events: {
				'click': 'delegatedToggle'
			},

			initialize: function() {
				this.listenTo(this.model, 'change:title', this.render); // If the model's title is updated, the view will be redrawn
			},

			beforeKill: function() {},

			// Renders the tab-nav item to the current state of the model
			render: function() {
				var templateFn = _.template( $(this.template).html() );
				this.$el.html( templateFn( this.model.toJSON() ) );
				return this;
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

		return EditorTabView;
	}
);