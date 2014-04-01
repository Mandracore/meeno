var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Task = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type           : 'HasOne',
		key            : 'parent',
		relatedModel   : 'meenoAppCli.Classes.Task',
		includeInJSON  : '_id',
		reverseRelation: {
			key           : 'children',
		}
	},{
		type: 'HasMany',
		key: 'noteLinks',
		relatedModel: 'meenoAppCli.Classes.LinkNoteTask',
		reverseRelation: {
			key           : 'task',
			includeInJSON : '_id',
		}
	},{
		type           : 'HasMany',
		key            : 'tagLinks',
		relatedModel   : 'meenoAppCli.Classes.LinkTaskTag',
		reverseRelation: {
			key           : 'task',
			includeInJSON : '_id',
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