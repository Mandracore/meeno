var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.NoteFilter = meenoAppCli.Classes.ObjectFilter.extend({
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
		})) && (undefined === this.get('tasks').find(function(task) {
			return (false === nf.get('tasks').contains(task));
		}));
	}
});