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

	edit: function() {
		this.$(".details").slideDown();
		this.$( "input[name='label']" ).focus().select();
	},

	update: function() {
		this.model.set({
			label : this.$("input[name='label']").val(),
			description : this.$("input[name='description']").val(),
		}).save();
		this.close();
	},

	reset: function() {
		this.$("input[name='label']").val(this.model.get('label'));
		this.$("input[name='description']").val(this.model.get('description'));
	},

	delete: function() {
		this.model.destroy();
		this.remove();
		console.log('task deleted');
	},

	close: function() {
		this.$(".details").slideUp();
	}
});