var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Task = Backbone.RelationalModel.extend({
	idAttribute: "_id",
	relations  : [{
		type           : 'HasMany',
		key            : 'noteLinks',
		relatedModel   : 'meenoAppCli.Classes.LinkNoteTask',
		reverseRelation: {
			key          : 'task',
			includeInJSON: '_id'
		}
	},{
		type           : 'HasMany',
		key            : 'tagLinks',
		relatedModel   : 'meenoAppCli.Classes.LinkTaskTag',
		reverseRelation: {
			key          : 'task',
			includeInJSON: '_id'
		}
	},{
		type           : 'HasOne',
		key            : 'parent',
		relatedModel   : 'meenoAppCli.Classes.Task',
		reverseRelation: {
			key          : 'children',
			includeInJSON: '_id'
		}
	}],

	getAncestors: function () {
		// Returns all the parents of a given task
		var ancestors = new meenoAppCli.Classes.Tasks();

		if (this.get('parent')) {
			ancestors.add(this.get('parent'));
			this.get('parent').getAncestors().each(function (elder) {
				ancestors.add(elder);
			});
		}
		return ancestors;
	},

	pluckAllTags: function () {
		// Returns an array of tags: those of "this" plus those of "this"'s ancestors
		var tags = [];
		this.getAncestors().each(function (elder) {
			tags = tags.concat(elder.get('tagLinks').pluck('tag'));
		})
		tags = tags.concat(this.get('tagLinks').pluck('tag'));
		return tags;
	},

	defaults: function() {
		return {
			label      : 'New Task',
			description: 'Description of your task...',
			parent     : false,
			position   : 0,
			due_at     : new Date(),
			created_at : new Date(),
			updated_at : new Date()
		};
	}
});