//==========================================
// DEFINING SERVER SIDE APPLICATION
//==========================================

var application_root = __dirname;
var express          = require("express");
var routes           = require("./app/src/routes");
var http             = require("http");
var path             = require("path");
var mongoose         = require('mongoose');
var stylus           = require('stylus');
var nib              = require('nib');
var meenoAppSrv      = express();

//------------------------------------------
// SERVER CONFIG
//------------------------------------------

meenoAppSrv.configure(function(){
	// app.enable('trust proxy') with proxy, see http://expressjs.com/guide.html
	meenoAppSrv.set('port', process.env.PORT || 3000);
	meenoAppSrv.use(express.favicon());
	meenoAppSrv.use(express.logger('dev'));
	meenoAppSrv.use(express.cookieParser('your secret here'));
	meenoAppSrv.use(express.session());
	meenoAppSrv.use(express.bodyParser());
	meenoAppSrv.use(express.methodOverride());
	meenoAppSrv.use(meenoAppSrv.router);
	meenoAppSrv.set('views', path.join(application_root, "app/src/views"));
	meenoAppSrv.set('view engine', 'jade');
	meenoAppSrv.use(stylus.middleware({
		//src  : application_root + '/public/stylesheets',
		src  : application_root + '/app/src/views',
		dest : application_root + '/public/stylesheets',
		compile: function (str, path) {
			return stylus(str)
				.set('filename', path)
				.set('compress', true)
				.use(nib());
		}
	}));
	meenoAppSrv.use(express.static(path.join(application_root, "public")));
	meenoAppSrv.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

meenoAppSrv.configure('development', function(){
  meenoAppSrv.use(express.errorHandler());
});

//------------------------------------------
// ROUTING
//------------------------------------------

meenoAppSrv.get("/", routes.securityProxy("user"), routes.index);
meenoAppSrv.get("/login", routes.login); // asecurityProxy("user") IS a function, to which meenoAppSrv.get will automatically pass req, res and next variables
meenoAppSrv.post("/login", routes.login);

//------------------------------------------
// START SERVER
//------------------------------------------

http.createServer(meenoAppSrv).listen(meenoAppSrv.get('port'), function(){
  console.log("Node.js - Express server listening on port " + meenoAppSrv.get('port'));
});