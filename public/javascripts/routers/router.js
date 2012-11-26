// js/routers/router.js
var appCli = appCli || {};
appCli.Classes = appCli.Classes || {};

// Todo Router
// ----------

appCli.Classes.Router = Backbone.Router.extend({
	routes:{
		'*filter': 'setFilter'
	},

	setFilter: function( param ) {
		// Set the current filter to be used
		appCli.TodoFilter = param.trim() || '';

		// Trigger a collection filter event, causing hiding/unhiding
		// of Todo view items
		appCli.Todos.trigger('filter');
	}
});

