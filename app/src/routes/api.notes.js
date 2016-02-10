//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){

	mas.get("/api/notes", function (req, res) {
		return mas.Models.Note.find({'_creator': req.session.user._id }, function(err, notes) {
			return res.send(notes);
		});
	});
	mas.get("/api/notes/:id", function (req, res) {
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {
			if (!note) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(note);
			}
		});
	});
	mas.put("/api/notes/:id", function (req, res) {
		return mas.Models.Note.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, note) {
			if (!note) {return res.send(403,"Forbidden");}

			note.created_at  = req.body.created_at;
			note.updated_at  = req.body.updated_at;
			note.title       = req.body.title;
			note.content     = req.body.content;
			note.content_sec = req.body.content_sec;
			note.tagLinks    = req.body.tagLinks;
			note.taskLinks   = req.body.taskLinks;

			console.log(note);

			return note.save(function(err) {
				if (!err) {
					console.log("updated");
					return res.send(note);
				} else {
					console.log(err);
					return res.send(400,"Impossible to save // "+err.err);
				}
			});
		});
	});
	mas.post("/api/notes", function (req, res) {
		var note = new mas.Models.Note ({
			_creator    : req.session.user._id,
			created_at  : req.body.created_at,
			updated_at  : req.body.updated_at,
			title       : req.body.title,
			content     : req.body.content,
			content_sec : req.body.content_sec,
			tagLinks    : req.body.tagLinks,
			taskLinks   : req.body.taskLinks,
		});

		console.log(req.body);

		note.save(function(err) {
			if (!err) {
				console.log("created");
				return res.send(note);
			} else {
				console.log(err);
				return res.send(400,"Impossible to save // "+err.err);
			}
		});
	});
	mas.delete("/api/notes/:id", function (req, res) {
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