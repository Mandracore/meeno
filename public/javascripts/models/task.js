var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Task = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type: 'HasMany',
		key: 'noteLinks',
		relatedModel: 'meenoAppCli.Classes.linkNoteTask',
		reverseRelation: {
			key: 'task'
		}
	}],
	defaults: function() {
		return {
			description : 'New Task',
			created_at  : new Date(),
			updated_at  : new Date()
		};
	}
});