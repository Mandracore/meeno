describe("Note model", function() {

	beforeEach(function() {
		this.note  = new meenoAppCli.Classes.Note({title:"Nouvelle note"});
		this.note2 = new meenoAppCli.Classes.Note({title:"Nouvelle note bis"});
		this.note3 = new meenoAppCli.Classes.Note({title:"Nouvelle note ter"});
		this.tag   = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2  = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.task  = new meenoAppCli.Classes.Task({label:"My test task"});
		this.task2 = new meenoAppCli.Classes.Task({label:"My test task 2"});
		this.notes = new meenoAppCli.Classes.Notes();
		this.tags  = new meenoAppCli.Classes.Tags();
		this.tasks = new meenoAppCli.Classes.Tasks();
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

	describe("when filtering a collection with a well-formatted search pattern", function() {
		it("should return the expected models with text only", function() {
			this.note.set("title","wanted 1");
			this.note2.set("title","wanted 2");
			this.note.get('tagLinks').add( { tag: this.tag } );
			this.note2.get('tagLinks').add( { tag: this.tag } );
			this.note2.get('taskLinks').add( { task: this.task } );
			var filter = {text: "ted",objects:[]};
			var collections = {
				tags: this.tags,
				tasks: this.tasks
			};

			expect(this.notes.search(filter, collections).length).toEqual(2);
		});

		it("should return the expected models with text and objects", function() {
			this.note.set("title","wanted 1");
			this.note2.set("title","wanted 2");
			this.note3.set("title","wanted 3");
			this.note.get('tagLinks').add( { tag: this.tag } );
			this.note2.get('tagLinks').add( { tag: this.tag } );
			this.note2.get('taskLinks').add( { task: this.task } );
			this.note3.get('tagLinks').add( { tag: this.tag } );
			this.note3.get('taskLinks').add( { task: this.task } );
			var filter = {text: "wanted",objects:[
				{class: 'tags', cid: this.tag.cid},
				{class: 'tasks', cid: this.task.cid},
			]};
			var collections = {
				tags: this.tags,
				tasks: this.tasks
			};

			expect(this.notes.search(filter, collections).length).toEqual(2);
			expect(this.notes.search(filter, collections).at(0).get('title')).toBe("wanted 2");
			expect(this.notes.search(filter, collections).at(1).get('title')).toBe("wanted 3");
		});
	});
});

describe("Note Filter model", function() {

	beforeEach(function() {
		this.noteFilter  = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter2 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter3 = new meenoAppCli.Classes.NoteFilter();
		this.noteFilter4 = new meenoAppCli.Classes.NoteFilter();
		this.tag         = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2        = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
		this.task        = new meenoAppCli.Classes.Task({label:"My test task"});
		this.task2       = new meenoAppCli.Classes.Task({label:"My test task 2"});
	});

	it("can be related to a tag through a link", function() {
		this.noteFilter.get('tags').add(this.tag2);
		expect(this.noteFilter.get('tags').at(0).get('label')).toEqual("My test tag 2");
	});

	it("can be related to a task through a link", function() {
		this.noteFilter.get('tasks').add(this.task);
		expect(this.noteFilter.get('tasks').at(0).get('label')).toEqual("My test task");
	});

	it("can be compared to another note filter", function() {
		this.noteFilter.get('tasks').add(this.task);
		this.noteFilter.set('text','value to match');
		this.noteFilter2.get('tasks').add(this.task2);
		this.noteFilter3.get('tasks').add(this.task2);
		this.noteFilter4.get('tasks').add(this.task2);
		this.noteFilter4.get('tasks');
		expect(this.noteFilter.isEqual(this.noteFilter2)).toBe(false);
		expect(this.noteFilter.isEqual(this.noteFilter2)).toBe(true);
	});
});

describe("Task Filter model", function() {

	beforeEach(function() {
		this.TaskFilter  = new meenoAppCli.Classes.TaskFilter();
		this.tag         = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.tag2        = new meenoAppCli.Classes.Tag({label:"My test tag 2"});
	});

	it("can be related to a tag through a link", function() {
		this.TaskFilter.get('tags').add(this.tag2);
		expect(this.TaskFilter.get('tags').at(0).get('label')).toEqual("My test tag 2");
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