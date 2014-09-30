define ([
		'jquery',
		'underscore',
		'backbone',
		'models/filter',
	], function ($, _, Backbone, Filter) {

		/**
		 * Parent of the classes {{#crossLink "NoteFilters"}}{{/crossLink}}, {{#crossLink "TaskFilters"}}{{/crossLink}} and {{#crossLink "TagFilters"}}{{/crossLink}}.
		 * It holds all the common methods.
		 * 
		 * @class ObjectFilters
		 * @extends Backbone.Collection
		 */
		var ObjectFilters = Backbone.Collection.extend({
			containsSimilar: function (of) {
				// If we can find a filter that is similar to of, this.find will be different from undefined
				// => containsSimilar() will return true
				return (undefined !== this.find(function(filter) {
					return filter.isSimilar(of);
				}));
			},
		});

		/**
		 * This class defines a collection of {{#crossLink "TaskFilter"}}{{/crossLink}},
		 * 
		 * @class NoteFilters
		 * @extends ObjectFilters
		 */
		var NoteFilters = ObjectFilters.extend({
			model: Filter.Note,
			url: '/api/filters/note'
		});

		/**
		 * This class defines a collection of {{#crossLink "TaskFilter"}}{{/crossLink}},
		 * 
		 * @class TagFilters
		 * @extends ObjectFilters
		 */
		var TagFilters = ObjectFilters.extend ({
			model: Filter.Tag,
			url: '/api/filters/tag'
		});

		/**
		* This class defines a collection of {{#crossLink "TaskFilter"}}{{/crossLink}},
		* 
		* @class TaskFilters
		* @extends ObjectFilters
		*/
		var TaskFilters = ObjectFilters.extend ({
			model: Filter.Task,
			url: '/api/filters/task'
		});

		return {
			Note: NoteFilters,
			Task: TaskFilters,
			Tag : TagFilters,
		};
	}
);