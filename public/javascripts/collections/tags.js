define ([
		'jquery',
		'underscore',
		'backbone',
		'models/tag',
	], function ($, _, Backbone, Tag) {

		/**
		 * This class holds collections of tags
		 * 
		 * @class Tags
		 * @extends Backbone.Collection
		 */

		var Tags = Backbone.Collection.extend({
			model      : Tag,
			url        : '/api/tags',
			comparator : 'label',

			/**
			 * Allows to search through a collection of tags based on full-text search (in label)
			 * 
			 * @method search
			 * @param  {TagFilter} filter the filter used to search the collection
			 * @return {Tags} a new filtered collection of tags
			 * @chainable
			 */
			search : function (filter) {
				if(filter.get('text') === "") return this;
				// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
				var pattern = new RegExp(filter.get('text'),"i");

				return new Tags (this.filter(function(model) {
					// Full text search
					return (pattern.test(model.get("label")));
				}));
			}
		});

		return Tags;
	}
);