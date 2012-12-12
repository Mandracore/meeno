// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

//==========================================
// The view of a note's editor
//==========================================
meenoAppCli.Classes.NoteEditorView = Backbone.View.extend({

	// Backbone will wrap the rendering of this view in a new DOM element : <article class="editor"></article>
	tagName  :  'article',
	className:  'editor',

	// The template function used to render an editor, with a template description stored within the html
	template: _.template( $('#editor-template').html() ),

	// Define here events occuring to the DOM element of the view or its children
	events: {
		'click .header-title'   : 'toggle',
		'click .quit'           : 'quit',
		'keypress .edit-content': 'save',
		'keypress .edit-title'  : 'save',
		'blur .edit-content'    : 'save',
		'blur .edit-title'      : 'save',
		'click .del'            : 'delete'
	},

	initialize: function() {
		this.model.editorView = this; // Storing a reference to this view in the model for reuse in editor-tab view
	},

	// Renders the editor item to the current state of related the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) ); // simply rendering the template
		return this; // to allow us chaining operations
	},

	save: function() {
		this.model.set({
			title  :this.$(".edit-title").html(),
			content:this.$(".edit-content").html()
		}).save({},{ // Defining callbacks to monitor the success/failure of the operation
			success: function() {console.log("Object successfully saved.")},
			error  : function() {console.log("Saving failed.")}
		});
	},

	delete: function() {
		this.model.destroy({ // Defining callbacks to monitor the success/failure of the operation
			success: function() {console.log("Object successfully deleted.")},
			error  : function() {console.log("Deleting failed.")}
		});
		this.model.editorTabView.remove();
		this.remove();
	},

	toggle: function() {
		// First, hide the others
		$("#editor-list").children().each(function(i,li){
			$(li).find(".body").hide();
		});
		// Then, display this one
		this.$(".body").fadeIn(500);
	},

	quit: function() {
		this.model.openInEditor = false; // We mark the model as not opened to allow us reopen it in the future
		this.model.editorTabView.remove(); // We destroy the tab view related to this model
		this.remove(); // We destroy this (editor) view
	}
});