var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TabContentView = Backbone.View.extend({

	tagName  :  'div',
	className:  'tab object note',
	template : _.template( $('#tab-content-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .close' : 'quit',
		'keypress .edit-content': 'keyPressProxy',
		// 'keypress .edit-title'  : 'save',
		// 'blur .edit-content'    : 'save',
		// 'blur .edit-title'      : 'save'
	},

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quitSub, this);
	},

	// Renders the tab-content item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	keyPressProxy: function( event ) {
		var $caretsNode = $(getCaretsNode());
		// If we are already in an html node related to an object
		if ($caretsNode.hasClass('object')) {
			console.log('passing to subobject ' + $caretsNode.attr('id'));
			meenoAppCli.dispatcher.trigger('tab:objectEvent:' + $caretsNode.attr('id'), event);
			return;
		}

		// We are not already inside an Object
		if (event.keyCode == 35) { // The user wants to insert a tag
			return this.newTask();
		}
	},

	newTask: function () {
		event.preventDefault();
		console.log('New tag');
		var id = makeid();
		pasteHtmlAtCaret("<span class='object tag' id='"+id+"'>#</span>");
		var newTag     = new meenoAppCli.Classes.Tag();
		var newTagView = new meenoAppCli.Classes.TagRefView({ 
			model: newTag,
			el: $("#"+id), // We bind the sub view to the element we just created
			sound: this.options.sound // This sub view will also listen to the same sound (for exiting in particular)
		});// el: $("#nav .help")
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

	quitSub: function() {
		console.log('quit tab content');
		this.remove();
	},

	quit: function() {
		meenoAppCli.dispatcher.trigger('tab:quit:'+this.options.sound);
		meenoAppCli.dispatcher.trigger('tab:toggle:browse');
	}
});