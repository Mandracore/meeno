var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TabContentView = Backbone.View.extend({

	tagName  :  'div',
	className:  'tab object note',
	template : _.template( $('#tab-content-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .close'          : 'quit',
		'keydown .edit-content': 'keyPressProxy',
		'keypress .edit-title'  : 'save',
		'blur .edit-content'    : 'save',
		'blur .edit-title'      : 'save'
	},

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quitSub, this);
		// this.$el.on("keyup", { view: this}, this.keyPressProxy);
		// $("button").on("click", { name: "Karl" }, greet);
	},

	// Renders the tab-content item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	keyPressProxy: function ( event ) {

		this.save();
		// console.log("keyCode="+event.keyCode)

		
		var $caretsNode = $(getCaretsNode());

		if ($caretsNode.parent().hasClass('object')) {
			console.log ($caretsNode);
			console.log ('go proxy...')
		// If we are already in an html node related to an object
			meenoAppCli.dispatcher.trigger('tab:object:' + $caretsNode.parent().attr('id'), event);
			return;
		} else {
		// We are not already inside an Object
			if (event.keyCode == 51) {
			// The user wants to insert a tag
				event.preventDefault();
				return this.newTask();
			}
			// The user is just typing some text
		}
	},

	newTask: function () {
		console.log('New tag');
		var id = makeid();
		pasteHtmlAtCaret(
			"<span class='object tag' id='"+id+"'>"
				+"<span class='icon'></span>"
				+"<span class='body'>&nbsp;</span>"
			+"</span>"
			+"<span class='void'>&nbsp;</span>");
		var newTag     = new meenoAppCli.Classes.Tag();
		var newTagView = new meenoAppCli.Classes.TagRefView({ 
			model: newTag,
			el: $("#"+id), // We bind the sub view to the element we just created
			sound: this.options.sound // This sub view will also listen to the same sound (for exiting in particular)
		});// el: $("#nav .help")
	},

	save: function() {
		this.model.set({
			title  :this.$(".edit-title").html(),
			content:this.$(".edit-content").html()
		}).save({},{
			success: function() {
				// console.log('successfully saved');
			},
			error  : function() {
				console.log('saving failed');
			}
		});
	},

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
		this.$el.off("keyup",this.keyPressProxy)
		this.remove();
	},

	quit: function() {
		meenoAppCli.dispatcher.trigger('tab:quit:'+this.options.sound);
		meenoAppCli.dispatcher.trigger('tab:toggle:browse');
	}
});