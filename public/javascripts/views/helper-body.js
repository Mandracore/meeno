HelperBodyView = Backbone.View.extend ({

	events: {},
	initialize: function() {},

	toggle: function() {
		// First, deactivate the other tabs' content
		$("#tabs").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	}
});