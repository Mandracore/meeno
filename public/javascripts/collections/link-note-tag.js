var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.LinkNoteTags = Backbone.Collection.extend({
	model: meenoAppCli.Classes.LinkNoteTag, 
	url: '/api/link-note-tag',
});