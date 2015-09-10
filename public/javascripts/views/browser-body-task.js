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
					'click .label .edit'       : 'editLabel',
					'click .label .cancel'     : 'editLabelCancel',
					'click .label .save'       : 'editLabelSave',
					'click .tags .edit'        : 'editTags',
					'click .tags .cancel'      : 'editTagsCancel',
					'click .tags .save'        : 'editTagsSave',
					'click .label .attribute'  : 'check',
					'click .delete'            : 'delete',
					'click .tagButtons button' : 'unlink',
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

				channel.trigger("browser:tasks:reSyncSelectors");

				//===============================================================================
				// DEPRECATED ==> TO BE REDESIGNED USING A MOUSETRAP LISTENER AND A KEY PROXY
				//===============================================================================

/*
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


*/

				return this;
			},


//================================================
// TO BE REFITTED
//================================================
			// Keyboard event proxy
			// =============================================================================

			/**
			 * Should become the one proxy for all keyboard events. For now, it is only used for
			 * task creation.
			 *
			 * @method kbEventProxy
			 */
			kbEventProxy: function (event) { console.log("heard")
				var $inputEditLabel = this.$(".label input");
				var $inputEditTags  = this.$(".tags input");

				// 1. The user wants to create a new task
				if ($inputEditLabel.is(":focus") && event == "enter") {
					console.log ("Save label !! From kb");
					this.editLabelSave ();
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
			 * @method editLabelSave
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
				//this.initAutocomplete(); // To be moved somewhere
				
				this.$(".label .default button").addClass("inactive");
				this.$(".tags .default").addClass("inactive");
				this.$(".tags .edition").addClass("active");
				this.$("input[name='newTag']").focus().select();

				//this.editLabelCancel(); // To close the label editor in cas it's open
			},

			/**
			 * Cancelling tags edition
			 * 
			 * @method editTagsCancel
			 */
			editTagsCancel: function() {
				this.$(".label .default button").removeClass("inactive");
				this.$(".tags .default").removeClass("inactive");
				this.$(".tags .edition").removeClass("active");

				this.$("input[name='tags']").val("")
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

			/** DEPRECATED

			 *
			update: function() {
				this.model.set({
					label : this.$("input[name='label']").val(),
					description : this.$("input[name='description']").val(),
				}).save();
				this.close();
			},*/

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

			/** DEPRECATED
			 * Will reset the model to the value stored in DB and re-render the view accordingly.
			 * 
			 *
			reset: function() {
				var self = this;
				this.model.fetch({success: function(model, response) {
					self.render();
					self.$(".details").show();
					self.initAutocomplete();
				}});
			},*/

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

			/** DEPRECATED
			 * To close the task form
			 * 
			 *
			close: function() {
				this.$(".autocomplete").autocomplete("destroy");
				this.$(".details").slideUp();
			}*/
		});

		return BrowserBodyTaskView;
	}
);