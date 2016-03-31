define ([
		'jquery',
		'underscore',
		'backbone',
		'models/note',
		'models/task',
		'models/tag',
		'collections/notes',
		'collections/tasks',
		'collections/tags',
		'models/filter',
	], function ($, _, Backbone, Note, Task, Tag, Notes, Tasks, Tags, Filter) {

	describe('Datamodel', function() {

		describe("Business Models", function() {

			//=======================================================================================================
			// DESCRIBE MODEL DEFAULTS
			//=======================================================================================================

			describe("Defaults", function() {

				beforeEach(function() {
					this.note = new Note();
					this.tag  = new Tag();
					this.task = new Task();
				});

				describe("Note, Task, Tags", function() {
					it("when updated should have the right `updated_at` attribute", function(done) {
						var self = this;
						
						this.timerNote0 = this.note.get('updated_at');
						this.timerTask0 = this.task.get('updated_at');
						this.timerTag0  = this.tag.get('updated_at');

						setTimeout(function() {
							self.note.set('title',"test update");
							self.task.set('label',"test update");
							self.tag.set('label',"test update");

							self.timerNote = self.note.get('updated_at').getTime() - self.timerNote0.getTime();
							self.timerTask = self.task.get('updated_at').getTime() - self.timerTask0.getTime();
							self.timerTag  = self.tag.get('updated_at').getTime() - self.timerTag0.getTime();
							expect(self.timerNote).toBeGreaterThan(9);
							expect(self.timerTask).toBeGreaterThan(9);
							expect(self.timerTag).toBeGreaterThan(9);
							// done();
						}, 10); // wait 100ms then run function ()
					});
				});

				describe("Note", function() {

					describe("when creating a new note", function() {
						it("should have a default created_at attribute", function() {
							expect((new Date()).getTime() - this.note.get('created_at').getTime()).toBeGreaterThan(-1);
						});
						it("should have a default updated_at attribute", function() {
							expect((new Date()).getTime() - this.note.get('updated_at').getTime()).toBeGreaterThan(-1);
						});
						it("should have a default title attribute", function() {
							expect(this.note.get('title')).toBe('Nouvelle note');
						});
						it("should have a default content attribute", function() {
							expect(this.note.get('content')).toBe('Saisissez ici le contenu de votre note...');
						});
						it("should have a default secondary content attribute", function() {
							expect(this.note.get('content_sec')).toBe('Vous pouvez également saisir vos notes ici...');
						});
					});
				});

				describe("Tag", function() {

					describe("when creating a new tag", function() {
						it("should have a default created_at attribute", function() {
							expect((new Date()).getTime() - this.tag.get('created_at').getTime()).toBeGreaterThan(-1);
						});
						it("should have a default updated_at attribute", function() {
							expect((new Date()).getTime() - this.tag.get('updated_at').getTime()).toBeGreaterThan(-1);
						});
						it("should have a default label attribute", function() {
							expect(this.tag.get('label')).toBe('New Tag');
						});
					});
				});

				describe("Task", function() {

					describe("when creating a new task", function() {
						it("should have a default created_at attribute", function() {
							expect((new Date()).getTime() - this.task.get('created_at').getTime()).toBeGreaterThan(-1);
						});
						it("should have a default description attribute", function() {
							expect(this.task.get('description')).toBe('Description of your task...');
						});
						it("should have a default position attribute set to 0", function() {
							expect(this.task.get('position')).toBe(0);
						});
						it("should have a default completed attribute set to false", function() {
							expect(this.task.get('completed')).toBe(false);
						});
						it("should have a default todo_at attribute set to today", function() {
							var now = new Date();
							var due = this.task.get('todo_at');
							expect(due.getYear()).toEqual(now.getYear());
							expect(due.getMonth()).toEqual(now.getMonth());
							expect(due.getDate()).toEqual(now.getDate());
						});
						it("should have a default due_at attribute set to today", function() {
							var now = new Date();
							var due = this.task.get('due_at');
							expect(due.getYear()).toEqual(now.getYear());
							expect(due.getMonth()).toEqual(now.getMonth());
							expect(due.getDate()).toEqual(now.getDate());
						});
					});
				});
			});

			//=======================================================================================================
			// DESCRIBE MODEL RELATIONS
			//=======================================================================================================

			describe("Relations and methods", function() {

				beforeEach(function() {
					this.note       = new Note({title:"Nouvelle note"});
					this.note2      = new Note({title:"Nouvelle note bis"});
					this.note3      = new Note({title:"Nouvelle note ter"});
					this.tag        = new Tag({label:"My test tag"});
					this.tag2       = new Tag({label:"My test tag 2"});
					this.tag3       = new Tag({label:"My test tag 3"});
					this.task       = new Task({label:"My test task"});
					this.task2      = new Task({label:"My test task 2"});
					this.task3      = new Task({label:"My test task 3"});
					this.noteFilter = new Filter.Note();
					this.notes      = new Notes();
					this.tags       = new Tags();
					this.tasks      = new Tasks();
					this.notes.add(this.note);
					this.notes.add(this.note2);
					this.notes.add(this.note3);
					this.tags.add(this.tag);
					this.tags.add(this.tag2);
					this.tasks.add(this.task);
					this.tasks.add(this.task2);
					this.tasks.add(this.task3);
				});

				it("Note can be related to a tag and a task", function() {
					this.note.get('tagLinks').add( { tag: this.tag } );
					expect(this.note.get('tagLinks').pluck('tag')[0].get('label')).toEqual("My test tag");

					this.note.get('taskLinks').add( { task: this.task } );
					expect(this.note.get('taskLinks').pluck('task')[0].get('label')).toEqual("My test task");
				});
				it("Tag can be related to a note and a task", function() {
					this.tag.get('noteLinks').add( { note: this.note2 } );
					expect(this.tag.get('noteLinks').pluck('note')[0].get('title')).toEqual("Nouvelle note bis");

					this.tag.get('taskLinks').add( { task: this.task2 } );
					expect(this.tag.get('taskLinks').pluck('task')[0].get('label')).toEqual("My test task 2");
				});
				it("Task can be related to a note and a tag", function() {
					this.task.get('noteLinks').add( { note: this.note2 } );
					expect(this.task.get('noteLinks').pluck('note')[0].get('title')).toEqual("Nouvelle note bis");

					this.task.get('tagLinks').add( { tag: this.tag } );
					expect(this.task.get('tagLinks').pluck('tag')[0].get('label')).toEqual("My test tag");
				});
			});
		});

		describe("Filter models", function() {

			beforeEach(function() {
				this.noteFilter  = new Filter.Note();
				this.noteFilter2 = new Filter.Note();
				this.noteFilter3 = new Filter.Note();
				this.noteFilter4 = new Filter.Note();
				this.noteFilter5 = new Filter.Note();
				this.noteFilter6 = new Filter.Note();
				this.noteFilter7 = new Filter.Note();
				this.noteFilter8 = new Filter.Note();
				this.noteFilter9 = new Filter.Note();
				this.taskFilter  = new Filter.Task();
				this.taskFilter2 = new Filter.Task();
				this.taskFilter3 = new Filter.Task();
				this.tagFilter   = new Filter.Tag();
				this.tagFilter2  = new Filter.Tag();
				this.tag         = new Tag({label:"My test tag"});
				this.tag2        = new Tag({label:"My test tag 2"});
				this.task        = new Task({label:"My test task"});
				this.task2       = new Task({label:"My test task 2"});
				this.tasks       = new Tasks();
				this.tasks.add(this.task);
				this.tasks.add(this.task2);
			});

			it("NoteFilter can be related to a tag and a task through a link", function() {
				this.noteFilter.get('tags').add(this.tag2);
				this.noteFilter.get('tasks').add(this.task);
				expect(this.noteFilter.get('tasks').at(0).get('label')).toEqual("My test task");
				expect(this.noteFilter.get('tags').at(0).get('label')).toEqual("My test tag 2");
			});
			it("TaskFilter can be related to a tag through a link", function() {
				this.taskFilter.get('tags').add(this.tag2);
				expect(this.taskFilter.get('tags').at(0).get('label')).toEqual("My test tag 2");
			});

			it("TaskFilter should allow to filter done/todo/both", function() {
				this.task.set("completed",0);
				this.task2.set("completed",1);

				// Test default value : todo only (0)
				expect(this.tasks.search(this.taskFilter).length).toEqual(1); 
				expect(this.tasks.search(this.taskFilter).at(0).get('label')).toEqual("My test task");
				// Test done only
				this.taskFilter.set("completed",1); 
				expect(this.tasks.search(this.taskFilter).length).toEqual(1); 
				expect(this.tasks.search(this.taskFilter).at(0).get('label')).toEqual("My test task 2");
				// Test done only
				this.taskFilter.set("completed",2); 
				expect(this.tasks.search(this.taskFilter).length).toEqual(2);
			});

			it("NoteFilter can be compared to another note filter", function() {
				this.noteFilter.get('tasks').add(this.task);
				this.noteFilter.get('tags').add(this.tag);
				this.noteFilter2.get('tasks').add(this.task);
				this.noteFilter2.get('tags').add(this.tag);
				this.noteFilter3.get('tasks').add(this.task);
				this.noteFilter4.get('tasks').add(this.task);
				this.noteFilter4.get('tags').add(this.tag2);
				this.noteFilter5.get('tasks').add(this.task);
				this.noteFilter5.get('tags').add(this.tag);
				this.noteFilter.set('text','value to match');
				this.noteFilter3.set('text','value to match');
				this.noteFilter4.set('text','value to match');
				this.noteFilter5.set('text','value to match');
				this.noteFilter6.set('text','other value to match');
				this.noteFilter7.set('text','other value to match');
				this.noteFilter8.set('text','other value to match');
				this.noteFilter9.set('text','other value to match');
				this.noteFilter8.get('tags').add(this.tag);
				expect(this.noteFilter.isSimilar(this.noteFilter2)).toBe(false);
				expect(this.noteFilter.isSimilar(this.noteFilter3)).toBe(false);
				expect(this.noteFilter.isSimilar(this.noteFilter4)).toBe(false);
				expect(this.noteFilter.isSimilar(this.noteFilter5)).toBe(true);
				expect(this.noteFilter6.isSimilar(this.noteFilter7)).toBe(true);
				expect(this.noteFilter9.isSimilar(this.noteFilter8)).toBe(false);
			});

			it("NoteFilter has isEmpty() method", function() {
				this.noteFilter2.get('tasks').add(this.task);
				this.noteFilter3.set('text','value to match');
				this.noteFilter4.get('tasks').add(this.task);
				this.noteFilter4.get('tags').add(this.tag);
				expect(this.noteFilter.isEmpty()).toBe(true);
				expect(this.noteFilter2.isEmpty()).toBe(false);
				expect(this.noteFilter3.isEmpty()).toBe(false);
				expect(this.noteFilter4.isEmpty()).toBe(false);
			});

			it("TaskFilter has isEmpty() method", function() {
				this.taskFilter2.get('tags').add(this.tag);
				this.taskFilter3.set('text','value to match');
				expect(this.taskFilter.isEmpty()).toBe(true);
				expect(this.taskFilter2.isEmpty()).toBe(false);
				expect(this.taskFilter3.isEmpty()).toBe(false);
			});

			it("TagFilter has isEmpty() method", function() {
				this.tagFilter2.set('text','value to match');
				expect(this.tagFilter.isEmpty()).toBe(true);
				expect(this.tagFilter2.isEmpty()).toBe(false);
			});

			it("NoteFilter can be super-cloned with all its relations", function() {
				this.noteFilter.get('tasks').add(this.task);
				this.noteFilter.get('tags').add(this.tag);
				this.noteFilter.get('tags').add(this.tag2);
				this.superClone = this.noteFilter.superClone();
				this.clone      = this.noteFilter.clone();

				expect(this.superClone.cid).not.toEqual(this.noteFilter.cid);
				expect(this.superClone.get('tags').pluck('label')).toEqual(this.noteFilter.get('tags').pluck('label'));
				expect(this.superClone.get('tasks').pluck('label')).toEqual(this.noteFilter.get('tasks').pluck('label'));
				expect(this.clone.get('tags').pluck('label')).not.toEqual(this.noteFilter.get('tags').pluck('label'));
				expect(this.clone.get('tasks').pluck('label')).not.toEqual(this.noteFilter.get('tasks').pluck('label'));
			});

			it("TaskFilter can be super-cloned with all its relations", function() {
				this.taskFilter.get('tags').add(this.tag);
				this.taskFilter.get('tags').add(this.tag2);
				this.superClone = this.taskFilter.superClone();
				this.clone      = this.taskFilter.clone();

				expect(this.superClone.cid).not.toEqual(this.taskFilter.cid);
				expect(this.superClone.get('tags').pluck('label')).toEqual(this.taskFilter.get('tags').pluck('label'));
				expect(this.clone.get('tags').pluck('label')).not.toEqual(this.taskFilter.get('tags').pluck('label'));
			});
		});

		describe("Collections", function() {

			beforeEach(function() {
				this.note        = new Note({title:"Nouvelle note"});
				this.note2       = new Note({title:"Nouvelle note bis"});
				this.note3       = new Note({title:"Nouvelle note ter"});
				this.note4       = new Note({title:"Nouvelle note 4"});
				this.tag         = new Tag({label:"My test tag"});
				this.tag2        = new Tag({label:"My test tag 2"});
				this.tag3        = new Tag({label:"My test tag 3"});
				this.tag4        = new Tag({label:"My test tag 4"});
				this.tag5        = new Tag({label:"My test tag 5"});
				this.tag6        = new Tag({label:"My test tag 6"});
				this.task        = new Task({label:"My test task 1"});
				this.task2       = new Task({label:"My test task 2"});
				this.task3       = new Task({label:"My test task 3"});
				this.task4       = new Task({label:"My test task 4"});
				this.task5       = new Task({label:"My test task 5"});
				this.task6       = new Task({label:"My test task 6"});
				this.task7       = new Task({label:"My test task 7"});
				this.task8       = new Task({label:"My test task 8"});
				this.noteFilter  = new Filter.Note();
				this.taskFilter1 = new Filter.Task();
				this.taskFilter2 = new Filter.Task();
				this.taskFilter3 = new Filter.Task();
				this.taskFilter4 = new Filter.Task();
				this.tagFilter   = new Filter.Tag();
				this.notes       = new Notes();
				this.tags        = new Tags();
				this.tasks       = new Tasks();
				this.notes.add(this.note);
				this.notes.add(this.note2);
				this.notes.add(this.note3);
				this.notes.add(this.note4);
				this.tags.add(this.tag);
				this.tags.add(this.tag2);
				this.tags.add(this.tag3);
				this.tags.add(this.tag4);
				this.tags.add(this.tag5);
				this.tags.add(this.tag6);
				this.tasks.add(this.task);
				this.tasks.add(this.task2);
				this.tasks.add(this.task3);
			});

			describe("Notes", function() {

				it("should provide a search function using objectFilters", function() {
					// Full text search only
					this.note.set("title","wanted1 1");
					this.note.get('tagLinks').add( { tag: this.tag } );
					this.note.get('tagLinks').add( { tag: this.tag2 } );
					this.note2.set("title","wanted1 2");
					this.note2.get('tagLinks').add( { tag: this.tag } );
					this.note2.get('taskLinks').add( { task: this.task } );
					this.note3.set("title","wanted2 3");
					this.note3.get('tagLinks').add( { tag: this.tag } );
					this.note3.get('tagLinks').add( { tag: this.tag2 } );
					this.note3.get('taskLinks').add( { task: this.task } );
					this.note4.set("title","wanted1 4");
					this.note4.get('tagLinks').add( { tag: this.tag } );
					this.note4.get('tagLinks').add( { tag: this.tag2 } );
					this.note4.get('taskLinks').add( { task: this.task } );
					this.noteFilter.set('text','ted1');

					expect(this.notes.search(this.noteFilter).length).toEqual(3);

					// Object search + text search
					this.noteFilter.set('text','ted1');
					this.noteFilter.get('tags').add(this.tag);
					this.noteFilter.get('tags').add(this.tag2);
					this.noteFilter.get('tasks').add(this.task);

					expect(this.notes.search(this.noteFilter).length).toEqual(1);
					expect(this.notes.search(this.noteFilter).at(0).get('title')).toBe("wanted1 4");
				});
			});

			describe("Tasks", function() {

				beforeEach(function() {
					/* TEST SCHEMA
					[1] task 1 / NCD
					[2] task 2 / Neolane
					[3] task 3 / 6#
					[4] task 4 / Perso
					[5] task 5 / Perso / Passeport
					[6] task 6 / Perso / Passeport
					[7] task 7 / Voyage
					[8] task 8 / Perso
					*/
					this.tasks.add(this.task4);
					this.tasks.add(this.task5);
					this.tasks.add(this.task6);
					this.tasks.add(this.task7);
					this.tasks.add(this.task8);

					this.task.set('position', 1);
					this.task2.set('position', 2);
					this.task3.set('position', 3);
					this.task4.set('position', 4);
					this.task5.set('position', 5);
					this.task6.set('position', 6);
					this.task7.set('position', 7);
					this.task8.set('position', 8);

					this.tag.set("label","NCD");
					this.tag2.set("label","Neolane");
					this.tag3.set("label","6#");
					this.tag4.set("label","Perso");
					this.tag5.set("label","Passeport");
					this.tag6.set("label","Voyage");

					this.task.get('tagLinks').add( { tag: this.tag } ); // NCD
					this.task2.get('tagLinks').add( { tag: this.tag2 } ); // Neolane
					this.task3.get('tagLinks').add( { tag: this.tag3 } ); // 6#
					this.task4.get('tagLinks').add( { tag: this.tag4 } ); // Perso
					this.task5.get('tagLinks').add( { tag: this.tag4 } ); // Perso
					this.task5.get('tagLinks').add( { tag: this.tag5 } ); // Passeport
					this.task6.get('tagLinks').add( { tag: this.tag4 } ); // Perso
					this.task6.get('tagLinks').add( { tag: this.tag5 } ); // Passeport
					this.task7.get('tagLinks').add( { tag: this.tag6 } ); // Voyage
					this.task8.get('tagLinks').add( { tag: this.tag4 } ); // Perso
				});

				it("should be SORTable by position", function() {
					// First test : all tasks with same "todo_at" (== now() per default)
					this.tasks.sort();
					expect(this.tasks.at(0).get('label')).toEqual('My test task 1');
					expect(this.tasks.at(1).get('label')).toEqual('My test task 2');
					expect(this.tasks.at(2).get('label')).toEqual('My test task 3');

					this.task.set('position',15);
					this.task7.set('position',1);
					this.tasks.sort();
					expect(this.tasks.at(0).get('label')).toEqual('My test task 7');
					expect(this.tasks.at(1).get('label')).toEqual('My test task 2');
					expect(this.tasks.at(2).get('label')).toEqual('My test task 3');

					// Second test : with different todo_at dates
					var today = new Date(); // target : 11/02
					today.setDate(11); // 11th
					today.setMonth(1); // Feb.
					today.setFullYear(2015); // 2015
					var someday9 = new Date(); // target : 09/02
					someday9.setDate(9); // 11th
					someday9.setMonth(1); // Feb.
					someday9.setFullYear(2015); // 2015
					var someday12 = new Date(); // target : 12/02
					someday12.setDate(12); // 11th
					someday12.setMonth(1); // Feb.
					someday12.setFullYear(2015); // 2015
					var someday17 = new Date(); // target : 17/02
					someday17.setDate(17); // 11th
					someday17.setMonth(1); // Feb.
					someday17.setFullYear(2015); // 2015
					var someday19 = new Date(); // target : 19/02
					someday19.setDate(19); // 11th
					someday19.setMonth(1); // Feb.
					someday19.setFullYear(2015); // 2015

					/* TEST SCHEMA
					Today
					[4][09/02] task 2
					[5][09/02] task 3
					[1][11/02] task 8
					Tomorrow
					[0][12/02] task 1
					[6][12/02] task 4
					[7][12/02] task 5
					[8][17/02] task 6
					[5][19/02] task 7
					*/

					this.task2.set('position',4);
					this.task3.set('position',5);
					this.task8.set('position',1);
					this.task.set('position',0);
					this.task7.set('position',5);
					this.task4.set('position',6);
					this.task5.set('position',7);
					this.task6.set('position',8);

					this.task2.set('todo_at', someday9);
					this.task3.set('todo_at', someday9);
					this.task8.set('todo_at', today);
					this.task.set('todo_at', someday12);
					this.task4.set('todo_at', someday12);
					this.task5.set('todo_at', someday12);
					this.task6.set('todo_at', someday17);
					this.task7.set('todo_at', someday19);
					this.tasks.sort();

					expect(this.tasks.at(0).get('label')).toEqual('My test task 2');
					expect(this.tasks.at(1).get('label')).toEqual('My test task 3');
					expect(this.tasks.at(3).get('label')).toEqual('My test task 1');
					expect(this.tasks.at(7).get('label')).toEqual('My test task 7');
				});

				it("should provide a search function using objectFilters", function() {
					// TF1 Should select only task 3
					this.taskFilter1.get('tags').add(this.tag3); // 6#
					// TF2 Should select only task 4 and task 8
					this.taskFilter2.get('tags').add(this.tag4); // Perso
					// TF3 Should select only task 6 (not its brother task 5)
					this.taskFilter3.set('text','6');
					this.taskFilter3.get('tags').add(this.tag4); // Perso
					this.taskFilter3.get('tags').add(this.tag5); // Passeport

					var tf1res = this.tasks.search(this.taskFilter1);
					var tf2res = this.tasks.search(this.taskFilter2);
					var tf3res = this.tasks.search(this.taskFilter3);

					expect(tf1res.length).toEqual(1);
					expect(tf1res.contains(this.task3)).toBe(true);

					expect(tf2res.length).toEqual(4);
					expect(tf2res.contains(this.task4)).toBe(true);
					expect(tf2res.contains(this.task5)).toBe(true);
					expect(tf2res.contains(this.task6)).toBe(true);
					expect(tf2res.contains(this.task8)).toBe(true);

					expect(tf3res.length).toEqual(1);
					expect(tf3res.contains(this.task6)).toBe(true);
				});
			});
		});

	});
});











