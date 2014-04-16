var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tags = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Tag,
	url: '/api/tags',

	search : function (filter) {
		if(filter.get('text') === "") return this;
		// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
		var pattern = new RegExp(filter.get('text'),"i");

		return new meenoAppCli.Classes.Tasks (this.filter(function(model) {
			// Full text search
			return (pattern.test(model.get("label")));
		}));
	}
});