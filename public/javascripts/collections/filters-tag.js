var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagFilters = meenoAppCli.Classes.ObjectFilters.extend ({
	model: meenoAppCli.Classes.TagFilter,
	url: '/api/filters/tag'
});