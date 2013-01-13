// js/views/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Tab View
// --------------
// The TabView is used to coordinate actions on two sub-views : NavTabView and ContentTabView

meenoAppCli.Classes.TabView = Backbone.View.extend({

	tagName  :  'div',
	className:  'editor-content',

	// Cache the template function for a single item.
	template: _.template( $('#editor-template').html() ),

	// The DOM events specific to an item.
	events: {
		'keypress .edit-content': 'save',
		'keypress .edit-title'  : 'save',
		'blur .edit-content'    : 'save',
		'blur .edit-title'      : 'save'
	},

	initialize: function() {
		var sound = Math.random(); // Sounds are used to enable cross-communication within Views without having to hard-link them
		var navTabView   = new meenoAppCli.Classes.TabView({ listen: sound });
		var contentTabView   = new meenoAppCli.Classes.NavView({ listen: sound });
		if (this.model) {
			// This tab is associated with a model
		} else {
			// It is a stand-alone tab (like Help or Browse)
			// On initialize, we just have to link it to the proper pre-existing piece of DOM

		}
		// this.$el.hide();
		// this.model.on('editor:toggle-sub', this.toggle, this); // When this event is triggered, we know that have to display this view
		// this.model.on('editor:quit destroy', this.quit, this); // When this event is triggered, we know that have to destroy this view
	},

	// Re-renders the editor item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	save: function() {
		var curModel = this.model;
		curModel.trigger('editor:save','init');
		this.model.set({
			title  :this.$(".edit-title").html(),
			content:this.$(".edit-content").html()
		}).save({},{
			success: function() {
				curModel.trigger('editor:save','success');
			},
			error  : function() {
				curModel.trigger('editor:save','error');
			}
		});
	},

	toggle: function() {
		$("#editor-content-list").children().each(function(i,el){
			$(el).hide();
		});
		this.$el.fadeIn(500);
	},

	quit: function() {
		console.log('quit editor');
		this.remove();
	}
});