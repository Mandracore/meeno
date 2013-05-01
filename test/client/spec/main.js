describe("Note model", function() {

	beforeEach(function() {
		this.note = new meenoAppCli.Classes.Note();
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
});