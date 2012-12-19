//javascripts/appCli.js

var meenoAppCli = meenoAppCli || {};

var ENTER_KEY = 13;

$(function() {
	// Create our global collections
	meenoAppCli.Notes = new meenoAppCli.Classes.Notes();
	// meenoAppCli.TagsNotes = new meenoAppCli.Classes.TagsNotes();

	// Init listener
	meenoAppCli.dispatcher = _.clone(Backbone.Events);

	// Kick things off by creating the **main view**.
	meenoAppCli.mainView = new meenoAppCli.Classes.MainView();

	// Initiate Router
	meenoAppCli.router = new meenoAppCli.Classes.Router();
  	Backbone.history.start();
});