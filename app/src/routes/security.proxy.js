//------------------------------------------
// PROXY CONTROLLER FOR AUTHENTIFICATION
//------------------------------------------
// A proxy to ensure security to use with any sensible route
// securityProxy(roleX) will return a function
exports.proxy = function (role) {
	return function (req, res, next) {
		if(!req.session || !req.session.logged) {// The user hasn't been authenticated
			res.send(401,"Unauthorized");
			return;
		}

		if(req.session.user.role == role) {// The user is known ad has the right role
			next();
		} else {// The user is know but hasn't the right credentials
			res.send(403,"Forbidden");
		}
	}
};