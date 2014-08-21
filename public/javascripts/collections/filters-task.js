var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

/**
 * @class meenoAppCli.Classes.TaskFilters
 * @extends meenoAppCli.Classes.ObjectFilters
 */
meenoAppCli.Classes.TaskFilters = meenoAppCli.Classes.ObjectFilters.extend ({
	model: meenoAppCli.Classes.TaskFilter,
	url: '/api/filters/task'
});