define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
	], function ($, _, Backbone, channel) {

		/**
		 * This class holds the view of the filter models that are used to filter the browser's search results.
		 * This view can accept models of classes {{#crossLink "NoteFilter"}}{{/crossLink}},
		 * {{#crossLink "TaskFilter"}}{{/crossLink}} and {{#crossLink "TagFilter"}}{{/crossLink}}.
		 * 
		 * @class BrowserBodyFilterView
		 * @extends Backbone.View
		 * @constructor
		 * @param {Object} options Holds all the options of the view.
		 * @param {Object} options.filterName Must be passed to initialize the view's model name.
		 */
		var BrowserBodyFilterView = Backbone.View.extend({
			tagName  : "li",
			className: "icon-filter",
			template : '#browser-body-filter-template',

			events: {
				'click': 'activate'
			},

			initialize: function(options) {
				this.options = options;
				this.active  = false;
				this.listenTo(this.options.parent.filters[this.options.filterName], 'change add:tags remove:tags add:tasks remove:tasks', function () {this.checkStatus()});
				this.listenTo(this.options.parent.filters[this.options.filterName], 'change add:tags remove:tags add:tasks remove:tasks', function () {this.checkStatus()});
				this.listenTo(channel, "browser:filters:"+this.options.filterName+":remove-active", function () {this.removeIfActive();});

			},

			/**
			 * Renders one filter : generates the HTML and appends it to the DOM element of the view
			 *
			 * @method render
			 * @chainable
			 */
			render: function() {
				var templateFn = _.template( $(this.template).html() );
				this.$el.html (templateFn (this.model.toJSON()));
				this.checkStatus();
				return this;
			},

			/**
			 * Called every time the filters of the {{#crossLink "BrowserBodyView"}}browser{{/crossLink}} 
			 * are updated. Checks if its model is similar to the one in use in the browser and 
			 * highlights it if it's true.
			 *
			 * @method checkStatus
			 */
			checkStatus: function () {
				if (this.options.parent.filters[this.options.filterName].isSimilar(this.model)) {
					this.$el.addClass('active');
					this.active = true;
				} else {
					this.$el.removeClass('active');
					this.active = false;
				}
			},

			/**
			 * Called when the user clicks on the view.
			 * Updates the right {{#crossLink "BrowserBodyView"}}browser{{/crossLink}}'s 
			 * filter to clone the view's model properties and highlights it.
			 *
			 * @method activate
			 */
			activate: function() {
				if (!this.active) {
					console.log("activate");
					this.options.parent.filters[this.options.filterName].makeItMatch(this.model);
					this.options.parent.filters[this.options.filterName].trigger('change');
				}
			},

			/**
			 * Listens to the event `browser:filters:[this.options.filterName]:remove-active` triggered by
			 * the {{#crossLink "BrowserBodyView"}}browser{{/crossLink}}.
			 * Will destroy both the view and its model.
			 *
			 * @method removeIfActive
			 */
			removeIfActive: function() {
				if (this.active) {
					this.model.destroy();
					this.kill();
				}
			},

		});

		return BrowserBodyFilterView;
	}
);
