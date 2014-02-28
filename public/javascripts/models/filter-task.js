var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TaskFilter = meenoAppCli.Classes.ObjectFilter.extend({
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'meenoAppCli.Classes.Tag'
	}],
	defaults: function() {
		return {
			subClass  : 'TaskFilter',
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});