var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.BrowserBodyTaskView
 * @extends {mee.cla.BrowserBodyObjectView}
 */
mee.cla.BrowserBodyTaskView = mee.cla.BrowserBodyObjectView.extend({

	template : '#browser-body-task-template',

	events: function(){
		return _.extend({},mee.cla.BrowserBodyObjectView.prototype.events,{
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
		this.options.hasSelectedTag = false;
		this.listenTo(mee.dispatcher, 'keyboard:enter',
			function () { this.addNewTag(); }
		);
	},

	/**
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
		mee.dispatcher.trigger("browser:tasks:reSyncSelectors");

		//submitOnEnter
		self.$("input").on("keydown", function(event) {
			// track enter key
			var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
			if (keycode == 13) { // keycode for enter key
				if ($(event.target).hasClass("submitOnEnter")) {
					// force the 'Enter Key' to implicitly trigger a click the Update button
					self.$(".update").click();
				}
				return false;
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
		if (this.$("input[name='newTag']").is(":focus")) {

			// Check that the value set by the user corresponds to a new tag
			// get all tags having exactly the label value = input value
			var selection = mee.tags.where({label: self.$("input[name='newTag']").val()});

			if (selection.length == 0) {
				// The user wants a new tag
				// 1. create a new tag
				var newTag = new mee.cla.Tag ({
					label : self.$("input[name='newTag']").val(),
				});
				mee.tags.add(newTag); // We add it to the collection so that we can save it
				newTag.save({}, {
					success: function () {
						console.log('new tag created OK');
				// 2. link the new tag
						self.model.get('tagLinks').add({ tag: newTag });
						self.renderTagUpdate();
					},
				});
			}
		}
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
				var tagFilter = new mee.cla.TagFilter({text: request.term});
				response (
					mee.tags.search(tagFilter).map(function (model, key, list) {
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
				console.log ("triggered this.initAutocomplete()");
				var selection = mee.tags.get(ui.item.value) // ui.item.value == model.cid
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
		// PB1 : ENTER dans le input.autocomplete lance la soumission du form ==> unlink sur button proche
		// PB2 : le unlink doit toujours foncitonner quand je clique sur le bouton !
		console.log('UNLINK');
		console.log(event);/*
		if ($(event.target).parent().hasClass("tagButtons") === false) {
			// When the user pushes the ENTER key, the browser will try to submit
			// the form by clicking on any button close to the input
			// We bypass this issue by checking the target of the event
			return;
		}*/
		var tag = mee.tags.get($(event.target).attr('data-cid'));
		var tagLink = this.model.get('tagLinks').find(
			function (tagLink) {return tagLink.get("tag") == tag; }
		);

		this.model.get('tagLinks').remove(tagLink);
		this.renderTagUpdate();
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