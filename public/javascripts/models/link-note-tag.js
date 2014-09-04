/**
 * This class holds the model relating one note to one tag
 * 
 * @class LinkNoteTag
 * @extends Backbone.RelationalModel
 */

define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {

		var LinkNoteTag = Backbone.RelationalModel.extend({
			idAttribute: "_id"
		});

		return LinkNoteTag;
	}
);