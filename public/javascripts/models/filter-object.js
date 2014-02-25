var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.ObjectFilter = Backbone.RelationalModel.extend({
	idAttribute: '_id',

	isEmpty: function () {
		if (this.get('tasks') !== undefined && this.get('tags') !== undefined) { // NoteFilters
			if (this.get('text') !== '' || this.get('tasks').length !== 0 || this.get('tags').length !== 0) { return false; }
		} else {
			if (this.get('tags') === undefined) { // TagFilters
				if (this.get('text') !== '') { return false; }
			} else { // TaskFilters
				if (this.get('text') !== '' || this.get('tags').length !== 0) { return false; }
			}
		}
		return true;
	},

	defaults: function() {
		return {
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});