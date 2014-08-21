var mee     = mee || {};
mee.cla = mee.cla || {};

mee.cla.HelperView = Backbone.View.extend({

	initialize: function() {
		mee.dispatcher.on('tab:toggle:helper', this.toggle, this);
		this.children = {
			tab  : new mee.cla.HelperTabView ({ el: $("#nav .help"), parent: this }),
			body : new mee.cla.HelperBodyView ({ el: $("#tabs .help"), parent: this })
		};
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});