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
// MODELS
//------------------------------------------

mas.Models = {
	Note: mongoose.model('Note', new mongoose.Schema({
		_creator: String,
		title: String,
		content: String,
		created_at: { type: Date, default: function () {return Date.now()} },
		updated_at: { type: Date, default: function () {return Date.now()} }
		})),
	User: mongoose.model('User', new mongoose.Schema({
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, default: "user" }
		}))
};


//------------------------------------------
// SERVER CONFIG
//------------------------------------------

mas.configure('development', 'production', function(){
	// app.enable('trust proxy') with proxy, see http://expressjs.com/guide.html
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
	mas.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

mas.configure('production', function(){
	mas.use(express.errorHandler()); 
});

mas.configure('development', 'production', function(){
	mas.use(express.static(path.join(application_root, "public")));
});



// DB connection
mongoose.connect('mongodb://localhost/meeno');


//------------------------------------------
// ROUTES
//------------------------------------------

mas.routes = {
	securityProxy: function (role) {
		return function (req, res, next) {
			if(!req.session.logged) {
				res.send(401,"Unauthorized");
				return;
			}

			if(req.session.user.role == role) {
				next();
			} else {
				res.send(403,"Forbidden");
			}
		}
	},
	index: function (req, res) {
		res.render('index_b', {
			title: 'Meeno',
			css: '/stylesheets/index_b.css'
		});
	},
	login: function (req, res) {
		mas.Models.User.find({'email': req.body.email}, function(err, user) {
			if (err) {return res.send(202, err);}
			if (!user[0]) {return res.send(202, "unknown user");}
			if (user[0].password !== req.body.password) {return res.send(202, "wrong password");}

			// User has been successfully authentified
			req.session.logged = true;
			req.session.user = user[0];
			return res.send(200, user[0]);
		});
	},
	register: function (req, res) {
		if (req.body.emailSignup != req.body.emailSignupConfirm) {
			return res.send(202, "Email addresses do not match");
		}
		if (req.body.passwordSignup != req.body.passwordSignupConfirm) {
			return res.send(202, "Passwords do not match");
		}
		var user = new mas.Models.User ({
			email   : req.body.emailSignup,
			password: req.body.passwordSignup
		});
		user.save(function(err) {
			if (!err) {
				// User has been successfully created
				req.session.logged = true;
				req.session.user = user;
				return res.send(201, user);
			} else {
				return res.send(202, err);
			}
		});
	},
	readAll: function (req, res) {
		return mas.Models.Note.find({'_creator': req.session.user._id }, function(err, notes) {
			return res.send(notes);
		});
	},
	readOne: function (req, res) {
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {
			if (!note) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(note);
			}
		});
	},
	update: function (req, res) {
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {
			if (!note) {return res.send(403,"Forbidden");}

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
			_creator  : req.session.user._id,
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
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {

			if (!note) {return res.send(403,"Forbidden");}
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

mas.get("/", mas.routes.index);
mas.post("/login", mas.routes.login);
mas.post("/register", mas.routes.register);
mas.get("/api/notes", mas.routes.securityProxy("user"), mas.routes.readAll);
mas.get("/api/notes/:id", mas.routes.securityProxy("user"), mas.routes.readOne);
mas.put("/api/notes/:id", mas.routes.securityProxy("user"), mas.routes.update);
mas.post("/api/notes", mas.routes.securityProxy("user"), mas.routes.create);
mas.delete("/api/notes/:id", mas.routes.securityProxy("user"), mas.routes.delete);


//------------------------------------------
// START SERVER
//------------------------------------------

http.createServer(mas).listen(mas.get('port'), function(){
  console.log("Node.js / Express server listening on port " + mas.get('port') + " in " + mas.get('mode') + " mode");
});