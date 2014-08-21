var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.TaskFilter
 * @extends mee.cla.ObjectFilter
 */
mee.cla.TaskFilter = mee.cla.ObjectFilter.extend({
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'mee.cla.Tag'
	}],
	defaults: function() {
		return {
			subClass  : 'TaskFilter',
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});