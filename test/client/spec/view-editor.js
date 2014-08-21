describe("Editor", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		appendSetFixtures(sandbox());
		this.note = new mee.cla.Note();
		this.editor  = new mee.cla.EditorView ({ model: this.note });
		$("#sandbox").append(this.editor.render().$el);
	});

	describe("when rendered", function() {
		it("should render two sub views", function() {
			expect (this.editor.children.tab.el.nodeName).toEqual("LI");
			expect (this.editor.children.body.el.nodeName).toEqual("DIV");
		});
	});

	describe("when killed", function() {
		it("should first kill its two sub views", function() {
			spyOn(this.editor.children.tab, 'kill');
			spyOn(this.editor.children.body, 'kill');
			this.editor.kill();
			expect(this.editor.children.tab.kill).toHaveBeenCalled();
			expect(this.editor.children.body.kill).toHaveBeenCalled();
		});
	});

	describe("when click on 'Duplicate' button", function() {
		it("should duplicate its model", function() {
			spyOn(this.editor.model, 'clone');
			this.editor.children.body.$('.clone').trigger('click');
			expect(this.editor.model.clone).toHaveBeenCalled();
		});
		it("should recreate the links to the same models", function() {
			expect(false).toBe(true);
		});
		it("should open and toggle a new editor", function() {
			this.editor.children.body.$('.clone').trigger('click');
			expect(this.editor.children.body.$el).toBeHidden();
		});
	});

	describe("when click on 'Close' button", function() {
		it("should kill itself", function() {
			spyOn(this.editor, 'kill');
			this.editor.children.body.$('.kill').trigger('click');
			expect(this.editor.kill).toHaveBeenCalled();
		});
	});

	describe("when click on 'Delete' button", function() {
		it("should delete its model", function() {
			spyOn(this.note, 'destroy');
			this.editor.children.body.$('.delete').trigger('click');
			expect(this.note.destroy).toHaveBeenCalled();
		});
		it("should kill itself", function() {
			spyOn(this.editor, 'kill');
			this.editor.children.body.$('.delete').trigger('click');
			expect(this.editor.kill).toHaveBeenCalled();
		});
	});

	describe("when editing the note's content", function() {

		describe("on keypress / if a selection is active / with one end within an object", function() {
			it("it shouldn't do anything whatever the key or combo of keys pressed", function() {
				expect(false).toBe(true);
			});
		});
		describe("on keypress / if a selection is active / with both ends within an object", function() {
			it("it should never allow object creation", function() {
				expect(false).toBe(true);
			});	
		});
		describe("on keypress / if a selection is active / with both ends within an object / that is locked", function() {
			it("it should delete the object if keys DEL or BACK or pressed", function() {
				expect(false).toBe(true);
			});
			it("it shouldn't do anything if any other keys are pressed", function() {
				expect(false).toBe(true);
			});
		});
		describe("on keypress / if a selection is active / with both ends within an object / that isn't locked", function() {
			it("it should follow normal behaviour", function() {
				expect(false).toBe(true);
			});
		});
		describe("on keypress / if a selection is active / containing objets", function() {
			it("it should delete all links to embedded objects in selection if character keys or DEL/BACK/ENTER keys are pressed", function() {
				expect(false).toBe(true);
			});	
			it("it should create a tag if the right combo is pressed", function() {
				expect(false).toBe(true);
			});
			it("it should create a task if the right combo is pressed", function() {
				expect(false).toBe(true);
			});
		});
		describe("on keypress / if no selection is active / with caret outside object", function() {
			it("it should create a tag if the right combo is pressed", function() {
				// Update DOM
				// Move caret into new object
				expect(false).toBe(true);
			});
			it("it should create a task if the right combo is pressed", function() {
				expect(false).toBe(true);
			});
		});
		describe("on keypress / if no selection is active / with caret inside object", function() {
			it("it should never allow object creation", function() {
				expect(false).toBe(true);
			});	
		});
		describe("on keypress / if no selection is active / with caret inside object / that is locked", function() {
			it("it should delete the object if keys DEL or BACK or pressed", function() {
				expect(false).toBe(true);
			});
			it("it shouldn't do anything if any other keys are pressed", function() {
				expect(false).toBe(true);
			});
		});
		describe("on keypress / if no selection is active / with caret inside object / that isn't locked", function() {
			it("it should follow normal behaviour", function() {
				expect(false).toBe(true);
			});
		});
	});	
});

describe("Embedded tag view", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		appendSetFixtures(sandbox());
		this.view = new mee.cla.TagRefView();
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