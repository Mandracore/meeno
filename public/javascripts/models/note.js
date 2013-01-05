// js/models/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Note = Backbone.NestedModel.extend({
// meenoAppCli.Classes.Note = Backbone.Model.extend({
	idAttribute: '_id',
	tags:[],
	/*
	relations: [{
		type: 'HasMany',
		key : 'tags',
		relatedModel: 'meenoAppCli.Classes.NoteTag',
		reverseRelation: {
			key: 'note',
			includeInJSON: '_noteID'
		}
	}],*/
	defaults: function() {
		return {
			title     : 'Nouvelle note',
			content   : 'Saisissez ici le contenu de votre note...',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});