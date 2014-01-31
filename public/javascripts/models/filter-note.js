var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteFilter = Backbone.RelationalModel.extend({
	idAttribute: '_id',
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'meenoAppCli.Classes.Tag'
	},
	{
		type: 'HasMany',
		key: 'tasks',
		relatedModel: 'meenoAppCli.Classes.Task'
	}],
	isEqual: function (nf) {
		if(this.get("text") != nf.get("text")) { return false; }
		// Trying to find one criteria that is not in common. 
		// _.find() should then be different from undefined and the test should return false (the filters are not equal)


		return (undefined === this.get('tags').find(function(tag) {
			return (false === nf.get('tags').contains(tag));
		})) || (undefined === this.get('tasks').find(function(task) {
			return (false === nf.get('tasks').contains(task));
		}));


		// return (undefined === _.find(nf1.objects, function(nf1Object) {
		// // Will find the first nf1 object not included in filter2 objects
		// 	return (undefined === _.find(filter2.objects, function(nf2Object) {
		// 	// If _.find is equal to undefined, it means that nf1Object is not contained into nf2.objects
		// 		return (nf1Object.class == nf2Object.class && nf1Object.cid == nf2Object.cid);
		// 	}));
		// }));
	},
	defaults: function() {
		return {
			text       : '',
			created_at : new Date(),
			updated_at : new Date()
		};
	}
});