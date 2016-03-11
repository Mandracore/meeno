//==========================================
// DEFINING SERVER SIDE APPLICATION
//==========================================

// Beware namespace collision
var application_root = __dirname;
var http             = require("http");
var path             = require("path");
var express          = require("express");
var mongoose         = require('mongoose');
var stylus           = require('stylus');
var nib              = require('nib');
var mas              = express(); // Meeno App Server
var bodyParser       = require('body-parser');
var morgan           = require('morgan');
mas.jwt              = require('jsonwebtoken'); // used to create, sign, and verify tokens


//------------------------------------------
// SERVER CONFIGURATION // TO BE ADJUSTED FOR PROD
//------------------------------------------

mas.configure('development', 'production', function(){
	mas.set('mode', process.env.NODE_ENV || "preproduction");
	// mas.set('mode', process.env.NODE_ENV || "development");
	mas.set('port', process.env.PORT || 3000);
	if (mas.get('mode') == "production") {
		mas.set('port', 80);
	}
	mas.use(express.favicon());
	mas.use(express.logger('dev'));
	mas.use(express.bodyParser());
	mas.use(express.methodOverride());
	mas.use(mas.router);
	mas.set('views', path.join(application_root, "app/src/views"));
	mas.set('view engine', 'jade');

	// JSON Web Tokens Parameters
	mas.set('superSecret', "D@n1$06pG%9T3TL9@Z6PB1MGA6s%vJRdgAZ^9HR@7fKF!BVv@YnFlKz&E8!o9gF&$XWVbilLjn132YNGL6PZQ19XK&hbD$w#A^K4"); // secret variable
	// use body parser so we can get info from POST and/or URL parameters
	mas.use(bodyParser.urlencoded({ extended: false }));
	mas.use(bodyParser.json());
});

mas.configure('development', function(){
	mas.use(stylus.middleware({
		// Beware : if you do GET localhost/stylesheets/style.css, Stylus will try to recover the following file :
		// src + /stylesheets/style.css and save the compiled one as :
		// dest + /stylesheets/style.css
		src  : application_root + '/app/src/views',
		dest : application_root + '/public',
		compile: function (str, path) {
			return stylus(str)
				.set('filename', path)
				.set('compress', true)
				.set('warn', true)
				.use(nib());
		}
	}));
	mas.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

mas.configure('production', function(){
	mas.use(express.errorHandler()); 
});

mas.configure('development', 'production', function(){
	mas.use(express.static(path.join(application_root, "public")));
});

//------------------------------------------
// DB CONNEXION
//------------------------------------------
mongoose.connect('mongodb://localhost/meeno');

//------------------------------------------
// MODELS
//------------------------------------------
require('./app/src/models/index.js')(mas, mongoose);

//------------------------------------------
// ROUTING
//------------------------------------------

// Serve cache manifest
var version=7;
mas.get('/cache.manifest',function(q,s){
	s.setHeader('content-type','text/cache-manifest'); // Header type cache-manifest mandatory
	s.end([
		'CACHE MANIFEST',
		'#v'+version, // Store version number
		'CACHE:', // Resources to cache
		'/javascripts-built/main.notyet.js',
		'NETWORK:', // Resources that must never be cached
		'/',
		'/login',
		'/logout',
		'/register',
		'/api', // everything starting with /api
	].join("\n"));
});

var authentication = require('./app/src/routes/authenticate.js');

// All routes starting with /api/ must first execute the authentication proxy
mas.all(['/api/*', '/logout'], function (req, res, next) {
  authentication.proxy (mas.get('superSecret'), req, res, next);
});

require('./app/src/routes/main.js')(mas);
require('./app/src/routes/api.notes.js')(mas);
require('./app/src/routes/api.tags.js')(mas);
require('./app/src/routes/api.tasks.js')(mas);
require('./app/src/routes/api.filters.js')(mas);

//------------------------------------------
// START HTTP SERVER
//------------------------------------------

http.createServer(mas).listen(mas.get('port'), function(){
  console.log("Node.js / Express HTTP server listening on port " + mas.get('port') + " in " + mas.get('mode') + " mode");
});