var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tasks = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Task,
	url: '/api/tasks',

	search : function(letters){
		letters = $.ui.autocomplete.escapeRegex(letters);
		if(letters === "") return this;

		var pattern = new RegExp(letters,"i");
		return _(this.filter(function(data) {
			return (pattern.test(data.get("label")) || pattern.test(data.get("description")));
		}));
	}
});