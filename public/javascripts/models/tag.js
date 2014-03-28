var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type            : 'HasMany',
		key             : 'noteLinks',
		relatedModel    : 'meenoAppCli.Classes.LinkNoteTag',
		reverseRelation : {
			key           : 'tag',
		}
	},{
		type            : 'HasMany',
		key             : 'taskLinks',
		relatedModel    : 'meenoAppCli.Classes.LinkTaskTag',
		reverseRelation : {
			key           : 'tag',
		}
	}],
	defaults: function() {
		return {
			label     : 'New Tag',
			color     : '#000000',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});