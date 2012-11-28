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
		'click'        : 'toggle',
		'keypress span': 'save',
		'blur span'    : 'renameEnd'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
		this.model.editorTabView = this; // Storing a reference to this view in the model for reuse in note view
	},

	// Re-renders the editor-tab item to the current state of the model
	render: function() {
		if (this.$("span").is(":focus")) return this; // We don't want to re-render when we are modifying the title

		var json = this.model.toJSON();
		var title = jQuery.trim(this.model.toJSON().title)
			.substring(0, 15) + "...";

		this.$el.html(this.template({title: title}));
		return this;
	},

	save: function() {
		this.model.set({
			title:this.$("span").html()
		}).save({},{
			success: function() {console.log("Object successfully saved.")},
			error  : function() {console.log("Saving failed.")}
		});
	},

	toggle: function() {
		console.log('toggle-show');
		if (this.$el.hasClass('active')) return;

		// First, deactivate the others
		$("#editor-tabs-list").children().each(function(i,li){
			$(li).removeClass("active");
		});
		// Then activate this one
		this.$el.addClass('active');
		this.model.editorView.toggle();
	},

	// Will be called by editor view
	rename: function () {
		this.$('span').focus().select();
	},

	renameEnd: function() {
		console.log("rename end")
		this.save();
	},
});