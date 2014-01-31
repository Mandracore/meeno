var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteFilter = Backbone.RelationalModel.extend({
	idAttribute: '_id',
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'meenoAppCli.Classes.Tag'
	},
	{
		type: 'HasMany',
		key: 'tasks',
		relatedModel: 'meenoAppCli.Classes.Task'
	}],
	defaults: function() {
		return {
			text       : '',
			created_at : new Date(),
			updated_at : new Date()
		};
	}
});