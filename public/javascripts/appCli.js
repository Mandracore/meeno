//javascripts/appCli.js
//==========================================
// INITIATING CLIENT SIDE APPLICATION
//==========================================

var meenoAppCli = meenoAppCli || {};

var ENTER_KEY = 13;

$(function() {
	// Create our global collection of Notes
	meenoAppCli.Notes = new meenoAppCli.Classes.Notes();

	// Launch the client application by initiating a MainView
	new meenoAppCli.Classes.MainView();
});