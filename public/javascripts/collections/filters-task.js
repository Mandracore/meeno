var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TaskFilters = Backbone.Collection.extend({
	model: meenoAppCli.Classes.TaskFilter,
	url: '/api/filters-task'
});