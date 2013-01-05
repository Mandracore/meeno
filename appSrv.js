//==========================================
// DEFINING SERVER SIDE APPLICATION
//==========================================

// Beware namespace collision
var application_root = __dirname;
var express          = require("express");
var http             = require("http");
var path             = require("path");
var mongoose         = require('mongoose');
var stylus           = require('stylus');
var nib              = require('nib');
var mas              = express(); // Meeno App Server


//------------------------------------------
// SERVER CONFIGURATION
//------------------------------------------

mas.configure('development', 'production', function(){
	mas.set('mode', process.env.NODE_ENV || "development");
	mas.set('port', process.env.PORT || 3000);
	mas.use(express.favicon());
	mas.use(express.logger('dev'));
	mas.use(express.cookieParser('your secret here'));
	mas.use(express.session()); // , express.session({ secret: 'esoognom'})
	mas.use(express.bodyParser());
	mas.use(express.methodOverride());
	mas.use(mas.router);
	mas.set('views', path.join(application_root, "app/src/views"));
	mas.set('view engine', 'jade');
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
mas.security = require('./app/src/routes/security.proxy.js');
require('./app/src/routes/main.js')(mas);
require('./app/src/routes/api.notes.js')(mas);
require('./app/src/routes/api.tags.js')(mas);
// require('./app/src/routes/api.tags.notes.js')(mas);

//------------------------------------------
// START SERVER
//------------------------------------------

http.createServer(mas).listen(mas.get('port'), function(){
  console.log("Node.js / Express server listening on port " + mas.get('port') + " in " + mas.get('mode') + " mode");
});