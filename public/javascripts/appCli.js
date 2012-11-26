//javascripts/appCli.js

var meenoAppCli = meenoAppCli || {};

var ENTER_KEY = 13;

$(function() {
	// Create our global collection of **Notes**.
	meenoAppCli.Notes = new meenoAppCli.Classes.Notes();

	// Kick things off by creating the **main view**.
	new meenoAppCli.Classes.MainView();
});