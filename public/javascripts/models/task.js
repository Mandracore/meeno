// js/models/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Note Model
// ----------
// Our basic **Todo** model has `title` and `completed` attributes.
// Storing a new Entity class in meenoAppCli namespace
// Using singular for Classes like Models => Note. Using plural for Collections => Notes
meenoAppCli.Classes.Task = Backbone.Model.extend({

	// Default attributes for the todo
	// and ensure that each todo created has `title` and `completed` keys.

	/* This is not mandatory when using localStorage only but with other DBs it will be since
	* Backbone needs a reference to wether he has to do put or post operations and so
	*/
	// idAttribute: "_id",

	// defaults: {
	// 	title     : 'Nouvelle note',
	// 	content   : 'Saisissez ici le contenu de votre note...',
	// 	created_at: new Date(),
	// 	updated_at: new Date()
	// }

	defaults: function() {
		return {
			content   : 'Saisissez ici le contenu de votre tâche...',
			created_at: new Date(),
			updated_at: new Date(),
			due_at: new Date(),
			done: false
		};
	}

});
