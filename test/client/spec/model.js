describe("Note model", function() {

	beforeEach(function() {
		this.note = new meenoAppCli.Classes.Note();
	});

	it("can be related to a tag through a link", function() {
		// Preparing models
		this.note = new meenoAppCli.Classes.Note({title:"My test note"});
		this.tag  = new meenoAppCli.Classes.Tag({label:"My test tag"});
		this.linkNoteTag = new meenoAppCli.Classes.linkNoteTag({
			note: this.note,
			tag: this.tag,
		});

		expect(this.note.get('tagLinks').at(0).get('note').get('title')).toEqual("My test note");;
		expect(this.note.get('tagLinks').at(0).get('tag').get('label')).toEqual("My test tag");;
	});

	it("can be related to a task through a link", function() {
		// Preparing models
		this.note = new meenoAppCli.Classes.Note({title:"My test note"});
		this.task  = new meenoAppCli.Classes.Task({description:"My test task"});
		this.linkNoteTask = new meenoAppCli.Classes.linkNoteTask({
			note: this.note,
			task: this.task,
		});

		expect(this.note.get('taskLinks').at(0).get('note').get('title')).toEqual("My test note");;
		expect(this.note.get('taskLinks').at(0).get('task').get('description')).toEqual("My test task");;
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
			// Modify object...
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