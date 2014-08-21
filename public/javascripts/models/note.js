var mee = mee || {};
mee.cla = mee.cla || {};

mee.cla.Note = Backbone.RelationalModel.extend({
	idAttribute: '_id',
	relations: [{
		type: 'HasMany',
		key: 'tagLinks',
		relatedModel: 'mee.cla.LinkNoteTag',
		reverseRelation: {
			key: 'note',
			includeInJSON: '_id'
		}
	},
	{
		type: 'HasMany',
		key: 'taskLinks',
		relatedModel: 'mee.cla.LinkNoteTask',
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