define ([
	// path aliases preconfigured in ../main.js
		'jquery',
		'underscore',
		'backbone',
		'models/task',
	], function ($, _, Backbone, Task) {

		/**
		 * Holds a collection of tasks
		 * 
		 * @class Tasks
		 * @extends Backbone.Collection
		 */
		var Tasks = Backbone.Collection.extend({
			model: Task,
			url: '/api/tasks',
			comparator: 'position',

			/**
			 * Allows to search through a collection of tasks with a complex filter based on full-text search (in label)
			 * and on tags related or not to the models
			 * 
			 * @method search
			 * @param  {TaskFilter} filter the filter used to search the collection
			 * @return {Tasks} a new filtered collection of tasks
			 * @chainable
			 */
			search: function (filter) {
				if(filter.get('text') === "" && filter.get('tags').length == 0) return this;
				// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
				var pattern = new RegExp(filter.get('text'),"i");

				return new Tasks (this.filter(function(model) {
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
			 * When moving a task to a new position, shift the following ones down to make some room for it.
			 * Also needs to be called when a new task is appended to a collection.
			 * 
			 * @method shiftDown
			 * @param  {Task} anchor the task that was moved, point of reference 
			 */
			shiftDown: function (anchor) {
				this.each (function (model) {
					if (model != anchor && model.get('position') >= anchor.get('position')) {
						model.set('position',model.get('position')+1);
						model.save();
					}
				});
			},
		});

		return Tasks;
	}
);