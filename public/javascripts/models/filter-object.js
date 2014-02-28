var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.ObjectFilter = Backbone.RelationalModel.extend({
	idAttribute: '_id',

	isEmpty: function () {
		if (this.get('subClass') == "NoteFilter") { // NoteFilter
			if (this.get('text') !== '' || this.get('tasks').length !== 0 || this.get('tags').length !== 0) { return false; }
		} else {
			if (this.get('subClass') == "TagFilter") { // TagFilter
				if (this.get('text') !== '') { return false; }
			} else { // TaskFilter
				if (this.get('text') !== '' || this.get('tags').length !== 0) { return false; }
			}
		}
		return true;
	},

	isSimilar: function (of) {
		if(this.get("text") != of.get("text")) { return false; }
		
		if (this.get('subClass') == "NoteFilter") { // NoteFilter
			var tagsLargest   = this;
			var tagsShortest  = of;
			var tasksLargest  = this;
			var tasksShortest = of;
			if (this.get('tags').length < of.get('tags').length) {
				var tagsLargest  = of;
				var tagsShortest = this;
			}
			if (this.get('tasks').length < of.get('tasks').length) {
				var tasksLargest  = of;
				var tasksShortest = this;
			}

			// Trying to find one criteria that is not in common. 
			// _.find() should then be different from undefined and the test should return false (the filters are not equal)
			return (undefined === tagsLargest.get('tags').find(function(tag) {
				return (false === tagsShortest.get('tags').contains(tag));
			})) && (undefined === tasksLargest.get('tasks').find(function(task) {
				return (false === tasksShortest.get('tasks').contains(task));
			}));
		} else {
			if (this.get('subClass') == "TaskFilter") { // TaskFilter
				var tagsLargest  = this;
				var tagsShortest = of;
				if (this.get('tags').length < of.get('tags').length) {
					var tagsLargest  = of;
					var tagsShortest = this;
				}
				// Trying to find one criteria that is not in common. 
				// _.find() should then be different from undefined and the test should return false (the filters are not equal)
				return (undefined === tagsLargest.get('tags').find(function(tag) {
					return (false === tagsShortest.get('tags').contains(tag));
				}));
			}
		}
	},

	superClone: function () {
		var superClone = this.clone();
		if (this.get('subClass') == "NoteFilter") { // NoteFilter
			superClone.get('tags').add(this.get('tags').models);
			superClone.get('tasks').add(this.get('tasks').models);
		} else {
			if (this.get('subClass') == "TaskFilter") { // TaskFilter
				superClone.get('tags').add(this.get('tags').models);
			}
		}
		return superClone;
	},

	defaults: function() {
		return {
			subClass  : 'NoteFilter',
			label     : 'New filter',
			text      : '',
			created_at: new Date(),
			updated_at: new Date()
		};
	}
});