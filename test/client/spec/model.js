describe("Note model", function() {

	beforeEach(function() {
		this.note       = new meenoAppCli.Classes.Note({title:"Nouvelle note"});
		this.note2      = new meenoAppCli.Classes.Note({title:"Nouvelle note bis"});
		this.note3      = new meenoAppCli.Classes.Note({title:"Nouvelle note ter"});
		this.tag        = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2       = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.task       = new meenoAppCli.Classes.Task({label:"My test task"});
		this.task2      = new meenoAppCli.Classes.Task({label:"My test task 2"});
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
	});

	it("can be related to a tag through a link", function() {
		this.note.get('tagLinks').add( { tag: this.tag } );
		expect(this.note.get('tagLinks').pluck('tag')[0].get('label')).toEqual("My test tag");
	});

	it("can be related to a task through a link", function() {
		this.note.get('taskLinks').add( { task: this.task } );
		expect(this.note.get('taskLinks').pluck('task')[0].get('label')).toEqual("My test task");
	});

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


describe("Tag model", function() {

	beforeEach(function() {
		this.tag = new meenoAppCli.Classes.Tag();
	});

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

describe("Task model", function() {

	beforeEach(function() {
		this.task = new meenoAppCli.Classes.Task();
	});

	describe("when creating a new task", function() {
		it("should have a default created_at attribute", function() {
			expect((new Date()).getTime() - this.task.get('created_at').getTime()).toBeGreaterThan(-1);
		});
		it("should have a default updated_at attribute", function() {
			expect((new Date()).getTime() - this.task.get('updated_at').getTime()).toBeGreaterThan(-1);
		});
		it("should have a default description attribute", function() {
			expect(this.task.get('description')).toBe('New Task');
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

describe("Note, tags and tasks model", function() {

	beforeEach(function() {
		this.note       = new meenoAppCli.Classes.Note({title:"Nouvelle note"});
		this.note2      = new meenoAppCli.Classes.Note({title:"Nouvelle note bis"});
		this.note3      = new meenoAppCli.Classes.Note({title:"Nouvelle note ter"});
		this.tag        = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2       = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.task       = new meenoAppCli.Classes.Task({label:"My test task"});
		this.task2      = new meenoAppCli.Classes.Task({label:"My test task 2"});
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
	it("Task can be related to a note, a tag and a task", function() {
		this.task.get('noteLinks').add( { note: this.note2 } );
		expect(this.task.get('noteLinks').pluck('note')[0].get('title')).toEqual("Nouvelle note bis");

		this.task.get('tagLinks').add( { tag: this.tag } );
		expect(this.task.get('tagLinks').pluck('tag')[0].get('label')).toEqual("My test tag");

		this.task.set('parent', this.task2);
		expect(this.task.get('parent').get('label')).toEqual("My test task 2");
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

describe("Collections of notes, tasks and tags", function() {
	beforeEach(function() {
		this.note       = new meenoAppCli.Classes.Note({title:"Nouvelle note"});
		this.note2      = new meenoAppCli.Classes.Note({title:"Nouvelle note bis"});
		this.note3      = new meenoAppCli.Classes.Note({title:"Nouvelle note ter"});
		this.tag        = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2       = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.task       = new meenoAppCli.Classes.Task({label:"My test task"});
		this.task2      = new meenoAppCli.Classes.Task({label:"My test task 2"});
		this.noteFilter = new meenoAppCli.Classes.NoteFilter();
		this.taskFilter = new meenoAppCli.Classes.TaskFilter();
		this.tagFilter  = new meenoAppCli.Classes.TagFilter();
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
	});
	it("should provide a search function using objectFilters", function() {
		// 1. Testing notes
		this.note.set("title","wanted 1");
		this.note2.set("title","wanted 2");
		this.noteFilter.set('text','ted');

		expect(this.notes.search(this.noteFilter).length).toEqual(2);

		this.note.set("title","wanted 1");
		this.note2.set("title","wanted 2");
		this.note3.set("title","wanted 3");
		this.note.get('tagLinks').add( { tag: this.tag } );
		this.note2.get('tagLinks').add( { tag: this.tag } );
		this.note2.get('taskLinks').add( { task: this.task } );
		this.note3.get('tagLinks').add( { tag: this.tag } );
		this.note3.get('taskLinks').add( { task: this.task } );
		this.noteFilter.set('text','wanted');
		this.noteFilter.get('tags').add(this.tag);
		this.noteFilter.get('tasks').add(this.task);

		expect(this.notes.search(this.noteFilter).length).toEqual(2);
		expect(this.notes.search(this.noteFilter).at(0).get('title')).toBe("wanted 2");
		expect(this.notes.search(this.noteFilter).at(1).get('title')).toBe("wanted 3");

		// 2. Testing tasks
		this.task.set("label","wanted 1");
		this.task2.set("label","wanted 2");
		this.task.get('tagLinks').add( { tag: this.tag } );
		this.taskFilter.set('text','2');
		this.taskFilter.get('tags').add(this.tag);

		expect(this.tasks.search(this.taskFilter).length).toEqual(0);

	});
});