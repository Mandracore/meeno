EditorView = Backbone.View.extend({

	initialize: function() {
		this.listenTo(this.model, 'remove', this.kill);
		this.children = {
			tab  : new EditorTabView({ model: this.model, parent: this }),
			body : new EditorBodyView({ model: this.model, parent: this })
		};
	},

	beforeKill: function() {
		console.log('Killing editor');
		channel.trigger('tab:toggle:browser');
		this.children.tab.kill();
		this.children.body.kill();
		mee.counters.openedEditors--;
		this.model.isInEditor = false;
	},

	render: function() {
		if (mee.counters.openedEditors < 6 && !this.model.isInEditor) {
			mee.counters.openedEditors++;
			this.model.isInEditor = true;
			$("#nav").append(this.children.tab.render().el);
			$("#tabs").append(this.children.body.render().el);
			return this;
		} else {
			channel.trigger('tab:toggle:browser');
			this.kill();
		}
	},

	toggle: function() {
		this.children.tab.toggle();
		this.children.body.toggle();
	}
});