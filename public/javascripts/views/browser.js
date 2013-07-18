var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserView = Backbone.View.extend({

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:browser', this.toggle, this);
		this.children = {
			tab  : new meenoAppCli.Classes.BrowserTabView({ el: $("#nav .browse"), parent: this }),
			body : new meenoAppCli.Classes.BrowserBodyView({ el: $("#tabs .browse"), parent: this })
		};
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});