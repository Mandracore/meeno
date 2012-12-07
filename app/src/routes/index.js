//------------------------------------------
// PROXY CONTROLLER FOR AUTHENTIFICATION
//------------------------------------------
// A proxy to ensure security to use with any sensible route
// securityProxy(roleX) will return a function
exports.securityProxy = function (role) {
	return function (req, res, next) {
		if(!req.session.logged) {
			//res.send(401,"Unauthorized");
			res.redirect('/login');
			return;
		}

		if(req.session.user && req.session.user.role === role) {
			next();
		} else {
			res.send(403,"Forbidden");
		}
	}
};

//------------------------------------------
// CONTROLLERS
//------------------------------------------
/*
* GET home page.
* /
*/
exports.index = function (req, res) {
	res.render('index', {
		title: 'Meeno',
		css: '/stylesheets/index.css'
	});
};

/*
* GET/POST login page.
* /login
*/
// exports.login = function (req, res) {
// 	if (req.method == "POST") {
// 		if(req.param('username') == "romain.latroy@gmail.com" && req.param('password') == "test") {
// 			req.session.logged = true;
// 			req.session.user = {
// 				name: 'romain.latroy',
// 				role: 'user'
// 			}
// 			res.redirect('/');
// 		}
// 		else {
// 			res.redirect('/login');
// 		}
// 	}
// 	if (req.method == "GET") {
// 		req.params.type;
// 		res.render('login', {
// 			title: 'Meeno',
// 			css: '/stylesheets/login.css'
// 		});
// 	}
// };