var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.LinksNoteTag = Backbone.Collection.extend({
	model: meenoAppCli.Classes.LinkNoteTag,
	url: '/api/links-note-tag',
});