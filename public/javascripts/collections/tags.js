/**
 * This class holds collections of tags
 * 
 * @class Notes
 * @extends Backbone.Collection
 */

Tags = Backbone.Collection.extend({
	model: Tag,
	url: '/api/tags',

	/**
	 * @method search
	 * @param {TagFilter} filter
	 */
	search : function (filter) {
		if(filter.get('text') === "") return this;
		// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
		var pattern = new RegExp(filter.get('text'),"i");

		return new Tasks (this.filter(function(model) {
			// Full text search
			return (pattern.test(model.get("label")));
		}));
	}
});