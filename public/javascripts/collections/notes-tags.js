// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagsNotes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.TagNote, 
	url: '/api/tags-notes',
});