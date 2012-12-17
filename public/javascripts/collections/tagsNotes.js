// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagsNotes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.TagNote, 
	localStorage: new Backbone.LocalStorage('backbone-meeno-tagsNotes')
});