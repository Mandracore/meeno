define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {
		// Creating a singleton listener, the same one being always returned when required
		var channel = _.extend({}, Backbone.Events); 
		return channel;
	}
);