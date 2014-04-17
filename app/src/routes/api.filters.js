//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){
	var FiltersTr = {
		'note' : "NoteFilter",
		'tag'  : "TagFilter",
		'task' : "TaskFilter",
	};

	mas.get("/api/filters/:object", mas.security.proxy("user"), function (req, res) {
		return mas.Models[FiltersTr[req.params.object]].find({'_creator': req.session.user._id }, function(err, filters) {

			if (!err) {
				return res.send(filters);
			} else {
				return res.send(400,"Impossible to get data // "+err.err);
			}
		});
	});
	mas.get("/api/filters/:object/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models[FiltersTr[req.params.object]].findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, filter) {
			if (!filter) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(filter);
			} else {
				return res.send(400,"Impossible to get data // "+err.err);
			}
		});
	});
	mas.put("/api/filters/:object/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models[FiltersTr[req.params.object]].findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, filter) {
			if (!filter) {return res.send(403,"Forbidden");}

			filter.subClass = FiltersTr[req.params.object];
			filter.label    = req.body.label;
			filter.text     = req.body.text;

			switch (req.params.object) {
				case "note" :
					filter.tags  = req.body.tags;
					filter.tasks = req.body.tasks;
					break;
				case "tasks" :
					filter.tags  = req.body.tags;
					break;
			}

			return filter.save(function(err) {
				if (!err) {
					return res.send(filter);
				} else {
					return res.send(400,"Impossible to update // "+err.err);
				}
			});
		});
	});
	mas.post("/api/filters/:object", mas.security.proxy("user"), function (req, res) {
		var filter = new mas.Models[FiltersTr[req.params.object]] ({
			_creator : req.session.user._id,
			subClass : FiltersTr[req.params.object],
			label    : req.body.label,
			text     : req.body.text,
		});

		switch (req.params.object) {
			case "note" :
				filter.tags  = req.body.tags;
				filter.tasks = req.body.tasks;
				break;
			case "tasks" :
				filter.tags  = req.body.tags;
				break;
		}

		filter.save(function(err) {
			if (!err) {
				return res.send(filter);
			} else {
				return res.send(400,"Impossible to save // "+err.err);
			}
		});
	});
	mas.delete("/api/filters/:object/:id", mas.security.proxy("user"), function (req, res) {
		return mas.Models[FiltersTr[req.params.object]].findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, filter) {

			if (!filter) {return res.send(403,"Forbidden");}
			return filter.remove(function(err) {
				if (!err) {
					return res.send('Object successfully removed');
				} else {
					return res.send(400,"Impossible to delete // "+err.err);
				}
			});
		});
	});
}