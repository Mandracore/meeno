//javascripts/appCli.js

var meenoAppCli = meenoAppCli || {};

var ENTER_KEY = 13;

$(function() {
	meenoAppCli.dispatcher = _.extend({}, Backbone.Events); // Init our app-wide listener
	meenoAppCli.Notes      = new meenoAppCli.Classes.Notes(); // Our global collection of notes
	//meenoAppCli.Tasks      = new meenoAppCli.Classes.Tasks(); // Our global collection of tasks
	meenoAppCli.Tags       = new meenoAppCli.Classes.Tags(); // Our global collection of tags
	meenoAppCli.mainView   = new meenoAppCli.Classes.MainView(); // Kick things off by creating the **main view**.
	meenoAppCli.router     = new meenoAppCli.Classes.Router(); // Initiate Router
  	Backbone.history.start(); // Start Backbone history recording
});