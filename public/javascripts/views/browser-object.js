define ([
		'jquery',
		'underscore',
		'channel',
		'backbone',
		'temp',
		'models/tag',
		'models/filter',
	], function ($, _, channel, Backbone, temp, Tag, Filter) {

		/**
		 * This class retains all core features for displaying objects views in the browser.
		 * Several classes will inherit from it, one per kind of business object :
		 * - BrowserNoteView
		 * - BrowserTaskView
		 * - BrowserTagView
		 * - ...
		 * 
		 * @class BrowserObjectView
		 * @extends Backbone.View
		 */
		var BrowserObjectView = Backbone.View.extend({
			tagName  : 'li',

			// The DOM events specific to an item.
			events: {
				// 'click .checkbox': 'actionCheck',
				'click .form .tags .buttons button' : 'editTagsRemove',
			},

			initialize: function(options) {
				// this.listenTo(channel, 'browser:actions:toggle-checkboxes:'+this.options.collName, function () { this.actionToggleCheckbox() });
				// this.listenTo(channel, 'browser:actions:delete:'+this.options.collName, function () { this.actionDelete() });
				// this.listenTo(channel, 'browser:actions:select:all:'+this.options.collName, function () { this.actionSelectMe() });
				// this.listenTo(channel, 'browser:actions:select:none:'+this.options.collName, function () { this.actionUnSelectMe() });
			},


			//============================================================
			// CORE ATTRIBUTES EDITION (commons btw. notes, tags and tasks)
			//============================================================

			/**
			 * Initialize event listeners
			 * In order to minimize the number of listeners, each browser object view only starts listening
			 * when they are maximized.
			 * Listen to the `input` event (any change, inc. copy/paste) of the inputs
			 * and do the right actions (display form controls or not)
			 * 
			 * @method listenStart
			 */
			listenStart: function() {
				this.className = this.$el.closest('.tab').hasClass('notes') ? "note" : (this.$el.closest('.tab').hasClass('tasks') ? "task" : "tag");

				var self = this;

				// Listen to the keyboard events
				this.listenTo(channel, 'keyboard:enter', function () {this.kbEventProxy("enter");});
				this.listenTo(channel, 'keyboard:escape', function () {this.kbEventProxy("escape");});

				//#### Commons for notes, tags and tasks
				// Listen to the `input` event (any change, inc. copy/paste) of the inputs
				// and do the right actions (display form controls or not)
				this.$('.form .label input').on('input', function() {
					var backup = (this.className == "note") ? self.model.get('title') : self.model.get('label');
					if($(this).val() != backup) {
						$(this).closest('.label').addClass('updated');
					} else {
						$(this).closest('.label').removeClass('updated');
					}
				});

				//#### For notes and tasks only
				if(this.className == "note" || this.className == "task") {
					// Init the autocomplete
					this.editTagsAutocompleteInit();
					// Listen to the `input` event (any change, inc. copy/paste) of the inputs
					// and do the right actions (display form controls or not)
					this.$('.form .tags input').on('input', function() {
						if($(this).val() != "") {
							$(this).closest('.tags').addClass('updated');
						} else {
							$(this).closest('.tags').removeClass('updated');
						}
					});
				}

				//#### For tasks only
				if(this.className == "task") {
					// Listen to the `input` event (any change, inc. copy/paste) of the inputs
					// and do the right actions (display form controls or not)
					this.$('.description .input').on('input', function() {
						var backup = self.model.get('description');
						if($(this).html() != backup) {
							$(this).closest('.description').addClass('updated');
						} else {
							$(this).closest('.description').removeClass('updated');
						}
					});
				}

			},

			/**
			 * Destroy event listeners
			 * 
			 * @method listenStop
			 */
			listenStop: function() {
				this.stopListening(channel, 'keyboard:enter');
				this.stopListening(channel, 'keyboard:escape');
				if(this.className == "note" || this.className == "task") {
					this.editTagsAutocompleteKill();
				}
				this.$('.label input').off('input');
				this.$('.tags input').off('input'); // Will not work for tags (but it's OK)
			},

			/**
			 * A proxy meant to interpret all keyboard events received and to dispatch them seamlessly
			 * 
			 * @method kbEventProxy
			 */
			kbEventProxy: function(event) {
				//#### Commons for notes, tags and tasks
				// 1. The user is updating the label
				var $inputEditLabel = this.$(".form .label input");
				if ($inputEditLabel.is(":focus")) {
					if (event == "escape") {
						this.$('.form .label input').blur(); // Mandatory to blur the input or it triggers infinite loop with the input event
						this.editLabelCancel();
						return;
					}
					if (event == "enter") {
						this.editLabelSubmit();
						return;
					}
				}

				//#### For notes and tasks only
				// 2. The user is updating the tags of the object
				if(this.className == "note" || this.className == "task") {
					var $inputEditTags  = this.$(".form .tags input");
					if ($inputEditTags.is(":focus")) {
						// 2.1 The user wants to rollback
						if (event == "escape") {
							$inputEditTags.blur();
							this.editTagsCancel(); // Mandatory to blur the input or it triggers infinite loop with the input event
							return;
						}
						// 2.2 The user wants to link a tag that doesn't exist to the current task
						// Will handle what happens if the user keyes in ENTER in the input, which bypasses the autocomplete, 
						// whether the autocomplete provided a match or not
						if (event == "enter") {
							this.editTagsSubmit ();
						}
					}
				}

				//#### For tasks only
				// 3. The user is updating the description of the task
				if(this.className == "task") {
					var $inputEditDesc  = this.$(".form .description .input");
					if ($inputEditDesc.is(":focus")) {
						// 2.1 The user wants to rollback
						if (event == "escape") {
							console.log('escape desc')
							$inputEditDesc.blur();
							this.editDescCancel(); // Mandatory to blur the input or it triggers infinite loop with the input event
							return;
						}
						// 2.2 The user wants to link a tag that doesn't exist to the current task
						// Will handle what happens if the user keyes in ENTER in the input, which bypasses the autocomplete, 
						// whether the autocomplete provided a match or not
						if (event == "enter") {
							this.editDescSubmit ();
						}
					}
				}
			},


			//============================================================
			// TAGS EDITION (commons btw. notes and tasks)
			//============================================================

			/**
			 * Should initialize the objet's tag autocomplete input and allow for linking existing tags
			 * to the object (note or task).
			 * To be called only when the user wants to add a new tag, and closed afterwards
			 * 
			 * @method editTagsAutocompleteInit
			 */
			editTagsAutocompleteInit: function() {
				var self = this;
				this.$(".autocomplete").autocomplete({
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
						self.$(".form .tags input").val(ui.item.label);
						return false; // to cancel normal behaviour
					},
					select: function(event, ui) {
						var selection = temp.coll.tags.get(ui.item.value) // ui.item.value == model.cid
						self.model.get('tagLinks').add({ tag: selection }); // adding the tag to the model
						//self.editTagsAutocompleteKill();
						// Re-rendering the task but re-opening the editTag form to go quicker if the user wants to go on
						self.model.save();
					}
				});
			},

			/**
			 * Used to destroy the autocomplete widget. It is necessary when :
			 * 1. The user successfully links a tag to the object
			 * 2. The user gives up its tag modification
			 * 
			 * @method editTagsAutocompleteKill
			 */
			editTagsAutocompleteKill: function() {
				this.$(".autocomplete").autocomplete("destroy");
			},

			/**
			 * Used in two cases : the user pressed ENTER or clicked on the "Link tag" button
			 * Proceeds as follows : checks if the tag keyed in exists or not, then creates it
			 * if not and finally links it to the object
			 * 
			 * @method editTagsSubmit
			 */
			editTagsSubmit: function() {
				var self   = this;
				var $input = this.$(".form .tags input");
				if ($input.val().length > 1) {
				// Check that the value set by the user corresponds to a new tag
				// get all tags having exactly the label value = input value
					var selection = temp.coll.tags.where({label: $input.val()});
					if (selection.length == 0) {
						// The user wants a new tag
						// 1. create a new tag
						var newTag = new Tag ({
							label : $input.val(),
						});
						temp.coll.tags.add(newTag); // We add it to the collection so that we can save it
						newTag.save({}, {
							success: function () {
						// 2. link the new tag
								self.model.get('tagLinks').add({ tag: newTag });
								self.model.save();
								return false;
							},
						});
						return false;
					} else {
						// The user wants to link an existing tag
						self.model.get('tagLinks').add({ tag: selection[0] });
						self.model.save();
					}
				}
				return false;
			},

			/**
			 * Should remove the clicked tag from the task
			 * 
			 * @method editTagsRemove
			 */
			editTagsRemove: function(event) {
				var tag = temp.coll.tags.get($(event.target).attr('data-cid'));
				var tagLink = this.model.get('tagLinks').find(
					function (tagLink) {return tagLink.get("tag") == tag; }
				);
				this.model.get('tagLinks').remove(tagLink);

				this.model.save();
			},


			/* TO BE REUSED LATER 

			actionToggleCheckbox: function() {
				this.$('span.checkbox').toggle();
			},

			actionDelete: function() {
				if (this.$('span.checkbox').hasClass("icon-check")) {
					this.model.destroy();
					this.kill();
				}
			},

			actionCheck: function() {
				//console.log(this.options.collName);
				if (this.$("span.checkbox").hasClass('icon-check')) {
					this.$("span.checkbox").removeClass('icon-check');
					this.$("span.checkbox").addClass('icon-check-empty');
				} else {
					this.$("span.checkbox").removeClass('icon-check-empty');
					this.$("span.checkbox").addClass('icon-check');
				}
				channel.trigger("browser:actions:update-selectors:"+this.options.collName);
			},

			actionSelectMe: function() {
				this.$("span.checkbox").removeClass('icon-check-empty');
				this.$("span.checkbox").addClass('icon-check');
			},

			actionUnSelectMe: function() {
				this.$("span.checkbox").removeClass('icon-check');
				this.$("span.checkbox").addClass('icon-check-empty');
			},
			*/
		});

		return BrowserObjectView;
	}
);