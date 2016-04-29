// This file aims at setting up Require.js and loading initially important dependancies
// Modules are loaded relatively to this boot strap and always append with ".js". So the module "app" will load "app.js" which is in the same directory as the bootstrap.

// Configuring aliases for most important modules and libraries to load
require.config ({
	paths: {
		jquery                 : 'lib/jquery-1.8.3.min',
		'jquery.ui'            : 'lib/jquery-ui-1.10.3.custom.min',
		'jquery.finger'        : 'lib/jquery.finger.min',
		'jquery.dateFormat'    : 'lib/jquery.dateFormat-1.0',
		'wysiwyg'              : 'lib/wysiwyg',
		// 'wysiwyg'              : 'lib/wysiwyg.min',
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
		'backbone.dualStorage': {
			deps: ['backbone'],
		},
		// 'backbone.custom': {
		// 	deps: ['backbone'],
		// 	exports: 'Backbone'
		// },
		'backbone.relational': {
			deps: ['backbone'],
		},
		// 'backbone.mousetrap': {
		// 	deps: ['backbone'],
		// },
	}
});

// Ce test ne génère plus d'erreur
// require ([
// 		'backbone', // Load the client-side application module stored in app.js (same folder as this file)
// 		'backbone.relational', // Load the client-side application module stored in app.js (same folder as this file)
// 		'backbone.dualStorage', // Load the client-side application module stored in app.js (same folder as this file)
// 	], function (Backbone) {
// 		console.log("underscore");
// 		console.log(_);
// 		console.log("Backbone");
// 		console.log(Backbone);

// 		var NoteTask = Backbone.RelationalModel.extend({
// 			idAttribute: "_id"
// 		});

// 		console.log(new NoteTask());

// 	}
// );

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