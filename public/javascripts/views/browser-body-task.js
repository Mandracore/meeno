var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyTaskView = meenoAppCli.Classes.BrowserBodyObjectView.extend({

	template : '#browser-body-task-template',

	events: function(){
		return _.extend({},meenoAppCli.Classes.BrowserBodyObjectView.prototype.events,{
			'click .edit'  : 'edit',
			'click .delete': 'delete',
			'click .close' : 'close',
			'click .update': 'update',
			'click .reset' : 'reset',
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
			tags: _.map(this.model.get('tagLinks').pluck('tag'), function(tag) {return tag.get('label')})
		};

		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (json));
		this.$el.attr("data-cid",this.model.cid);
		meenoAppCli.dispatcher.trigger("browser:tasks:reSyncSelectors");
		return this;
	},

	enter: function() {
		// risque : lier deux fois
		if (this.$("input[name='newTag']").is(":focus") && !this.options.hasSelectedTag) {
			console.log('FUCK and it is in the input');
			// tester si ça se déclencer au select de l'autocomplete
			if (!this.options.hasSelectedTag) {
				console.log('c\'est pour toi !');
				var tagFilter = new meenoAppCli.Classes.TagFilter({text: this.$("input[name='newTag']").val()});
				var selection = meenoAppCli.tags.search(tagFilter);
				if (!selection) {
					// create a new tag

				} else {
					// link the existing tag
					
				}
			} else {
				this.options.hasSelectedTag = false; // to reinitialize after an autocomplete selection
			}
		}
	},

	edit: function() {
		this.$(".details").slideDown();
		this.$("input[name='label']").focus().select();
		this.initAutocomplete();
	},

	/**
	 * Triggered when the user hits ENTER
	 * @return {[type]} [description]
	 */
	addTag: function() {

/*
				var selectedModel = meenoAppCli[this.options.modelClass+'s'].find(function (model) {
					return model.get('label') == self.$(".body").val();
				});

				if (!selectedModel) {
				// If the model doesn't exist, we create it
					console.log('--- Creating new '+this.options.modelClass+' ---');
					this.model = new meenoAppCli.Classes[modelClassName]({
						label : this.$(".body").val()
					});
*/


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
				console.log ('autocomplete SELECT')
				var selection = meenoAppCli.tags.get(ui.item.value) // ui.item.value == model.cid
				self.model.get('tagLinks').add({ tag: selection });
				self.render();
				self.$(".details").show();
				self.initAutocomplete();
				self.$("input[name='newTag']").val("").focus();
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