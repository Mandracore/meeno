describe("Embedded tag view", function() {

	beforeEach(function() {
		// loadFixtures('../../../../../../app/src/views/clientSideTemplates.html');
		loadFixtures('clientSideTemplates.html');
		this.view = new meenoAppCli.Classes.TagRefView();
	});

	// Describing what should be always true about that view, whatever its status is
	describe("when instantiated", function() {
		it("should be a SPAN element", function() {
			expect (this.view.render().el.nodeName).toEqual("SPAN");
		});
		it("should have the right classes", function() {
			expect (this.view.render().el).toHaveClass("object");
			expect (this.view.render().el).toHaveClass("tag");
		});
	});

	// Describing view's behaviour if it's already locked
	describe("if not locked", function() {
		describe("when pressing any key", function() {
			it("should not be altered", function() {
				expect (false).toBe(true);
			});
		});
		describe("when clicked or on pressing key back", function() {
			it("should be destroyed", function() {
				expect (false).toBe(true);
			});
			it("should be unlinked from note", function() {
				expect (false).toBe(true);
			});
		});
	});

	// Describing view's behaviour if it's already locked
	describe("if already locked", function() {
		describe("when pressing any key but the back key with caret inside", function() {
			it("should not be altered", function() {
				expect (false).toBe(true);
			});
		});
		describe("when clicked or on pressing key back with caret inside", function() {
			it("should be destroyed", function() {
				expect (false).toBe(true);
			});
			it("should be unlinked from note", function() {
				expect (false).toBe(true);
			});
		});
	});
});
