define ([
		'jquery',
		'underscore',
		'backbone',
		'temp',
		'channel',
		'models/tag',
		'views/browser-object',
		'models/filter',
	], function ($, _, Backbone, temp, channel, Tag, BrowserObjectView, Filter) {

		/**
		 * Displays a task in the browser
		 * 
		 * @class BrowserTaskView
		 * @extends {BrowserObjectView}
		 */
		var BrowserTaskView = BrowserObjectView.extend({

			template  : '#browser-task-template',
			className : 'task',

			events: function(){
				return _.extend({},BrowserObjectView.prototype.events,{
					'click .content'              : 'expand',
					'click .label .edit'          : 'editLabel',
					'click .label .cancel'        : 'editLabelCancel',
					'click .label .save'          : 'editLabelSave',
					'click .tags .edit'           : 'editTags',
					'click .tags .cancel'         : 'editTagsCancel',
					'click .tags .save'           : 'editTagsSave',
					'click .label .attribute'     : 'check',
					'click .delete'               : 'delete',
					// 'click .tags .buttons button' : 'editTagsRemove',
					'click .due'                  : 'dueDateShowPicker',
				});
			},

			/**
			 * @method initialize
			 */
			initialize: function() {
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
							'cid'   : tag == null ? null : tag.cid,
							'label' : tag == null ? "BROKEN" : tag.get('label'),
							'color' : tag == null ? "#000000" : tag.get('color'),
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
					dateFormat        : "yy/mm/dd",
					showOtherMonths   : true,
					selectOtherMonths : true,
					changeMonth       : true,
					changeYear        : true,
					firstDay          : 1,
					defaultDate       : new Date(self.model.get('due_at')),
					onSelect          : function (date, dp) {
						self.dueDateUpdate(date);
					}
				});

				channel.trigger("browser:tasks:reSyncSelectors");

				return this;
			},

			/**
			 * Expand to task to allow edition
			 * 
			 * @method expand
			 */
			expand: function(date) {
				if(!this.$el.hasClass('expanded')) {
					this.$el.addClass('expanded');
					this.$('.label input').focus().select();
					this.listenStart();
				}
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

			/**
			 * Update the model's description attribute
			 * 
			 * @method editDescSubmit
			 */
			editDescSubmit: function() {
				this.model.set('description', this.$('.form .description .input').html());
				this.model.save();
			},

			/**
			 * Reset the descriptions's input
			 * 
			 * @method editDescCancel
			 */
			editDescCancel: function() {
				this.$('.form .description .input').html(this.model.get('description')).trigger('input').focus().select();
			},

			/**
			 * Update the model's label attribute
			 * 
			 * @method editLabelSubmit
			 */
			editLabelSubmit: function() {
				this.model.set('label', this.$('.form .label input').val());
				this.model.save();
			},

			/**
			 * Reset the label's input
			 * 
			 * @method editLabelCancel
			 */
			editLabelCancel: function() {
				this.$('.form .label input').val(this.model.get('label')).trigger('input').focus().select();
			},

			/**
			 * Empty the tags' input
			 * 
			 * @method editTagsCancel
			 */
			editTagsCancel: function() {
				this.$('.form .tags input').val('').trigger('input').focus();
			},

			/**

			MOVED TO BROWSER-OBJECT


			 * Should initialize the task's tag autocomplete input and allow for linking existing tags
			 * to the task.
			 * To be called only when the user wants to add a new tag, and closed afterwards
			 * 
			 * @method editTagsAutocompleteInit
			 
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
			 
			editTagsAutocompleteKill: function() {
				this.$(".autocomplete").autocomplete("destroy");
			},


			*/


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

		return BrowserTaskView;
	}
);