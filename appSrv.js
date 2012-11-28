//==========================================
// DEFINING SERVER SIDE APPLICATION
//==========================================

//var meenoApp         =  meenoApp || {};
var application_root = __dirname;
var express          = require("express");
var path             = require("path");
var mongoose         = require('mongoose');
var stylus           = require('stylus');
var nib              = require('nib');
var appSrv           = express();

console.log(application_root);
console.log("reload");


//------------------------------------------
// SERVER CONFIG
//------------------------------------------

appSrv.configure(function(){
	appSrv.use(express.bodyParser());
	appSrv.use(express.methodOverride());
	appSrv.use(appSrv.router);
	appSrv.use(express.static(path.join(application_root, "public")));
	appSrv.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	appSrv.set('views', path.join(application_root, "app/src/views"));
	appSrv.set('view engine', 'jade');
	appSrv.use(stylus.middleware({
		src  : application_root + '/public/stylesheets',
		dest : application_root + '/public/stylesheets',
		compile: function (str, path) {
			return stylus(str)
				.set('filename', path)
				.set('compress', true)
				.use(nib());
		}
	}));
});


//------------------------------------------
// ROUTING
//------------------------------------------

appSrv.get('/', function(req, res){
	res.render('index.jade', {
		title: 'Meeno'
	});
});
appSrv.get('/2', function(req, res){
	res.render('index2.jade', {
		title: 'Meeno'
	});
});


//------------------------------------------
// START SERVER
//------------------------------------------

appSrv.listen(3000,function () {
	console.log("server is listening on port 3000");
});