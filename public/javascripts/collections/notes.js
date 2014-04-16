var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Note,
	url: '/api/notes',

	search : function (filter) {
		if(filter.get('text') === "" && filter.get('tags').length == 0 && filter.get('tasks').length == 0) return this;
		// filter.text = $.ui.autocomplete.escapeRegex(filter.text);
		var pattern = new RegExp(filter.get('text'),"i");

		return new meenoAppCli.Classes.Notes (this.filter(function(model) {
			// Full text search
			if (false === (pattern.test(model.get("title")) || pattern.test(model.get("content")))) {
				return false;
			}
			if (filter.get('tags').length == 0 && filter.get('tasks').length == 0) { return true; }

			// Search by related objects
			// This finder will return the objects for which there is no link
			// If it returns undefined, that means that the current model is a match for our search
			return (undefined === filter.get('tags').find(function(tag) {
				return (false === _.contains(model.get('tagLinks').pluck('tag'), tag)); // Looking for the tag of the filter that is not related to current model
			})) && (undefined === filter.get('tasks').find(function(task) {
				return (false === _.contains(model.get('taskLinks').pluck('task'), task)); // Looking for the task of the filter that is not related to current model
			}));
		}));
	}
});