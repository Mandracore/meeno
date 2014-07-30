var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyTaskView = meenoAppCli.Classes.BrowserBodyObjectView.extend({

	template : '#browser-body-task-template',

	events: function(){
		return _.extend({},meenoAppCli.Classes.BrowserBodyObjectView.prototype.events,{
			'click .edit'    : 'edit',
			'click .delete'  : 'delete',
			'blur .label'    : 'save'
		});
	},

	render: function() {
		//this.collName = "tasks";
		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (this.model.toJSON()));
		meenoAppCli.dispatcher.trigger("browser:tasks:reSyncSelectors");
		return this;
	},

	edit: function() {
		console.log('edit');
		this.$("span.label").attr('contenteditable','true').focus().select();
		document.execCommand('selectAll',false,null);
	},

	save: function() {
		this.$("span.label").attr('contenteditable','false');
		console.log('save');
		this.model.set({
			label  :this.$("span.label").html()
		}).save({},{
			success: function() {
				console.log('save success');
			},
			error  : function() {
				console.log('save error');
			}
		});
	},

	delete: function() {
		this.model.destroy();
		meenoAppCli.Tags.remove(this.model);
		this.remove();
		console.log('task deleted')
	},

	/**
	 * Uses the position of the view's DOM element to calculate the new position.
	 * Avoids to modify the position of the other items.
	 * @return {void} only updates its model and its DOM element
	 */
	updatePosition: function () {
		if (!this.$el.prev().length) {
			newPos = this.$el.next().attr("data-position") - 1;
		} else if (!this.$el.next().length) {
			newPos = this.$el.prev().attr("data-position") + 1;
		} else {
			newPos = ((this.$el.prev().attr("data-position") + this.$el.next().attr("data-position")) / 2 );
		}

		this.$el.attr("data-position", newPos);
		this.model.set('position', newPos);
	}
});