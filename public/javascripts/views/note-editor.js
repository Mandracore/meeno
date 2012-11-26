// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Item View
// --------------

// The DOM element for a todo item...
meenoAppCli.Classes.NoteEditorView = Backbone.View.extend({

	//... is a list tag.
	tagName  :  'li',
	className:  'editor',

	// Cache the template function for a single item.
	template: _.template( $('#editor-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .toggle'         : 'toggle',
		'click .quit'           : 'quit',
		'keypress .edit-title'  : 'save',
		'blur .edit-title'      : 'renameNoteEnd',
		'keypress .edit-content': 'save',
		'blur .edit-content'    : 'save',
		'click .rename'         : 'renameNote',
		'click .del'            : 'deleteNote'
	},

	initialize: function() {
		// Minimizing the others editors :
		$("#editor-list").children().each(function(i,li){
			$(li).find(".body").hide();
		});
	},

	// Re-renders the todo item to the current state of the model and
	// updates the reference to the todo's edit input within the view.
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	save: function() {
		this.model.set({
			title:this.$(".edit-title").val(),// raccourci pour this.$el.find(selector)
			content:this.$(".edit-content").val()
		}).save({},{
			success: function() {console.log("Object successfully saved.")},
			error  : function() {console.log("Saving failed.")}
		});
	},

	renameNote: function() {
		this.$('.header-title').hide();
		this.$(".edit-title").show().focus().select();
	},

	renameNoteEnd: function() {
		this.save();
		this.$('.header-title').show();
		this.$(".edit-title").hide().prev().html(this.$(".edit-title").val());
	},

	deleteNote: function() {
		this.model.destroy({
			success: function() {console.log("Object successfully deleted.")},
			error  : function() {console.log("Deleting failed.")}
		});
		this.remove();
	},

	toggle: function() {
		if (this.$(".body").is(":visible")) {
			console.log('Minimizing');
			this.$(".body").toggle(500);
		} else {
			console.log('Maximizing');
			// if it's not visible, that means we want to open it.
			// We then should minimize the others
			$("#editor-list").children().each(function(i,li){
				$(li).find(".body").hide();
			});
			// Trick to move the editor at the top without removing it from DOM (and losing event bindings) >> we create a clone
			var cloneNoteEditor = new meenoAppCli.Classes.NoteEditorView({model: this.model}); // we create a clone of our editor
			this.remove(); // We can now withdraw the original editor
			var $cloneNoteEditorRendered = cloneNoteEditor.render().$el; // we render the clone view
			$cloneNoteEditorRendered.find(".body").hide(); // we hide the body of the editor before prepending it
			$('#editor-list').prepend($cloneNoteEditorRendered); // we insert the cloned editor in the view
			$cloneNoteEditorRendered.find(".body").toggle(500); // we now can maximize the editor
		}
	},

	quit: function() {
		console.log('quit');
		this.model.trigger("editor:quit"); // To notify the noteView that the editor has been closed
		this.remove();
	}
});