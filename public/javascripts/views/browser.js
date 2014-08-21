var mee     = mee || {};
mee.cla = mee.cla || {};

mee.cla.BrowserView = Backbone.View.extend({

	initialize: function() {
		mee.dispatcher.on('tab:toggle:browser', this.toggle, this);
		this.children = {
			tab  : new mee.cla.BrowserTabView({ el: $("#nav .browse"), parent: this }),
			body : new mee.cla.BrowserBodyView({ el: $("#tabs .browse"), parent: this, collections: this.options.collections })
		};
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});