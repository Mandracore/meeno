describe("Browser", function() {

	beforeEach(function() {
		loadFixtures('clientSideTemplates.html'); // Inserting the client side templates into the fixtures area of the DOM
		appendLoadFixtures('serverGenerated.html'); // Inserting the HTML generated by Jade on server side into the fixtures area of the DOM
		// Preparing models
		this.note        = new meenoAppCli.Classes.Note();
		this.tag         = new meenoAppCli.Classes.Tag({label: "New test tag"});
		this.task        = new meenoAppCli.Classes.Task();
		this.noteFilter  = new meenoAppCli.Classes.NoteFilter();
		this.notes       = new meenoAppCli.Classes.Notes();
		this.tags        = new meenoAppCli.Classes.Tags();
		this.tasks       = new meenoAppCli.Classes.Tasks();
		this.noteFilters = new meenoAppCli.Classes.NoteFilters();
		this.taskFilters = new meenoAppCli.Classes.TaskFilters();
		this.tagFilters  = new meenoAppCli.Classes.TagFilters();
		this.note.get('tagLinks').add( { tag: this.tag } );
		this.notes.add([this.note]);
		this.tags.add(this.tag);
		this.tasks.add(this.task);

		// Initializing browser
		this.browser = new meenoAppCli.Classes.BrowserView({ collections : {
			notes       : this.notes,
			tags        : this.tags,
			tasks       : this.tasks,
			noteFilters : this.noteFilters,
			taskFilters : this.taskFilters,
			tagFilters  : this.tagFilters,
		}});
	});

	it("should kill existing views before re-rendering", function() {
		var cid1 = this.browser.children.body.children.notes[0].cid;
		this.browser.children.body.render();
		var cid2 = this.browser.children.body.children.notes[0].cid;
		expect(cid1).not.toEqual(cid2);
	});

	describe("when asked to display notes", function() {
		it("should embed the related tags", function() {
			expect(this.browser.children.body.children.notes[0].$el).toContain('span.tags');
			expect(this.browser.children.body.children.notes[0].$('span.tags span').eq(0)).toContainText("New test tag");
		});
	});

	describe("when a collection is modified", function() {

		describe("if it's a note", function() {
			it("should relaunch notes rendering if we updated 'title' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.note.set({title:'test'});
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('notes');
			});
			it("should relaunch notes rendering if we linked a tag to it", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.note.get('tagLinks').add( { tag: this.tag } );
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('notes');
			});
			it("should NOT relaunch notes rendering if we updated 'content' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.note.set({content:'test'});
				expect(this.browser.children.body.renderCollection).not.toHaveBeenCalled();
			});
		});
		describe("if it's a tag", function() {
			it("should relaunch tags rendering if we updated 'label' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.tag.set({label:'test'});
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('tags');
			});
			it("should NOT relaunch tags rendering if we updated 'color' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.tag.set({color:'#aaaaaa'});
				expect(this.browser.children.body.renderCollection).not.toHaveBeenCalled();
			});
		});
		describe("if it's a task", function() {
			it("should relaunch tasks rendering if we updated 'label' attribute", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.task.set({label:'update test'});
				expect(this.browser.children.body.renderCollection).toHaveBeenCalledWith('tasks');
			});
			it("should NOT relaunch tasks rendering if other attributes are modified", function() {
				spyOn(this.browser.children.body, 'renderCollection');
				this.task.set({due:'2013-08-23 20:00:00'});
				this.task.set({description:'update test'});
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
		beforeEach(function() {
			// Browser already focused
			// Notes already focused
			$searchWrapperNotes = $("#tabs .tab.browse .listobjects.notes .search-wrapper");
			$searchWrapperTasks = $("#tabs .tab.browse .listobjects.tasks .search-wrapper");
			$searchWrapperTags  = $("#tabs .tab.browse .listobjects.tags .search-wrapper");
			$search             = $searchWrapperNotes.find("input.search");
			$autocomplete       = $searchWrapperNotes.find("input.autocomplete");
			$search.focus(); // Focus into the note search input
		});

		describe("and filtering via related objects", function() {
			
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
		});

		describe("and leveraging the custom filters management", function() {
			it("should refresh the controls displayed everytime one of its filters is updated", function() {
				spyOn(this.browser.children.body, 'refreshFilterControls');

				this.browser.children.body.filters.noteFilter.get('tags').add(this.tag); // Updating browser-body's noteFilter
				expect(this.browser.children.body.refreshFilterControls).toHaveBeenCalledWith('note');
				this.browser.children.body.filters.taskFilter.get('tags').add(this.tag); // Updating browser-body's taskFilter
				expect(this.browser.children.body.refreshFilterControls).toHaveBeenCalledWith('task');
				this.browser.children.body.filters.tagFilter.set('text','new test value 2'); // Updating browser-body's tagFilter
				expect(this.browser.children.body.refreshFilterControls).toHaveBeenCalledWith('tag');
			});	
			it("should display the right controls to save/delete filters", function() {

				this.browser.children.body.filters.noteFilter.get('tags').add(this.tag); // Updating browser-body's noteFilter
				this.browser.children.body.filters.taskFilter.get('tags').add(this.tag); // Updating browser-body's taskFilter
				this.browser.children.body.filters.tagFilter.set('text','new test value 2'); // Updating browser-body's tagFilter

				expect($searchWrapperNotes.find(".filter-editor .action.save").is(':visible')).toBe(true);
				expect($searchWrapperTasks.find(".filter-editor .action.save").is(':visible')).toBe(true);
				expect($searchWrapperTags.find(".filter-editor .action.save").is(':visible')).toBe(true);

				spyOn(this.browser.children.body, 'refreshFilterControls').andCallThrough();

				this.browser.children.body.options.collections.noteFilters.add(this.browser.children.body.filters.noteFilter);
				this.browser.children.body.options.collections.taskFilters.add(this.browser.children.body.filters.taskFilter);
				this.browser.children.body.options.collections.tagFilters.add(this.browser.children.body.filters.tagFilter);

				expect(this.browser.children.body.refreshFilterControls).toHaveBeenCalledWith('note');
				expect(this.browser.children.body.refreshFilterControls).toHaveBeenCalledWith('task');
				expect(this.browser.children.body.refreshFilterControls).toHaveBeenCalledWith('tag');
				expect($searchWrapperNotes.find(".filter-editor .action.save").is(':visible')).toBe(false);
				expect($searchWrapperNotes.find(".filter-editor .action.delete").is(':visible')).toBe(true);
				expect($searchWrapperTasks.find(".filter-editor .action.save").is(':visible')).toBe(false);
				expect($searchWrapperTasks.find(".filter-editor .action.delete").is(':visible')).toBe(true);
				expect($searchWrapperTags.find(".filter-editor .action.save").is(':visible')).toBe(false);
				expect($searchWrapperTags.find(".filter-editor .action.delete").is(':visible')).toBe(true);

				// We don't check that it's different yet
			});
			xit("should display a button to delete the active filter of the collection", function() {
				expect(true).toBe(false);
			});
			xit("should save a filter model when clicking the dedicated button", function() {
				expect(true).toBe(false);
			});
			xit("should delete the active filter when clicking the dedicated button and deactivate search", function() {
				expect(true).toBe(false);
			});
		});
	});
});