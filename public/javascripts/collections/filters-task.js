var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TaskFilters = meenoAppCli.Classes.ObjectFilters.extend ({
	model: meenoAppCli.Classes.TaskFilter,
	url: '/api/filters/task'
});