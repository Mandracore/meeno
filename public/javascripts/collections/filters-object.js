var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * @class mee.cla.ObjectFilters
 * @extends Backbone.Collection
 */
mee.cla.ObjectFilters = Backbone.Collection.extend({
	containsSimilar: function (of) {
		// If we can find a filter that is similar to of, this.find will be different from undefined
		// => containsSimilar() will return true
		return (undefined !== this.find(function(filter) {
			return filter.isSimilar(of);
		}));
	},
});