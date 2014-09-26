// Define App module's dependencies
// -------------------------------------------------------
define ([
	'jquery',
	'underscore',
	'backbone',
	'views/main',
	'routers/router',
	// 'collections/notes',
	// 'collections/tasks',
	// 'collections/tags',
	// 'collections/filters-note',
	// 'collections/filters-task',
	// 'collections/filters-tag',
	// ], function ($, _, Backbone, MainView, Notes, Tasks, Tags, NoteFilters, TaskFilters, TagFilters, Router) {
	], function ($, _, Backbone, MainView, Router) {

		// Building the attributes and methods of the App object
		// -------------------------------------------------------

		// 1. The initialize method ()
		var initialize = function () {
			Backbone.View.prototype.kill = function () {
				if (this.beforeKill) {
					this.beforeKill();
				}

				this.remove();
				this.off(); // unbind events that are set on this view
				// remove all models bindings made by this view (do not affect any other observer to this model)
				if (this.model) {this.model.off( null, null, this );}
			};

			Backbone.history.start(); // Start Backbone history recording
		};

		// 2. The attributes of the App object
		// var notes       = new Notes(); // Our global collection of notes
		// var tasks       = new Tasks(); // Our global collection of tasks
		// var tags        = new Tags(); // Our global collection of tags
		// var noteFilters = new NoteFilters(); // Our global collection of tasks
		// var taskFilters = new TaskFilters(); // Our global collection of tasks
		// var tagFilters  = new TagFilters(); // Our global collection of tasks
		var mainView    = new MainView(); // Kick things off by creating the **main view**.
		var router      = new Router(); // Initiate Router
		var counters = {
			openedEditors: 0
		};

		// Return what will embody the "App" object
		// ----------------------------------------
		return {
			initialize: initialize,
			// notes: notes,
			// tasks: tasks,
			// tags: tags,
			// noteFilters: noteFilters,
			// taskFilters: taskFilters,
			// tagFilters: tagFilters,
			mainView: mainView,
			router: router,
			counters: counters,
		};
	}
);