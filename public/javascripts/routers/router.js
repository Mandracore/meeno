// js/routers/router.js
var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Todo Router
// ----------

meenoAppCli.Classes.Router = Backbone.Router.extend({
	routes:{
		'*filter': 'setFilter'
	},

	setFilter: function( param ) {
		console.log("param:"+param);
	}
});

