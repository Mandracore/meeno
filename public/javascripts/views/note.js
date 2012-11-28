// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Item View
// --------------

// The DOM element for a todo item...
meenoAppCli.Classes.NoteView = Backbone.View.extend({

	//... is a list tag.
	tagName:  'li',

	// Cache the template function for a single item.
	template: _.template( $('#note-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click': 'edit'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
	},

	// Re-renders the note item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
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