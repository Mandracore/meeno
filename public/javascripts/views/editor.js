var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorView = Backbone.View.extend({

	initialize: function() {
		console.log('Editing note');
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
		meenoAppCli.counters.openedEditors--;
		this.model.isInEditor = false;
	},

	render: function() {
		if (meenoAppCli.counters.openedEditors < 6 && !this.model.isInEditor) {
			meenoAppCli.counters.openedEditors++;
			this.model.isInEditor = true;
			$("#nav").append(this.children.tab.render().el);
			$("#tabs").append(this.children.body.render().el);
			return this;
		} else {
			console.log ('Please close an editor first.');
			meenoAppCli.dispatcher.trigger('tab:toggle:browser');
			this.kill();
		}
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});