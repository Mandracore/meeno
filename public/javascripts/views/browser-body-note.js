var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyNoteView = meenoAppCli.Classes.BrowserBodyObjectView.extend({

	template : '#overview-note-template',

	// Renders the note item to the current state of the model
	render: function () {
		this.collName = "notes";
		console.log ("R[Browser-body-note]");
		var json        = this.model.toJSON();
		json.created_at = json.created_at.toString('dddd, MMMM ,yyyy');
		json = {
			note: json,
			tags: _.map(this.model.get('tagLinks').pluck('tag'), function(tag) {return tag.get('label')})
		}

		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (json));
		meenoAppCli.dispatcher.trigger("browser:notes:reSyncSelectors");
		return this;
	},

	edit: function() {
		var newEditor = new meenoAppCli.Classes.EditorView ({ model: this.model });
		newEditor.render();
		newEditor.toggle();
	}
});