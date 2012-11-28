// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Item View
// --------------

// The DOM element for a todo item...
meenoAppCli.Classes.NoteEditorView = Backbone.View.extend({

	//... is a list tag.
	tagName  :  'article',
	className:  'editor',

	// Cache the template function for a single item.
	template: _.template( $('#editor-template').html() ),

	// The DOM events specific to an item.
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

	// Re-renders the editor item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	save: function() {
		this.model.set({
			title  :this.$(".edit-title").html(),
			content:this.$(".edit-content").html()
		}).save({},{
			success: function() {console.log("Object successfully saved.")},
			error  : function() {console.log("Saving failed.")}
		});
	},

	delete: function() {
		this.model.destroy({
			success: function() {console.log("Object successfully deleted.")},
			error  : function() {console.log("Deleting failed.")}
		});
		this.model.editorTabView.remove();
		this.remove();
	},

	toggle: function() {
		if (!this.$(".body").is(":visible")) {
			// if it's not visible, that means we want to open it.
			// We then should hide the others first
			$("#editor-list").children().each(function(i,li){
				$(li).find(".body").hide();
			});
			this.$(".body").fadeIn(500);
		}
	},

	quit: function() {
		console.log('quit');
		this.model.openInEditor = false;
		this.model.editorTabView.remove();
		this.remove();
	}
});