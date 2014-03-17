var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	defaults: function() {
		return {
			label     : 'New Tag',
			color     : '#000000',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});