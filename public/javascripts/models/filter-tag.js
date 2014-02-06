var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagFilter = Backbone.RelationalModel.extend({
	idAttribute: '_id',
	defaults: function() {
		return {
			text       : '',
			created_at : new Date(),
			updated_at : new Date()
		};
	}
});