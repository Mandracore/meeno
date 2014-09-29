define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {
		// Creating a singleton store for the objects shared within the app
		// The same store will always be returned when required

		var notes       = new Notes(); // Our global collection of notes
		var tasks       = new Tasks(); // Our global collection of tasks
		var tags        = new Tags(); // Our global collection of tags
		var noteFilters = new NoteFilters(); // Our global collection of tasks
		var taskFilters = new TaskFilters(); // Our global collection of tasks
		var tagFilters  = new TagFilters(); // Our global collection of tasks

		var temp = {
			coll: {
				notes: notes,
				tasks: tasks,
				tags: tags,
				noteFilters: noteFilters,
				taskFilters: taskFilters,
				tagFilters: tagFilters,
			}
			count: {
				openedEditors: 0
			}
		};
		return temp;
	}
);