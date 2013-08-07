var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Note, 
	url: '/api/notes',
	
	search : function(letters){
		if(letters == "") return this;
		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return (pattern.test(data.get("title")) || pattern.test(data.get("content")));
		}));
	}
});