describe("Browser", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		this.browser = new meenoAppCli.Classes.BrowserView();
	});

	describe("when asked to filter objects", function() {

		beforeEach(function() {
			this.note = new meenoAppCli.Classes.Note();
			// add to a collection
			this.tag  = new meenoAppCli.Classes.Tag();
			// add to a collection
			this.task = new meenoAppCli.Classes.Task();
			// add to a collection
			appendSetFixtures(sandbox());
		});

		describe("if it's a note", function() {
			it("should hide unnecessary note views", function() {
				expect(false).toBe(true);
			});
		});
	});


	describe("when asked to select all notes", function() {
		it("should check all checkbox of the visible notes", function() {
		});
		it("should allow to filter tags by their title or content", function() {
		});
		it("should allow to filter tasks by their title or content", function() {
		});
	});

	describe("when asked to select visible notes", function() {
		it("should check all checkbox of the displayed", function() {
			expect(false).toBe(true);
		});
	});
});

describe("Editor", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		appendSetFixtures(sandbox());
		this.note = new meenoAppCli.Classes.Note();
		this.view  = new meenoAppCli.Classes.EditorView ({ model: this.note });
		$("#sandbox").append(this.view.render().$el);
	});

	describe("when rendered", function() {
		it("should render two sub views", function() {
			expect (this.view.children.tab.el.nodeName).toEqual("LI");
			expect (this.view.children.body.el.nodeName).toEqual("DIV");
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

	// Describe basic cloning feat, no cloning of relationships yet
	describe("when click on 'Duplicate' button", function() {
		it("should duplicate its model", function() {
			spyOn(this.view.model, 'clone');
			this.view.children.body.$('.clone').trigger('click');
			expect(this.view.model.clone).toHaveBeenCalled();
		});
		it("should open and toggle a new editor", function() {
			this.view.children.body.$('.clone').trigger('click');
			expect(this.view.children.body.$el).toBeHidden();
		});
	});

	describe("when click on 'Close' button", function() {
		it("should kill itself", function() {
			spyOn(this.view, 'kill');
			this.view.children.body.$('.kill').trigger('click');
			expect(this.view.kill).toHaveBeenCalled();
		});
	});

	describe("when click on 'Delete' button", function() {
		it("should delete its model", function() {
			spyOn(this.note, 'destroy');
			this.view.children.body.$('.delete').trigger('click');
			expect(this.note.destroy).toHaveBeenCalled();
		});
		it("should kill itself", function() {
			spyOn(this.view, 'kill');
			this.view.children.body.$('.delete').trigger('click');
			expect(this.view.kill).toHaveBeenCalled();
		});
	});
});

describe("Embedded tag view", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		appendSetFixtures(sandbox());
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
