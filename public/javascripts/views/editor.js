define ([
		'jquery',
		'jquery.dateFormat',
		'jquery.finger',
		'underscore',
		'backbone',
		'lib/tools',
		'temp',
		'channel',
		'models/tag',
		'models/task',
		'models/filter',
	], function ($, $, $, _, Backbone, tools, temp, channel, Tag, Task, Filter) {

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
				'blur input'                : 'objectInputDestroy',
				'click .content .tag'       : 'objectUnLink',
				'click .content .task'      : 'objectUnLink',

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
				// this.children = [];

				this.lastSave = new Date();

				this.listenTo(channel, 'keyboard:list-outdent', function () {this.textEditor("list-outdent");});
				this.listenTo(channel, 'keyboard:list-indent', function () {this.textEditor("list-indent");});
				this.listenTo(channel, 'keyboard:tag', function () {this.textEditor("tag");});
				this.listenTo(channel, 'keyboard:task', function () {this.textEditor("task");});
				this.listenTo(channel, 'keyboard:entity', function () {this.textEditor("entity");});
				this.listenTo(channel, 'keyboard:header', function () {this.textEditor("header");});
				this.listenTo(channel, 'keyboard:enter', function () {this.kbEventProxy("enter");});
				this.listenTo(channel, 'keyboard:escape', function () {this.kbEventProxy("escape");});

				this.listenTo(channel, 'editors:close:' + this.model.cid , function () {this.close();});
				
				// Listeners allowing to automatically update note content in case the embedded objects change
				this.listenTo(temp.coll.tags, 'delete change:label change:color', function () { this.objectsRepaint(); });
				this.listenTo(temp.coll.tasks, 'delete change:label', function () { this.objectsRepaint(); });
			},

			render: function() {
				// Renders the tab-content item to the current state of the model
				var self             = this;
				var data             = this.model.toJSON();
				var hTemplate        = $(this.template).html();
				var compiledTemplate = _.template(hTemplate);
				this.$el.html( compiledTemplate(data) );
				this.$el.attr('data-cid',this.model.cid);

				// Render a tab to control editor display
				var $tab = $("<li data-cid='"+this.model.cid+"'><span class='close fa fa-remove'></span><span class='open'>"+this.model.get('title')+"</span></li>");
				$("#editors-tabs").prepend($tab);

				// Listen to any change (copy/paste, keypress,...) in the two parts of the note
				this.$('.body .content').on('input', function() { 
					self.saveTry();
				});

				// Generate ToC
				this.tocRebuild();

				// Generate ToC
				this.objectsRepaint();

				this.$(".body").on('flick', function(e) {
					var $body = $(this);

					if (e.orientation == "horizontal") {
						var way = (e.dx > 0) ? "left" : "right";
						if (way == "right") {
							if ($body.hasClass("swiped")) { return; }
							$body.addClass('swiped');
						} else {
							if (!($body.hasClass("swiped"))) { return; }
							$body.removeClass('swiped');
						}
					}
				});


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
					success: function() {},
					error  : function() {
						console.log('Saving note modifications failed');
					}
				});
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

			/**
			 * All functions required to provide simple WYSIWYG text edition
			 * 
			 * @method textEditor
			 */
			textEditor: function (event) {
				// event can come from :
				// 1. Click : we use $(event.target).attr('data-action') to know which action to do
				// 2. Keypress : we use directly event, which should be a simple string
				var action     = !event.target ? event : $(event.target).attr('data-action');
				var fromButton = (event.target != undefined);

				switch (action) {
					case "header":
						if (!fromButton) {
							document.execCommand("delete", null, false); // to remove last character like ! !
						}
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
						this.tocRebuild();
						this.save();
						break;
					case "list-indent": // Not in use for now
						var nodeType = window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.nodeName;
						console.log(nodeType)
						if (nodeType == "LI") {
							document.execCommand('indent');
							console.log('indent');
						} else {
							document.execCommand('insertOrderedList');
							console.log('insert list');
						}
						break;
					case "list-outdent": // Not in use for now
						console.log('outdent');
						document.execCommand('outdent');
						break;
					case "task":
						this.objectInsert("task", fromButton);
						break;
					case "tag":
						this.objectInsert("tag", fromButton);
						break;
				}
			},

			/**
			 * All functions required to provide simple WYSIWYG text edition
			 * 
			 * @method textEditor
			 */
			// textEditor: function(event) {
			// 	var action = $(event.target).attr('data-action');
			// 	switch (action) {
			// 		case "header":
			// 			var nodeType = window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.nodeName;
			// 			// This will allow to switch header styles from H1 to H4
			// 			switch (nodeType) {
			// 				case "H1":
			// 					document.execCommand('formatBlock',false,'<h2>');
			// 					break;
			// 				case "H2":
			// 					document.execCommand('formatBlock',false,'<h3>');
			// 					break;
			// 				case "H3":
			// 					document.execCommand('formatBlock',false,'<h4>');
			// 					break;
			// 				case "H4":
			// 					document.execCommand('formatBlock',false,'<p>');
			// 					break;
			// 				default:
			// 					document.execCommand('formatBlock',false,'<h1>');
			// 					break;
			// 			}
			// 			break;
			// 		case "list": // Not in use for now
			// 			document.execCommand('insertUnorderedList');
			// 			break;
			// 		case "task":
			// 			this.objectInsert("task", true);
			// 			break;
			// 		case "tag":
			// 			this.objectInsert("tag", true);
			// 			break;
			// 	}
			// },


			/**
			 * Insert a new object (tag, task,...) into the note content. Will just insert a form into the editor at the
			 * caret's position
			 * 
			 * @method objectInsert
			 */
			objectInsert: function (className, fromButton) {
				if (!fromButton) { // To distinguish between the two trigger cases (through keypress or through click)
					document.execCommand("delete", null, false); // to remove last character like ##
					var $focused = $(document.activeElement); // most efficient way to retrieve currently focus element
					if (!$focused.hasClass('content')) { return; } // No action if no focus in the editor (no need to check that if the trigger is not the keyboard)
				}

				var iObjectID = (new Date()).getTime();

				switch (className) {
					case "tag":
						var hObject = '<div class="tag object" id ="' + iObjectID +'" contenteditable="true">'+
							'<div class="circle"></div>'+
							'<input class="mousetrap noteEditor" placeholder="Name your tag here">'+
						'</div>';
						break;
					case "task":
						var hObject = '<div class="task object" id ="' + iObjectID +'" contenteditable="true">'+
							'<div class="fa fa-tasks"></div>'+
							'<input class="mousetrap noteEditor" placeholder="Describe here your task">'+
						'</div>';
						break;
				}


				tools.pasteHtmlAtCaret(hObject); // Insert the object where the caret stands
				var $objectInput = this.$('#'+iObjectID+' input');

				$objectInput.focus(); // Put the focus into the input so that the user can name the object

				if (className == "tag") {
					this.objectAutocompleteInit($objectInput);
				}

				return false;
			},

			/**
			 * Will provide an autocomplete widget for the objects requiring it (like tags)
			 * 
			 * @method objectAutocompleteInit
			 */
			objectAutocompleteInit: function ($input) {

				var self = this;
				$input.autocomplete({
					source: function (request, response) {
						// request.term : data typed in by the user ("new yor")
						// response : native callback that must be called with the data to suggest to the user
						var tagFilter = new Filter.Tag ({text: request.term});
						response (
							temp.coll.tags.search(tagFilter).map(function (model, key, list) {
								return {
									label: model.get("label"),
									value: model.cid
								};
							})
						);
					},
					focus: function(event, ui) {
						$input.val(ui.item.label);
						return false; // to cancel normal behaviour
					},
					select: function(event, ui) {
						var objectModel = temp.coll.tags.get(ui.item.value) // ui.item.value == model.cid
						self.objectLink($input, objectModel, "tag");
						return false;
					}
				});
				return false;
			},

			/**
			 * Once the object has been created or just linked to the current note,
			 * We update the DOM to show the user that the job is done
			 * 
			 * @method objectFreeze
			 */
			objectFreeze: function ($input, objectModelCid, objectModelId, objectModelColor) {
				var $parent = $input.parent();
				var sParentNewHtml = "";
				
				if ($parent.hasClass('task')) {
					sParentNewHtml += '<div class="fa fa-tasks"></div>';
				} else {
					sParentNewHtml += '<div class="circle" style="background-color: '+objectModelColor+';"></div>';
				}

				sParentNewHtml += '<span class="label">' + $input.val() + '</span>';

				$input.remove();
				$parent.html(sParentNewHtml);
				$parent.attr('contenteditable',false); // To prevent the user from editing the object once linked
				$parent.attr('data-cid',objectModelCid);
				$parent.attr('data-model-id',objectModelId);
				$parent.closest('.content').focus();
			},

			/**
			 * A proxy to handle ENTER/ESCAPE keyboard events :
			 * 1. To cancel object creation
			 * 2. To submit new object or to link existing object 
			 * 
			 * @method kbEventProxy
			 */
			kbEventProxy: function (event) {
				var $focused = $(document.activeElement); // most efficient way to retrieve currently focus element

				if (($focused.prop("tagName") != "INPUT") || !$focused.hasClass('noteEditor')) { return; } // No action if no focus in some object input

				if (event == "escape") {
				// 1. The user wants to abort object insertion
					$focused.blur();
				}
				// 2. The user wants to submit the new object (creation + linking or just linking)
				if (event == "enter") {
					this.objectSubmit($focused);
				}
			},

			/**
			 * Remove the object from DOM if the user wants to cancel
			 * 
			 * @method objectInputDestroy
			 */
			objectInputDestroy: function (event) {
				$(event.target).parent().remove();
			},

			/**
			 * To create/link new object
			 * 
			 * @method objectSubmit
			 */
			objectSubmit: function ($focused) {
				var self        = this;
				var className   = $focused.closest('div').hasClass('tag') ? 'tag' : 'task';
				var objectModel = {};

				if ($focused.val().length < 2) { return; } // Do not do anything if label is too short

				if (className == "task") {
				// 2.1 For tasks, always create + link
					objectModel = new Task ({
						label : $focused.val(),
					});
					temp.coll.tasks.add(objectModel);
				} else {
				// 2.2 If we are dealing with a tag, we can link or create + link => requires to check
					// 2.2.0 Check whether the object already exists or not
					objectModel = temp.coll.tags.find(function (model) {
						return model.get('label') == $focused.val();
					});

					if (!objectModel) {
					// 2.2.1 The model does not exist in the DB so we create it first
						objectModel = new Tag ({
							label : $focused.val(),
						});
						temp.coll.tags.add(objectModel);
					}
				}

				objectModel.save({}, {
					success: function () {
						// Only link the object when we are sure it has been saved in the DB (in case it's new)
						self.objectLink($focused, objectModel, className);
						return false;
					},
				});
			},

			/**
			 * To link an object
			 * 
			 * @method objectLink
			 */
			objectLink: function ($focused, objectModel, className) {
				var color = undefined;
				switch (className) {
					case "tag":
						var link = this.model.get('tagLinks').find(function (link) {
							return link.get("tag") == objectModel;
						});

						if (link) { // No need to link if it's already linked
							alert('This tag is already linked to the current note.');
							return false;
						}
						this.model.get('tagLinks').add({ tag: objectModel });
						color = objectModel.get('color');
						break;
					case "task":
						this.model.get('taskLinks').add({ task: objectModel });
						break;
				}

				this.objectFreeze($focused, objectModel.cid, objectModel.id, color);
				this.model.save();
				this.save();
			},

			/**
			 * To unlink an object
			 * 
			 * @method objectUnLink
			 */
			objectUnLink: function (event) {
				var self        = this;
				var $object     = $(event.target).parent();
				var className   = $object.hasClass("task") ? "task" : "tag";
				var objectModel = temp.coll[className+"s"].get($object.attr('data-cid'));
				var link        = {};

				switch (className) {
					case "tag":
						var link = this.model.get('tagLinks').find(
							function (link) {return link.get("tag") == objectModel; }
						);
						this.model.get('tagLinks').remove(link);
						break;
					case "task":
						var link = this.model.get('taskLinks').find(
							function (link) {return link.get("task") == objectModel; }
						);
						this.model.get('taskLinks').remove(link);
						break;
				}
				$object.remove();
				this.model.save();
				this.save();
			},

			/**
			 * This method will ensure the content of the note is updated in case :
			 * 1. A tag or task is deleted
			 * 2. A tag color changes
			 * 3. A tag or task label changes
			 * 
			 * @method objectsRepaint
			 */
			objectsRepaint: function (event) {
				this.$('.content .tag').each(function (index) {
					var $tag = $(this);

					// 1. First, test if the related model does exist
					var model = temp.coll.tags.get($tag.attr('data-model-id'));

					if (!model) {
						// The model does not exist
						$tag.remove();
						console.log("Object destroyed !");
						return true; // Skip to the next iteration
					}

					// 2. Second, update the color
					$tag.find(".circle").css("background-color", model.get('color'));

					// 3. Third, update the label
					$tag.find(".label").text(model.get('label'));
				});

				this.$('.content .task').each(function (index) {
					var $task = $(this);

					// 1. First, test if the related model does exist
					var model = temp.coll.tasks.get($task.attr('data-model-id'));

					if (!model) {
						// The model does not exist
						$task.remove();
						console.log("Object destroyed !");
						return true; // Skip to the next iteration
					}

					// 2. Second, update the label
					$task.find(".label").text(model.get('label'));
				});


				this.save();
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

