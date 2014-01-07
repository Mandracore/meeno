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

	describe("when using search", function() {
		// To be tested :
		// Simple : Notes, Tags, Tasks
		// Complex : Notes, Tasks

		// For now, we test only notes
		describe("when looking for objects related to other ones", function() {
			it("should display an autocomplete input (set focus and change placeholder) for tasks when hitting the task combo", function() {

			});
			it("should display an autocomplete input (set focus and change placeholder) for tags when hitting the tag combo", function() {

			});
			it("should prevent from displaying various autocompletes at the same time", function() {
			});
			it("should hide the autocomplete input for tags when hitting the ESC key or when selecting an option", function() {
			});
			it("should add a new object to the search filter when selecting an option", function() {
				// Open the browser
				// Test 1 : with notes
				//		open the note object
				//		focus on the search input
				//		trigger a task combo
				//		fake type in a letter of an existing tag (see above)
				//		save the value of the first option
				// 		select the first option
				//		validate it's been saved with id = objecttype+objectid
				// Test 2 : with tasks

				// Open the browser
				// Open the note object (complex search only here )
			});
		});

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