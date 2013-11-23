var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Note,
	url: '/api/notes',

	search : function(lookFor){
		if(lookFor === "") return this;

		var pattern = new RegExp(lookFor.string,"i");
		return _(this.filter(function(data) {
			// Full text search
			var bContainsText = (pattern.test(data.get("title")) || pattern.test(data.get("content")))
			// Object links search
			var bIsRelated = data.get(lookFor);
			return bContainsText || bIsRelated;
		}));
	}
});