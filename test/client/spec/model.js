describe("Business Models", function() {

	//=======================================================================================================
	// DESCRIBE MODEL DEFAULTS
	//=======================================================================================================

	describe("Defaults", function() {

		beforeEach(function() {
			this.note = new meenoAppCli.Classes.Note();
			this.tag  = new meenoAppCli.Classes.Tag();
			this.task = new meenoAppCli.Classes.Task();
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
			});

			describe("when modifying a note", function() {
				it("should have updated updated_at attribute", function() {
					var time0 = this.note.get('updated_at');
					this.note.set('title','new title');
					var time1 = this.note.get('updated_at');
					expect(time1 - time0).toBeGreaterThan(0);
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

			describe("when modifying a tag", function() {
				it("should have updated updated_at attribute", function() {
					var time0 = this.tag.get('updated_at');
					// Modify object...
					var time1 = this.tag.get('updated_at');
					expect(time1 - time0).toBeGreaterThan(0);
				});
			});
		});


		describe("Task", function() {

			describe("when creating a new task", function() {
				it("should have a default created_at attribute", function() {
					expect((new Date()).getTime() - this.task.get('created_at').getTime()).toBeGreaterThan(-1);
				});
				it("should have a default updated_at attribute", function() {
					expect((new Date()).getTime() - this.task.get('updated_at').getTime()).toBeGreaterThan(-1);
				});
				it("should have a default description attribute", function() {
					expect(this.task.get('description')).toBe('Description of your task...');
				});
				it("should have a default position attribute", function() {
					expect(this.task.get('position')).toBe(0);
				});
			});

			describe("when modifying a task", function() {
				it("should have updated updated_at attribute", function() {
					var time0 = this.task.get('updated_at');
					// Modify object...
					var time1 = this.task.get('updated_at');
					expect(time1 - time0).toBeGreaterThan(0);
				});
			});
		});
	});

	//=======================================================================================================
	// DESCRIBE MODEL RELATIONS
	//=======================================================================================================

	describe("Relations and methods", function() {

		beforeEach(function() {
			this.note       = new meenoAppCli.Classes.Note({title:"Nouvelle note"});
			this.note2      = new meenoAppCli.Classes.Note({title:"Nouvelle note bis"});
			this.note3      = new meenoAppCli.Classes.Note({title:"Nouvelle note ter"});
			this.tag        = new meenoAppCli.Classes.Tag({label:"My test tag"});
			this.tag2       = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
			this.tag3       = new meenoAppCli.Classes.Tag({label:"My test tag 3"});
			this.task       = new meenoAppCli.Classes.Task({label:"My test task"});
			this.task2      = new meenoAppCli.Classes.Task({label:"My test task 2"});
			this.task3      = new meenoAppCli.Classes.Task({label:"My test task 3"});
			this.noteFilter = new meenoAppCli.Classes.NoteFilter();
			this.notes      = new meenoAppCli.Classes.Notes();
			this.tags       = new meenoAppCli.Classes.Tags();
			this.tasks      = new meenoAppCli.Classes.Tasks();
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
		it("Task can have one parent and several children", function() {
			this.task2.set('parent', this.task);
			this.task3.set('parent', this.task);
			expect(this.task2.get('parent').get('label')).toEqual("My test task");
			expect(this.task.get('children').at(0).get('label')).toEqual("My test task 2");
			expect(this.task.get('children').at(1).get('label')).toEqual("My test task 3");
		});
		it("Task should have a getAncestors() method", function() {
			this.task2.set('parent', this.task);
			this.task3.set('parent', this.task2);
			expect(this.task3.getAncestors().length).toEqual(2);
			expect(this.task3.getAncestors().at(1).get('label')).toEqual("My test task");
			expect(this.task3.getAncestors().at(0).get('label')).toEqual("My test task 2");
		});
		it("Task should have a pluckAllTags() method", function() {
			this.task2.set('parent', this.task);
			this.task3.set('parent', this.task2);

			this.task.get('tagLinks').add( { tag: this.tag } );
			this.task3.get('tagLinks').add( { tag: this.tag3 } );

			var allTask3Tags = this.task3.pluckAllTags();

			expect(allTask3Tags.length).toEqual(2);
			expect(_.contains(allTask3Tags, this.tag)).toBe(true);
			expect(_.contains(allTask3Tags, this.tag3)).toBe(true);
			expect(this.task.pluckAllTags().length).toEqual(1);
			expect(this.task2.pluckAllTags().length).toEqual(1);
		});
	});
});

describe("Filter models", function() {

	beforeEach(function() {
		this.noteFilter  = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter2 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter3 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter4 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter5 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter6 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter7 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter8 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter9 = new meenoAppCli.Classes.NoteFilter();
		this.taskFilter  = new meenoAppCli.Classes.TaskFilter();
		this.taskFilter2 = new meenoAppCli.Classes.TaskFilter();
		this.taskFilter3 = new meenoAppCli.Classes.TaskFilter();
		this.tagFilter   = new meenoAppCli.Classes.TagFilter();
		this.tagFilter2  = new meenoAppCli.Classes.TagFilter();
		this.tag         = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2        = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.task        = new meenoAppCli.Classes.Task({label:"My test task"});
		this.task2       = new meenoAppCli.Classes.Task({label:"My test task 2"});
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
		this.note        = new meenoAppCli.Classes.Note({title:"Nouvelle note"});
		this.note2       = new meenoAppCli.Classes.Note({title:"Nouvelle note bis"});
		this.note3       = new meenoAppCli.Classes.Note({title:"Nouvelle note ter"});
		this.note4       = new meenoAppCli.Classes.Note({title:"Nouvelle note 4"});
		this.tag         = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2        = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.tag3        = new meenoAppCli.Classes.Tag({label:"My test tag 3"});
		this.tag4        = new meenoAppCli.Classes.Tag({label:"My test tag 4"});
		this.tag5        = new meenoAppCli.Classes.Tag({label:"My test tag 5"});
		this.tag6        = new meenoAppCli.Classes.Tag({label:"My test tag 6"});
		this.task        = new meenoAppCli.Classes.Task({label:"My test task 1"});
		this.task2       = new meenoAppCli.Classes.Task({label:"My test task 2"});
		this.task3       = new meenoAppCli.Classes.Task({label:"My test task 3"});
		this.task4       = new meenoAppCli.Classes.Task({label:"My test task 4"});
		this.task5       = new meenoAppCli.Classes.Task({label:"My test task 5"});
		this.task6       = new meenoAppCli.Classes.Task({label:"My test task 6"});
		this.task7       = new meenoAppCli.Classes.Task({label:"My test task 7"});
		this.task8       = new meenoAppCli.Classes.Task({label:"My test task 8"});
		this.noteFilter  = new meenoAppCli.Classes.NoteFilter();
		this.taskFilter1 = new meenoAppCli.Classes.TaskFilter();
		this.taskFilter2 = new meenoAppCli.Classes.TaskFilter();
		this.taskFilter3 = new meenoAppCli.Classes.TaskFilter();
		this.taskFilter4 = new meenoAppCli.Classes.TaskFilter();
		this.tagFilter   = new meenoAppCli.Classes.TagFilter();
		this.notes       = new meenoAppCli.Classes.Notes();
		this.tags        = new meenoAppCli.Classes.Tags();
		this.tasks       = new meenoAppCli.Classes.Tasks();
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

	describe("Tasks Collections", function() {

		describe("position methods", function() {

			it("should be SORTable by position", function() {
				this.task.set('position',3);
				this.task2.set('position',1);
				this.task3.set('position',2);
				this.tasks.sort();
				expect(this.tasks.at(0).get('label')).toEqual('My test task 2');
				expect(this.tasks.at(1).get('label')).toEqual('My test task 3');
				expect(this.tasks.at(2).get('label')).toEqual('My test task 1');
				this.task.set('position',1);
				this.task2.set('position',2);
				this.task3.set('position',3);
				this.tasks.sort();
				expect(this.tasks.at(0).get('label')).toEqual('My test task 1');
				expect(this.tasks.at(1).get('label')).toEqual('My test task 2');
				expect(this.tasks.at(2).get('label')).toEqual('My test task 3');
			});
		});

		describe("hierarchy methods", function() {

			beforeEach(function() {
				/* TEST HIERARCHY
				[0] task 1 / NCD <=== 1
					[0] task 2 / Neolane <=== 1
						[0] task 3 / 6# <=== 1
				[1] task 4 / Perso <=== 2 & 3 & 4
					[0] task 5 / Passeport <=== 2
					[1] task 6 / Passeport <=== 2 & 3
					[2] task 7 / Voyage <=== 2
				[2] task 8 / Perso <=== 2
				*/
				this.tasks.add(this.task4);
				this.tasks.add(this.task5);
				this.tasks.add(this.task6);
				this.tasks.add(this.task7);
				this.tasks.add(this.task8);

				this.task2.set('parent', this.task);
				this.task3.set('parent', this.task2);
				this.task5.set('parent', this.task4);
				this.task6.set('parent', this.task4);
				this.task7.set('parent', this.task4);
				// this.task8.set('parent', this.task);

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
				this.task5.get('tagLinks').add( { tag: this.tag5 } ); // Passeport
				this.task6.get('tagLinks').add( { tag: this.tag5 } ); // Passeport
				this.task7.get('tagLinks').add( { tag: this.tag6 } ); // Voyage
				this.task8.get('tagLinks').add( { tag: this.tag4 } ); // Perso
			});

			it("tasks should provide a method to append the ancestors to a collection", function() {
				this.tasks2 = new meenoAppCli.Classes.Tasks();
				this.tasks2.add(this.task3);
				this.tasks2.add(this.task6);
				this.tasks2.add(this.task7);
				this.tasks2Welders = this.tasks2.addAncestors();

				expect(this.tasks2Welders.length).toEqual(6);
				expect(this.tasks2Welders.contains(this.task)).toBe(true);
				expect(this.tasks2Welders.contains(this.task2)).toBe(true);
				expect(this.tasks2Welders.contains(this.task4)).toBe(true);
			});

			it("tasks should provide a search function using objectFilters and returning ancestors", function() {
				//=====================================================
				// le filtrage par tags semble ne plus avoir d'effet
				//=====================================================
/*
				// TF1 Should select only task 3 plus its two ancestors (task 1 & task 2)
				this.taskFilter1.set('text','3');
				// TF2 Should select only task 4 plus its children (5,6,7), and task 8
				this.taskFilter2.get('tags').add(this.tag5); // Passeport
				this.taskFilter2.get('tags').add(this.tag6); // Voyage
				this.taskFilter2.get('tags').add(this.tag); // NCD
				this.taskFilter2.get('tags').add(this.tag2); // Neolane
				// TF3 Should select only task 6 plus its parent task 4
				this.taskFilter3.set('text','6');
				this.taskFilter3.get('tags').add(this.tag4); // Perso
				this.taskFilter3.get('tags').add(this.tag5); // Passeport
				// TF4 Should select only task 4
				this.taskFilter4.set('text','4');
				this.taskFilter4.get('tags').add(this.tag4); // Perso

				var tf1res = this.tasks.search(this.taskFilter1);
				var tf2res = this.tasks.search(this.taskFilter2);
				var tf3res = this.tasks.search(this.taskFilter3);
				var tf4res = this.tasks.search(this.taskFilter4);

				// console.log(this.task.getAncestors());
				// console.log(this.task2.getAncestors());
				// console.log(this.task3.getAncestors());

				// expect(tf1res.length).toEqual(3);
				// expect(tf1res.contains(this.task)).toBe(true);
				// expect(tf1res.contains(this.task2)).toBe(true);
				// expect(tf1res.contains(this.task3)).toBe(true);
				expect(tf2res.length).toEqual(0); // KO
				// expect(tf2res.contains(this.task4)).toBe(true);
				// expect(tf2res.contains(this.task6)).toBe(true);
				// expect(tf3res.length).toEqual(2);
				// expect(tf3res.contains(this.task4)).toBe(true);
				// expect(tf3res.contains(this.task5)).toBe(true);
				// expect(tf3res.contains(this.task6)).toBe(true);
				// expect(tf4res.length).toEqual(1);

				*/

				var r2Task1 = new meenoAppCli.Classes.Task({label:"Run 2 task 1"});
				var r2Tag1  = new meenoAppCli.Classes.Tag({label:"Run 2 My test tag 1"});
				var r2Tasks  = new meenoAppCli.Classes.Tasks();
				r2Tasks.add(r2Task1);
				var r2tf = new meenoAppCli.Classes.TaskFilter();
				r2tf.get('tags').add(r2Tag1);
				expect(r2Tasks.search(r2tf).length).toEqual(0);
			});


			it("should provide a getTree method", function() {

				this.taskFilter.set('text','');
				this.taskFilter.get('tags').add(this.tag1).add(this.tag2);

				// 3. Checking the tree generated
				/* Expected result:
					task 0
					    task 1 / Perso
					        task 2 / Passeport
					        task 3 / Passeport
					        task 4 / Voyage
				*/

				expect(this.tasks.search(this.taskFilter).getTree).toEqual(false);
			});

		});
	});

});