var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyFilterView = Backbone.View.extend({
	// filterName (e.g. "noteFilter") must be declared by passing options to the constructor
	tagName  : "li",
	className: "icon-filter",
	template : '#browser-body-filter-template',

	events: {
		'click': 'activate'
	},

	initialize: function() {
		var boColl = this.options.filterName.replace(/(Filter)$/, function($1){ return "s"; }); // noteFilter => notes
		this.listenTo(meenoAppCli.dispatcher, "browser:filter:"+boColl+":activate", function () {this.checkStatus();});
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
		if (this.options.parent.filters[this.options.filterName].isSimilar(this.model)) {
			this.$el.addClass('active');
		} else {
			this.$el.removeClass('active');
		}
	},

	activate: function() {
		var boColl = this.options.filterName.replace(/(Filter)$/, function($1){ return "s"; }); // noteFilter => notes
		this.options.parent.filters[this.options.filterName] = this.model.superClone();
		// Next event will :
		// 1. Ask browser-body-filter views to check their status
		// 2. Ask browser-body view to re-render collections of business objects
		// 3. Ask browser-body view to refresh filter controls
		meenoAppCli.dispatcher.trigger("browser:filter:"+boColl+":activate");
	}
});