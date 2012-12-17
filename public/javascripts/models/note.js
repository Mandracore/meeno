// js/models/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Note = Backbone.RelationalModel.extend({
	idAttribute: '_id',
	defaults: function() {
		return {
			title     : 'Nouvelle note',
			content   : 'Saisissez ici le contenu de votre note...',
			created_at: new Date(),
			updated_at: new Date()
		};
	},
	relations: [{
		type: 'HasMany',
		key : 'tags',
		relatedModel: 'meenoAppCli.Classes.TagNote',
		reverseRelation: {
			key: 'note',
			includeInJSON: '_id'
		}
	}]
});