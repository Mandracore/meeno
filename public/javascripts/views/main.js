
// js/views/main-meeno.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
meenoAppCli.Classes.MainView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#meenoApp',

	// Our template for the line of statistics at the bottom of the appCli.
	// statsTemplate: _.template( $('#stats-template').html() ),

	// Delegated events for creating new items, and clearing completed ones.
	// Events occuring to the DOM
	events: {
		'click #new'           : 'new', // Create new editor and refresh list of editors !
		'keypress input#search': 'search'
	},

	// At initialization we bind to the relevant events on the `Todos`
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting todos that might be saved in *localStorage*.
	initialize: function() {
		// Events occurring to the collection registerd in javascripts/collecitons/notes.js
		meenoAppCli.Notes.on( 'add destroy reset change', this.render, this );
		meenoAppCli.Notes.fetch(); // Get back from localstorage, wich will fire event and thus this.render
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
		console.log('search');
	}


});