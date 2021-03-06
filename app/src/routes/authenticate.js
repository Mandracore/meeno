var jwt = require('jsonwebtoken');

//------------------------------------------
// PROXY CONTROLLER FOR AUTHENTIFICATION
//------------------------------------------
// A proxy to ensure security to use with any sensible route
// securityProxy(roleX) will return a function
// The pattern is the following :
//    1. TBD
//    2. TBD
// Two way to invoke this proxy
//    1. Pass it as a callback to each sensible route. For example : mas.get("/api/tasks", mas.security.proxy("user"), function (req, res) { ... } )
//    2. Invoke it globally (any verb here) : mas.all('/api/*', mas.authentication.proxy);

exports.proxy = function (secret, req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verifies secret and checks expiration
		jwt.verify(token, secret, function(err, decoded) {      
			if (err) {
				console.log("[KO] Failed to authenticate token");
				console.log(err);
				return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
			} else {
				if (decoded.revoked) {
					console.log ('[KO] This token has been revoked');
					return res.status(401).send({ 
						success: false, 
						message: 'This token has been revoked',
					});
				}
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;    
				next(); // The router will now execute next callback
			}
		});

	} else {
		// if there is no token, return an error
		console.log ('[KO] No token has been provided');
		return res.status(401).send({ 
				success: false, 
				message: 'No token provided.' 
		});
	}
};