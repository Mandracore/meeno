// javascripts/views/main.js
var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

//==========================================
// TOP-LEVEL CLIENT-SIDE VIEW
//==========================================
meenoAppCli.Classes.MainView = Backbone.View.extend({

	// This view is bind to the DOM element of id meenoApp
	el: '#meenoApp',

	// Define here events occuring to the DOM Element of the view or its children
	events: {
		'click #new'           : 'new', // Create new note
		'keypress input#search': 'search' // Look for notes...
	},

	// Defining what will be done when the view will be created
	initialize: function() {
		// Define here events occuring to the model which will be listened by this view
		meenoAppCli.Notes.on( 'add destroy reset change', this.render, this );
		// Fill up collection with models stored in localstorage, wich will fire event "reset" on the collection and thus "this.render"
		meenoAppCli.Notes.fetch();
	},

	// Triggers rendering of sub view NoteView
	render: function() {
		this.$('#notes-list').html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) { // Then, for each note in our collection...
			var noteView = new meenoAppCli.Classes.NoteView({ model: note }); // ... we create a NoteView ...
			$('#notes-list').append(noteView.render().el); // ... and we finally append its rendered DOM element to our container.
		}, this);
		return this;
	},

	new: function() {
		var newNote           = meenoAppCli.Notes.create(); // Create a new note in the collection meenoAppCli.Notes
		newNote.openInEditor  = true; // we mark the new model as already opened in editor to avoid opening multiple editors for the same model
		var noteEditorTabView = new meenoAppCli.Classes.NoteEditorTabView({ model: newNote }); // Create a tab view of this new model 
		var noteEditorView    = new meenoAppCli.Classes.NoteEditorView({ model: newNote }); // Create an editor view of this new model 
		$('#editor-tabs-list').append(noteEditorTabView.render().el); // Append the tab to its container
		$('#editor-list').append(noteEditorView.render().el); // Append the editor to its container
		noteEditorTabView.toggle(); // Display the editor of the new note
	},

	// Search notes within the collection meenoAppCli.Notes
	search: function() {
		// Coming soon
		console.log('search');
	}


});