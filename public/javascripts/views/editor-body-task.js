var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorBodyTaskView = Backbone.View.extend({

	tagName   :'span',
	className :'object task icon-tasks',
	template  :'#editor-body-task-template',

	// The DOM events specific to an item.
	events: {
		'input'    : 'autocomplete',
		'keypress' : 'keyProxy'
	},

	initialize: function() {
		this.options.isLocked = false;
		Backbone.View.prototype.initialize.apply(this, arguments);

		if (this.model) {
			this.options.id = this.$el.attr('id');
			this.options.isLocked = true;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'remove', this.kill);
		} else {
			this.options.id = makeid();
		}
		this.listenTo(this.options.note, 'change:content', this.checkChanges);

		console.log ('Init[emb_task]');
	},

	checkChanges: function () {
		if (this.options.parentDOM.find(this.$el).length === 0) {
			console.log(this.cid+"'s DOM element has been removed");
			if (!this.model) {
				this.kill();
			} else {
				this.unlink();
			}
		}
		else {console.log(this.cid+"'s DOM element still exists");}
	},

	keyProxy: function(event) {
		if (event.keyCode == 13 || event.keyCode == 9) {
			this.lock();
		}
	},

	render: function() {
		console.log ("R[emb-task]");
		this.$el.attr('id', this.options.id);
		this.$el.attr('contentEditable',false);
		var templateData = {
			id: this.options.id
		};
		var templateFn = _.template( $(this.template).html() );
		this.$el.html( templateFn( templateData ) );
		return this;
	},

	autocomplete: function() {
		console.log('autocomplete');
		var strHint = (this.$(".body").val());
		if (strHint.length > -1) {
			var pattern = new RegExp(strHint,"i");
			var proposals = meenoAppCli.tasks.filter(function (task) {
				return pattern.test(task.get('label'));
			});
			var datalistOptions = proposals.map(function (obj, key) {
				return "<option class='trick' data-model-id='"+obj.get('_id')+"' value='"+obj.get('label')+"'>"+obj.get('label')+"</option>";
			});
			this.$(".datalist").html(datalistOptions);
		}
	},

	error: function (msg) {
		console.error(msg);
		this.$el.addClass("broken");
	},

	lock: function (event) {
		console.log("locking");
		if (!this.options.isLocked) {
			if (this.$('.body').val().length <= 2) {
				console.log('##WARNING## task too short to lock'); // We save only tasks of more than 2 characters
			} else {
				console.log('______ Locking Object ______');

				var self = this;
				var selectedModel = meenoAppCli.tasks.find(function (task) {
					return task.get('label') == self.$(".body").val();
				});

				if (!selectedModel) {
					console.log('--- Creating new task ---');
					this.model = new meenoAppCli.Classes.Task({
						label : this.$(".body").val()
					});
					meenoAppCli.tasks.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
					this.model.save({},{ // Now that the model is into a collection, the .save() method will work
						success: function () {self.link ();},
						error  : function () {self.error("Impossible to save new model");}
					});
				} else {
					if (_.contains(this.options.note.get('taskLinks').pluck('task'), selectedModel)) {
						console.log('task already linked');
						return;
					}
					console.log('--- Linking to selected task ---');
					this.model = selectedModel;
					this.link ();
				}
			}
		}
	},

	link: function () {
		console.log('------ trying to link task');
		var self = this;
		this.options.note.get('taskLinks').add( { task: this.model } );
		this.options.note.save({},{
			success: function () {
				var $newSpan = $("<span>",{class:"body"}).html(self.model.get('label'));
				self.$(".body").parent().remove();
				self.$el.append($newSpan);
				self.$el.removeClass("broken");
				self.$el.addClass("locked");
				self.$el.attr("data-model-id",self.model.get("_id"));
				self.isLocked = true;
				moveCaret (self.$el.next()[0], 1); // Moving the caret out of the object
				console.log('Task "'+self.model.get('label')+'" linked to current note');
				self.options.isLocked = true;
			},
			error: function () {self.error('Impossible to link new Task "'+self.model.get('label')+'" to current note');}
		});
	},

	unlink: function () {
		var self = this;
		var taskLink2rem = this.options.note.get('taskLinks').find(function(taskLink){return taskLink.get('task') == self.model; });
		this.options.note.get('taskLinks').remove(taskLink2rem);
		this.options.note.save ({},{
			success: function () {console.log('Object successfully unlinked');self.kill();},
			error: function () {console.error('Impossible to unlink object');self.kill();}
		});
	}
});