define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {

		var Router = Backbone.Router.extend({
			routes:{
				'*filter': 'setFilter'
			},

			setFilter: function( param ) {
				//console.log("Router param:"+param);
			}
		});

		return Router;
	}
);

/*


define ([
		'jquery',
		'underscore',
		'backbone',
	], function ($, _, Backbone) {
		return {};
	}
);*/