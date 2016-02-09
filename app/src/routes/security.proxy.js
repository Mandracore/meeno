//------------------------------------------
// PROXY CONTROLLER FOR AUTHENTIFICATION
//------------------------------------------
// A proxy to ensure security to use with any sensible route
// securityProxy(roleX) will return a function
// The pattern is the following :
//    1. check if a session exists
//    2. check if the role of the user (stored in session) corresponds to the role passed in parameter
// This proxy must be passed as a callback to all sensible routes. For example :
// 		mas.get("/api/tasks", mas.security.proxy("user"), function (req, res) { ... } )

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