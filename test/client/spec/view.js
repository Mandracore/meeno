describe("Editor view", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		this.view = new meenoAppCli.Classes.EditorView();
	});

	describe("when instantiated", function() {
		it("should instante two sub views", function() {
			expect (this.view.slaves.nav.el).toEqual("SPAN");
			expect (this.view.slaves.content.el).toEqual("SPAN");
		});
	});

	describe("when quit", function() {
		it("should first kill its two sub views", function() {
			spyOn(this.view.slaves.nav, 'quit');
			spyOn(this.view.slaves.content, 'quit');
			this.view.quit();
			expect(this.view.slaves.nav.quit).toHaveBeenCalled();
			expect(this.view.slaves.content.quit).toHaveBeenCalled();
		});
	});
});


describe("Embedded tag view", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		setFixtures(sandbox());
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
	describe("if already locked", function() {
		describe("when pressing any key but the back key with caret inside", function() {
			it("should not be altered", function() {
				$("#sandbox").append(this.view.render().$el);
				
				var initHtml = this.view.$el.html();
				var keyEvent = jQuery.Event("keydown");
				keyEvent.which = 50; // # Some key code value

				this.view.$el.trigger(keyEvent);

				expect (this.view.$el).toBeVisible(); // L'élément DOM de la vue doit toujours être affiché
				expect (initHtml).toEqual(this.view.$el.html()); // Le contenu de l'élément de la vue doit rester intact
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
