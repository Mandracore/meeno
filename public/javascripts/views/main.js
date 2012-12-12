// javascripts/views/main.js
var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

//==========================================
// TOP-LEVEL CLIENT-SIDE VIEW
//==========================================
meenoAppCli.Classes.MainView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#meenoApp',

	// Define here events occuring to the DOM
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

	render: function() {
		this.$('#notes-list').html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) { // Then, for each note in our collection...
			var noteView = new meenoAppCli.Classes.NoteView({ model: note }); // ... we create a NoteView ...
			$('#notes-list').append(noteView.render().el); // ... and we finally append its rendered DOM element to our container.
		}, this);
		return this;
	},

	new: function() {
		var newNote           = meenoAppCli.Notes.create();
		newNote.openInEditor  = true;
		var noteEditorTabView = new meenoAppCli.Classes.NoteEditorTabView({ model: newNote });
		var noteEditorView    = new meenoAppCli.Classes.NoteEditorView({ model: newNote });
		$('#editor-tabs-list').append(noteEditorTabView.render().el);
		$('#editor-list').append(noteEditorView.render().el);
		noteEditorTabView.toggle();
	},

	search: function() {
		// Coming soon
		console.log('search');
	}


});