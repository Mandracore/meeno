define ([
		'jquery',
		'underscore',
		'backbone',
		'models/link',
	], function ($, _, Backbone, Link) {

		/**
		 * Holds the task model
		 * 
		 * @class Task
		 */
		var Task = Backbone.RelationalModel.extend({
			idAttribute: "_id",
			relations  : [{
				type           : 'HasMany',
				key            : 'noteLinks',
				relatedModel   : Link.NoteTask,
				reverseRelation: {
					key          : 'task',
					includeInJSON: '_id'
				}
			},{
				type           : 'HasMany',
				key            : 'tagLinks',
				relatedModel   : Link.TaskTag,
				reverseRelation: {
					key          : 'task',
					includeInJSON: '_id'
				}
			}],

			/**
			 * This method overrides the one provided by Backbone so that the attribute cid is also included in the json output
			 * This is necessary for decoupling testing from database : we need unique IDs in unit testing but we don't 
			 * want to rely on a database layer
			 * 
			 * @method toJSON
			 * @return {json} all the attributes of the model put in a json object
			 */
			toJSON: function() {
				var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
				json.cid = this.cid;
				return json;
			},

			initialize: function() {
				var self = this;
				this.listenTo(this,'change:label change:position change:completed change:due_at', this.updated);
			},

			updated: function() {
				this.set('updated_at', new Date());
				// this.save(); // Commented for now as it poses problems with unit testing
			},

			defaults: function() {
				return {
					label      : 'New Task',
					description: 'Description of your task...',
					position   : 0,
					completed  : false,
					todo_at    : (new Date()).toISOString(),
					due_at     : (new Date()).toISOString(),
					created_at : (new Date()).toISOString(),
					updated_at : (new Date()).toISOString(),
				};
			}
		});

		return Task;
	}
);