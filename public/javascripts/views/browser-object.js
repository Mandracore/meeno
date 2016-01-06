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
				this.options = options;
				// this.listenTo(channel, 'browser:actions:toggle-checkboxes:'+this.options.collName, function () { this.actionToggleCheckbox() });
				// this.listenTo(channel, 'browser:actions:delete:'+this.options.collName, function () { this.actionDelete() });
				// this.listenTo(channel, 'browser:actions:select:all:'+this.options.collName, function () { this.actionSelectMe() });
				// this.listenTo(channel, 'browser:actions:select:none:'+this.options.collName, function () { this.actionUnSelectMe() });
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
						self.render();
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
				console.log ('Kill AC')
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
								self.render();
								return false;
							},
						});
						return false;
					} else {
						// The user wants to link an existing tag
						self.model.get('tagLinks').add({ tag: selection[0] });
						self.model.save();
						self.render();
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
				this.render();
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