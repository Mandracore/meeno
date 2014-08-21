var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.NoteFilter
 * @extends mee.cla.ObjectFilter
 */
mee.cla.NoteFilter = mee.cla.ObjectFilter.extend({
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'mee.cla.Tag',
		includeInJSON: '_id',
	},
	{
		type: 'HasMany',
		key: 'tasks',
		relatedModel: 'mee.cla.Task',
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