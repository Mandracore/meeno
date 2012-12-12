// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

//==========================================
// The view of a note's editor tab
//==========================================
meenoAppCli.Classes.NoteEditorTabView = Backbone.View.extend({

	// Backbone will wrap the rendering of this view in a new DOM element : <li></li>
	tagName  :  'li',

	// The template function used to render a tab, with a template description stored within the html
	template: _.template( $('#editor-tab-template').html() ),

	// Define here events occuring to the DOM element of the view or its children
	events: {
		'click' : 'toggle' // we wrote 'click' and not 'click sometag' because we want a click on any part of the view to trigger the callback defined hereafter
	},

	initialize: function() {
		this.model.on('change', this.render, this); // if the related model is altered in any way, we redraw
		this.model.editorTabView = this; // Storing a reference to this view in the model for re-use in NoteView or NoteEditorView
	},

	// Renders the editor-tab item to the current state of the related model
	render: function() {
		var json = this.model.toJSON();
		var title = jQuery.trim(this.model.toJSON().title)
			.substring(0, 15) + "...";

		this.$el.html(this.template({title: title})); // We only need the title of the model
		return this;
	},

	toggle: function() {
		// We do nothing if it's already opened
		if (this.$el.hasClass('active')) { return; }
		// First, deactivate the other tabs
		$("#editor-tabs-list").children().each(function(i,li){
			$(li).removeClass("active");
		});
		this.$el.addClass('active'); // Then activate this tab
		this.model.editorView.toggle(); // Finally, display the related editor
	}
});