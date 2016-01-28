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
			className        : 'editor',
			template         : '#editor-body-template',
			numberOfEdit     : 0,
			limitNumberOfEdit: 5,

			// The DOM events specific to an item.
			events: {
				'click .header .close'      : 'close',
				'click .text-editor button' : 'textEditor',


				// 'click .title'      : 'show',
				// 'click .delete'        : 'delete',
				// 'click .clone'         : 'clone',
				// 'keypress'             : 'trySave',
				// 'blur .edit-content'   : 'save',
				// 'blur .edit-title'     : 'save'
			},

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
				var self = this;
				this.children = [];

				this.lastSave = new Date();

				this.listenTo(channel, 'keyboard:tag', function () {this.newObject("tag");});
				this.listenTo(channel, 'keyboard:task', function () {this.newObject("task");});
				this.listenTo(channel, 'keyboard:entity', function () {this.newObject("entity");});
				this.listenTo(channel, 'editors:close:' + this.model.cid , function () {this.close();});
			},

			render: function() {
				// Renders the tab-content item to the current state of the model
				var self             = this;
				var data             = this.model.toJSON();
				var hTemplate        = $(this.template).html();
				var compiledTemplate = _.template(hTemplate);
				this.$el.html( compiledTemplate(data) );
				this.$el.attr('data-cid',this.model.cid);

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

				// Render a tab to control editor display
				var $tab = $("<li data-cid='"+this.model.cid+"'><span class='close fa fa-remove'></span><span class='open'>"+this.model.get('title')+"</span></li>");
				$("#editors-tabs").prepend($tab);

				// Listen to any change (copy/paste, keypress,...) in the two parts of the note
				this.$('.body .content').on('input', function() { 
					self.saveTry();
				});

				// Generate ToC
				this.tocRebuild();

				return this;
			},

			/**
			 * The user wants to close a note already opened. We should only :
			 * 1. Remove the editors' tab from the DOM
			 * 2. Remove the editor itself from the DOM
			 * Other actions are handled by {{#crossLink "MainView:class"}}{{/crossLink}} itself.
			 *
			 * @method close
			 */
			close: function() {
				this.save();

				// 1. Destroy the tab
				$('#editors-tabs li[data-cid=' + this.model.cid + ']').remove();
				// 2. Display the browser
				$('#nav .browse').eq(0).click();
				// 3. Destroy the editor itself along with its subviews
				this.model.set('isOpened',false);
				_.map (this.children, function(child) {return child.kill();}); // destroy objects in editor (mainly tasks)
				this.$el.remove();
				this.kill();
			},

			/**
			 * Simple method to trigger note saving when necessary
			 * 
			 * @method saveTry
			 */
			saveTry: function() {
				if((new Date()) - this.lastSave > 2000) {
					this.save();
					this.tocRebuild();
				}
			},

			/**
			 * To update the model following the content of the contenteditables
			 * 
			 * @method save
			 */
			save: function() {
				this.lastSave = new Date();
				this.model.set({
					content     :this.$(".left .content").html(),
					content_sec :this.$(".right .content").html()
				}).save({},{
					success: function() {
						console.log('Note successfully saved');
					},
					error  : function() {
						console.log('Saving note modifications failed');
					}
				});
			},

			/**
			 * All functions required to provide simple WYSIWYG text edition
			 * 
			 * @method textEditor
			 */
			textEditor: function(event) {
				var action = $(event.target).attr('data-action');
				switch (action) {
					case "header":
						var nodeType = window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.nodeName;
						// This will allow to switch header styles from H1 to H4
						switch (nodeType) {
							case "H1":
								document.execCommand('formatBlock',false,'<h2>');
								break;
							case "H2":
								document.execCommand('formatBlock',false,'<h3>');
								break;
							case "H3":
								document.execCommand('formatBlock',false,'<h4>');
								break;
							case "H4":
								document.execCommand('formatBlock',false,'<p>');
								break;
							default:
								document.execCommand('formatBlock',false,'<h1>');
								break;
						}
						break;
					case "list":
						document.execCommand('insertUnorderedList');
						break;
				}
			},

			/**
			 * Browse the content of each parts of the editor to build a dynamic table of contents
			 * 
			 * @method tocRebuild
			 */
			tocRebuild: function() {
				var $headers = this.$(".body .content h1");
				var bRebuild = false;
				var sToC = {
					left  : "",
					right : "",
				};
				var count = {
					left  : 0,
					right : 0,
				};
				var $ToC = {
					left  : this.$(".left .summary ul"),
					right : this.$(".right .summary ul"),
				};


				$headers.each(function() {
					var $h1 = $(this);
					// 1. Provide to each header a unique ID (if not done already)
					if (!$h1.attr("id")) {
						$h1.attr("id", (new Date()).getTime());
					}

					var anchor = $h1.attr("id");
					var title = $h1.text();

					if ($h1.closest(".column").hasClass("left")) {
						count.left++;
						sToC.left += "<li><a href='#"+$h1.attr("id")+"' title='"+$h1.text()+"'>"+count.left+"</a></li>";
						if ($ToC.left.find("li[data-anchor=" + anchor + "]").length == 0) {
							bRebuild = true;
						}
					} else {
						count.right++;
						sToC.right += "<li><a href='#"+$h1.attr("id")+"' title='"+$h1.text()+"'>"+count.right+"</a></li>";
						if ($ToC.right.find("li[data-anchor=" + anchor + "]").length == 0) {
							bRebuild = true;
						}
					}

				});
				// 2. Update the summary if necessary
				if (bRebuild) {
					$ToC.left.html(sToC.left);
					$ToC.right.html(sToC.right);
				}
				// var $ToC = $h1.closest(".summary ul");
			},

			newObject: function (className) {

				var $focused = $(document.activeElement); // most efficient way to retrieve currently focus element
				if ($focused.hasClass('content')) { return; } // No action if no focus in the editor

				console.log('>>> New '+className);

				var newView = new EditorObjectView({
					note      : this.model,
					parent    : this,
					modelClass: className
				});

				newView.undelegateEvents();

				switch (className) {
					case "tag":
						var hObject = '<div class="tag" contenteditable="false"><input placeholder="Name your tag here"></div>';
						break;
					case "task":
						var hObject = '<div class="task" contenteditable="false">'+
							'<div class="fa fa-tasks"></div>'+
							'<input placeholder="Describe here your task">'+
						'</div>';
						break;
				}

				var $object = $(hObject);

				tools.pasteHtmlAtCaret(hObject);

				// var newHtml = $("<div></div>").append(newView.render().el).html();
				// tools.pasteHtmlAtCaret(
				// 	newHtml + // The tag itself with a trick to get its html back
				// 	"<span class='void'>&nbsp;</span>" // A place to put the caret
				// );
				// newView.$el = $("#" + newView.options.id); // Linking the DOM to the view
				// newView.delegateEvents(); // Binding all events
				// newView.options.parentDOM = this.$("section.edit-content");
				// newView.$(".body").focus(); // Focusing on input
				// this.children.push (newView);
				// this.save();

				return false;
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
			// updateEditorsClass: function (callback) {
			// 	var $editors             = this.$el.parent();
			// 	var editorsChildrenCount = $editors.children().length;
			// 	var editorsClass         = "children-count-" + editorsChildrenCount;

			// 	// Testing
			// 	$editors.removeClass("children-count-0");
			// 	$editors.removeClass("children-count-1");
			// 	$editors.removeClass("children-count-2");
			// 	$editors.removeClass("children-count-3");
			// 	$editors.removeClass("children-count-4");
			// 	$editors.removeClass("children-count-5");
			// 	$editors.addClass(editorsClass, 100, "easeOutExpo", callback());
			// },


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

