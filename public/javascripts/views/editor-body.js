var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorBodyView = Backbone.View.extend({

	tagName           : 'div',
	className         : 'tab object note',
	template          : '#editor-body-template',
	numberOfEdit      : 0,
	limitNumberOfEdit : 5,

	// The DOM events specific to an item.
	events: {
		'click .close'         : 'delegatedKill',
		'click .delete'        : 'delete',
		'click .clone'         : 'clone',
		'keypress'             : 'trySave',
		'blur .edit-content'   : 'save',
		'blur .edit-title'     : 'save'
	},

	initialize: function() {
		Backbone.View.prototype.initialize.apply(this, arguments);
	},

	delegatedKill: function() {
		this.save();
		this.options.parent.kill();
	},

	delete: function() {
		this.model.destroy({
			success: function() {console.log("Object successfully deleted.");},
			error  : function() {console.log("Deleting failed.");}
		});
		this.options.parent.kill();
	},

	clone: function() {
		this.save();
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

	newTag: function () {
		console.log('>>> New tag');
		var id     = makeid();
		var newTag = new meenoAppCli.Classes.Tag();
		var newTagView = new meenoAppCli.Classes.TagRefView({
			id: id,
			model: newTag,
			sound: this.options.sound, // This sub view will also listen to the same sound (for exiting in particular)
			isNew: true,
			note: this.model, // Has to be refined to diminish memory consumtion
			parent: this
		});
		newTagView.undelegateEvents();
		var newTagHtml = $("<div></div>").append(newTagView.render().el).html();
		pasteHtmlAtCaret(
			newTagHtml + // The tag itself with a trick to get its html back
			"<span class='void'>&nbsp;</span>" // A place to put the caret
		);
		newTagView.$el = $("#"+id); // Linking the DOM to the view
		newTagView.delegateEvents(); // Binding all events
		newTagView.$(".body").focus(); // Focusing on input
		this.save();
		return false;
	},

	newTask: function () {
		console.log('>>> New task');
		// Don't do anything for now
		this.save();
		return false;
	},

	newEntity: function () {
		console.log('>>> New person');
		// Don't do anything for now
		this.save();
		return false;
	},

	trySave: function() {
		this.numberOfEdit++;
		if(this.numberOfEdit == this.limitNumberOfEdit){
			this.save();
			this.numberOfEdit=0;
		}
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

_.extend(meenoAppCli.Classes.EditorBodyView.prototype, meenoAppCli.l18n.EditorBodyView);