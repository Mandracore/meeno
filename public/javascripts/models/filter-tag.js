var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.TagFilter
 * @extends mee.cla.ObjectFilter
 */
mee.cla.TagFilter = mee.cla.ObjectFilter.extend({
	defaults: function() {
		return {
			subClass  : 'TagFilter',
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});