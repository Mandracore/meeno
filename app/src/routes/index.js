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
*/
exports.index = function (req, res) {
	res.render('index', { title: 'Meeno' });
};

/*
* GET/POST login page.
*/
exports.login = function (req, res) {
	res.render('login', { title: 'Meeno' });
};