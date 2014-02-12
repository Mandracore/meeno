var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TaskFilter = meenoAppCli.Classes.ObjectFilter.extend({
	relations: [{
		type: 'HasMany',
		key: 'tags',
		relatedModel: 'meenoAppCli.Classes.Tag'
	}]
});