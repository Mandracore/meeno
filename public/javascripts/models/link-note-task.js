var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A link object between 'Note' and 'Task'
meenoAppCli.Classes.LinkNoteTask = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type           : 'HasOne',
		key            : 'note',
		relatedModel   : 'meenoAppCli.Classes.Note',
		reverseRelation: {
			key: 'taskLinks',
			includeInJSON: false
		}
	},
	{
		type           : 'HasOne',
		key            : 'task',
		relatedModel   : 'meenoAppCli.Classes.Task',
		reverseRelation: {
			key: 'noteLinks',
			includeInJSON: false
		}
	}],
});