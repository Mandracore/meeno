var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteFilters = meenoAppCli.Classes.ObjectFilters.extend({
	model: meenoAppCli.Classes.NoteFilter,
	url: '/api/filters-note'
});