var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Note = Backbone.RelationalModel.extend({
	idAttribute: '_id',
	relations: [{
		type: 'HasMany',
		key: 'tagLinks',
		relatedModel: 'meenoAppCli.Classes.LinkNoteTag',
		reverseRelation: {
			key: 'note',
			includeInJSON: '_id'
		}
	},
	{
		type: 'HasMany',
		key: 'taskLinks',
		relatedModel: 'meenoAppCli.Classes.LinkNoteTask',
		reverseRelation: {
			key: 'note',
			includeInJSON: '_id',
		}
	}],
	defaults: function() {
		return {
			title     : 'Nouvelle note',
			content   : 'Saisissez ici le contenu de votre note...',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});