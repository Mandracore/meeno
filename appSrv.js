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

// mas.Models           = require("./app/src/models");
// mas.routes           = {main: require("./app/src/routes"), api: require("./app/src/routes/api")};


//------------------------------------------
// MODELS
//------------------------------------------

mas.Models = {
	Note: mongoose.model('Note', new mongoose.Schema({
		title: String,
		content: String,
		created_at: { type: Date, default: function () {return Date.now()} },
		updated_at: { type: Date, default: function () {return Date.now()} }
}))};

//------------------------------------------
// SERVER CONFIG
//------------------------------------------

mas.configure(function(){
	// app.enable('trust proxy') with proxy, see http://expressjs.com/guide.html
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
	mas.use(stylus.middleware({
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
	mas.use(express.static(path.join(application_root, "public")));
	mas.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

mas.configure('development', function(){
  mas.use(express.errorHandler());
});

// DB connection
mongoose.connect('mongodb://localhost/meeno');
//var db = mongoose.createConnection('mongodb://localhost/test');




//------------------------------------------
// ROUTES
//------------------------------------------

mas.routes = {
	index: function (req, res) {
		res.render('index', {
			title: 'Meeno',
			css: '/stylesheets/index.css'
		});
	},
	readAll: function (req, res) {
		return mas.Models.Note.find(function(err, notes) {
			return res.send(notes);
		});
	},
	readOne: function (req, res) {
		return mas.Models.Note.findById(req.params.id, function(err, note) {
			if (!err) {
				return res.send(note);
			}
		});
	},
	update: function (req, res) {
		return mas.Models.Note.findById(req.params.id, function(err, note) {
			note.title      = req.body.title;
			note.content    = req.body.content;
			note.created_at = req.body.created_at;
			note.updated_at = req.body.updated_at;
			return note.save(function(err) {
				if (!err) {
					console.log("updated");
				} else {
					console.log(err);
				}
				return res.send(note);
			});
		});
	},
	create: function (req, res) {
		var note = new mas.Models.Note ({
			title     : req.body.title,
			content   : req.body.content,
			created_at: req.body.created_at,
			updated_at: req.body.updated_at
		});
		note.save(function(err) {
			if (!err) {
				return console.log("created");
			} else {
				console.log(err);
			}
		});
		return res.send(note);
	},
	delete: function (req, res) {
		return mas.Models.Note.findById(req.params.id, function(err, note) {
			return note.remove(function(err) {
				if (!err) {
					console.log("removed");
					return res.send('');
				}
			});
		});
	}
};

//------------------------------------------
// ROUTING
//------------------------------------------

//mas.get("/", mas.routes.securityProxy("user"), mas.routes.index);
//mas.get("/", mas.routes.index); // Disabling security for now
//mas.get("/login", mas.routes.login);
mas.get("/", mas.routes.index);
mas.get("/api/notes", mas.routes.readAll);
mas.get("/api/notes/:id", mas.routes.readOne);
mas.put("/api/notes/:id", mas.routes.update);
mas.post("/api/notes", mas.routes.create);
mas.delete("/api/notes/:id", mas.routes.delete);

//------------------------------------------
// START SERVER
//------------------------------------------

http.createServer(mas).listen(mas.get('port'), function(){
  console.log("Node.js - Express server listening on port " + mas.get('port'));
});