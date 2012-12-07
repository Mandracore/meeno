// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// The collection of todos is backed by *localStorage* instead of a remote
// server.
meenoAppCli.Classes.Notes = Backbone.Collection.extend({

	// Référence à la classe créée dans models/todo.js et 
	// sauvegardée dans la classe meenoAppCli.Classes.Notes et dans toute future instanciation de celle-ci
	model: meenoAppCli.Classes.Note, 

	// Save all of the todo items under the `"todos"` namespace.
	//localStorage: new Backbone.LocalStorage('backbone-meeno-notes')
	url: '/api/notes'
});