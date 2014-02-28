var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteFilter = meenoAppCli.Classes.ObjectFilter.extend({
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
			subClass  : 'NoteFilter',
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});