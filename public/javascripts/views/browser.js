define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
		'views/browser-tab',
		'views/browser-body',
	], function ($, _, Backbone, channel, BrowserTabView, BrowserBodyView) {
		/**
		 * This class is mainly a proxy for two subclasses : {{#crossLink "BrowserTabView"}}{{/crossLink}} and {{#crossLink "BrowserBodyView"}}{{/crossLink}}.
		 * It listens to the event tab:toggle:browser and make the two subviews visible.
		 * 
		 * @class BrowserView
		 * @constructor
		 */
		var BrowserView = Backbone.View.extend({

			initialize: function() {
				this.listenTo(channel, 'tab:toggle:browser', this.toggle);

				this.children = {
					tab  : new BrowserTabView({ el: $("#nav .browse"), parent: this }),
					body : new BrowserBodyView({ el: $("#tabs .browse"), parent: this })
				};
			},

			toggle: function() {
				this.children.tab.toggle();
				this.children.body.toggle();
			}
		});

		return BrowserView;
	}
);