define ([
		'jquery',
		'underscore',
		'backbone',
		'models/link',
	], function ($, _, Backbone, Link) {

		/**
		 * This class holds the note model
		 * 
		 * @class Note
		 * @extends Backbone.RelationalModel
		 */
		var Note = Backbone.RelationalModel.extend({
			idAttribute: '_id',
			relations: [{
				type: 'HasMany',
				key: 'tagLinks',
				relatedModel: Link.NoteTag,
				reverseRelation: {
					key: 'note',
					includeInJSON: '_id'
				}
			},
			{
				type: 'HasMany',
				key: 'taskLinks',
				relatedModel: Link.NoteTask,
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

		return Note;
	}
);