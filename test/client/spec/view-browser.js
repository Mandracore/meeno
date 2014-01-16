describe("Browser", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html'); // Inserting the client side templates into the fixtures area of the DOM
		appendLoadFixtures('serverGenerated.html'); // Inserting the HTML generated by Jade on server side into the fixtures area of the DOM
		//appendSetFixtures(sandbox()); // Inserting a #sanbox div into the fixtures area of the DOM
		/*appendSetFixtures(
			'<div id="nav"><div class="browse"></div></div>'+
			'<div id="tabs"><div class="browse">'+
				'<div class="listobjects notes selected"><ul class="notes"></ul></div>'+
				'<div class="listobjects tasks"><ul class="tasks"></ul></div>'+
				'<div class="listobjects tags"><ul class="tags"></ul></div>'+
			'</div></div>'
		);*/
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
		describe("and filtering via related objects", function() {

			beforeEach(function() {
				// Browser already focused
				// Notes already focused
				$searchwrapper = $("#tabs .tab.browse .listobjects.notes .searchwrapper");
				$search = $searchwrapper.find("input.search");
				$autocomplete = $searchwrapper.find("input.autocomplete");
				$search.focus(); // Focus into the note search input
			});
			
			it("should display an autocomplete input (+ hide the other one), set focus and the right placeholder when hitting task combo", function() {
				// Testing notes+tasks
				meenoAppCli.dispatcher.trigger('keyboard:task'); // Simulate a keyboard event (normally listened by mousetrap)
				expect($autocomplete.is(':focus')).toBe(true); // Autocomplete must have focus
				expect($autocomplete.attr('placeholder')).toBe("filter by related tasks"); // Placeholder should be correct
			});

			it("should display an autocomplete input (+ hide the other one), set focus and the right placeholder when hitting tag combo", function() {
				// Testing notes+tasks
				meenoAppCli.dispatcher.trigger('keyboard:tag'); // Simulate a keyboard event (normally listened by mousetrap)
				expect($autocomplete.is(':focus')).toBe(true); // Autocomplete must have focus
				expect($autocomplete.attr('placeholder')).toBe("filter by related tags"); // Placeholder should be correct
			});

			it("should hide the autocomplete input (+ display the other one) when hitting the ESC key", function() {
				meenoAppCli.dispatcher.trigger('keyboard:task'); // Display autocomplete
				expect($autocomplete.is(':visible')).toBe(true); // Check Autocomplete is visible
				expect($autocomplete.is(':focus')).toBe(true); // Check Autocomplete has focus
				meenoAppCli.dispatcher.trigger('keyboard:escape'); // Simulate escape (without testing mousetrap)
				expect($autocomplete.is(':visible')).toBe(false); // Check Autocomplete is now hidden
				expect($search.is(':focus')).toBe(true); // Check Search has focus
			});
			it("should hide the autocomplete input (+ display the other one) when hitting the Backspace key if input is empty", function() {
				meenoAppCli.dispatcher.trigger('keyboard:tag'); // Display autocomplete
				expect($autocomplete.is(':visible')).toBe(true); // Check Autocomplete is visible
				expect($autocomplete.is(':focus')).toBe(true); // Check Autocomplete has focus
				$autocomplete.val('test'); // Fill input with some chars
				meenoAppCli.dispatcher.trigger('keyboard:backspace'); // Simulate escape (without testing mousetrap)
				expect($autocomplete.is(':visible')).toBe(true); // It should be still visible
				$autocomplete.val(''); // Empty input
				meenoAppCli.dispatcher.trigger('keyboard:backspace'); // Simulate escape (without testing mousetrap)
				expect($autocomplete.is(':visible')).toBe(false); // This time it should be hidden
				expect($search.is(':focus')).toBe(true); // Check Search has focus
			});
			it("should hide the autocomplete input and add a new object to the search filter when selecting an option", function() {
				expect(true).toBe(false);

				//this.browser.children.body

				// Saisir du texte
				// Rajouter deux tags
				// Rajouter une task
				// Valider que le pattern de recherche est bien formé (class/id pour chaque objet)

				// Open the browser
				// Test 1 : with notes
				//		open the note object
				//		focus on the search input
				//		trigger a task combo
				//		fake type in a letter of an existing tag (see above)
				//		save the value of the first option
				// 		select the first option
				//		validate it's been saved with class/id
				// Test 2 : with tasks

				// Open the browser
				// Open the note object (complex search only here )
			});
		});
	});
});