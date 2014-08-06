//------------------------------------------
// BACKEND MODELS
//------------------------------------------

module.exports = function(mas, mongoose){

	// This sub-document of msNote will be stored within its parent
	var msLinkNoteTag = new mongoose.Schema({
		note : { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
		tag  : { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' },
	});

	// This sub-document of msNote will be stored within its parent
	var msLinkNoteTask = new mongoose.Schema({
		note : { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
		task : { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
	});

	// This sub-document of msTask will be stored within its parent
	var msLinkTaskTag = new mongoose.Schema({
		task : { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
		tag : { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' },
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
		_creator  : String,
		created_at: { type: Date, default: function () { return Date.now(); } },
		updated_at: { type: Date, default: function () { return Date.now(); } },
		label     : { type: String, required: true}
	});
	var msTask = new mongoose.Schema({
		_creator   : String,
		created_at : { type: Date, default: function () { return Date.now(); } },
		updated_at : { type: Date, default: function () { return Date.now(); } },
		due_at     : { type: Date, default: function () { return Date.now(); } },
		label      : { type: String, required: true},
		description: String,
		position   : Number,
		tagLinks   : [msLinkTaskTag],
	});
	var msNoteFilter = new mongoose.Schema({
		_creator : String,
		label    : { type: String, required: true},
		text     : { type: String },
		tags      : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // Linked document is Tag
		tasks     : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Linked document is Task
	});
	var msTaskFilter = new mongoose.Schema({
		_creator : String,
		label    : { type: String, required: true},
		text     : { type: String },
		tags      : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // Linked document is Tag
	});
	var msTagFilter = new mongoose.Schema({
		_creator : String,
		label    : { type: String, required: true},
		text     : { type: String },
	});

	mas.Schemas = {
		Note         : msNote,
		Tag          : msTag,
		Task         : msTask,
		LinkNoteTag  : msLinkNoteTag,
		LinkNoteTask : msLinkNoteTask,
		User         : msUser,
		NoteFilter   : msNoteFilter,
		TaskFilter   : msTaskFilter,
		TagFilter    : msTagFilter,
	};
	mas.Models = {
		Note         : mongoose.model('Note', mas.Schemas.Note),
		Tag          : mongoose.model('Tag', mas.Schemas.Tag),
		Task         : mongoose.model('Task', mas.Schemas.Task),
		LinkNoteTag  : mongoose.model('LinkNoteTag', mas.Schemas.LinkNoteTag),
		LinkNoteTask : mongoose.model('LinkNoteTask', mas.Schemas.LinkNoteTask),
		User         : mongoose.model('User', mas.Schemas.User),
		NoteFilter   : mongoose.model('NoteFilter', mas.Schemas.NoteFilter),
		TaskFilter   : mongoose.model('TaskFilter', mas.Schemas.TaskFilter),
		TagFilter    : mongoose.model('TagFilter', mas.Schemas.TagFilter),
	};
};