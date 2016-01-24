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
					'click .delete button'       : 'delete',
					'click .overview'            : 'expand',
					'click .reduce'              : 'reduce',
					'click .label .edit'         : 'editLabel',
					'click .label .cancel'       : 'editLabelCancel',
					'click .label .save'         : 'editLabelSubmit',
					'click .tags .cancel'        : 'editTagsCancel',
					'click .tags .link'          : 'editTagsSubmit',
					'click .description .cancel' : 'editDescCancel',
					'click .description .save'   : 'editDescSubmit',
					'click .check button'        : 'check',
					'click .form .date'          : 'dueDateShowPicker',
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

				//channel.trigger("browser:tasks:reSyncSelectors");

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
			 * reduce the note
			 * 
			 * @method reduce
			 */
			reduce: function() {
				if(this.$el.hasClass('expanded')) {
					this.$el.removeClass('expanded');
					this.listenStop();
				}
			},

			/**
			 * Since the datepicker is not attached to a visible input, we need a function to display it.
			 * The following method will display the date picker when clicking on the due date of the task
			 * 
			 * @method dueDateShowPicker
			 */
			dueDateShowPicker: function() {
				//this.$(".datepicker").datepicker('show');
				this.$('.datepicker').show().focus().hide();
				console.log('dueDateShowPicker')
			},

			/**
			 * Once a date is selected by the user, this method updates the related model
			 * 
			 * @method dueDateUpdate
			 */
			dueDateUpdate: function(date) {
				this.model.set('due_at',new Date (date).toISOString()).save();
				this.reduce();
				this.render();
				this.expand();
				//this.$('.form .tags input').val('').focus();
			},

			/**
			 * Update the model's description attribute
			 * 
			 * @method editDescSubmit
			 */
			editDescSubmit: function() {
				var self = this;
				this.model.set('description', this.$('.form .description .input').html());
				this.$('.form .description').removeClass('updated');
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
				this.$('.form .label').removeClass('updated');
				this.model.set('label', this.$('.form .label input').val());
				this.model.save();
				this.reduce();
				this.render();
				this.expand();
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