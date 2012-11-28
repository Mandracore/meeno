// js/models/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Note Model
// ----------
// Our basic **Todo** model has `title` and `completed` attributes.
// Storing a new Entity class in meenoAppCli namespace
// Using singular for Classes like Models => Note. Using plural for Collections => Notes
meenoAppCli.Classes.Note = Backbone.Model.extend({

	// Default attributes for the todo
	// and ensure that each todo created has `title` and `completed` keys.
	defaults: {
		title     : 'Nouvelle note',
		content   : 'Saisissez ici le contenu de votre note...',
		created_at: new Date()
	}

});
