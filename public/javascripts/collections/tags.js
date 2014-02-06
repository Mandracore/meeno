var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tags = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Tag,
	url: '/api/tags',

	search : function(filter) {
		if(filter.get('text') === "") return this;
		var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
		var pattern = new RegExp(letters,"i");
		return this.filter(function(data) {
			return (pattern.test(data.get("label")));
		});
	}
});