//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, securityProxy){

	mas.get("/api/tasks", function (req, res) {
		return mas.Models.Task.find({'_creator': req.session.user._id }, function(err, tasks) {
			return res.send(tasks);
		});
	});
	mas.get("/api/tasks/:id", function (req, res) {
		return mas.Models.Task.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, task) {
			if (!task) {return res.send(403,"Forbidden");}

			if (!err) {
				return res.send(task);
			}
		});
	});
	mas.put("/api/tasks/:id", function (req, res) {
		return mas.Models.Task.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, task) {
			if (!task) {return res.send(403,"Forbidden");}

			task.created_at  = req.body.created_at;
			task.updated_at  = req.body.updated_at;
			task.todo_at     = req.body.todo_at;
			task.due_at      = req.body.due_at;
			task.label       = req.body.label;
			task.description = req.body.description;
			task.position    = req.body.position;
			task.completed   = req.body.completed;
			task.noteLinks   = req.body.noteLinks;
			task.tagLinks    = req.body.tagLinks;

			console.log(task);

			return task.save(function(err) {
				if (!err) {
					console.log("updated");
					return res.send(task);
				} else {
					console.log(err);
					return res.send(400,"Impossible to save // "+err.err);
				}
			});
		});
	});
	mas.post("/api/tasks", function (req, res) {
		var task = new mas.Models.Task ({
			_creator   : req.session.user._id,
			created_at : req.body.created_at,
			updated_at : req.body.updated_at,
			todo_at    : req.body.todo_at,
			due_at     : req.body.due_at,
			label      : req.body.label,
			description: req.body.description,
			position   : req.body.position,
			completed  : req.body.completed,
			noteLinks  : req.body.noteLinks,
			tagLinks   : req.body.tagLinks,
		});

		console.log(req.body);

		task.save(function(err) {
			if (!err) {
				console.log("created");
				return res.send(task);
			} else {
				console.log(err);
				return res.send(400,"Impossible to save // "+err.err);
			}
		});
	});
	mas.delete("/api/tasks/:id", function (req, res) {
		return mas.Models.Task.findOne({'_creator': req.session.user._id, '_id': req.params.id}, function(err, task) {
			if (!task) {return res.send(403,"Forbidden");}
			return task.remove(function(err) {
				if (!err) {
					console.log("removed");
					return res.send('');
				}
			});
		});
	});
};