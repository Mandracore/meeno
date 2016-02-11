module.exports = function(mas) {

	var jwt                = require('jsonwebtoken');
	var Negotiator         = require('negotiator').Negotiator;
	var availableLanguages = ['fr', 'fr-fr', 'fr-ca', 'en', 'en-us', 'en-gb', 'en-ca'];

	//------------------------------------------
	// MAIN ROUTES/CONTROLLERS
	//------------------------------------------
	mas.get('/', function (req, res) {
		negotiator = new Negotiator(req);
		res.render('index', {
			title  : 'Meeno',
			css    : '/stylesheets/index.css',
			locale : negotiator.preferredLanguage(availableLanguages) || 'en'
		});
	});

	// NEW LOGIN ENDPOINT !!!
	// First route to login the user
	mas.post('/login2', function (req, res) {
		if (!req.body.email) {return res.send(202, 'no user provided');}
		mas.Models.User.findOne({'email': req.body.email}, function(err, user) {
			// console.log(user)
			if (err) {return res.send(202, err);}
			if (!user) {return res.send(202, 'unknown user');}
			if (user.password !== req.body.password) {return res.send(202, 'wrong password');}

			// User has been successfully authentified
			// create a token
			var payload = {
				userId: user._id,
				role: "readwrite",
			};
			var token = jwt.sign(payload, mas.get('superSecret'), {
				// expiresInMinutes: 1440 // expires in 24 hours
				issuer: "mandracore",
				expiresIn: 120, // expires in 2 minutes
			});

			// return the information including token as JSON
			return res.json({
				success: true,
				message: 'Enjoy your token!',
				token: token
			});
		});
	});

	mas.post('/login', function (req, res) {
		mas.Models.User.find({'email': req.body.email}, function(err, user) {
			if (err) {return res.send(202, err);}
			if (!user[0]) {return res.send(202, 'unknown user');}
			if (user[0].password !== req.body.password) {return res.send(202, 'wrong password');}

			// User has been successfully authentified
			req.session.logged = true;
			req.session.user = user[0];
			return res.send(200, user[0]);
		});
	});
	mas.post('/register', function (req, res) {
		if (req.body.emailSignup != req.body.emailSignupConfirm) {
			return res.send(202, 'Email addresses do not match');
		}
		if (req.body.passwordSignup != req.body.passwordSignupConfirm) {
			return res.send(202, 'Passwords do not match');
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
	});
};