var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

/**
 * This class holds the view of the filter models that are used to filter the browser's search results.
 * It's the same view for filters on notes, tags and tasks.
 * 
 * @class meenoAppCli.Classes.BrowserBodyFilterView
 * @extends Backbone.View
 */
meenoAppCli.Classes.BrowserBodyFilterView = Backbone.View.extend({
	// filterName (e.g. "noteFilter") must be declared by passing options to the constructor
	tagName  : "li",
	className: "icon-filter",
	template : '#browser-body-filter-template',

	events: {
		'click': 'activate'
	},

	initialize: function() {
		this.active = false;
		this.listenTo(this.options.parent.filters[this.options.filterName], 'change add:tags remove:tags add:tasks remove:tasks', function () {this.checkStatus()});
		this.listenTo(this.options.parent.filters[this.options.filterName], 'change add:tags remove:tags add:tasks remove:tasks', function () {this.checkStatus()});
		this.listenTo(meenoAppCli.dispatcher, "browser:filters:"+this.options.filterName+":remove-active", function () {this.removeIfActive();});

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
			this.active = true;
		} else {
			this.$el.removeClass('active');
			this.active = false;
		}
	},

	activate: function() {
		if (!this.active) {
			console.log("activate");
			this.options.parent.filters[this.options.filterName].makeItMatch(this.model);
			this.options.parent.filters[this.options.filterName].trigger('change');
		}
	},

	removeIfActive: function() {
		if (this.active) {
			this.model.destroy();
			this.kill();
		}
	},

});