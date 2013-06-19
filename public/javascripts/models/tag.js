var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations: [{
		type: 'HasMany',
		key: 'noteLinks',
		relatedModel: 'meenoAppCli.Classes.linkNoteTag',
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