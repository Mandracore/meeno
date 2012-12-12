// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A collection of notes (hence the use of the plural)
meenoAppCli.Classes.Notes = Backbone.Collection.extend({
	// The model related to this collection
	model: meenoAppCli.Classes.Note, 
	// We define here were the collection is retrieved from
	localStorage: new Backbone.LocalStorage('backbone-meeno-notes')
});