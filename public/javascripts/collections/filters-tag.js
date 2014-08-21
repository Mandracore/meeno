var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

/**
 * @class meenoAppCli.Classes.TagFilters
 * @extends meenoAppCli.Classes.ObjectFilters
 */
meenoAppCli.Classes.TagFilters = meenoAppCli.Classes.ObjectFilters.extend ({
	model: meenoAppCli.Classes.TagFilter,
	url: '/api/filters/tag'
});