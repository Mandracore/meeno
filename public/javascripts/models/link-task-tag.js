var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A link object between 'Task' and 'Tag'
meenoAppCli.Classes.LinkTaskTag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type           : 'HasOne',
		key            : 'tag',
		relatedModel   : 'meenoAppCli.Classes.Tag',
		reverseRelation: {
			key: 'taskLinks'
		}
	},
	{
		type           : 'HasOne',
		key            : 'task',
		relatedModel   : 'meenoAppCli.Classes.Task',
		reverseRelation: {
			key: 'tagLinks'
		}
	}],
});