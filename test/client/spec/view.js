describe("Embedded tag view", function() {

	beforeEach(function() {
		// loadFixtures('../../../../../../app/src/views/clientSideTemplates.html');
		loadFixtures('clientSideTemplates.html');
		this.view = new meenoAppCli.Classes.TagRefView();
	});

	describe("when instantiated", function() {
		it("should be a list element", function() {
			expect (this.view.render().el.nodeName).toEqual("SPAN");
		});
		it("should have the right classes", function() {
			expect (this.view.render().el).toHaveClass("object");
			expect (this.view.render().el).toHaveClass("tag");
		});
	});
});
