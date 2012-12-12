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

	initialize: function() {
		// Define here events occuring to the model which will be listened by this view
		meenoAppCli.Notes.on( 'add destroy reset change', this.render, this );
		meenoAppCli.Notes.fetch(); // Get back from localstorage, wich will fire event "reset" and thus this.render due to code at line 22
	},

	render: function() {
		this.$('#notes-list').html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) {
			var noteView = new meenoAppCli.Classes.NoteView({ model: note });
			$('#notes-list').append(noteView.render().el);
		}, this);
	},

	new: function() {
		console.log('new');
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