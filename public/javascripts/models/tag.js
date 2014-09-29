Tag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type: 'HasMany',
		key: 'noteLinks',
		relatedModel: 'LinkNoteTag',
		reverseRelation: {
			key: 'tag',
			includeInJSON: '_id'
		}
	},{
		type: 'HasMany',
		key: 'taskLinks',
		relatedModel: 'LinkTaskTag',
		reverseRelation: {
			key: 'tag',
			includeInJSON: '_id'
		}
	}],
	defaults: function() {
		return {
			label     : 'New Tag',
			color     : '#000000',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});