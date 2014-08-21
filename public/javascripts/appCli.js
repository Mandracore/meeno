//javascripts/appCli.js

var mee = mee || {};

$(function() { // This ensures the code will be executed when DOM is ready

	Backbone.View.prototype.kill = function () {
		if (this.beforeKill) {
			this.beforeKill();
		}

		//console.log ("[Kill]");
		this.remove();
		// unbind events that are set on this view
		this.off();
		// remove all models bindings made by this view (do not affect any other observer to this model)
		if (this.model) {this.model.off( null, null, this );}
		// Beware : this remove cannot event listeners referring to this view and set on other objects !
	};
	mee.dispatcher  = _.extend({}, Backbone.Events); // Init our app-wide listener
	mee.notes       = new mee.cla.Notes(); // Our global collection of notes
	mee.tasks       = new mee.cla.Tasks(); // Our global collection of tasks
	mee.tags        = new mee.cla.Tags(); // Our global collection of tags
	mee.noteFilters = new mee.cla.NoteFilters(); // Our global collection of tasks
	mee.taskFilters = new mee.cla.TaskFilters(); // Our global collection of tasks
	mee.tagFilters  = new mee.cla.TagFilters(); // Our global collection of tasks
	mee.mainView    = new mee.cla.MainView(); // Kick things off by creating the **main view**.
	mee.router      = new mee.cla.Router(); // Initiate Router
	mee.counters = {
		openedEditors: 0
	};


	Backbone.history.start(); // Start Backbone history recording
});