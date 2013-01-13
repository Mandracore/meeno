// js/views/staticTabNav.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.StaticTabNavView = Backbone.View.extend({

	// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
	// It explains why we don't need a render function

	// The DOM events we listen to
	events: {
		'click': 'toggle'
	},

	toggle: function() {
		// First, deactivate the other tabs
		$("#nav").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
		// Command its content to toggle itself
		meenoAppCli.dispatcher.trigger('tab:toggle:' + this.options.sound);
	}
});