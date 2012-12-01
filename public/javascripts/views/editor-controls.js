// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Item View
// --------------

// The DOM element for a todo item...
meenoAppCli.Classes.NoteEditorControlsView = Backbone.View.extend({

	tagName  :  'div',
	className:  'editor-controls',

	// Cache the template function for a single item.
	template: _.template( $('#editor-controls-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .quit'           : 'quit',
		'click .del'            : 'delete'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		this.model.on('editor:toggle-sub', this.toggle, this); // When this event is triggered, we know that have to display this view
		this.model.on('editor:save', this.saveIndicator, this); // When this event is triggered, we know that to display a visual warning here
	},

	// Re-renders the editor-tab item to the current state of the model
	render: function() {
		this.$el.html(this.template({}));
		return this;
	},

	toggle: function() {
		// Let's see if this works
		$("#editor-controls-list").children().each(function(i,el){
			$(el).hide();
		});
		this.$el.fadeIn(500);
	},

	delete: function() {
		this.model.destroy({
			success: function() {console.log("Object successfully deleted.")},
			error  : function() {console.log("Deleting failed.")}
		});
		meenoAppCli.mainView.trigger('editor:counter',false);
		this.remove();
		$('#editor-permanent').fadeIn(500);
	},

	quit: function() {
		console.log('quit controls');
		this.model.openInEditor = false;
		this.model.trigger('editor:quit');
		meenoAppCli.mainView.trigger('editor:counter',false);
		this.remove();
		$('#editor-permanent').fadeIn(500);
	},

	saveIndicator: function(status) {
		if (status == "error") {
			this.$('span').show().html('Saving failed');
			return;
		}
		if (status == "success") {
			//this.$('span').show().html('Modifications saved').fadeOut(1500);
			return;
		}
		if (status == "init") {
			this.$('span').show().html('Saving...').fadeOut(1500);
			return;
		}
	}
});