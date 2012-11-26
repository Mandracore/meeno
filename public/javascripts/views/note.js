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
		'click p': 'edit'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
		this.model.on('editor:quit', function(){this.openInEditor = false;}, this); // the NoteEditorView notifies us that it's been closed
		this.openInEditor = false;
	},

	// Re-renders the todo item to the current state of the model and
	// updates the reference to the todo's edit input within the view.
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	edit: function() {
		if(this.openInEditor) return; // We do not want to open it twice
		// Bug ici : on peut ouvrir deux fois une note qui vient d'être créée...
		this.openInEditor = true;
		console.log('editing...');
		var noteEditorView = new meenoAppCli.Classes.NoteEditorView({ model: this.model });
		$('#editor-list').prepend(noteEditorView.render().el);
	}
});