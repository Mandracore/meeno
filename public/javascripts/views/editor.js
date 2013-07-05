var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorView = Backbone.View.extend({

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quitSub, this);
	},

	beforeKill: function() {
		// External listeners have to be removed in order to destroy last reference to the view and allow Garbage collecting
		meenoAppCli.dispatcher.off('tab:toggle:' + this.options.sound, this.toggle, this);
		meenoAppCli.dispatcher.off('tab:quit:' + this.options.sound, this.quitSub, this);
	},

	render: function() {
		return this;
	},

	toggle: function() {
		// First, deactivate the other tabs' content
		$("#tabs").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	},

	quitSub: function() {
		console.log('quit tab content');
		this.remove();
	},

	quit: function() {
		meenoAppCli.dispatcher.trigger('tab:quit:'+this.options.sound); // Will be heard by this view and its sub views
		meenoAppCli.dispatcher.trigger('tab:toggle:browse');
	}
});