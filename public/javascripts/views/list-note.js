var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.ListNoteView = Backbone.View.extend({
	tagName  : 'li',
	template : '#overview-note-template',
	
	// The DOM events specific to an item.
	events: {
		'click .checkbox': 'check',
		'click .edit'    : 'edit'
	},

	initialize: function() {},

	// Re-renders the note item to the current state of the model
	render: function () {
		console.log ("R[list-note]");
		var json        = this.model.toJSON();
		json.created_at = json.created_at.toString('dddd, MMMM ,yyyy');

		_.each(this.model.get('tags'),function (element, index, list) {

			var tag = meenoAppCli.tags.get(element._id);
			if (tag) console.log("======== Render note's tag :"+tag.get('label'));
		}, this)
		// var tag = meenoAppCli.Tags.get(note.get('tags')[0])
		// tag.get('label')

		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (json));

		return this;
	},

	check: function() {
		if (this.$("span.checkbox").hasClass('icon-check')) {
			this.$("span.checkbox").removeClass('icon-check');
			this.$("span.checkbox").addClass('icon-check-empty');
		} else {
			this.$("span.checkbox").removeClass('icon-check-empty');
			this.$("span.checkbox").addClass('icon-check');
		}
	},

	edit: function() {
		var newEditor = new meenoAppCli.Classes.EditorView ({ model: this.model });
		newEditor.render();
		newEditor.toggle();
	},

	highlight: function(term) {
		// console.log('hili:'+term);
	}
});