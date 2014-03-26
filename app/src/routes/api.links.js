//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){

	mas.get("/api/links-note-tag", mas.security.proxy("user"), function (req, res) {
		return mas.Models.LinkNoteTag.find({'_creator': req.session.user._id }, function(err, links) {
			if (!links) { return res.send(403,"Access is forbidden or no data"); }
			if (!err) { return res.send(links); }
			else { return res.send(400,"Impossible to retrieve data : "+err); }
		});
	});
	mas.get("/api/links-note-tag/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.LinkNoteTag.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, link) {
			if (!link) { return res.send(403,"Access is forbidden or no data"); }
			if (!err) { return res.send(link); }
			else { return res.send(400,"Impossible to retrieve data : "+err); }
		});
	});
	mas.put("/api/links-note-tag/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.LinkNoteTag.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, link) {
			if (!link) { return res.send(403,"Access is forbidden or no data"); }

			link.note = req.body.note;
			link.tag  = req.body.tag;

			return link.save(function(err) {
				if (!err) { return res.send(link); }
				else { return res.send(400,"Impossible to update data : "+err); }
			});
		});
	});
	mas.post("/api/links-note-tag", mas.security.proxy("user"), function (req, res) {
		var link = new mas.Models.LinkNoteTag ({
			note : req.body.note,
			tag  : req.body.tag,
		});

		return link.save(function(err) {
			if (!err) { return res.send(note); }
			else { return res.send(400,"Impossible to save data : "+err); }
		});
	});
	mas.delete("/api/links-note-tag/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models.LinkNoteTag.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, link) {
			if (!link) { return res.send(403,"Access is forbidden or no data"); }

			return link.remove(function(err) {
				if (!err) { return res.send(200, 'Deletion complete'); }
				else { return res.send(400,"Impossible to delete data : "+err); }
			});
		});
	});
}