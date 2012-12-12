// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

//==========================================
// The view of a note in the list of notes
//==========================================
meenoAppCli.Classes.NoteView = Backbone.View.extend({

	// Backbone will wrap the rendering of this view in a new DOM element : <li></li>
	tagName:  'li',

	// The template function used to render a note, with a template description stored within the html
	template: _.template( $('#note-template').html() ),

	// Define here events occuring to the DOM element of the view or its children
	events: {
		'click': 'edit' // we wrote 'click' and not 'click sometag' because we want a click on any part of the view to trigger the callback defined hereafter
	},

	initialize: function() {
		this.model.on('change', this.render, this); // if the related model is altered in any way, we will redraw
	},

	// Renders the note item to the current state of the related model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this; // To allow chaining
	},

	edit: function() {
		if(this.model.openInEditor) { // We will just toggle the editor in that case
			this.model.editorTabView.toggle();
			return;
		}

		this.model.openInEditor = true; // we mark this model as already opened in editor to avoid opening multiple editors for the same model
		var noteEditorTabView   = new meenoAppCli.Classes.NoteEditorTabView({ model: this.model }); // We create a new tab (NoteEditorTabView)
		var noteEditorView      = new meenoAppCli.Classes.NoteEditorView({ model: this.model }); // We create a new editor (NoteEditorView)
		$('#editor-tabs-list').append(noteEditorTabView.render().el); // We render the NoteEditorTabView and append it to the right container
		$('#editor-list').append(noteEditorView.render().el); // We render the NoteEditorView and append it to the right container
		noteEditorTabView.toggle(); // we display the new editor by calling the toggle() method on the tab view (defined in editor-tab.js)
	}
});