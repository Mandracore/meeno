// js/models/note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tag = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	defaults: function() {
		return {
			label     : 'New Tag'
		};
	},
	relations: [{
		type: 'HasMany',
		key: 'notes',
		relatedModel: 'meenoAppCli.Classes.TagNote',
		reverseRelation: {
			key: 'tag',
			includeInJSON: '_id'
		}
	}]

});