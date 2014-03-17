var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.LinksNoteTask = Backbone.Collection.extend({
	model: meenoAppCli.Classes.LinkNoteTask,
	url: '/api/links-note-task',
});