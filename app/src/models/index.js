//------------------------------------------
// BACKEND MODELS
//------------------------------------------

module.exports = function(mas, mongoose){

	// This sub-document of msNote will be saved through it, no need for dedicated api
	var msLinkNoteTag = new mongoose.Schema({
		tag  : { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }, // Linked document is Tag
		note : { type: mongoose.Schema.Types.ObjectId, ref: 'Note' } // Linked document is Note
	});
	var msLinkNoteTask = new mongoose.Schema({
		task : { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // Linked document is Task
		note : { type: mongoose.Schema.Types.ObjectId, ref: 'Note' } // Linked document is Note
	});

	var msNote = new mongoose.Schema({
		_creator   : String,
		created_at : { type: Date, default: function () { return Date.now(); } },
		updated_at : { type: Date, default: function () { return Date.now(); } },
		title      : String,
		content    : String,
		tagLinks   : [msLinkNoteTag],
		taskLinks  : [msLinkNoteTask]
	});
	var msUser = new mongoose.Schema({
		created_at : { type: Date, default: function () { return Date.now(); } },
		updated_at : { type: Date, default: function () { return Date.now(); } },
		email      : { type: String, required: true, unique: true },
		password   : { type: String, required: true },
		role       : { type: String, default: "user" }
	});
	var msTag = new mongoose.Schema({
		_creator   : String,
		created_at : { type: Date, default: function () { return Date.now(); } },
		updated_at : { type: Date, default: function () { return Date.now(); } },
		label      : { type: String, required: true, unique: true }
	});
	var msTask = new mongoose.Schema({
		_creator    : String,
		created_at  : { type: Date, default: function () { return Date.now(); } },
		updated_at  : { type: Date, default: function () { return Date.now(); } },
		due_at      : { type: Date, default: function () { return Date.now(); } },
		label       : { type: String, required: true, unique: true },
		description : String
	});

	mas.Schemas = {
		Note         : msNote,
		Tag          : msTag,
		Task         : msTask,
		LinkNoteTag  : msLinkNoteTag,
		LinkNoteTask : msLinkNoteTask,
		User         : msUser,
	};
	mas.Models = {
		Note         : mongoose.model('Note', mas.Schemas.Note),
		Tag          : mongoose.model('Tag', mas.Schemas.Tag),
		Task         : mongoose.model('Task', mas.Schemas.Task),
		LinkNoteTag  : mongoose.model('LinkNoteTag', mas.Schemas.LinkNoteTag),
		LinkNoteTask : mongoose.model('LinkNoteTask', mas.Schemas.LinkNoteTask),
		User         : mongoose.model('User', mas.Schemas.User),
	};
};