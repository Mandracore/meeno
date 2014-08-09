var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyTaskView = meenoAppCli.Classes.BrowserBodyObjectView.extend({

	template : '#browser-body-task-template',

	events: function(){
		return _.extend({},meenoAppCli.Classes.BrowserBodyObjectView.prototype.events,{
			'click .edit'             : 'edit',
			'click .delete'           : 'delete',
			'click .close'            : 'close',
			'click .update'           : 'update',
			'click .reset'            : 'reset',
			'click .tagButtons button': 'unlink',
		});
	},

	initialize: function() {
		this.options.hasSelectedTag = false;
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:enter',
			function () { this.enter(); }
		);
	},

	render: function() {
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
		meenoAppCli.dispatcher.trigger("browser:tasks:reSyncSelectors");
		return this;
	},

	/**
	 * Updates the view after the user modified the tags related to the task
	 * @return {void}
	 */
	renderTagUpdate: function() {
		this.render();
		this.$(".details").show();
		this.initAutocomplete();
		this.$("input[name='newTag']").val("").focus();
	},

	/**
	 * Triggered when the user hits ENTER
	 * @return {[type]} [description]
	 */
	enter: function() {
		var self = this;
		if (this.$("input[name='newTag']").is(":focus") && !this.options.hasSelectedTag) {
			if (this.options.hasSelectedTag) { // The Enter keypress has already been taken into account
				this.options.hasSelectedTag = false; // We reinitialize
				return;

			} else { // The Enter keypress has not been taken into account yet
				var tagFilter = new meenoAppCli.Classes.TagFilter({text: this.$("input[name='newTag']").val()});
				var selection = meenoAppCli.tags.search(tagFilter);

				if (!selection.at(0)) {
					// 1. create a new tag
					var newTag = new meenoAppCli.Classes.Tag ({
						label : self.$("input[name='newTag']").val(),
					});
					meenoAppCli.tags.add(newTag); // We add it to the collection so that we can save it
					newTag.save({}, {
						success: function () {
					// 2. link the new tag
							self.model.get('tagLinks').add( { tag: newTag } );
							self.renderTagUpdate();
						},
					});
				} else {
					// link the existing tag
					self.model.get('tagLinks').add( { tag: selection.at(0) } );
					self.renderTagUpdate();
				}
			}
		}
	},

	edit: function() {
		this.$(".details").slideDown();
		this.$("input[name='label']").focus().select();
		this.initAutocomplete();
	},

	/**
	 * Should initialize the task's tag autocomplete input
	 * To be called only when a task is being edited, and deleted when its form is closed
	 * @return {void}
	 */
	initAutocomplete: function() {
		var self = this;
		this.$(".autocomplete").autocomplete({
			source: function (request, response) {
				// request.term : data typed in by the user ("new yor")
				// response : native callback that must be called with the data to suggest to the user
				var tagFilter = new meenoAppCli.Classes.TagFilter({text: request.term});
				response (
					meenoAppCli.tags.search(tagFilter).map(function (model, key, list) {
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
				self.options.hasSelectedTag = true;
				var selection = meenoAppCli.tags.get(ui.item.value) // ui.item.value == model.cid
				self.model.get('tagLinks').add({ tag: selection });
				self.renderTagUpdate();
			}
		});
	},

	update: function() {
		this.model.set({
			label : this.$("input[name='label']").val(),
			description : this.$("input[name='description']").val(),
		}).save();
		this.close();
	},

	/**
	 * Should unlink the clicked tag from the task
	 * @return {void}
	 */
	unlink: function(event) {
		var tag = meenoAppCli.tags.get($(event.target).attr('data-cid'));
		var tagLink = this.model.get('tagLinks').find(
			function (tagLink) {return tagLink.get("tag") == tag; }
		);

		this.model.get('tagLinks').remove(tagLink);
		this.renderTagUpdate();
	},

	/**
	 * Will reset the model to the value stored in DB and re-render the view accordingly
	 * @return {void}
	 */
	reset: function() {
		var self = this;
		this.model.fetch({success: function(model, response) {
			self.render();
			self.$(".details").show();
			self.initAutocomplete();
		}});
	},

	delete: function() {
		this.model.destroy();
		this.remove();
	},

	close: function() {
		this.$(".autocomplete").autocomplete("destroy");
		this.$(".details").slideUp();
	}
});