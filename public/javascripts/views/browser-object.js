define ([
		'jquery',
		'underscore',
		'channel',
		'backbone',
		'backbone.custom',
	], function ($, _, channel, Backbone) {

		/**
		 * This class retains all core features for displaying objects views in the browser.
		 * Several classes will inherit from it, one per kind of business object :
		 * - BrowserNoteView
		 * - BrowserTaskView
		 * - BrowserTagView
		 * - ...
		 * 
		 * @class BrowserObjectView
		 * @extends Backbone.View
		 */
		var BrowserObjectView = Backbone.View.extend({
			tagName  : 'li',

			// The DOM events specific to an item.
			events: {
				'click .checkbox': 'actionCheck',
			},

			initialize: function(options) {
				this.options = options;
				this.listenTo(channel, 'browser:actions:toggle-checkboxes:'+this.options.collName, function () { this.actionToggleCheckbox() });
				this.listenTo(channel, 'browser:actions:delete:'+this.options.collName, function () { this.actionDelete() });
				this.listenTo(channel, 'browser:actions:select:all:'+this.options.collName, function () { this.actionSelectMe() });
				this.listenTo(channel, 'browser:actions:select:none:'+this.options.collName, function () { this.actionUnSelectMe() });
			},

			actionToggleCheckbox: function() {
				this.$('span.checkbox').toggle();
			},

			actionDelete: function() {
				if (this.$('span.checkbox').hasClass("icon-check")) {
					this.model.destroy();
					this.kill();
				}
			},

			actionCheck: function() {
				//console.log(this.options.collName);
				if (this.$("span.checkbox").hasClass('icon-check')) {
					this.$("span.checkbox").removeClass('icon-check');
					this.$("span.checkbox").addClass('icon-check-empty');
				} else {
					this.$("span.checkbox").removeClass('icon-check-empty');
					this.$("span.checkbox").addClass('icon-check');
				}
				channel.trigger("browser:actions:update-selectors:"+this.options.collName);
			},

			actionSelectMe: function() {
				this.$("span.checkbox").removeClass('icon-check-empty');
				this.$("span.checkbox").addClass('icon-check');
			},

			actionUnSelectMe: function() {
				this.$("span.checkbox").removeClass('icon-check');
				this.$("span.checkbox").addClass('icon-check-empty');
			},
		});

		return BrowserObjectView;
	}
);