var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyView = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter li'                                 : 'toggleObject',
		'keyup .search'                                    : 'searchText',
		'click .actions-contextual .delete'                : 'deleteToggle',
		'click .actions-contextual-selection .select-all'  : 'selectAll',
		'click .actions-contextual-selection .unselect-all': 'unSelectAll',
		'click span.checkbox'                              : 'selection',
		'click .actions-contextual-trigger button'         : 'actionTrigger',
		'click .objectButtons span'                        : 'searchObjectRemove',
		'click .filter-editor button.save'                 : 'filterSaveStep1',
		'click .filter-editor button.saveConfirm'          : 'filterSaveStep2',
	},

	initialize: function() {
		var self = this;

		this.deleteInProgress = {
			"notes" : false,
			"tags"  : false,
			"tasks" : false
		};
		this.children = {
			"notes" : [],
			"tags"  : [],
			"tasks" : [],
			"noteFilters" : [],
			"tagFilters" : [],
			"taskFilters" : []
		};
		this.filters = {
			"noteFilter": new meenoAppCli.Classes.NoteFilter(),
			"taskFilter": new meenoAppCli.Classes.TaskFilter(),
			"tagFilter" : new meenoAppCli.Classes.TagFilter()
		};

		this.listenTo(this.options.collections.notes, 'add remove change:title add:tagLinks', function () {this.renderCollection("notes");});
		this.listenTo(this.options.collections.tags, 'add remove change:label', function () {this.renderCollection("tags");});
		this.listenTo(this.options.collections.tasks, 'add remove change:label', function () {this.renderCollection("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:filter:notes:activate', function () {this.renderCollection("notes"); this.refreshFilterControls("note");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:filter:tasks:activate', function () {this.renderCollection("tasks"); this.refreshFilterControls("task");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:filter:tags:activate', function () {this.renderCollection("tags"); this.refreshFilterControls("tag");});
		this.listenTo(this.options.collections.noteFilters, 'add remove', function () {this.renderFilterCollection("noteFilters");});
		this.listenTo(this.options.collections.taskFilters, 'add remove', function () {this.renderFilterCollection("taskFilters");});
		this.listenTo(this.options.collections.tagFilters, 'add remove', function () {this.renderFilterCollection("tagFilters");});
		this.listenTo(this.filters.noteFilter, 'change', function () {this.refreshFilterControls("note");});
		this.listenTo(this.filters.taskFilter, 'change', function () {this.refreshFilterControls("task");});
		this.listenTo(this.filters.tagFilter, 'change', function () {this.refreshFilterControls("tag");});
		this.listenTo(this.options.collections.noteFilters, 'change add:tags add:tasks', function () {this.refreshFilterControls("note");});
		this.listenTo(this.options.collections.taskFilters, 'change add:tags', function () {this.refreshFilterControls("task");});
		this.listenTo(this.options.collections.tagFilters, 'change', function () {this.refreshFilterControls("tag");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:notes:reSyncSelectors', function () {this.reSyncSelectors("notes");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:tags:reSyncSelectors', function () {this.reSyncSelectors("tags");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:taks:reSyncSelectors', function () {this.reSyncSelectors("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:tag', function () {this.searchOpenAutocomplete("tags");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:task', function () {this.searchOpenAutocomplete("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:entity', function () {this.searchOpenAutocomplete("entities");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:escape', function () {this.searchCloseAutocomplete("escape");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:backspace', function () {this.searchCloseAutocomplete("backspace");});
		this.render();
		this.refreshFilterControls("note");
		this.refreshFilterControls("task");
		this.refreshFilterControls("tag");
	},

	// --------------------------------------------------------------------------------
	// Mass actions
	reSyncSelectors: function(collName) {
		if (this.deleteInProgress[collName]) {
			this.$(".listobjects ."+collName+" span.checkbox").show(); // Display object selectors or hide them
		}
	},

	selection : function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var countUnselected = $listObjects.find("span.checkbox.icon-check-empty").length;
		if (countUnselected === 0) { // "Unselect all" only
			$listObjects.find(".actions-contextual-selection .select-all").hide();
			$listObjects.find(".actions-contextual-selection .unselect-all").show();
		} else {
			var countSelected = $listObjects.find("span.checkbox.icon-check").length;
			if (countSelected === 0) { // "Select all" only
				$listObjects.find(".actions-contextual-selection .select-all").show();
				$listObjects.find(".actions-contextual-selection .unselect-all").hide();
			} else { // "Select all" and "Unselect all"
				$listObjects.find(".actions-contextual-selection .select-all").show();
				$listObjects.find(".actions-contextual-selection .unselect-all").show();
			}
		}
	},

	selectAll: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		$listObjects.find("span.checkbox").each(function (idx, checkbox) {
			$(checkbox).addClass("icon-check").removeClass("icon-check-empty");
		});
		this.selection(event);
	},

	unSelectAll: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		$listObjects.find("span.checkbox").each(function (idx, checkbox) {
			$(checkbox).addClass("icon-check-empty").removeClass("icon-check");
		});
		this.selection(event);
	},

	deleteToggle: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var collName = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
		this.deleteInProgress[collName] = !this.deleteInProgress[collName];

		$listObjects.find("span.checkbox").toggle(); // Display object selectors or hide them
		$listObjects.find(".actions-contextual .action").toggle();
		$listObjects.find(".actions-contextual .cancel").toggle();
		$listObjects.find(".actions-contextual-trigger").toggle();
		$listObjects.find(".actions-contextual-trigger .delete").toggle();
		$listObjects.find(".actions-contextual-selection").toggle();

		if ($listObjects.find(".actions-contextual-selection").is(":visible")) {
			this.selection(event);
		}
	},

	actionTrigger: function (event) {
		// Which list objects are we working on ?
		var $listObjects = $(event.target).closest(".listobjects");
		var collName = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
		// Which action do we want to trigger ?
		var action = $(event.target).attr('class');
		meenoAppCli.dispatcher.trigger("browser:"+collName+":"+action);
	},

	// --------------------------------------------------------------------------------
	// Toggle the browser
	toggle: function() {
		// First, deactivate the other tabs' content
		$("#tabs").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	},

	// --------------------------------------------------------------------------------
	// Toggle business objet type displayed by the browser
	toggleObject : function (event) {
		var objectClass = $(event.target).hasClass("notes") ? "notes" : ($(event.target).hasClass("tags") ? "tags" : "tasks");
		// First, the command
		this.$el.find(".filter ul").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		this.$el.find(".filter li."+objectClass).addClass('selected');
		// Then, the contents
		this.$el.children(".listobjects").each(function(i,child){
			$(child).removeClass("selected");
		});
		this.$el.find(".listobjects."+objectClass).addClass('selected');
	},

	//=================================================================================
	// Search business objets among database
	//=================================================================================
	searchGetFocus: function (io) {
		var focus = false;
		var $listObjects = {};
		var inputClass = io ? "search" : "autocomplete";
		this.$(".listobjects").find('input.'+inputClass).each(function(idx,el) {
			if ($(el).is(":focus")) {
				focus = true;
				$listObjects = $(el).closest('.listobjects');
				browserActiveView = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
			}
		});
		if (!focus) { return false; }
		else {
			return browserActiveView;
		}
	},

	searchOpenAutocomplete: function (autoColl) {
		// Check focus before taking action
		var self = this;
		var filteredColl = this.searchGetFocus(true); // the kind of object we are filtering now
		if (filteredColl === false) { return; }
		var $listObjects           = this.$(".listobjects."+filteredColl);
		var filteredCollFilterName = filteredColl.replace(/(s)$/, function($1){ return ""; })+"Filter";

		// autoColl : the kind of object that will be used to retrieve the ones we look for
		var autoCollFilterClass = autoColl.replace(/^(.)/, function($1){ return $1.toUpperCase( ); })
									.replace(/(s)$/, function($1){ return ""; })+"Filter";

		console.log ('search '+filteredColl+' related to '+autoColl);

		// Parameter the autocomplete to propose the right kind of objects
		$listObjects.find(".autocomplete").autocomplete({
			source: function (request, response) {
				// request.term : data typed in by the user ("new yor")
				// response : native callback that must be called with the data to suggest to the user
				var autoCollFilter = new meenoAppCli.Classes[autoCollFilterClass]({text: request.term});
				response (
					self.options.collections[autoColl].search(autoCollFilter).map(function (model, key, list) {
						return {
							label: model.get("label"),
							value: model.cid
						};
					})
				);
			},
			focus: function( event, ui ) {
				$(event.target).val(ui.item.label);
				return false; // to cancel normal behaviour
			},
			select: function(event, ui) {
				console.log('An option has been selected');
				$(event.target).hide();
				$listObjects.find(".search").focus();

				// Saving input value into the global filter
				var autoSelModel = self.options.collections[autoColl].get(ui.item.value) // ui.item.value == model.cid
				console.log("Selected option: " + autoSelModel.get('label'));
				// Il y a bien un problème à la ligne suivante
				// Puisqu'on cherche des tags dans un tagFilter
				if (self.filters[filteredCollFilterName].get(autoColl).contains(autoSelModel) === true) { return; }
				// Adding the new autoSelModel to the view's filter
				self.filters[filteredCollFilterName].get(autoColl).add(autoSelModel);
				$(".listobjects."+filteredColl+" .search").keyup(); // Trick to re-render collections
				// Append new Object Button to the DOM
				var $objectButton = $("<span></span>")
					.attr('data-class', autoColl)
					.attr('data-cid', autoSelModel.cid)
					.html(autoSelModel.get('label'));
				self.$(".listobjects."+filteredColl+" .objectButtons").append($objectButton);
			}
		// Change the autocomplete's placeholder, empty it (in case it was used before), display it and focus in
		}).attr("placeholder","filter by related "+autoColl).val('').show().focus(); 
	},

	searchCloseAutocomplete: function (event) {console.log('close requested')
		// Check focus before taking action
		var browserActiveView = this.searchGetFocus(false); // the kind of object we are looking for
		if (browserActiveView === false) { return; }
		var $listObjects = this.$(".listobjects."+browserActiveView);
		// Listening to "backspace" & "escape" events triggered by mousetrap
		if ( event == "escape" || (event == "backspace" && $listObjects.find(".autocomplete").val() == '') ) {
			$listObjects.find(".autocomplete").hide();
			$listObjects.find(".search").focus();
		}
	},

	searchObjectRemove: function (event) {
		var $objectButton          = $(event.target);
		var $listObjects           = $objectButton.closest('.listobjects');
		var filteredColl           = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
		var filteredCollFilterName = filteredColl.replace(/(s)$/, function($1){ return ""; })+"Filter";
		var object                 = this.options.collections[$objectButton.attr('data-class')].get($objectButton.attr('data-cid'))
		$objectButton.remove(); // Cleaning up DOM
		this.filters[filteredCollFilterName].get($objectButton.attr('data-class')).remove(object); // Removing model from Filter
		$(".listobjects."+filteredColl+" .search").keyup(); // Trick to re-render collections
		this.refreshFilterControls(filteredColl.replace(/(s)$/, function($1){ return ""; }));
	},

	searchText: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var filterName   = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
		var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
		this.filters[filterName].set('text', $(event.target).val());
		this.renderCollection(collName);
		this.refreshFilterControls(collName.replace(/(s)$/, function($1){ return ""; }));
	},

	refreshFilterControls: function (collName) { //note
		console.log("refreshFilterControls="+collName);
		var $listObjects    = this.$(".listobjects."+collName+"s");
		var filtersCollName = collName+"Filters";
		var filterName      = collName+"Filter";

		$listObjects.find('.filter-editor .action').hide(); // No action controls should be displayed

		if (!this.filters[filterName].isEmpty()) { // The user has set a filter set in the super-input
			if (this.options.collections[filtersCollName].containsSimilar(this.filters[filterName]) === false) {
				$listObjects.find('.filter-editor .action.save').show(); // "Save" button is displayed
			} else {
				$listObjects.find('.filter-editor .action.delete').show(); // "Delete" button is displayed
			}
		}

		meenoAppCli.dispatcher.trigger("browser:"+filterName+":check-status"); // Force browser-body-filter views to check their status
	},

	filterSaveStep1: function (event) {
		var $listObjects    = $(event.target).closest(".listobjects");
		$listObjects.find(".filter-editor input").show().focus();
		$listObjects.find('.filter-editor .action.saveConfirm').show();
		$listObjects.find('.filter-editor .action.save').hide();
	},

	filterSaveStep2: function (event) {
		var $listObjects    = $(event.target).closest(".listobjects");
		var filterName      = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
		var filtersCollName = filterName + "s";
		var $inputFilterLabel = $listObjects.find(".filter-editor input");
		this.filters[filterName].set('label', $inputFilterLabel.val());
		$listObjects.find('.filter-editor .action.saveConfirm').hide();
		$inputFilterLabel.hide();
		this.options.collections[filtersCollName].add(this.filters[filterName].superClone());
	},

	renderFilterCollection: function (filtersCollName) {
		var self         = this;
		var filteredColl = filtersCollName.replace(/(Filters)$/, function($1){ return "s"; }); // noteFilters => notes
		var filterName   = filtersCollName.replace(/(s)$/, function($1){ return ""; }); // noteFilters => noteFilter

		// First, emptying the DOM
		var $list = this.$('.listobjects.'+filteredColl+' .filter-editor ul');
		$list.html('');

		// Second, killing children views of right collection
		_.each(this.children[filtersCollName], function (child, index) {
			child.kill();
		});
		this.children[filtersCollName] = [];

		// Third, filling the DOM again
		this.options.collections[filtersCollName].each(function (element) {
			var newView = new meenoAppCli.Classes.BrowserBodyFilterView({ filterName: filterName, model: element, parent: self });
			self.children[filtersCollName].push (newView);
			$list.append(newView.render().el);
		}, this);
	},


	//=================================================================================
	// Render business objects' sub views 
	//=================================================================================
	render: function (event) {
		this.renderCollection('notes');
		this.renderCollection('tags');
		this.renderCollection('tasks');
	},

	renderCollection: function (collName) {
		//console.log("renderCollection:"+collName);
		var self = this;
		var filterName = collName == "notes" ? "noteFilter" : (collName == "tasks" ? "taskFilter" : "tagFilter");
		// First, emptying the DOM
		var $list = this.$('.listobjects.'+collName+' .'+collName);
		$list.html('');
		// Second, killing children views of right collection
		_.each(this.children[collName], function (child, index) {
			child.kill();
		});
		this.children[collName] = [];
		// Third, filling the DOM again
		var newView = {};

		this.options.collections[collName].search(this.filters[filterName]).each(function (element) { // for now we ignore complex searches
			if (collName == "notes") { newView = new meenoAppCli.Classes.BrowserBodyNoteView({ model: element }); }
			if (collName == "tags") { newView = new meenoAppCli.Classes.BrowserBodyTagView({ model: element }); }
			if (collName == "tasks") { newView = new meenoAppCli.Classes.BrowserBodyTaskView({ model: element }); }
			self.children[collName].push (newView);
			$list.append(newView.render().el);
		}, this);
	},
});

//_.extend(meenoAppCli.Classes.BrowserBodyView.prototype, meenoAppCli.l18n.BrowserBodyView);