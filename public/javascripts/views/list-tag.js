// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};


// The DOM element for a todo item...
meenoAppCli.Classes.ListTagView = Backbone.View.extend({

	//... is a list tag.
	tagName  : 'li',

	// Cache the template function for a single item.
	template: _.template( $('#overview-tag-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .checkbox': 'check',
		'click .edit'    : 'edit',
		'click .delete'  : 'delete',
		'blur .label'    : 'save'
	},

	initialize: function() {},

	// Re-renders the note item to the current state of the model
	render: function() {
		console.log ("R[list-tag]");
		this.$el.html( this.template( this.model.toJSON() ) );
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
	}
});