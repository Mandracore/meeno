define ([
		'jquery',
		'jquery.dateFormat',
		'underscore',
		'backbone',
		'lib/tools',
		'temp',
		'channel',
		'views/editor-object',
	], function ($, $, _, Backbone, tools, temp, channel, EditorObjectView) {

		/**
		 * This backbone view holds the body of a note editor (where the note is actually rendered)
		 * 
		 * @class EditorBodyView
		 * @extends Backbone.View
		 */
		var EditorBodyView = Backbone.View.extend({

			tagName          : 'div',
			className        : 'editor object note',
			template         : '#editor-body-template',
			numberOfEdit     : 0,
			limitNumberOfEdit: 5,

			// The DOM events specific to an item.
			events: {
				'click .close'       : 'close',
				'click .minimize'    : 'minimize',
				'click .title'       : 'show',
				'click .delete'      : 'delete',
				'click .clone'       : 'clone',
				'keypress'           : 'trySave',
				'blur .edit-content' : 'save',
				'blur .edit-title'   : 'save'
			},

			//=================================================
			// V2 FUNC
			//=================================================
			/**
			 * The user wants to open a note editor :
			 * 1. Deploy #editors
			 * 2. Ensure this note editor is in front of the others
			 *
			 * @method initialize
			 */
			initialize: function(options) {
				//this.options = options;
				//Backbone.View.prototype.initialize.apply(this, arguments);
				this.children = [];

				this.listenTo(channel, 'keyboard:tag', function () {this.newObject("tag");});
				this.listenTo(channel, 'keyboard:task', function () {this.newObject("task");});
				this.listenTo(channel, 'keyboard:entity', function () {this.newObject("entity");});
			},

			render: function() {
				// Renders the tab-content item to the current state of the model
				var self             = this;
				var data             = this.model.toJSON();
				var hTemplate        = $(this.template).html();
				var compiledTemplate = _.template(hTemplate);
				this.$el.html( compiledTemplate(data) );

				// Activating sub-views of embedded objects like tags, notes,...
				this.$(".object").each(function (index, object) {
					var $object    = $(object);
					var subView    = {};
					var modelClass = $object.hasClass('tag') ? "tag" : "task";
					var model      = temp.coll[modelClass+"s"].get($object.attr('data-model-id'));

					if (model) {
						subView  = new EditorObjectView({
							model     : model,
							modelClass: modelClass,
							el        : $object[0], // We bind the sub view to the element we just created
							note      : self.model,
							parent    : self,
							parentDOM : self.$("section.edit-content"),
						});
						self.children.push (subView);
					} else {
						$object.addClass('broken');
					}
				});
				return this;
			},

			/**
			 * The user wants to see a note already opened (inserted in #editors). We should only :
			 * 1. Deploy #editors
			 * 2. Ensure this note editor is in front of the others if it's not the case
			 *
			 * @method show
			 */
			show: function() {
				var $editors = this.$el.parent();
				var $editor  = this.$el.detach(); // Detach from DOM without removing attached jQuery objects and properties
				$editor.appendTo($editors); // insert to the end
				$editors.addClass('visible',500); // maximize the #editors
				//$editors.removeClass('hidden',500); // maximize the #editors
			},

			/**
			 * The user wants to maximize the #editors wrapper and show
			 *
			 * @method minimize
			 */
			minimize: function() {
				var $editors = this.$el.parent();
				$editors.removeClass("visible", 1000, "easeOutExpo");
			},

			/**
			 * The user wants to close a note already opened. We should only :
			 * 1. Remove the editor from #editors
			 * 2. If #editors is now empty, close it (delegated to {{#crossLink "updateEditorsClass:method"}}{{/crossLink}}.)
			 *
			 * @method close
			 */
			close: function() {
				var $editors = this.$el.parent();

				$editors.removeClass("visible", 1000);
				//$editors.switchClass("visible", "hidden", 1000);

				this.$el.remove(); // Remove from DOM
				this.model.set('isOpened',false);
				this.updateEditorsClass(); // update the class of the editors' wrapper
				_.map (this.children, function(child) {return child.kill();}); // destroy objects in editor (mainly tasks)
				this.kill (); // destroy the view
			},

			/**
			 * This method should update the class of #editors in the following cases :
			 * 1. a new editor is opened
			 * 2. a opened editor is closed
			 * This allows to apply the correct styling to the editors' wrapper. Also, the editors's wrapper
			 * should be automatically minimized (which means apply the class `hidden`) when it's empty
			 * 
			 * @method updateEditorsClass
			 */
			updateEditorsClass: function (callback) {
				var $editors             = this.$el.parent();
				var editorsChildrenCount = $editors.children().length;
				var editorsClass         = "children-count-" + editorsChildrenCount;

				// Testing
				$editors.removeClass("children-count-0");
				$editors.removeClass("children-count-1");
				$editors.removeClass("children-count-2");
				$editors.removeClass("children-count-3");
				$editors.removeClass("children-count-4");
				$editors.removeClass("children-count-5");
				$editors.addClass(editorsClass, 100, "easeOutExpo", callback());
			},



			/*
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
				mee.Notes.add(cloneModel);
				var newEditor = new EditorView ({ model: cloneModel });
				newEditor.toggle();
			},


			checkFocus: function () {
				var $caretsNode = $(tools.getCaretsNode());
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

				var newView = new EditorObjectView({
					note      : this.model,
					parent    : this,
					modelClass: className
				});

				newView.undelegateEvents();
				var newHtml = $("<div></div>").append(newView.render().el).html();
				tools.pasteHtmlAtCaret(
					newHtml + // The tag itself with a trick to get its html back
					"<span class='void'>&nbsp;</span>" // A place to put the caret
				);
				newView.$el = $("#" + newView.options.id); // Linking the DOM to the view
				newView.delegateEvents(); // Binding all events
				newView.options.parentDOM = this.$("section.edit-content");
				newView.$(".body").focus(); // Focusing on input
				this.children.push (newView);
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
			}*/
		});

		//_.extend(EditorBodyView.prototype, mee.l18n.EditorBodyView);
		return EditorBodyView;
	}
);

