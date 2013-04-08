var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TabContentView = Backbone.View.extend({

	tagName  :  'div',
	className:  'tab object note',
	template : _.template( $('#tab-content-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .close'         : 'quit',
		'keyup .edit-content': 'keyProxy',
		'keydown .edit-content': 'keyProxy',
		'keypress .edit-title' : 'save',
		'blur .edit-content'   : 'save',
		'blur .edit-title'     : 'save'
	},

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quitSub, this);
		meenoAppCli.dispatcher.on('note:link:object:' + this.options.sound, this.linkObject, this);
	},

	linkObject: function (parameters) {
		if (parameters.type == "tag") {
			this.model.add('tags', parameters.model);
			this.model.save();
			console.log('Tag linked to current note');
		}
	},

	render: function() {
		// Renders the tab-content item to the current state of the model
		this.$el.html( this.template( this.model.toJSON() ) );
		var view = this;

		// Activating sub-views of embedded objects like tags, notes,...
		this.$(".object").each(function (index, object) {
			var $object = $(object);
			if ($object.hasClass('tag')) {
				var model = meenoAppCli.Tags.get($object.attr('data-model-id'));
				if (model) {
					var subView  = new meenoAppCli.Classes.TagRefView({ 
						model: model,
						el   : $object[0], // We bind the sub view to the element we just created
						sound: view.options.sound, // This sub view will also listen to the same sound (for exiting in particular)
						isNew: false
					});
				} else {
					$object.addClass('broken');
				}
			}
		});
		return this;
	},

	keyProxy: function ( event ) {
		// console.log(event)
		// console.log("keyCode="+event.keyCode)

		if (event.type == "keyup") {
			this.save();
		}
	
		var $caretsNode = $(getCaretsNode());

		if ($caretsNode.parent().hasClass('object')) {
		// If we are already in an html node related to an object, we dispatch the event to the right sub-view
			meenoAppCli.dispatcher.trigger('tab:object:key:' + $caretsNode.parent().attr('id'), event);
			return;
		} else {
		// We are not already inside an Object
			if (event.keyCode == 51 && event.type == "keydown") {
			// The user wants to insert a tag
				event.preventDefault();
				return this.newTask();
			}
			// The user is just typing some text
		}
	},

	newTask: function () {
		console.log('New tag');
		var id     = makeid();
		var newTag = new meenoAppCli.Classes.Tag();
		pasteHtmlAtCaret(
			"<span class='object tag icon-tag' id='"+id+"'>"
				+"<span class='icon'></span>"
				+"<label>"
					+"<datalist id='datalist_"+id+"' class='datalist'>"
						+"<option value='Blackberry'>Blackberry</option>"
					+"</datalist>"
				+	"<input class='body' type='text' name='datalist_"+id+"' list='datalist_"+id+"'>"
				+"</label>"
			+"</span>"
			+"<span class='void'>&nbsp;</span>");
		var newTagView = new meenoAppCli.Classes.TagRefView({ 
			model: newTag,
			el: $("#"+id), // We bind the sub view to the element we just created
			sound: this.options.sound, // This sub view will also listen to the same sound (for exiting in particular)
			isNew: true
		});
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
		this.remove();
	},

	quit: function() {
		meenoAppCli.dispatcher.trigger('tab:quit:'+this.options.sound); // Will be heard by this view and its sub views
		meenoAppCli.dispatcher.trigger('tab:toggle:browse');
	}
});