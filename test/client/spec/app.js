describe("Application", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		this.note1 = new mee.cla.Note();
		this.note2 = new mee.cla.Note();
		this.note3 = new mee.cla.Note();
		this.note4 = new mee.cla.Note();
		this.note5 = new mee.cla.Note();
		this.note6 = new mee.cla.Note();
	});

	describe("when triggering the creation of a new editor", function() {
		it("should prevent from opening twice the same note", function() {
			this.view1 = new mee.cla.EditorView ({ model: this.note1 });
			this.view2 = new mee.cla.EditorView ({ model: this.note1 });
			spyOn(this.view2, 'kill');
			this.view1.render();
			this.view2.render();
			expect(this.view2.kill).toHaveBeenCalled();
		});
		it("should prevent from opening more than 5 editors", function() {
			this.view1 = new mee.cla.EditorView ({ model: this.note1 });
			this.view2 = new mee.cla.EditorView ({ model: this.note2 });
			this.view3 = new mee.cla.EditorView ({ model: this.note3 });
			this.view4 = new mee.cla.EditorView ({ model: this.note4 });
			this.view5 = new mee.cla.EditorView ({ model: this.note5 });
			this.view6 = new mee.cla.EditorView ({ model: this.note6 });
			spyOn(this.view6, 'kill');
			this.view1.render();
			this.view2.render();
			this.view3.render();
			this.view4.render();
			this.view5.render();
			this.view6.render();
			expect(this.view6.kill).toHaveBeenCalled();
		});
	});
});
