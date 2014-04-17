var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserTabView = Backbone.View.extend({

	// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
	// It explains why we don't need a render function

	// The DOM events we listen to
	events: {
		'click': 'delegatedToggle'
	},

	initialize: function() {},

	delegatedToggle: function() {
		this.options.parent.toggle();
	},

	toggle: function() {
		// First, deactivate the other tabs
		$("#nav").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	},
});