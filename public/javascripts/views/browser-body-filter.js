var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyFilterView = Backbone.View.extend({
	// filterClass (e.g. "noteFilter") must be declared by passing options to the constructor
	tagName: "li",
	template : '#browser-body-filter-template',

	events: {
		'click .filter li': 'activate',
	},

	initialize: function() {
		this.listenTo(meenoAppCli.dispatcher, 'browser:'+this.options.filterClass+':check-status', function () {this.checkStatus();});
		this.listenTo(meenoAppCli.dispatcher, 'browser:'+this.options.filterClass+':deactivate', function () {this.deactivate();});
	},

	// Renders the item to the current state of the model
	render: function() {
		console.log ("R[Browser-body-filter]");
		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (this.model.toJSON()));
		this.checkStatus();
		return this;
	},

	checkStatus: function () {
		if (this.options.parent.filters[filterClass] == this.model) {
			this.activate():
		}
	},

	deactivate: function () {
		this.$el.removeClass('active');
	},

	activate: function() {
		// Deactivate everybody
		meenoAppCli.dispatcher.trigger("browser:"+filterClass+":deactivate");
		// Activate only me
		this.options.parent.filters[filterClass] = this.model;
		this.$el.addClass('active');
	}
});