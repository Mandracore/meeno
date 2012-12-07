// app/src/models/index.js

// var Todo = mongoose.model('Todo', new mongoose.Schema({
//   text: String,
//   done: Boolean,
//   order: Number
// }));

exports.Note = mongoose.model('Note', new mongoose.Schema({
	title: String,
	content: String,
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now }
}));