describe("Browser", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html'); // Inserting the client side templates into the fixtures area of the DOM
		appendSetFixtures(sandbox()); // Inserting a #sanbox div into the fixtures area of the DOM
		appendSetFixtures(
			'<div id="nav"><div class="browse"></div></div>'+
			'<div id="tabs"><div class="browse">'+
				'<div class="listobjects notes selected"><ul class="notes"></ul></div>'+
				'<div class="listobjects tasks"><ul class="tasks"></ul></div>'+
				'<div class="listobjects tags"><ul class="tags"></ul></div>'+
			'</div></div>'
		);
		// Preparing models
		this.note = new meenoAppCli.Classes.Note();
		this.notes = new meenoAppCli.Classes.Notes();
		this.notes.add([this.note]);
		this.tag  = new meenoAppCli.Classes.Tag();
		this.tags = new meenoAppCli.Classes.Tags();
		this.tags.add([this.tag]);
		this.task = new meenoAppCli.Classes.Task();
		this.tasks = new meenoAppCli.Classes.Tasks();
		this.tasks.add([this.task]);
		// Initializing browser
		this.browser = new meenoAppCli.Classes.BrowserView({ collections : {
			notes : this.notes,
			tags  : this.tags,
			tasks : this.tasks,
		}});
	});

	describe("when asked to display notes", function() {
		it("should embed the related tags", function() {
			this.linkNoteTag = new meenoAppCli.Classes.linkNoteTag({
				note: this.note,
				tag: this.tag,
			});
			// Browser should automatically redraw
			expect(this.note.$el).toContain('span.related-tag');
			expect(this.note.$('span.related-tag')).toContainText(this.tag.get('label'));
		});
	});

	describe("when asked to filter objects", function() {

		beforeEach(function() {
		});

		describe("if it's a note", function() {
			it("should kill existing note views and empty DOM", function() {
				expect(false).toBe(true);
			});
			it("should display only correct the right models", function() {
				expect(false).toBe(true);
			});
		});
	});

	describe("when a collection is modified", function() {

		describe("if it's a note", function() {
			it("should relaunch notes rendering", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.note.set({title:'test'});
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('notes');
			});
			it("but only if we updated 'title' attribute...", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.note.set({content:'test'});
				expect(this.browser.children.body.renderCollection).not.toHaveBeenCalled();
			});	
			it("...or linked a tag to it", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.linkNoteTask = new meenoAppCli.Classes.linkNoteTask({
					note: this.note,
					tag: this.tag,
				});
				expect(this.browser.children.body.renderCollection).not.toHaveBeenCalled();
			});
		});
		describe("if it's a tag", function() {
			it("should relaunch tags rendering", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.tag.set({label:'test'});
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('tags');
			});
			it("but only if we updated 'label' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.tag.set({color:'#aaaaaa'});
				expect(this.browser.children.body.renderCollection).not.toHaveBeenCalled();
			});
		});
		describe("if it's a task", function() {
			it("should relaunch tasks rendering", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.task.set({description:'test'});
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('tasks');
			});
			it("but only if we updated 'description' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.task.set({due:'2013-08-23 20:00:00'});
				expect(this.browser.children.body.renderCollection).not.toHaveBeenCalled();
			});
		});
	});

	describe("when asked to select all notes", function() {
		it("should check all checkbox of the visible notes", function() {
			expect(false).toBe(true);
		});
		it("should allow to filter tags by their title or content", function() {
			expect(false).toBe(true);
		});
		it("should allow to filter tasks by their title or content", function() {
			expect(false).toBe(true);
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
