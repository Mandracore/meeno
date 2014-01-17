var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Note,
	url: '/api/notes',

	search : function (lookFor) {
		if(lookFor.text == "" && lookFor.objects == []) return this;
		lookFor.text = $.ui.autocomplete.escapeRegex(lookFor.text);

		var pattern = new RegExp(lookFor.text.string,"i");
		return (this.filter(function(model) {
			// Full text search
			if (false === (pattern.test(model.get("title")) || pattern.test(model.get("content")))) {
				return false;
			}
			// Search by related objects
			if (undefined === _.find(lookFor.objects, function(object) { // Returns undefined if nothing found
				
				// var searchedModel = meenoAppCli.[object.class].get(object.id);
				// on passe les 2 autres collections par variable ?
				var links         = (object.class == "tags" ? "tagLinks" : "taskLinks");
				var linksAttr     = (object.class == "tags" ? "tag" : "task");
				// Will find the first object that is not related to the current model
				return (false === _.contains(model.get(links).pluck(linksAttr), searchedModel));
			})) {
				return true;
			} else {
				return false;
			}
		}));
	}
});