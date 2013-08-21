var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorBodyView = Backbone.View.extend({

	tagName   : 'div',
	className : 'tab object note',
	template  : '#editor-body-template',

	// The DOM events specific to an item.
	events: {
		'click .kill'           : 'delegatedKill',
		'click .delete'         : 'delete',
		'click .clone'          : 'clone',
		'keyup .edit-content'   : 'keyProxy',
		'keydown .edit-content' : 'keyProxy',
		'keypress .edit-title'  : 'save',
		'blur .edit-content'    : 'save',
		'blur .edit-title'      : 'save'
	},

	initialize: function() {},

	delegatedKill: function() {
		this.options.parent.kill();
	},

	delete: function() {
		this.model.destroy({
			success: function() {console.log("Object successfully deleted.")},
			error  : function() {console.log("Deleting failed.")}
		});
		this.options.parent.kill();
	},

	clone: function() {
		var cloneModel = this.model.clone();
		meenoAppCli.Notes.add(cloneModel);
		var newEditor = new meenoAppCli.Classes.EditorView ({ model: cloneModel });
		newEditor.toggle();
	},

	render: function() {
		// Renders the tab-content item to the current state of the model
		var templateFn = _.template( $(this.template).html() );
		this.$el.html( templateFn( this.model.toJSON() ) );
		var view = this;

		// Activating sub-views of embedded objects like tags, notes,...
		this.$(".object").each(function (index, object) {
			var $object = $(object);
			if ($object.hasClass('tag')) {
				var model = meenoAppCli.tags.get($object.attr('data-model-id'));
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
				return this.newTag();
			}
			// The user is just typing some text
		}
	},

	newTag: function () {
		console.log('>>> New tag');
		var id     = makeid();
		var newTag = new meenoAppCli.Classes.Tag();
		var newTagView = new meenoAppCli.Classes.TagRefView({ 
			id: id,
			model: newTag,
			sound: this.options.sound, // This sub view will also listen to the same sound (for exiting in particular)
			isNew: true,
			note: this.model // Has to be refined to diminish memory consumtion
		});
		var newTagHtml = $("<div></div>").append(newTagView.render().$el).html();
		pasteHtmlAtCaret(
			newTagHtml + // The tag itself with a trick to get its html back
			"<span class='void'>&nbsp;</span>" // A place to put the caret
		);
		newTagView.$el = $("#"+id); // Linking the DOM to the view
		newTagView.$(".body").focus(); // Focusing on input
	},

	save: function() {
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
	},

	toggle: function() {
		// First, deactivate the other tabs' content
		$("#tabs").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	}
});