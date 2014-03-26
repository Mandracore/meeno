var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A link object between 'Note' and 'Tag'
meenoAppCli.Classes.LinkNoteTag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type           : 'HasOne',
		key            : 'note',
		relatedModel   : 'meenoAppCli.Classes.Note',
		reverseRelation: {
			key: 'tagLinks'
			includeInJSON : false,
		}
	},
	{
		type           : 'HasOne',
		key            : 'tag',
		relatedModel   : 'meenoAppCli.Classes.Tag',
		reverseRelation: {
			key: 'noteLinks'
			includeInJSON : false,
		}
	}],
});