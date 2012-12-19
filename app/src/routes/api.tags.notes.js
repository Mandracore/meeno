//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){

	mas.get("/api/tags-notes", mas.security.proxy("user"), function (req, res) {
		return mas.Models.TagNote.find({'_creator': req.session.user._id }, function(err, tagsNotes) {
			return res.send(tagsNotes);
		});
	});
	mas.get("/api/tags-notes/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.TagNote.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, tagNote) {
			if (!tagNote) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(tagNote);
			}
		});
	});
	mas.put("/api/tags-notes/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.TagNote.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, tagNote) {
			if (!tagNote) {return res.send(403,"Forbidden");}

			tagNote.label      = req.body.title;
			return tagNote.save(function(err) {
				if (!err) {
					console.log("updated");
				} else {
					console.log(err);
				}
				return res.send(tagNote);
			});
		});
	});
	mas.post("/api/tags-notes", mas.security.proxy("user"), function (req, res) {
		var tagNote = new mas.Models.TagNote ({
			_creator  : req.session.user._id,
			label     : req.body.label
		});
		tagNote.save(function(err) {
			if (!err) {
				return console.log("created");
			} else {
				console.log(err);
			}
		});
		return res.send(tagNote);
	});
	mas.delete("/api/tags-notes/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.TagNote.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, tagNote) {
			if (!tagNote) {return res.send(403,"Forbidden");}
			return tagNote.remove(function(err) {
				if (!err) {
					console.log("removed");
					return res.send('');
				} else {
					console.log(err);
				}
			});
		});
	});
}