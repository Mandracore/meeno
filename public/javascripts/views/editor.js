var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorView = Backbone.View.extend({

	initialize: function() {
		this.children = {
			tab  : new meenoAppCli.Classes.EditorTabView({ model: this.model }),
			body : new meenoAppCli.Classes.EditorBodyView({ model: this.model, parent: this })
		};
		$("#nav").append(this.children.tab.render().el);
		$("#tabs").append(this.children.body.render().el);
	},

	beforeKill: function() {
		console.log('Killing editor');
		meenoAppCli.dispatcher.trigger('tab:toggle:browse');
		this.children.tab.kill();
		this.children.body.kill();
	},

	render: function() {
		return this;
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});