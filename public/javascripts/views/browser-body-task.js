define ([
		'jquery',
		'underscore',
		'backbone',
		'temp',
		'channel',
		'models/tag',
		'views/browser-body-object',
		'models/filter',
	], function ($, _, Backbone, temp, channel, Tag, BrowserBodyObjectView, Filter) {

		/**
		 * Displays a task in the browser
		 * 
		 * @class BrowserBodyTaskView
		 * @extends {BrowserBodyObjectView}
		 */
		var BrowserBodyTaskView = BrowserBodyObjectView.extend({

			template  : '#browser-body-task-template',
			className : 'task',

			events: function(){
				return _.extend({},BrowserBodyObjectView.prototype.events,{
					'click .label .edit'          : 'editLabel',
					'click .label .cancel'        : 'editLabelCancel',
					'click .label .save'          : 'editLabelSave',
					'click .tags .edit'           : 'editTags',
					'click .tags .cancel'         : 'editTagsCancel',
					'click .tags .save'           : 'editTagsSave',
					'click .label .attribute'     : 'check',
					'click .delete'               : 'delete',
					'click .tags .buttons button' : 'editTagsRemove',
					'click .due'                  : 'dueDateShowPicker',
				});
			},

			/**
			 * @method initialize
			 */
			initialize: function() {
				// To catch keyboard events and dispatch them to a proxy
				this.listenTo(channel, 'keyboard:enter', function () {this.kbEventProxy("enter");});
			},

			/**
			 * This method aims at rendering the HTML elements for a given task model.
			 * Once it is appended to the DOM, some event bindings are also done.
			 * In particular, we control the events occuring when the ENTER key is pressed,
			 * so that the browser does not try to submit the form by faking a click event on
			 * the closest button (which triggers unwanted behaviours).
			 * 
			 * @method render
			 * @chainable
			 */
			render: function() {
				var self = this;
				var json = {
					task: this.model.toJSON(),
					tags: _.map(this.model.get('tagLinks').pluck('tag'), function(tag) {
						return {
							cid : tag.cid,
							'label' : tag.get('label'),
					}}),
				};

				var templateFn = _.template( $(this.template).html() );
				this.$el.html (templateFn (json));
				this.$el.attr("data-cid",this.model.cid);

				if (this.model.get("completed") === true) {
					this.$el.addClass('completed');
				} else {
					this.$el.removeClass('completed');
				}

				this.$(".datepicker").datepicker({
					dateFormat : "yy/mm/dd",
					onSelect   : function (date, dp) {
						self.dueDateUpdate(date);
					}
				});

				channel.trigger("browser:tasks:reSyncSelectors");

				return this;
			},

			/**
			 * Since the datepicker is not attached to a visible input, we need a function to display it.
			 * The following method will display the date picker when clicking on the due date of the task
			 * 
			 * @method dueDateShowPicker
			 */
			dueDateShowPicker: function() {
				this.$(".datepicker").datepicker('show');
			},

			/**
			 * Once a date is selected by the user, this method updates the related model
			 * 
			 * @method dueDateUpdate
			 */
			dueDateUpdate: function(date) {
				this.model.set('due_at',new Date (date).toISOString()).save();
			},


//================================================
// TO BE REFITTED
//================================================




			// Keyboard event proxy
			// =============================================================================

			/**
			 * Should become the one proxy for all keyboard events. For now, it is only used for
			 * task creation. #Performance issue : there is one listener per task, so if 200 tasks are
			 * rendered, there is 200 proxies that will receive the same event and do a similar check.
			 * #enhancement In the future, it could be interesting to think about something more efficient.
			 *
			 * @method kbEventProxy
			 */
			kbEventProxy: function (event) {
				var $inputEditLabel = this.$(".label input");
				var $inputEditTags  = this.$(".tags input");

				// 1. The user wants to create a new task
				if ($inputEditLabel.is(":focus") && event == "enter") {
					this.editLabelSave ();
				}

				// 2. The user wants to link a tag that doesn't exist to the current task
				// Will handle what happens if the user keyes in ENTER in the input, which bypasses the autocomplete, 
				// whether the autocomplete provided a match or not
				if ($inputEditTags.is(":focus") && event == "enter") {
					this.editTagsReturnKey ();
				}
			},

			//============================================================
			// LABEL EDITION
			//============================================================

			/**
			 * To handle label edition. Globally works as follows : the user clicks on "edit", then we hide this button
			 * by add the class "inactive" to the parent span "default". 
			 * 
			 * @method editLabel
			 */
			editLabel: function() {
				this.$(".default").addClass("inactive");
				this.$(".label .edition").addClass("active");
				this.$("input[name='label']").focus().select();
			},

			/**
			 * Saving label update
			 * 
			 @method editLabelSave
			 */
			editLabelSave: function() {
				this.model.set({
					label : this.$("input[name='label']").val(),
				}).save();
				this.$(".default").removeClass("inactive");
				this.$(".label .edition").removeClass("active");
			},

			/**
			 * Cancelling label update
			 * 
			 * @method editLabelCancel
			 */
			editLabelCancel: function() {
				this.$("input[name='label']").val(this.model.get("label"))
				this.$(".default").removeClass("inactive");
				this.$(".label .edition").removeClass("active");
			},

			//============================================================
			// TAGS EDITION
			//============================================================

			/**
			 * To link new tags to the current task
			 * 
			 * @method editTags
			 */
			editTags: function() {
				this.editTagsAutocompleteInit();
				
				this.$(".label .default button").addClass("inactive");
				this.$(".tags .default").addClass("inactive");
				this.$(".tags").addClass("active");
				this.$("input[name='newTag']").focus().select();

				//this.editLabelCancel(); // To close the label editor in cas it's open
			},

			/**
			 * Should initialize the task's tag autocomplete input and allow for linking existing tags
			 * to the task.
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
						self.$("input[name='newTag']").val(ui.item.label);
						return false; // to cancel normal behaviour
					},
					select: function(event, ui) {
						var selection = temp.coll.tags.get(ui.item.value) // ui.item.value == model.cid
						self.model.get('tagLinks').add({ tag: selection }); // adding the tag to the model
						// Re-rendering the task but re-opening the editTag form to go quicker if the user wants to go on
						self.model.save();
						self.editTagsAutocompleteKill();
						self.render();
					}
				});
			},

			/**
			 * Used to destroy the autocomplete widget. It is necessary when :
			 * 1. The user successfully links a tag to the task
			 * 2. The user gives up its tag modification
			 * 
			 * @method editTagsAutocompleteKill
			 */
			editTagsAutocompleteKill: function() {
				this.$(".autocomplete").autocomplete("destroy");
			},

			/**
			 * Cancelling tags edition
			 * 
			 * @method editTagsCancel
			 */
			editTagsCancel: function() {
				this.$(".label .default button").removeClass("inactive");
				this.$(".tags .default").removeClass("inactive");
				this.$(".tags").removeClass("active");

				this.$("input[name='tags']").val("");
				this.editTagsAutocompleteKill();
			},

			/**
			 * To be called when the user keyes ENTER in and the autcomplete has not the focus (just the input)
			 * Two cases are possible :
			 * 1. The tag keyed in already exists (link only)
			 * 2. The tag keyed in does not exist (create and link)
			 * 
			 * @method editTagsReturnKey
			 */
			editTagsReturnKey: function() {
				var self = this;
				if (self.$("input[name='newTag']").is(":focus") && self.$("input[name='newTag']").val().length > 1) {
				// Check that the value set by the user corresponds to a new tag
				// get all tags having exactly the label value = input value
					var selection = temp.coll.tags.where({label: self.$("input[name='newTag']").val()});
					if (selection.length == 0) {
						// The user wants a new tag
						// 1. create a new tag
						var newTag = new Tag ({
							label : self.$("input[name='newTag']").val(),
						});
						temp.coll.tags.add(newTag); // We add it to the collection so that we can save it
						newTag.save({}, {
							success: function () {
						// 2. link the new tag
								self.model.get('tagLinks').add({ tag: newTag });
								self.model.save();
								self.editTagsAutocompleteKill();
								self.render();
								return false;
							},
						});
						return false;
					} else {
						// The user wants to link an existing tag
						self.model.get('tagLinks').add({ tag: selection[0] });
						self.model.save();
						self.editTagsAutocompleteKill();
						self.render();
					}
				}
				return false;
			},


			/**
			 * To be called when the user clicks on the "Link tag" button
			 * Two cases are possible :
			 * 1. The tag keyed in already exists (link only)
			 * 2. The tag keyed in does not exist (create and link)
			 * 
			 * @method editTagsReturnKey
			 */
			editTagsSave: function() {
				var self = this;
				if (self.$("input[name='newTag']").val().length > 1) {
				// Check that the value set by the user corresponds to a new tag
				// get all tags having exactly the label value = input value
					var selection = temp.coll.tags.where({label: self.$("input[name='newTag']").val()});
					if (selection.length == 0) {
						// The user wants a new tag
						// 1. create a new tag
						var newTag = new Tag ({
							label : self.$("input[name='newTag']").val(),
						});
						temp.coll.tags.add(newTag); // We add it to the collection so that we can save it
						newTag.save({}, {
							success: function () {
						// 2. link the new tag
								self.model.get('tagLinks').add({ tag: newTag });
								self.model.save();
								self.editTagsAutocompleteKill();
								self.render();
								return false;
							},
						});
						return false;
					} else {
						// The user wants to link an existing tag
						self.model.get('tagLinks').add({ tag: selection[0] });
						self.model.save();
						self.editTagsAutocompleteKill();
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

			//============================================================
			// COMPLETION EDITION
			//============================================================

			/**
			 * Will update the model (complete the task) and relaunch rendering.
			 * It can also uncheck task.
			 * 
			 * @method check
			 */
			check: function() {
				var self = this;
				this.model.set("completed",!(this.model.get("completed")));
				this.model.save();
				this.render();
			},

			//============================================================
			// DELETE TASK
			//============================================================

			/**
			 * To remove the view's model from database and kill the view.
			 * 
			 * @method delete
			 */
			delete: function() {
				this.model.destroy();
				this.remove();
			},

		});

		return BrowserBodyTaskView;
	}
);