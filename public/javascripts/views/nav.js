// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Item View
// --------------

// The DOM element for a todo item...
meenoAppCli.Classes.NavItemView = Backbone.View.extend({

	//... is a list tag.
	tagName  :  'li',

	// Cache the template function for a single item.
	template: _.template( $('#editor-tab-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click'        : 'toggle'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
		this.model.on('editor:quit destroy', this.quit, this); // When this event is triggered, we know that have to destroy this view
		this.model.on('editor:toggle', this.toggle, this); // When this event is triggered, we know that have to destroy this view
		
		//this.model.editorTabView = this; // Storing a reference to this view in the model for reuse in note view
	},

	// Re-renders the editor-tab item to the current state of the model
	render: function() {
		var json = this.model.toJSON();
		var title = jQuery.trim(this.model.toJSON().title)
			.substring(0, 15) + "...";

		this.$el.html(this.template({title: title}));
		return this;
	},

	toggle: function() {
		if (this.$el.hasClass('active')) return;

		// First, deactivate the other tabs
		$("#editor-tabs-list").children().each(function(i,li){
			$(li).removeClass("active");
		});
		// Then activate this one
		this.$el.addClass('active');
		//this.model.editorView.toggle();
		this.model.trigger('editor:toggle-sub'); // Communicate with the other views based on this model (editor-controls & editor)
	},

	quit: function() {
		console.log('quit tab');
		this.remove();
	}
});