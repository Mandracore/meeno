var mee = mee || {};
mee.cla = mee.cla || {};

mee.cla.BrowserBodyNoteView = mee.cla.BrowserBodyObjectView.extend({

	template : '#browser-body-note-template',

	render: function () {
		var json        = this.model.toJSON();
		// json.created_at = json.created_at.toString('dddd, MMMM ,yyyy');
		json = {
			note: json,
			tags: _.map(this.model.get('tagLinks').pluck('tag'), function(tag) {return tag.get('label')})
		};

		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (json));
		mee.dispatcher.trigger("browser:notes:reSyncSelectors");
		return this;
	},

	edit: function() {
		var newEditor = new mee.cla.EditorView ({ model: this.model });
		newEditor.render();
		newEditor.toggle();
	}
});