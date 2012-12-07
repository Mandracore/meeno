//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

exports.readAll = function (req, res) {
	return mas.Models.Note.find(function(err, notes) {
		return res.send(notes);
	});
};

exports.readOne = function (req, res) {
	return mas.Models.Note.findById(req.params.id, function(err, note) {
		if (!err) {
			return res.send(note);
		}
	});
};

exports.update = function (req, res) {
	return mas.Models.Note.findById(req.params.id, function(err, note) {
		note.title      = req.body.title;
		note.content    = req.body.content;
		note.updated_at = Date.now;
		return note.save(function(err) {
			if (!err) {
				console.log("updated");
			}
			return res.send(note);
		});
	});
};

exports.create = function (req, res) {
	var note = new mas.Models.Note ({
		title  : req.body.title,
		content: req.body.content
	});
	note.save(function(err) {
		if (!err) {
			return console.log("created");
		}
	});
	return res.send(note);
};

exports.delete = function (req, res) {
	return mas.Models.Note.findById(req.params.id, function(err, note) {
		return note.remove(function(err) {
			if (!err) {
				console.log("removed");
				return res.send('');
			}
		});
	});
};