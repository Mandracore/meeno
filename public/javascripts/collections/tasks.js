var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tasks = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Tag, 
	url: '/api/tasks',

	search : function(letters){
		if(letters == "") return this;
		var pattern = new RegExp(letters,"i");
		return _(this.filter(function(data) {
		  	return (pattern.test(data.get("description")));
		}));
	}
});