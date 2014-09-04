// This file aims at setting up Require.js and loading initially important dependancies

// Configuring aliases for most important modules and libraries to load
require.config ({
	paths: {
		jquery: 'lib/jquery-1.8.3.min',
		underscore: 'lib/underscore-min',
		backbone: 'lib/backbone',
	}
});

require ([
		'app', // Load the client-side application module stored in app.js (same folder)
	], function (App) {
		// The 'app' dependency is passed in as "App"
		App.initialize();
	}
);