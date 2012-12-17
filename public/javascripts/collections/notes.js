// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Note, 
	localStorage: new Backbone.LocalStorage('backbone-meeno-notes')
});