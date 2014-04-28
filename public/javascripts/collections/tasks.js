var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tasks = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Task,
	url: '/api/tasks',

	search: function (filter) {
		if(filter.get('text') === "") return this;
		// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
		var pattern = new RegExp(filter.get('text'),"i");

		return new meenoAppCli.Classes.Tasks (this.filter(function(model) {
			// Full text search
			if (false === (pattern.test(model.get("label")))) {
				return false;
			}
			if (filter.get('tags').length == 0) { return true; }

			// Search by related objects
			// This finder will return the objects for which there is no link
			// If it returns undefined, that means that the current model is a match for our search
			return (undefined === filter.get('tags').find(function(tag) {
				return (false === _.contains(model.get('tagLinks').pluck('tag'), tag)); // Looking for the tag of the filter that is not related to current model
			}));
		}));
	},

	getTree: function () {
		// 1. Build recursive tree ?
		// 2. On each node, check the existence of a parent to draw it
	}
});