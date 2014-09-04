/**
 * This class holds the model relating one note to one task
 * 
 * @class LinkNoteTask
 * @extends Backbone.RelationalModel
 */

define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {

		var LinkNoteTask = Backbone.RelationalModel.extend({
			idAttribute: "_id"
		});

		return LinkNoteTask;
	}
);