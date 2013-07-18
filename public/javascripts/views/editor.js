var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorView = Backbone.View.extend({

	initialize: function() {
		this.children = {
			tab  : new meenoAppCli.Classes.EditorTabView({ model: this.model, parent: this }),
			body : new meenoAppCli.Classes.EditorBodyView({ model: this.model, parent: this })
		};
	},

	beforeKill: function() {
		console.log('Killing editor');
		meenoAppCli.dispatcher.trigger('tab:toggle:browser');
		this.children.tab.kill();
		this.children.body.kill();
	},

	render: function() {
		$("#nav").append(this.children.tab.render().el);
		$("#tabs").append(this.children.body.render().el);
		return this;
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});