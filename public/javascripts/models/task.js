var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Task = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type: 'HasMany',
		key: 'noteLinks',
		relatedModel: 'meenoAppCli.Classes.LinkNoteTask',
		reverseRelation: {
			key: 'task',
			includeInJSON: '_id'
		}
	}],
	getAllTags: function () {
		// 1. get the tags
		// 2. get the tags of all ancestors
		// 3. return it
	}
	defaults: function() {
		return {
			label       : 'New Task',
			description : 'Describe here your task...',
			due_at      : new Date(),
			created_at  : new Date(),
			updated_at  : new Date()
		};
	}
});