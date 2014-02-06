var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagFilters = Backbone.Collection.extend({
	model: meenoAppCli.Classes.TagFilter,
	url: '/api/filters-tag'
});