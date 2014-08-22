var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.Tags
 */
mee.cla.Tags = Backbone.Collection.extend({
	model: mee.cla.Tag,
	url: '/api/tags',

	/**
	 * @method search
	 * @param {mee.cla.TagFilter} filter
	 */
	search : function (filter) {
		if(filter.get('text') === "") return this;
		// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
		var pattern = new RegExp(filter.get('text'),"i");

		return new mee.cla.Tasks (this.filter(function(model) {
			// Full text search
			return (pattern.test(model.get("label")));
		}));
	}
});