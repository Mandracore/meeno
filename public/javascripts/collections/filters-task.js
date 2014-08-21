var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.TaskFilters
 * @extends mee.cla.ObjectFilters
 */
mee.cla.TaskFilters = mee.cla.ObjectFilters.extend ({
	model: mee.cla.TaskFilter,
	url: '/api/filters/task'
});