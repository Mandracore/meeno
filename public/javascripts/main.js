// This file aims at setting up Require.js and loading initially important dependancies
// Modules are loaded relatively to this boot strap and always append with ".js". So the module "app" will load "app.js" which is in the same directory as the bootstrap.

// Configuring aliases for most important modules and libraries to load
require.config ({
	paths: {
		jquery: 'lib/jquery-1.8.3.min',
		underscore: 'lib/underscore',
		backbone: 'lib/backbone.amd',
		mousetrap: 'lib/mousetrap.min',
		channel: 'channel',
	}
});

require ([
		'app', // Load the client-side application module stored in app.js (same folder as this file)
	], function (App) {
		// The 'app' dependency is passed in as "App"
		App.initialize();
	}
);