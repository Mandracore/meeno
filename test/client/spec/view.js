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

	describe("when searching for text or objects", function() {
		it("should provide a well-formatted search obect", function() {
			// The complex search pattern will be stored directly in the browser's view
			/*
			Use case pattern :
				1. The user clicks in the search box (span>input)
				2. If the user presses ctrl+maj+alt+t it will look for tags > dropdown list > enter to validate
				3. If the user presses ctrl+maj+alt+h it will look for tasks > dropdown list > enter to validate
				4. If the user just types text in, it will be a full text search

			Testing pattern :
				1. Focus on input
				2. keypress text (x5 : "abcde")
				3. keypress ctrl+maj+alt+t, keypress down, keypress enter (select first option)
				4. keypress ctrl+maj+alt+h, keypress down, keypress enter (select first option)
				5. keypress ctrl+maj+alt+h, keypress down x 2, keypress enter (select second option)
				6. keypress ctrl+maj+alt+h, keypress down x 2, keypress enter (select second option)
				7. Check that the complex search pattern is well formatted :
					7.1. csp.text = "abcde"
					7.2. csp.objects[0].externalKeyName = "tagLinks"
					7.3. csp.objects[0].externalKeyValue = "ID1" // Voir comment retrouver le bon ID
					7.4. csp.objects[1].externalKeyName = "taskLinks"
					7.5. csp.objects[1].externalKeyValue = "ID1" // Voir comment retrouver le bon ID
					7.6. csp.objects[2].externalKeyName = "taskLinks"
					7.7. csp.objects[2].externalKeyValue = "ID1" // Voir comment retrouver le bon ID
					7.8. csp.objects[3].externalKeyName = "taskLinks"
					7.9. csp.objects[3].externalKeyValue = "ID1" // Voir comment retrouver le bon ID

			Dataset requiredl
				1. 1 tag
				2. 2 tasks

			Complex search object pattern :
				{
					text: "search",
					objects: {
						{
							externalKeyName: "tagLinks",
							externalKeyValue: "c9902be3"
						}
					}
				}
			*/
			expect(false).toBe(true);
		});
		it("should return the right records", function() {
			expect(false).toBe(true);
		});
	});
});

describe("Editor", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html');
		appendSetFixtures(sandbox());
		this.note = new meenoAppCli.Classes.Note();
		this.editor  = new meenoAppCli.Classes.EditorView ({ model: this.note });
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
