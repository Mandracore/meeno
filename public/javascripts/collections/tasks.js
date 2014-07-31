var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tasks = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Task,
	url: '/api/tasks',
	comparator: 'position',

	/**
	 * Allows to search through a collection of tasks with a complex filter based on full-text search (in label)
	 * and on tags related or not to the models
	 * @param  {meenoAppCli.Classes.TaskFilter} filter the filter used to search the collection
	 * @return {meenoAppCli.Classes.Tasks} a new filtered collection of tasks
	 */
	search: function (filter) {
		if(filter.get('text') === "" && filter.get('tags').length == 0) return this;
		// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
		var pattern = new RegExp(filter.get('text'),"i");

		return new meenoAppCli.Classes.Tasks (this.filter(function(model) {
			// Full text search
			if (false === (pattern.test(model.get("label")))) {
				return false;
			}

			if (filter.get('tags').length == 0) { return true; }

			// Search by related objects
			// This finder will return the objects for which there is no link
			// If it returns undefined, that means that the current model is a match for our search
			return (undefined === filter.get('tags').find(function(tag) {
				//return (false === _.contains(model.pluckAllTags(), tag)); // Looking for the tag of the filter that is not related to current model
				return (false === _.contains(model.get('tagLinks').pluck('tag'), tag)); // Looking for the tag of the filter that is not related to current model
			}));
		}));
	},

	/**
	 * When moving a task to a new position, shift the following ones down to make some room for it
	 * @param  {meenoAppCli.Classes.Task} anchor the task that has moved, point of reference
	 * @return {void}
	 */
	shiftDown: function (anchor) {
		this.each (function (model) {
			if (model != anchor && model.get('position') >= anchor.get(position)) {
				model.set('position',model.get('position')+1);
				model.save();
			}
		});
	}
});