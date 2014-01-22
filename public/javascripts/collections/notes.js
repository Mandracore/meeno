var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Note,
	url: '/api/notes',

	search : function (lookFor, collections) {
		if(lookFor.text === "" && lookFor.objects.length == 0) return this;
		// lookFor.text = $.ui.autocomplete.escapeRegex(lookFor.text);
		var pattern = new RegExp(lookFor.text,"i");
		return new meenoAppCli.Classes.Notes (this.filter(function(model) {
			// Full text search
			if (false === (pattern.test(model.get("title")) || pattern.test(model.get("content")))) {
				return false;
			}

			if (lookFor.objects.length === 0) { return true; }
			// Search by related objects
			// This finder will return the objects for which there is no link
			// If it returns undefined, that means that the current model is a match for our search
			var bIsMatch = (undefined === _.find(lookFor.objects, function(object) { // Returns undefined if nothing found
				var searchedModel = collections[object.class].get(object.cid);
				var links         = (object.class == "tags" ? "tagLinks" : "taskLinks");
				var linksAttr     = (object.class == "tags" ? "tag" : "task");
				// Will find the first object that is not related to the current model
				return (false === _.contains(model.get(links).pluck(linksAttr), searchedModel));
			}));
			if (bIsMatch) {
				return true;
			}

			return false;
		}));
	}
});