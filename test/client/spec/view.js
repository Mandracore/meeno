describe("Browser view", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		this.view = new meenoAppCli.Classes.BrowserView();
	});

	describe("when instantiated", function() {
		it("should instantiate two sub views", function() {
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

describe("Editor view", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		this.view = new meenoAppCli.Classes.EditorView();
		// Need to fake a model here // var newNote   = meenoAppCli.Notes.create({silent:true});
	});

	describe("when rendered", function() {
		it("should render two sub views", function() {
			$("#sandbox").append(this.view.render().$el);
			expect (this.view.children.tab.el).toEqual("LI");
			expect (this.view.children.body.el).toEqual("DIV");
		});
	});

	describe("when killed", function() {
		it("should first kill its two sub views", function() {
			spyOn(this.view.children.tab, 'kill');
			spyOn(this.view.children.body, 'kill');
			this.view.kill();
			expect(this.view.children.tab.kill).toHaveBeenCalled();
			expect(this.view.children.body.kill).toHaveBeenCalled();
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
