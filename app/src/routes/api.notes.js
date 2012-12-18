//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){

	mas.get("/api/notes", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Note.find({'_creator': req.session.user._id }, function(err, notes) {
			return res.send(notes);
		});
	});
	mas.get("/api/notes/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {
			if (!note) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(note);
			}
		});
	});
	mas.put("/api/notes/:id", mas.security.proxy("user"), function (req, res) {
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
	});
	mas.post("/api/notes", mas.security.proxy("user"), function (req, res) {
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
	});
	mas.delete("/api/notes/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {

			if (!note) {return res.send(403,"Forbidden");}
			return note.remove(function(err) {
				if (!err) {
					console.log("removed");
					return res.send('');
				}
			});
		});
	});
}