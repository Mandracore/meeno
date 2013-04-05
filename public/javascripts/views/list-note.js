// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};


meenoAppCli.Classes.ListNoteView = Backbone.View.extend({

	tagName  : 'li',

	template: _.template( $('#overview-note-template').html() ),

	events: {
		'click .checkbox': 'check',
		'click .edit'    : 'edit'
	},

	initialize: function() {
		meenoAppCli.Notes.on('add destroy reset change', this.kill, this ); // Will destroy itself on those events, to prevent from memory leak
	},

	beforeKill: function() {
		// This listener has to be removed in order to destroy last reference to the view and allow Garbage collecting
		meenoAppCli.Notes.off('add destroy reset change', this.kill, this );
	},

	// Re-renders the note item to the current state of the model
	render: function() {
		var json        = this.model.toJSON();
		json.created_at = json.created_at.toString('dddd, MMMM ,yyyy');
		// console.log("__________Render list-note :"+this.model.get('title'));
		//var note = meenoAppCli.Notes.models[1]
		_.each(this.model.get('tags'),function (element, index, list) {

			var tag = meenoAppCli.Tags.get(element._id);
			// if (tag) console.log("Render note's tag :"+tag.get('label'));
		}, this)
		// var tag = meenoAppCli.Tags.get(note.get('tags')[0])
		// tag.get('label')



		this.$el.html( this.template( json ) );
		return this;
	},

	check: function() {
		if (this.$("span.checkbox").hasClass('icon-check')) {
			this.$("span.checkbox").removeClass('icon-check');
			this.$("span.checkbox").addClass('icon-check-empty');
		} else {
			this.$("span.checkbox").removeClass('icon-check-empty');
			this.$("span.checkbox").addClass('icon-check');
		}
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
	}
});