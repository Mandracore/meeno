var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Task = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type           : 'HasOne',
		key            : 'parent',
		relatedModel   : 'meenoAppCli.Classes.Task',
		collectionType : 'meenoAppCli.Classes.Tasks',
		includeInJSON  : '_id',
		reverseRelation: {
			key: 'children',
			includeInJSON: false,
		}
	}],
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