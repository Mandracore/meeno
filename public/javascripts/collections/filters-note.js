var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

/**
 * @class meenoAppCli.Classes.NoteFilters
 * @extends meenoAppCli.Classes.ObjectFilters
 */
meenoAppCli.Classes.NoteFilters = meenoAppCli.Classes.ObjectFilters.extend({
	model: meenoAppCli.Classes.NoteFilter,
	url: '/api/filters/note'
});