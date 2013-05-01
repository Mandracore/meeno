// js/models/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tag = Backbone.NestedModel.extend({
	idAttribute: "_id",
	defaults: function() {
		return {
			label     : 'New Tag',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});