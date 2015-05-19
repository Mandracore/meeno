
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
			comparator: function (task1, task2) {
				/* 	Guidelines for building a "sort"-like backbone comparator :
						return -1 if the first model should come before the second
						return 0 if they are of the same rank
						return 1 if the first model should come after
				*/

				var date1 = typeof task1.get('todo_at') == "string" ? new Date (task1.get('todo_at')) : task1.get('todo_at');
				var date2 = typeof task2.get('todo_at') == "string" ? new Date (task2.get('todo_at')) : task2.get('todo_at');
				date1.setHours(0,0,0,0);
				date2.setHours(0,0,0,0);
				var time1 = date1.getTime();
				var time2 = date2.getTime();

				if(time1 < time2) {
					return -1;
				} else if (time1 === time2) { 
					if(task1.get('position') < task2.get('position')) {
						return -1;
					} else if (task1.get('position') === task2.get('position')) {
						return 0;
					} else {
						return 1;
					}
				} else {
					return 1;
				}
			},

			/**
			 * Allows to search through a collection of tasks with a complex filter based on full-text search (in label)
			 * and on tags related or not to the models. The filtering of tasks can also take into account the "completed"
			 * attribute.
			 * 
			 * @method search
			 * @param  {TaskFilter} filter the filter used to search the collection
			 * @return {Tasks} a new filtered collection of tasks
			 * @chainable
			 */
			search: function (filter) {
				if(
					filter.get('text') === "" &&
					filter.get('completed') == 2 &&
					filter.get('tags').length == 0
					) {
					console.log ("exit case");
					return this.sort();
				}
				// var letters = $.ui.autocomplete.escapeRegex(filter.get('text'));
				var pattern = new RegExp(filter.get('text'),"i");
				
				return new Tasks (this.filter(function(model) {
					// Testing 'completed' attribute
					if (filter.get('completed') != 2) {
						if (model.get('completed') != filter.get('completed')) {
							return false;
						}
					}
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
			 * @param  {Task} anchor the task that was moved, point of reference.
			 */
			shiftDown: function (anchor) {
				this.each (function (model) {
					if (model != anchor && model.get('position') >= anchor.get('position')) {
						model.set('position',model.get('position')+1);
						//model.save();
					}
				});
			},
		});

		return Tasks;
	}
);