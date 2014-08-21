var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

/**
 * @class meenoAppCli.Classes.NoteFilter
 * @extends meenoAppCli.Classes.ObjectFilter
 */
meenoAppCli.Classes.NoteFilter = meenoAppCli.Classes.ObjectFilter.extend({
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'meenoAppCli.Classes.Tag',
		includeInJSON: '_id',
	},
	{
		type: 'HasMany',
		key: 'tasks',
		relatedModel: 'meenoAppCli.Classes.Task',
		includeInJSON: '_id',
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