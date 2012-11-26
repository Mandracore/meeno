//==========================================
// DEFINING SERVER SIDE APPLICATION
//==========================================

//var meenoApp         =  meenoApp || {};
var application_root = __dirname;
var express          = require("express");
var path             = require("path");
var mongoose         = require('mongoose');
var appSrv           = express();

// perform similar check for nested children
//meenoApp.Models = {};

//------------------------------------------
// SERVER CONFIG
//------------------------------------------

appSrv.configure(function(){
	appSrv.use(express.bodyParser());
	appSrv.use(express.methodOverride());
	appSrv.use(appSrv.router);
	appSrv.use(express.static(path.join(application_root, "../public")));
	appSrv.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	appSrv.set('views', path.join(application_root, "src/views"));
	appSrv.set('view engine', 'jade')
	appSrv.use(require('stylus').middleware({ src: __dirname + '/public' }));
});


//------------------------------------------
// ROUTING
//------------------------------------------

appSrv.get('/', function(req, res){
	console.log('test')
	res.render('index.jade', {
		title: 'Meeno'
	});
});


//------------------------------------------
// START SERVER
//------------------------------------------

appSrv.listen(3000,function () {
	console.log("server is listening on port 3000");
});