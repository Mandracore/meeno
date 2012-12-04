
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
		'click #new'      : 'new', // Create new editor and refresh list of editors !
		'keyup #search': 'search'
	},

	// At initialization we bind to the relevant events on the `Todos`
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting todos that might be saved in *localStorage*.
	initialize: function() {
		// Events occurring to the collection registerd in javascripts/collecitons/notes.js
		meenoAppCli.dispatcher = _.clone(Backbone.Events); // Launch main listener
		meenoAppCli.editorCounter = 0;
		meenoAppCli.Notes.on('add destroy reset change', this.render, this );
		this.on('editor:counter', this.editorCounter, this );
		meenoAppCli.Notes.fetch(); // Get back from localstorage, wich will fire event and thus this.render
	},

	render: function() {
		this.$('#note-list').html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) {
			var noteView = new meenoAppCli.Classes.NoteView({ model: note });
			$('#note-list').append(noteView.render().el);
		}, this);
	},

	new: function() {
		if (meenoAppCli.editorCounter > 3) {
			alert("Can't open more editors");
			return;
		}
		this.trigger('editor:new',true);
		var newNote                = meenoAppCli.Notes.create();
		newNote.openInEditor       = true;
		var noteEditorTabView      = new meenoAppCli.Classes.NoteEditorTabView({ model: newNote });
		var noteEditorControlsView = new meenoAppCli.Classes.NoteEditorControlsView({ model: newNote });
		var noteEditorView         = new meenoAppCli.Classes.NoteEditorView({ model: newNote });
		$('#editor-tabs-list').append(noteEditorTabView.render().el);
		$('#editor-controls-list').append(noteEditorControlsView.render().el);
		$('#editor-content-list').append(noteEditorView.render().el);
		noteEditorTabView.toggle();
	},

	search: function() {
		var term = $("#search").val();
		if (term == "") {
			meenoAppCli.Notes.reset();
			meenoAppCli.Notes.fetch();
			console.log('Refetching whole collection');
			return;
		} 

		
		var pattern = new RegExp(term,"gi");
		meenoAppCli.Notes.reset();
		meenoAppCli.Notes.fetch();
		meenoAppCli.Notes.reset(_.filter(meenoAppCli.Notes.models, function(data){
			return pattern.test(data.get("title")) || pattern.test(data.get("content"));
		}));

		meenoAppCli.dispatcher.trigger('search:hi',term);
	},

	editorCounter: function(add) {
		if (add) {
			meenoAppCli.editorCounter ++;
		} else {
			meenoAppCli.editorCounter --;
		}
	}


});