// js/routers/router.js
var mee = mee || {};
mee.cla = mee.cla || {};

// Todo Router
// ----------

mee.cla.Router = Backbone.Router.extend({
	routes:{
		'*filter': 'setFilter'
	},

	setFilter: function( param ) {
		//console.log("Router param:"+param);
	}
});

