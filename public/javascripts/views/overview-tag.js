// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};


// The DOM element for a todo item...
meenoAppCli.Classes.TagOverView = Backbone.View.extend({

	//... is a list tag.
	tagName:  'li',

	// Cache the template function for a single item.
	template: _.template( $('#overview-tag-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click span.edit': 'edit',
		'click span.delete': 'delete',
		'blur span.label': 'save'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		meenoAppCli.Tags.on('add destroy reset change', this.kill, this ); // Will destroy itself on those events, to prevent from memory leak
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
	},

	// Re-renders the note item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	edit: function() {
		console.log('edit');
		this.$("span.label").attr('contenteditable','true').focus().select();
		document.execCommand('selectAll',false,null);
	},

	delete: function() {
		this.model.destroy();
		meenoAppCli.Tags.remove(this.model);
		this.remove();
		console.log('tag deleted')
	},

	save: function() {
		this.$("span.label").attr('contenteditable','false');
		console.log('save');
		this.model.set({
			label  :this.$("span.label").html()
		}).save({},{
			success: function() {
				console.log('save success');
			},
			error  : function() {
				console.log('save error');
			}
		});
	},

	highlight: function(term) {
		// console.log('hili:'+term);
	},

	kill: function() {
		this.remove();
	}
});