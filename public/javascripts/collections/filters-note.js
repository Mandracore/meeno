var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteFilters = Backbone.Collection.extend({
	model: meenoAppCli.Classes.NoteFilter,
	url: '/api/filters-note'
});