describe("List tag view", function() {

	beforeEach(function() {
		this.view = new meenoAppCli.Classes.ListTagView();
	});

	describe("when editing a tag's label", function() {
		it("should update the content of the notes that are related to it", function() {
			expect(false).toBe(true);
		});
	});
});

describe("Embedded tag view", function() {

	// beforeEach(function() {
	// 	setFixtures('<ul class="todos"></ul>');
	//  loadFixtures(fixtureUrl[, fixtureUrl, ...])
	// });

	beforeEach(function() {
		this.view = new meenoAppCli.Classes.TagRefView();
	});

	describe("when instantiated", function() {
		it("should be a list element", function() {
			expect(this.view.el.nodeName).toEqual("UL");
		});
		it("should have the classes 'object' and 'tag'", function() {
			expect($(this.view.el).hasClass('object')).toBeTruthy();
			expect($(this.view.el).hasClass('todos')).toBeTruthy();
		});
	});
});