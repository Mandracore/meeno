//------------------------------------------
// BACKEND MODELS
//------------------------------------------

module.exports = function(mas, mongoose){

	// This sub-document of msNote will be saved through it, no need for dedicated api
	var msLinkNoteTag = new mongoose.Schema({
		tag  : { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }, // Linked document is Tag
		note : { type: mongoose.Schema.Types.ObjectId, ref: 'Note' } // Linked document is Note
	});

	var msNote = new mongoose.Schema({
		_creator   : String,
		created_at : { type: Date, default: function () { return Date.now()} },
		updated_at : { type: Date, default: function () { return Date.now()} },
		title      : String,
		content    : String,
		tagLinks   : [msLinkNoteTag]
	});
	var msUser = new mongoose.Schema({
		email    : { type: String, required: true, unique: true },
		password : { type: String, required: true },
		role     : { type: String, default: "user" }
	});
	var msTag = new mongoose.Schema({
		_creator : String,
		label    : { type: String, required: true, unique: true }
	});

	mas.Schemas = {
		Note        : msNote,
		Tag         : msTag,
		LinkNoteTag : msLinkNoteTag,
		User        : msUser,
	};
	mas.Models = {
		Note        : mongoose.model('Note', mas.Schemas.Note),
		Tag         : mongoose.model('Tag', mas.Schemas.Tag),
		LinkNoteTag : mongoose.model('LinkNoteTag', mas.Schemas.LinkNoteTag),
		User        : mongoose.model('User', mas.Schemas.User),
	};
}