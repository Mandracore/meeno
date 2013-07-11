var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.EditorTabView = Backbone.View.extend({

	tagName  :  'li', // The View will generate itself within a <tagName> element (its top-level element)...
	className:  'object note', // ... and will apply itself those classes : <tagName class="className1 className2[...]"
	template : _.template( $('#tab-nav-template').html() ), // ... and will finally use this template to render the related model with passed to the constructor

	// The DOM events we listen to
	events: {
		'click': 'toggle'
	},

	initialize: function() {
		this.model.on('change', this.render, this); // if the model is altered in any way, we redraw (it could be triggered in the editor view)
	},

	beforeKill: function() {},

	// Renders the tab-nav item to the current state of the model
	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	toggle: function() {
		// First, deactivate the other tabs
		$("#nav").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	}
});