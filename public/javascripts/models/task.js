var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * Holds the task model
 * 
 * @class mee.cla.Task
 */
mee.cla.Task = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations  : [{
		type           : 'HasMany',
		key            : 'noteLinks',
		relatedModel   : 'mee.cla.LinkNoteTask',
		reverseRelation: {
			key          : 'task',
			includeInJSON: '_id'
		}
	},{
		type           : 'HasMany',
		key            : 'tagLinks',
		relatedModel   : 'mee.cla.LinkTaskTag',
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

	defaults: function() {
		return {
			label      : 'New Task',
			description: 'Description of your task...',
			position   : 0,
			due_at     : new Date(),
			created_at : new Date(),
			updated_at : new Date()
		};
	}
});