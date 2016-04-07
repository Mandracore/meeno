// This file aims at setting up Require.js and loading initially important dependancies
// Modules are loaded relatively to this boot strap and always append with ".js". So the module "app" will load "app.js" which is in the same directory as the bootstrap.

// Configuring aliases for most important modules and libraries to load
require.config ({
	paths: {
		jquery                 : 'lib/jquery-1.8.3.min',
		'jquery.ui'            : 'lib/jquery-ui-1.10.3.custom.min',
		'jquery.finger'        : 'lib/jquery.finger.min',
		'jquery.dateFormat'    : 'lib/jquery.dateFormat-1.0',
		underscore             : 'lib/underscore',
		backbone               : 'lib/backbone',
		'backbone.relational'  : 'lib/backbone-relational',
		'backbone.dualStorage' : 'lib/backbone.dualstorage',
		mousetrap              : 'lib/mousetrap.min',
	},
	shim: {
		'jquery.ui': {
			deps: ['jquery'],
			exports: '$'
		},
		'jquery.finger': {
			deps: ['jquery'],
			exports: '$'
		},
		'jquery.dateFormat': {
			deps: ['jquery'],
			exports: '$'
		},
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'backbone.custom': {
			deps: ['backbone'],
			exports: 'Backbone'
		},
		'backbone.dualStorage': {
			deps: ['backbone'],
			exports: 'Backbone'
		},
		// 'backbone.relational': {
		// 	deps: ['backbone'],
		// 	exports: 'Backbone'
		// },
		'backbone.mousetrap': {
			deps: ['backbone'],
			exports: 'Backbone'
		},
	}
});

require ([
		'app', // Load the client-side application module stored in app.js (same folder as this file)
	], function (App) {
		// The 'app' dependency is passed in as "App"
		App.initialize();

		window.addEventListener('load', function(e) {
			window.applicationCache.addEventListener('updateready', function(e) {
				window.applicationCache.swapCache();
				window.location.reload();
			})
			window.applicationCache.update();
		})
	}
);