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
		this.children = [];

		this.listenTo(meenoAppCli.dispatcher, 'keyboard:tag', function () {this.newObject("tag");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:task', function () {this.newObject("task");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:entity', function () {this.newObject("entity");});
	},

	delegatedKill: function() {
		this.save();
		_.map (this.children, function(child) {return child.kill();});
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
		var self = this;

		// Activating sub-views of embedded objects like tags, notes,...
		this.$(".object").each(function (index, object) {
			var $object = $(object);
			var subView = {};
			var model = {};
			if ($object.hasClass('tag')) {
				model = meenoAppCli.tags.get($object.attr('data-model-id'));
				if (model) {
					subView  = new meenoAppCli.Classes.EditorBodyTagView({
						model     : model,
						el        : $object[0], // We bind the sub view to the element we just created
						note      : self.model,
						parent    : self,
						parentDOM : self.$("section.edit-content")
					});
					self.children.push (subView);
				} else {
					$object.addClass('broken');
				}
			}
			if ($object.hasClass('task')) {
				model = meenoAppCli.tasks.get($object.attr('data-model-id'));
				if (model) {
					subView  = new meenoAppCli.Classes.EditorBodyTaskView({
						model     : model,
						el        : $object[0], // We bind the sub view to the element we just created
						note      : self.model,
						parent    : self,
						parentDOM : self.$("section.edit-content")
					});
					self.children.push (subView);
				} else {
					$object.addClass('broken');
				}
			}
		});
		return this;
	},

	checkFocus: function () {
		var $caretsNode = $(getCaretsNode());
		if (
			!($caretsNode.hasClass("edit-content")) && 
			$caretsNode.parents("section.edit-content").length === 0) {
			console.log('Editor not focused');
			return false;
		} else {
			return true;
		}
	},


	newObject: function (className) {
		if (!this.checkFocus()) {return;} // No action if no focus in the editor
		console.log('>>> New '+className);

		switch (className) {
			case "tag":
				var newTagView = new meenoAppCli.Classes.EditorBodyTagView({
					note   : this.model,
					parent : this
				});
				newTagView.undelegateEvents();
				var newTagHtml = $("<div></div>").append(newTagView.render().el).html();
				pasteHtmlAtCaret(
					newTagHtml + // The tag itself with a trick to get its html back
					"<span class='void'>&nbsp;</span>" // A place to put the caret
				);
				newTagView.$el = $("#" + newTagView.options.id); // Linking the DOM to the view
				newTagView.delegateEvents(); // Binding all events
				newTagView.options.parentDOM = this.$("section.edit-content");
				newTagView.$(".body").focus(); // Focusing on input
				this.children.push (newTagView);
				this.save();
			break;
			case "task":
				var newTaskView = new meenoAppCli.Classes.EditorBodyTaskView({
					note   : this.model,
					parent : this
				});
				console.log('>>> New task DONE');
				newTaskView.undelegateEvents();
				var newTaskHtml = $("<div></div>").append(newTaskView.render().el).html();
				pasteHtmlAtCaret(
					newTaskHtml + // The tag itself with a trick to get its html back
					"<span class='void'>&nbsp;</span>" // A place to put the caret
				);
				newTaskView.$el = $("#" + newTaskView.options.id); // Linking the DOM to the view
				newTaskView.delegateEvents(); // Binding all events
				newTaskView.options.parentDOM = this.$("section.edit-content");
				newTaskView.$(".body").focus(); // Focusing on input
				this.children.push (newTaskView);
				this.save();
			break;
			case "entity":
				// Don't do anything for now
				this.save();
			break;
		}
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
				console.log('Note successfully saved');
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

//_.extend(meenoAppCli.Classes.EditorBodyView.prototype, meenoAppCli.l18n.EditorBodyView);
