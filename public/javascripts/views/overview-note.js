// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};


// The DOM element for a todo item...
meenoAppCli.Classes.NoteOverView = Backbone.View.extend({

	//... is a list tag.
	tagName:  'li',

	// Cache the template function for a single item.
	template: _.template( $('#overview-note-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click': 'edit'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		meenoAppCli.Notes.on('add destroy reset change', this.kill, this ); // Will destroy itself on those events, to prevent from memory leak
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
	},

	// Re-renders the note item to the current state of the model
	render: function() {
		var json        = this.model.toJSON();
		json.created_at = json.created_at.toString('dddd, MMMM ,yyyy');
		this.$el.html( this.template( json ) );
		return this;
	},

	edit: function() {
		console.log('Editing note');
		var sound          = Math.random(); // Using "sound" to make both view listen to same events...
		var tabNavView     = new meenoAppCli.Classes.TabNavView({ model: this.model, sound: sound }); // ...and thus enable them to communicate
		var tabContentView = new meenoAppCli.Classes.TabContentView({ model: this.model, sound: sound });
		$("#nav").append(tabNavView.render().el);
		$("#tabs").append(tabContentView.render().el);
		meenoAppCli.dispatcher.trigger('tab:toggle:' + sound); // Command the two linked views to activate themselves

		// if (this.model.openInEditor) { // We do not want to open it twice, we will just toggle editor
		// 	this.model.trigger('editor:toggle');
		// 	return;
		// }

		// if (meenoAppCli.editorCounter > 3) {
		// 	alert("Can't open more editors");
		// 	return;
		// }
		// meenoAppCli.dispatcher.trigger('editor:counter',true);

		// this.model.openInEditor    = true;
		// var tab      = new meenoAppCli.Classes.NoteEditorTabView({ model: this.model });
		// var noteEditorControlsView = new meenoAppCli.Classes.NoteEditorControlsView({ model: this.model });
		// var noteEditorView         = new meenoAppCli.Classes.NoteEditorView({ model: this.model });
		// $('#editor-tabs-list').append(noteEditorTabView.render().el);
		// $('#editor-controls-list').append(noteEditorControlsView.render().el);
		// $('#editor-content-list').append(noteEditorView.render().el);
		// this.model.trigger('editor:toggle');
	},

	highlight: function(term) {
		// console.log('hili:'+term);
	},

	kill: function() {
		this.remove();
	}
});