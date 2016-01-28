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
				this.listenTo(this,'change', this.updated);
			},

			updated: function() {
				this.set('updated_at', new Date().toISOString());
			},

			defaults: function() {
				return {
					title       : 'New note',
					content     : '<h1>Column 1 header</h1><p>Set here the content of your note</p>',
					content_sec : '<h1>Column 2 header</h1><p>Set here some other content for your note</p>',
					created_at  : (new Date()).toISOString(),
					updated_at  : (new Date()).toISOString(),
				};
			}
		});

		return Note;
	}
);