var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.NoteFilters
 * @extends mee.cla.ObjectFilters
 */
mee.cla.NoteFilters = mee.cla.ObjectFilters.extend({
	model: mee.cla.NoteFilter,
	url: '/api/filters/note'
});