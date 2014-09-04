define ([
		'backbone',
	], function (Backbone) {

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