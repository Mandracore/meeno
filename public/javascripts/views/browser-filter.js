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
		 * @class BrowserFilterView
		 * @extends Backbone.View
		 * @constructor
		 * @param {Object} options Holds all the options of the view.
		 * @param {Object} options.filterName Must be passed to initialize the view's model name.
		 */
		var BrowserFilterView = Backbone.View.extend({
			tagName  : "li",
			className: "fa fa-filter",
			template : '#browser-filter-template',

			events: {
				'click': 'activate'
			},

			initialize: function(options) {
				this.options = options;
				this.active  = false;
				this.listenTo(channel, "browser:search:filters:check-status:"+this.options.filterName, this.checkStatus);
				this.listenTo(channel, "browser:search:filters:remove:"+this.options.filterName, this.removeIfActive);
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
				return this;
			},

			/**
			 * Called every time the filters of the {{#crossLink "BrowserView"}}browser{{/crossLink}} 
			 * are updated. Checks if its model is similar to the one in use in the browser and 
			 * highlights it if it's true.
			 *
			 * @method checkStatus
			 */
			checkStatus: function (currentFilter) {
				if (currentFilter.isSimilar(this.model)) {
					this.$el.addClass('active');
					this.active = true;
				} else {
					this.$el.removeClass('active');
					this.active = false;
				}
			},

			/**
			 * Called when the user clicks on the view.
			 * Updates the right {{#crossLink "BrowserView"}}browser{{/crossLink}}'s 
			 * filter to clone the view's model properties and highlights it.
			 *
			 * @method activate
			 */
			activate: function() {
				if (!this.active) {
					channel.trigger("browser:search:filters:activate", this.model);
				}
			},

			/**
			 * Will destroy both the view and its model if it is currently active.
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

		return BrowserFilterView;
	}
);
