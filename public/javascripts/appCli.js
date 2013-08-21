//javascripts/appCli.js

var meenoAppCli = meenoAppCli || {};

var ENTER_KEY = 13;

$(function() { // This ensures the code will be executed when DOM is ready

	Backbone.View.prototype.kill = function () {
		if (this.beforeKill) {
			this.beforeKill();
		}

		// same as this.$el.remove();
		// console.log ("Killing : "+this.options.class);
		console.log ("[Kill]");
		this.remove();
		// unbind events that are set on this view
		this.off();
		// remove all models bindings made by this view (do not affect any other observer to this model)
		this.model.off( null, null, this );
		// console.log ('___________View killed___________:');
		// Beware : this remove cannot event listeners referring to this view and set on other objects !
	};
	meenoAppCli.dispatcher = _.extend({}, Backbone.Events); // Init our app-wide listener
	meenoAppCli.notes      = new meenoAppCli.Classes.Notes(); // Our global collection of notes
	meenoAppCli.tasks      = new meenoAppCli.Classes.Tasks(); // Our global collection of tasks
	meenoAppCli.tags       = new meenoAppCli.Classes.Tags(); // Our global collection of tags
	meenoAppCli.mainView   = new meenoAppCli.Classes.MainView(); // Kick things off by creating the **main view**.
	meenoAppCli.router     = new meenoAppCli.Classes.Router(); // Initiate Router
	meenoAppCli.counters = {
		openedEditors: 0
	};


	Backbone.history.start(); // Start Backbone history recording
});