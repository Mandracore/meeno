define ([
	// path aliases preconfigured in ../main.js
		'jquery',
		'underscore',
		'backbone',
		'models/task',
		'models/tag',
	], function ($, _, Backbone, Task, Tag) {

		/**
		 * Parent of the classes {{#crossLink "NoteFilter"}}{{/crossLink}}, {{#crossLink "TaskFilter"}}{{/crossLink}} and {{#crossLink "TagFilter"}}{{/crossLink}}.
		 * It holds all the common methods.
		 * 
		 * @class ObjectFilter
		 * @extends Backbone.RelationalModel
		 */
		var ObjectFilter = Backbone.RelationalModel.extend({
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
						tagsLargest  = of;
						tagsShortest = this;
					}
					if (this.get('tasks').length < of.get('tasks').length) {
						tasksLargest  = of;
						tasksShortest = this;
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
							tagsLargest  = of;
							tagsShortest = this;
						}
						// Trying to find one criteria that is not in common. 
						// _.find() should then be different from undefined and the test should return false (the filters are not equal)
						return (undefined === tagsLargest.get('tags').find(function(tag) {
							return (false === tagsShortest.get('tags').contains(tag));
						}));
					}
				}

				return true;
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

			makeItMatch: function (of) {
				this.set("text", of.get("text"));

				if (this.get('subClass') == "NoteFilter") { // NoteFilter
					this.get('tags').remove(this.get('tags').models);
					this.get('tags').add(of.get('tags').models);
					this.get('tasks').add(of.get('tasks').models);
					this.get('tasks').remove(this.get('tasks').models);
				} else {
					if (this.get('subClass') == "TaskFilter") { // TaskFilter
						this.get('tags').remove(this.get('tags').models);
						this.get('tags').add(of.get('tags').models);
					}
				}
			},

			defaults: function() {
				return {
					subClass  : 'NoteFilter',
					label     : 'New filter',
					text      : ''
				};
			}
		});

		/**
		 * Used to filter collections of {{#crossLink "Tag"}}{{/crossLink}}s.
		 * 
		 * @class TagFilter
		 * @extends ObjectFilter
		 */
		var TagFilter = ObjectFilter.extend({
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

		/**
		 * Used to filter collections of {{#crossLink "Task"}}{{/crossLink}}s.
		 * 
		 * @class TaskFilter
		 * @extends ObjectFilter
		 */
		var TaskFilter = ObjectFilter.extend({
			relations: [{
				type: 'HasMany',
				key: 'tags',
				relatedModel: Tag
			}],
			defaults: function() {
				return {
					subClass  : 'TaskFilter',
					label     : 'New filter',
					text      : '',
					completed : 0,
					created_at: new Date(),
					updated_at: new Date()
				};
			}
		});

		/**
		 * Used to filter collections of {{#crossLink "Note"}}{{/crossLink}}s.
		 * 
		 * @class NoteFilter
		 * @extends ObjectFilter
		 */
		var NoteFilter = ObjectFilter.extend({
			relations: [{
				type: 'HasMany',
				key: 'tags',
				relatedModel: Tag,
				includeInJSON: '_id',
			},
			{
				type: 'HasMany',
				key: 'tasks',
				relatedModel: Task,
				includeInJSON: '_id',
			}],
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

		return {
			Note: NoteFilter,
			Task: TaskFilter,
			Tag : TagFilter,
		};
	}
);