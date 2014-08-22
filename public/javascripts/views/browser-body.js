var mee     = mee || {};
mee.cla = mee.cla || {};

/**
 * This class will be used to support the main view of the object browser.
 * From here, the user will be able to browse notes, tags and tasks, using filters and sorting out results.
 * It controls the creation of several subviews, like {{#crossLink "mee.cla.BrowserBodyTagView"}}{{/crossLink}},
 * {{#crossLink "mee.cla.BrowserBodyFilterView"}}{{/crossLink}},...
 * 
 * @class mee.cla.BrowserBodyView
 * @constructor
 * @param {Object} options Holds all the options of the view
 * @param {Object} options.collections Holds the 6 collections of objects to be used by the browser
 * @param {mee.cla.Notes} options.collections.notes
 * @param {mee.cla.Tags} options.collections.tags
 * @param {mee.cla.Tasks} options.collections.tasks
 * @param {mee.cla.NoteFilters} options.collections.noteFilters
 * @param {mee.cla.TaskFilters} options.collections.taskFilters
 * @param {mee.cla.TagFilters} options.collections.tagFilters
 */
mee.cla.BrowserBodyView = Backbone.View.extend ({

	// Initialize the view
	// =============================================================================
	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	// ###Setup the view's DOM events
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
		'click .filter-editor button.delete'               : 'filterDelete',
	},

	// ###Setup the view
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

		// this.filters stores the filters that actually filter the displayed collections
		// they can be cloned for saving
		this.filters = {
			"noteFilter": new mee.cla.NoteFilter(),
			"taskFilter": new mee.cla.TaskFilter(),
			"tagFilter" : new mee.cla.TagFilter()
		};

		this.listenTo(this.options.collections.notes, 'reset add remove change:title add:tagLinks', function () {this.renderCollection("notes");});
		this.listenTo(this.options.collections.tags, 'reset add remove change:label', function () {this.renderCollection("tags"); this.renderCollection("notes");});
		this.listenTo(this.options.collections.tasks, 'reset add remove change:label', function () {this.renderCollection("tasks");});

		this.listenTo(this.options.collections.noteFilters, 'reset add remove', function () {this.renderFilterCollection("noteFilters");});
		this.listenTo(this.options.collections.taskFilters, 'reset add remove', function () {this.renderFilterCollection("taskFilters");});
		this.listenTo(this.options.collections.tagFilters, 'reset add remove', function () {this.renderFilterCollection("tagFilters");});
		this.listenTo(this.options.collections.noteFilters, 'change add remove', function () {this.refreshFilterControls("note");});
		this.listenTo(this.options.collections.taskFilters, 'change add remove', function () {this.refreshFilterControls("task");});
		this.listenTo(this.options.collections.tagFilters, 'change add remove', function () {this.refreshFilterControls("tag");});

		this.listenTo(this.filters.noteFilter, 'change add:tags remove:tags add:tasks remove:tasks', function () {
			this.renderCollection("notes");
			this.refreshFilterControls("note");
			this.renderFilterInSuperInput("noteFilter"); });
		this.listenTo(this.filters.taskFilter, 'change add:tags remove:tags', function () {
			this.renderCollection("tasks");
			this.refreshFilterControls("task");
			this.renderFilterInSuperInput("taskFilter");});
		this.listenTo(this.filters.tagFilter, 'change', function () {
			this.renderCollection("tags");
			this.refreshFilterControls("tag");
			this.renderFilterInSuperInput("tagFilter");});

		this.listenTo(mee.dispatcher, 'browser:notes:reSyncSelectors', function () {this.reSyncSelectors("notes");});
		this.listenTo(mee.dispatcher, 'browser:tags:reSyncSelectors', function () {this.reSyncSelectors("tags");});
		this.listenTo(mee.dispatcher, 'browser:taks:reSyncSelectors', function () {this.reSyncSelectors("tasks");});
		this.listenTo(mee.dispatcher, 'keyboard:tag', function () {this.searchOpenAutocomplete("tags");});
		this.listenTo(mee.dispatcher, 'keyboard:task', function () {this.searchOpenAutocomplete("tasks");});
		this.listenTo(mee.dispatcher, 'keyboard:entity', function () {this.searchOpenAutocomplete("entities");});
		this.listenTo(mee.dispatcher, 'keyboard:escape', function () {this.searchCloseAutocomplete("escape");});
		this.listenTo(mee.dispatcher, 'keyboard:backspace', function () {this.searchCloseAutocomplete("backspace");});

		// this.listenTo($("ul.objects"), 'sortupdate', function (event, ui) { this.sortableUpdate (event, ui); });
		// this.listenTo($("ul.notes.objects"), 'sortupdate', function () { console.log ('SORT')});
		//objects notes ui-sortable
		this.render();
		this.refreshFilterControls("note");
		this.refreshFilterControls("task");
		this.refreshFilterControls("tag");


	},

	// Navigation in the browser
	// =============================================================================
	// To display the browser itself and then to choose which objects to display

	/**
	 * Makes the browser visible
	 *
	 * @method toggle
	 */
	toggle: function() {
		// First, deactivate the other tabs' content
		$("#tabs").children().each(function(i,child){
			$(child).removeClass("selected");
		});
		// Then activate this one
		this.$el.addClass('selected');
	},

	/**
	 * Displays the adequate subsection of the browser (notes, tags or tasks) when the user clicks
	 * on the right button (class `.filter li`).
	 *
	 * @method toggleObject
	 * @param {event} event Backbone event
	 */
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

	// Mass actions
	// =============================================================================
	// Series of methods that allow for selecting several objects and operating an 
	// action on them (delete, tag, move,...)
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
		/**
		* Event triggered on mee.dispatcher after the user clicks on an action button
		* (flagged in the DOM with the `.actions-contextual-trigger button` classes).
		* It should be listened by subviews (for example instances of
		* {{#crossLink "mee.cla.BrowserBodyTagView"}}{{/crossLink}}) to let them
		* relay the action to their respective model.
		* 
		* @event browser:[collection-name]:[action]
		*/
		mee.dispatcher.trigger("browser:"+collName+":"+action);
	},


	// Search business objets in database
	// =============================================================================
	// To display the browser itself and then to choose which objects to display
	searchGetFocus: function (io) {
		var focus = false;
		var $listObjects = {};
		var inputClass = io ? "search" : "autocomplete";
		this.$(".search-wrapper").find('input.'+inputClass).each(function(idx,el) {
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

		// Parameter the autocomplete to propose the right kind of objects
		$listObjects.find(".search-wrapper .autocomplete").autocomplete({
			source: function (request, response) {
				// request.term : data typed in by the user ("new yor")
				// response : native callback that must be called with the data to suggest to the user
				var autoCollFilter = new mee.cla[autoCollFilterClass]({text: request.term});
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
				$(event.target).hide();
				$listObjects.find(".search").focus();

				// Saving input value into the global filter
				var autoSelModel = self.options.collections[autoColl].get(ui.item.value) // ui.item.value == model.cid
				if (self.filters[filteredCollFilterName].get(autoColl).contains(autoSelModel) === true) { return; }
				self.filters[filteredCollFilterName].get(autoColl).add(autoSelModel);
			}
		// Change the autocomplete's placeholder, empty it (in case it was used before), display it and focus in
		}).attr("placeholder","filter by related "+autoColl).val('').show().focus(); 
	},

	searchCloseAutocomplete: function (event) {
		// Check focus before taking action
		var browserActiveView = this.searchGetFocus(false); // the kind of object we are looking for
		if (browserActiveView === false) { return; }
		var $listObjects = this.$(".listobjects."+browserActiveView);
		// Listening to "backspace" & "escape" events triggered by mousetrap
		if ( event == "escape" || (event == "backspace" && $listObjects.find(".search-wrapper .autocomplete").val() == '') ) {
			console.log("Closing autocomplete");
			$listObjects.find(".search-wrapper .autocomplete").hide();
			$listObjects.find(".search-wrapper .search").focus();
		}
	},

	searchObjectRemove: function (event) {
		var $objectButton          = $(event.target);
		var $listObjects           = $objectButton.closest('.listobjects');
		var filteredColl           = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
		var filteredCollFilterName = filteredColl.replace(/(s)$/, function($1){ return ""; })+"Filter";
		var object                 = this.options.collections[$objectButton.attr('data-class')].get($objectButton.attr('data-cid'))
		this.filters[filteredCollFilterName].get($objectButton.attr('data-class')).remove(object); // Removing model from Filter
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
		$inputFilterLabel.hide().val('');
		var cloneFilter = this.filters[filterName].superClone();
		this.options.collections[filtersCollName].add(cloneFilter);
		cloneFilter.save();
	},

	filterDelete: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var filterName   = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
		/**
		* Event triggered on mee.dispatcher after the user decides to delete the saved tag
		* that is currently active. This event is listened by the views of 
		* the class {{#crossLink "mee.cla.BrowserBodyFilterView"}}{{/crossLink}}. The
		* one view related to a model with the right filter name will delete its model.
		* @event browser:filters:[filter-name]:remove-active
		*/
		mee.dispatcher.trigger("browser:filters:"+filterName+":remove-active");
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
			var newView = new mee.cla.BrowserBodyFilterView({ filterName: filterName, model: element, parent: self });
			self.children[filtersCollName].push (newView);
			$list.append(newView.render().el);
		}, this);
	},

	renderFilterInSuperInput: function (filterName) {
		var self         = this;
		var filter       = this.filters[filterName];
		var filteredColl = filterName.replace(/(Filter)$/, function($1){ return "s"; }); // noteFilter => notes

		this.$(".listobjects."+filteredColl+" .super-input .objectButtons span").remove();
		this.$(".listobjects."+filteredColl+" .super-input input.search").val(filter.get('text')).focus();

		switch (filterName) {
			case 'noteFilter':
				filter.get('tags').each(function (tag) {
					var $objectButton = $("<span></span>")
						.attr('data-class', "tags") //tags
						.attr('data-cid', tag.cid)
						.html(tag.get('label'));
					self.$(".listobjects."+filteredColl+" .super-input .objectButtons").append($objectButton);
				});
				filter.get('tasks').each(function (task) {
					var $objectButton = $("<span></span>")
						.attr('data-class', "tasks") //tasks
						.attr('data-cid', task.cid)
						.html(task.get('label'));
					self.$(".listobjects."+filteredColl+" .super-input .objectButtons").append($objectButton);
				});
				break;
			case 'taskFilter':
				filter.get('tags').each(function (tag) {
					var $objectButton = $("<span></span>")
						.attr('data-class', "tags") //tags
						.attr('data-cid', tag.cid)
						.html(tag.get('label'));
					self.$(".listobjects."+filteredColl+" .super-input .objectButtons").append($objectButton);
				});
				break;
		}
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
		var self = this;
		var filterName = collName == "notes" ? "noteFilter" : (collName == "tasks" ? "taskFilter" : "tagFilter");

		// First, emptying the DOM
		var $list = this.$('.listobjects.'+collName+' .'+collName);
		if ($list.is(':ui-sortable')) {
			$list.sortable( "destroy" );
		}
		$list.html('');

		// Second, killing children views of right collection
		_.each(this.children[collName], function (child, index) {
			child.kill();
		});
		this.children[collName] = [];

		// Third, filling the DOM again
		var newView = {};
		var results = this.options.collections[collName].search(this.filters[filterName]);

		results.each(function (element) {
			if (collName == "notes") { newView = new mee.cla.BrowserBodyNoteView({ model: element }); }
			if (collName == "tags") { newView = new mee.cla.BrowserBodyTagView({ model: element }); }
			if (collName == "tasks") { newView = new mee.cla.BrowserBodyTaskView({ model: element }); }
			self.children[collName].push (newView);
			$list.append(newView.render().el);
		}, this);

		if($list.hasClass('tasks')) {
			$list.sortable({
				update: function( event, ui ) {
					return self.sortableUpdate(event, ui);
				}
			});
		}
	},

	/**
	 * This methods aims at saving the new positions of the objects
	 * @param  {jQuery event} event http://api.jqueryui.com/sortable/#event-update the event triggered by jQuery
	 * @param  {jQuery ui} ui http://api.jqueryui.com/sortable/#event-update the ui object that is sortable
	 * @return {void} nothing to return
	 */
	sortableUpdate: function (event, ui) {
		console.log("sortable update");

		// 1. Find the model corresponding to the sorted DOM node
		var sortedModel = this.options.collections.tasks.get(ui.item.attr('data-cid'));
		// 2. Find out in which scenario we are
		if (!ui.item.next().length) { // The moved item is now the last one of the list (than could be filtered)
			var prevModel = this.options.collections.tasks.get(ui.item.prev().attr('data-cid'));
			sortedModel.set('position', prevModel.get('position')+1);
		} else { // The moved item is somewhere in the list
			var nextModel = this.options.collections.tasks.get(ui.item.next().attr('data-cid'));
			sortedModel.set('position', nextModel.get('position'));
		}
		sortedModel.save();
		// 3. Shift all the following models
		this.options.collections.tasks.shiftDown(sortedModel);
	}
});