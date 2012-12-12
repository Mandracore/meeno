// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Item View
// --------------

// The DOM element for a todo item...
meenoAppCli.Classes.NoteEditorTabView = Backbone.View.extend({

	//... is a list tag.
	tagName  :  'li',

	// Cache the template function for a single item.
	template: _.template( $('#editor-tab-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click'        : 'toggle'
	},

	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw
		this.model.editorTabView = this; // Storing a reference to this view in the model for re-use in NoteView or NoteEditorView
	},

	// Renders the editor-tab item to the current state of the model
	render: function() {
		var json = this.model.toJSON();
		var title = jQuery.trim(this.model.toJSON().title)
			.substring(0, 15) + "...";

		this.$el.html(this.template({title: title}));
		return this;
	},

	toggle: function() {
		// We do nothing if it's already opened
		if (this.$el.hasClass('active')) { return; }
		// First, deactivate the others
		$("#editor-tabs-list").children().each(function(i,li){
			$(li).removeClass("active");
		});
		// Then activate this one
		this.$el.addClass('active');
		this.model.editorView.toggle();
	}
});