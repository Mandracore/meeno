var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tags = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Tag,
	url: '/api/tags',

	search : function(letters){
		letters = $.ui.autocomplete.escapeRegex(letters);
		if(letters === "") return this;
		var pattern = new RegExp(letters,"i");
		return _(this.filter(function(data) {
			return (pattern.test(data.get("label")));
		}));
	}
});