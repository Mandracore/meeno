var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TabContentView = Backbone.View.extend({

	tagName          :  'div',
	className        :  'tab object note',
	template         : _.template( $('#tab-content-template').html() ),
	numberOfEdit     :  0,
	limitNumberOfEdit:  5,

	// The DOM events specific to an item.
	events: {
		'click .close'         : 'quit',
		'keyup .edit-content'  : 'save',
		'keypress .edit-title' : 'save',
		'blur .edit-content'   : 'save',
		'blur .edit-title'     : 'save'
	},

    keyboardEvents: {
        '#': 'newTag',
        'ctrl+alt+t': 'newTask',
        't t t': 'newTask',
        '@': 'newPerson'
    },

	initialize: function() {
		Backbone.View.prototype.initialize.apply(this, arguments);
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quitSub, this);
	},

	beforeKill: function() {
		// External listeners have to be removed in order to destroy last reference to the view and allow Garbage collecting
		meenoAppCli.dispatcher.off('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.off('tab:quit:' + this.options.sound, this.quitSub, this);
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

	keyProxy: function (event) {
		var $caretsNode = $(getCaretsNode());

		if ($caretsNode.parent().hasClass('object')) {
		// If we are already in an html node related to an object, we dispatch the event to the right sub-view
			meenoAppCli.dispatcher.trigger('tab:object:key:' + $caretsNode.parent().attr('id'), event);
			return false;
		} else {
		// We are not already inside an Object
			return true;
		}
	},

	newTag: function ( event ) {
		if(this.keyProxy(event)){
			console.log('New tag');
			var id     = makeid();
			var newTag = new meenoAppCli.Classes.Tag();

			pasteHtmlAtCaret(
				"<span class='object tag icon-tag' id='"+id+"'>"
					+"<label class='datalist-wrapper'>"
						+"<datalist id='datalist_"+id+"' class='datalist'>"
						+"</datalist>"
					+	"<input class='body' type='text' name='datalist_"+id+"' list='datalist_"+id+"'>"
					+"</label>"
				+"</span>"
				+"<span class='void'>&nbsp;</span>");
			var newTagView = new meenoAppCli.Classes.TagRefView({
				model: newTag,
				el: $("#"+id), // We bind the sub view to the element we just created
				sound: this.options.sound, // This sub view will also listen to the same sound (for exiting in particular)
				isNew: true,
				note: this.model
			});
			this.save();
			return false;
		}
	},

	newTask: function ( event ) {
		if(this.keyProxy(event)){
			console.log('New task');
			// Don't do anything for now
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				// internet explorer
				event.returnValue = false;
			}
			this.save();
		}
	},

	newPerson: function ( event ) {
		if(this.keyProxy(event)){
			console.log('New person');
			// Don't do anything for now
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				// internet explorer
				event.returnValue = false;
			}
			this.save();
		}
	},

	save: function() {
		if(this.keyProxy()){
			this.numberOfEdit++;
			if(this.numberOfEdit==this.limitNumberOfEdit){
				this.model.set({
					title  :this.$(".edit-title").html(),
					content:this.$(".edit-content").html()
				}).save({},{
					success: function() {
						console.log('successfully saved');
					},
					error  : function() {
						console.log('Saving note modifications failed');
					}
				});
				this.numberOfEdit=0;
			}
		}
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