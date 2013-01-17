var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TabContentView = Backbone.View.extend({

	tagName  :  'div',
	className:  'tab object note',
	template : _.template( $('#tab-content-template').html() ),

	// The DOM events specific to an item.
	events: {
		// 'keypress .edit-content': 'save',
		// 'keypress .edit-title'  : 'save',
		// 'blur .edit-content'    : 'save',
		// 'blur .edit-title'      : 'save'
	},

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
	},

	// Renders the tab-content item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	// save: function() {
	// 	var curModel = this.model;
	// 	curModel.trigger('editor:save','init');
	// 	this.model.set({
	// 		title  :this.$(".edit-title").html(),
	// 		content:this.$(".edit-content").html()
	// 	}).save({},{
	// 		success: function() {
	// 			curModel.trigger('editor:save','success');
	// 		},
	// 		error  : function() {
	// 			curModel.trigger('editor:save','error');
	// 		}
	// 	});
	// },

	toggle: function() {
		// First, deactivate the other tabs' content
		$("#tabs").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	},

	quit: function() {
		console.log('quit editor');
		this.remove();
	}
});