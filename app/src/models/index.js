//------------------------------------------
// API CONTROLLERS FOR DB ACCESS
//------------------------------------------

module.exports = function(mas, mongoose){
	mas.Models = {
		Note: mongoose.model('Note', new mongoose.Schema({
			_creator: String,
			title: String,
			content: String,
			created_at: { type: Date, default: function () {return Date.now()} },
			updated_at: { type: Date, default: function () {return Date.now()} }
		})),
		User: mongoose.model('User', new mongoose.Schema({
			email: { type: String, required: true, unique: true },
			password: { type: String, required: true },
			role: { type: String, default: "user" }
		}))
	};
}