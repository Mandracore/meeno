var jwt = require('jsonwebtoken');

//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

// exports.proxy = function (role) {
// 	return function (req, res, next) {
// 		if(!req.session || !req.session.logged) {// The user hasn't been authenticated
// 			res.send(401,"Unauthorized");
// 			return;
// 		}

// 		if(req.session.user.role == role) {// The user is known ad has the right role
// 			next();
// 		} else {// The user is know but hasn't the right credentials
// 			res.send(403,"Forbidden");
// 		}
// 	}
// };

exports.proxy = function (app, role) {
	// For now, the role parameter will not be used
	return function (req, res, next) {
		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];

		// decode token
		if (token) {
			// verifies secret and checks expiration
			jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
				if (err) {
					return res.json({ success: false, message: 'Failed to authenticate token.' });    
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;    
					next(); // The router will now execute next callback
				}
			});

		} else {
			// if there is no token, return an error
			return res.status(403).send({ 
					success: false, 
					message: 'No token provided.' 
			});
		}	
	};
};