/**
 * This class holds the note model
 * 
 * @class Note
 * @extends Backbone.RelationalModel
 * @requires LinkNoteTask
 * @requires LinkNoteTag
 */

define ([
		'jquery',
		'underscore',
		'backbone',
		'models/link-note-task',
		'models/link-note-tag',
	], function ($, _, Backbone, LinkNoteTag, LinkNoteTask) {
		var Note = Backbone.RelationalModel.extend({
			idAttribute: '_id',
			relations: [{
				type: 'HasMany',
				key: 'tagLinks',
				relatedModel: 'LinkNoteTag',
				reverseRelation: {
					key: 'note',
					includeInJSON: '_id'
				}
			},
			{
				type: 'HasMany',
				key: 'taskLinks',
				relatedModel: 'LinkNoteTask',
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