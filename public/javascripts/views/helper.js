HelperView = Backbone.View.extend({

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