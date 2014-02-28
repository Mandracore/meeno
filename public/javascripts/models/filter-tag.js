var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagFilter = meenoAppCli.Classes.ObjectFilter.extend({
	defaults: function() {
		return {
			subClass  : 'TagFilter',
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});