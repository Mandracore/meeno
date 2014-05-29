var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tasks = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Task,
	url: '/api/tasks',
	comparator: 'position',

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

	getFirstSiblings: function () {
		return this.find(function (model) {
			return model.get('parent') === false; // those that do not have parent
		});
	},

	getTree: function () {
		return this.getFirstSiblings().getTreeSlave();
	},

	getTreeSlave: function () {
		var self = this;
		this.sort(); // Should sort by position
		var sHtml = "<ul>"; // Should contain the generated tree
		this.each (function (model) {
			if (model.getChildren() !== false ) {
				sHtml += "<li>"+model.get('label')+"</li>";
				sHtml += self.getTreeSlave (model.getChildren());
			} else {
				sHtml += "<li>"+model.get('label')+"</li>";
			}
		})
		sHtml += "</ul>";
		return sHtml;
	}
});