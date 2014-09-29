define ([
		'jquery',
		'underscore',
		'backbone',
		'collections/notes',
		'collections/tasks',
		'collections/tags',
		'collections/filters',
	], function ($, _, Backbone, Notes, Tasks, Tags, Filters) {
		// Creating a singleton store for the objects shared within the app
		// The same store will always be returned when required

		var notes       = new Notes(); // Our global collection of notes
		var tasks       = new Tasks(); // Our global collection of tasks
		var tags        = new Tags(); // Our global collection of tags
		var noteFilters = new Filters.note(); // Our global collection of note filters
		var taskFilters = new Filters.task(); // Our global collection of task filters
		var tagFilters  = new Filters.tag(); // Our global collection of tag filters

		var temp = {
			coll: {
				notes: notes,
				tasks: tasks,
				tags: tags,
				noteFilters: noteFilters,
				taskFilters: taskFilters,
				tagFilters: tagFilters,
			},
			count: {
				openedEditors: 0
			},
		};
		return temp;
	}
);