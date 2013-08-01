var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.HelperView = Backbone.View.extend({

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:helper', this.toggle, this);
		this.children = {
			tab  : new meenoAppCli.Classes.HelperTabView ({ el: $("#nav .help"), parent: this }),
			body : new meenoAppCli.Classes.HelperBodyView ({ el: $("#tabs .help"), parent: this })
		};
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});