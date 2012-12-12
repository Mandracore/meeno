// javascripts/models/note.js

var meenoAppCli = meenoAppCli || {}; // To keep us safe from namespace collision
meenoAppCli.Classes = meenoAppCli.Classes || {}; // To store our Classes

// The model of a note
meenoAppCli.Classes.Note = Backbone.Model.extend({
	// The defaults : a note should always have a created_at property set to now,...
	defaults: {
		title     : 'Nouvelle note',
		content   : 'Saisissez ici le contenu de votre note...',
		created_at: new Date()
	}

});
