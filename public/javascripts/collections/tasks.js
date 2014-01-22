var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tasks = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Task,
	url: '/api/tasks',

	search : function(lookFor, collections){
		if(lookFor.text === "") return this;
		var letters = $.ui.autocomplete.escapeRegex(lookFor.text);
		var pattern = new RegExp(letters,"i");
		return this.filter(function(data) {
			return (pattern.test(data.get("label")) || pattern.test(data.get("description")));
		});
	}
});