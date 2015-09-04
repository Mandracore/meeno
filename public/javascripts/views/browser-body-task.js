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
					'click .edit'             : 'edit',
					'click span.label'        : 'check',
					'click .delete'           : 'delete',
					'click .close'            : 'close',
					'click .update'           : 'update',
					'click .reset'            : 'reset',
					'click .tagButtons button': 'unlink',
				});
			},

			/**
			 * @method initialize
			 */
			initialize: function() {
				//this.options.hasSelectedTag = false;
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

				channel.trigger("browser:tasks:reSyncSelectors");

				// Control the behaviour when ENTER key is keyed down
				self.$("input").not('.autocomplete').on("keydown", function(event) {
					// track enter key
					var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
					if (keycode == 13) { // keycode for enter key
						self.$(".update").click();
						return false; // To prevent the browser to try to submit the form by itself (by faking a click on an unwanted button)
					} else  {
						return true;
					}
				});
				self.$("input.autocomplete").on("keydown", function(event) {
					// track enter key
					var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
					if (keycode == 13) { // keycode for enter key
						self.addNewTag();
						return false; // To prevent the browser to try to submit the form by itself (by faking a click on an unwanted button)
					} else  {
						return true;
					}
				});

				return this;
			},

			/**
			 * @method edit
			 */
			edit: function() {
				this.$(".details").slideDown();
				this.$("input[name='label']").focus().select();
				this.initAutocomplete();
			},

			/**
			 * Updates the view after the user modified the tags related to the task
			 * 
			 * @method renderTagUpdate
			 */
			renderTagUpdate: function() {
				this.render();
				this.$(".details").show();
				this.initAutocomplete();
				this.$("input[name='newTag']").val("").focus();
			},

			/**
			 * When the user tries to link the task to a new tag, this method will create the desired tag 
			 * and link it to the view's model.
			 * 
			 * @method addNewTag
			 */
			addNewTag: function() {
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
								self.renderTagUpdate();
								return false;
							},
						})
;						return false;
					}
				}
				return false;
			},


			/**
			 * Should initialize the task's tag autocomplete input and allow for linking existing tags
			 * to the task.
			 * To be called only when a task is being edited, and deleted when its form is closed
			 * 
			 * @method initAutocomplete
			 */
			initAutocomplete: function() {
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
						self.model.get('tagLinks').add({ tag: selection });
						self.renderTagUpdate();
					}
				});
			},

			/**
			 * Saves the changes made into the database
			 * 
			 * @method update
			 */
			update: function() {
				this.model.set({
					label : this.$("input[name='label']").val(),
					description : this.$("input[name='description']").val(),
				}).save();
				this.close();
			},

			/**
			 * Should unlink the clicked tag from the task
			 * 
			 * @method unlink
			 */
			unlink: function(event) {
				var tag = temp.coll.tags.get($(event.target).attr('data-cid'));
				var tagLink = this.model.get('tagLinks').find(
					function (tagLink) {return tagLink.get("tag") == tag; }
				);

				this.model.get('tagLinks').remove(tagLink);
				this.renderTagUpdate();
			},

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

			/**
			 * Will reset the model to the value stored in DB and re-render the view accordingly.
			 * 
			 * @method reset
			 */
			reset: function() {
				var self = this;
				this.model.fetch({success: function(model, response) {
					self.render();
					self.$(".details").show();
					self.initAutocomplete();
				}});
			},

			/**
			 * To remove the view's model from database and kill the view.
			 * 
			 * @method delete
			 */
			delete: function() {
				this.model.destroy();
				this.remove();
			},

			/**
			 * To close the task form
			 * 
			 * @method close
			 */
			close: function() {
				this.$(".autocomplete").autocomplete("destroy");
				this.$(".details").slideUp();
			}
		});

		return BrowserBodyTaskView;
	}
);