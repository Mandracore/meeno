// Define App module's dependencies
// -------------------------------------------------------

/**
* Meeno application core module
@module App
 */

define ([
	'jquery',
	'underscore',
	'backbone',
	'views/main',
	'routers/router',
	'backbone.dualStorage',
	], function ($, _, Backbone, MainView, Router) {

		var initialize = function () {

			Backbone.View.prototype.kill = function () {
				if (this.beforeKill) {
					this.beforeKill();
				}

				this.remove();
				this.off(); // unbind events that are set on this view
				// remove all models bindings made by this view (do not affect any other observer to this model)
				if (this.model) {this.model.off( null, null, this );}
			};

			Backbone.history.start(); // Start Backbone history recording

			new MainView(); // Kick things off by creating the **main view**.
			new Router(); // Initiate Router
		};


		// Return what will embody the "App" object
		// ----------------------------------------
		return {
			initialize: initialize,
		};
	}
);