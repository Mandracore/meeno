var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.TagFilters
 * @extends mee.cla.ObjectFilters
 */
mee.cla.TagFilters = mee.cla.ObjectFilters.extend ({
	model: mee.cla.TagFilter,
	url: '/api/filters/tag'
});