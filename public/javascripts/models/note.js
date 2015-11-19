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

			initialize: function() {
				var self = this;
				this.listenTo(this,'change', this.updated);
			},

			updated: function() {
				this.set('updated_at', new Date());
			},

			defaults: function() {
				return {
					title       : 'Nouvelle note',
					content     : 'Saisissez ici le contenu de votre note...',
					content_sec : 'Vous pouvez également saisir vos notes ici...',
					created_at  : new Date(),
					updated_at  : new Date()
				};
			}
		});

		return Note;
	}
);