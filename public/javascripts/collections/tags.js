// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// The collection of todos is backed by *localStorage* instead of a remote
// server.
meenoAppCli.Classes.Tags = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Tag, 
	localStorage: new Backbone.LocalStorage('backbone-meeno-tags')
});