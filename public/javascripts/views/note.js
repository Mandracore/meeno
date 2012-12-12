// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteView = Backbone.View.extend({

	tagName:  'li',

	template: _.template( $('#note-template').html() ),

	events: {
		'click': 'edit'
	},

	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw
	},

	// Renders the note item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this; // To allow chaining
	},

	edit: function() {
		console.log('editing...');
		if(this.model.openInEditor) { // We do not want to open it twice, we will just toggle editor
			this.model.editorTabView.toggle();
			return;
		}

		this.model.openInEditor = true;
		var noteEditorTabView   = new meenoAppCli.Classes.NoteEditorTabView({ model: this.model });
		var noteEditorView      = new meenoAppCli.Classes.NoteEditorView({ model: this.model });
		$('#editor-tabs-list').append(noteEditorTabView.render().el);
		$('#editor-list').append(noteEditorView.render().el);
		noteEditorTabView.toggle();
	}
});