//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){

	mas.get("/api/tags", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Tag.find({'_creator': req.session.user._id }, function(err, tags) {
			return res.send(tags);
		});
	});
	mas.get("/api/tags/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Tag.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, tag) {
			if (!tag) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(tag);
			}
		});
	});
	mas.put("/api/tags/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Tag.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, tag) {
			if (!tag) {return res.send(403,"Forbidden");}

			tag.created_at = req.body.created_at;
			tag.updated_at = req.body.updated_at;
			tag.label      = req.body.label;
			tag.color      = req.body.color;

			console.log(tag);

			return tag.save(function(err) {
				if (!err) {
					console.log("updated");
				} else {
					console.log(err);
					return res.send(400,"Impossible to save // "+err.err);
				}
				return res.send(tag);
			});
		});
	});
	mas.post("/api/tags", mas.security.proxy("user"), function (req, res) {
		var tag = new mas.Models.Tag ({
			_creator  : req.session.user._id,
			created_at: req.body.created_at,
			updated_at: req.body.updated_at,
			label     : req.body.label,
			color     : req.body.color,
		});

		console.log(req.body);

		tag.save(function(err) {
			if (!err) {
				console.log("created");
				return res.send(tag);
			} else {
				console.log(err);
				return res.send(400,"Impossible to save // "+err.err);
			}
		});
	});
	mas.delete("/api/tags/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Tag.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, tag) {
			if (!tag) {return res.send(403,"Forbidden");}
			return tag.remove(function(err) {
				if (!err) {
					console.log("removed");
					return res.send('');
				}
			});
		});
	});
};