define ([
		'jquery',
		'underscore',
		'backbone',
		'backbone.relational',
	], function ($, _, Backbone) {

		/**
		 * This class holds the model relating one note to one task
		 * 
		 * @class NoteTask
		 * @extends Backbone.RelationalModel
		 */
		var NoteTask = Backbone.RelationalModel.extend({
			idAttribute: "_id"
		});

		/**
		 * This class holds the model relating one note to one tag
		 * 
		 * @class NoteTag
		 * @extends Backbone.RelationalModel
		 */
		var NoteTag = Backbone.RelationalModel.extend({
			idAttribute: "_id"
		});

		/**
		 * This class holds the model relating one task to one tag
		 * 
		 * @class TaskTag
		 * @extends Backbone.RelationalModel
		 */
		var TaskTag = Backbone.RelationalModel.extend({
			idAttribute: "_id"
		});

		return {
			NoteTask: NoteTask,
			NoteTag : NoteTag,
			TaskTag : TaskTag,
		};
	}
);