var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type: 'HasMany',
		key: 'noteLinks',
		relatedModel: 'linkNoteTag',
		reverseRelation: {
			key: 'tag'
		}
	}],
	defaults: function() {
		return {
			label     : 'New Tag',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});