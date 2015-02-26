define ([
		'jquery.ui',
		'underscore',
		'backbone',
		'temp',
		'channel',
		'models/filter',
		'views/browser-body-note',
		'views/browser-body-task',
		'views/browser-body-tag',
		'views/browser-body-filter',
	], function ($, _, Backbone, temp, channel, Filter, BrowserBodyNoteView, BrowserBodyTaskView, BrowserBodyTagView, BrowserBodyFilterView) {

		/**
		 * This class will be used to support the main view of the object browser.
		 * From here, the user will be able to browse notes, tags and tasks, using filters and sorting out results.
		 * It controls the creation of several subviews, like {{#crossLink "BrowserBodyTagView"}}{{/crossLink}},
		 * {{#crossLink "BrowserBodyFilterView"}}{{/crossLink}},...
		 * 
		 * @class BrowserBodyView
		 * @constructor
		 * @param {Object} parent Holds a reference to the mother browser view
		 * @extends Backbone.View
		 */
		var BrowserBodyView = Backbone.View.extend ({

			// Initialize the view
			// =============================================================================
			// That view will be binded to a pre-existing piece of DOM
			// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
			// It also explains why we don't need a render function
			// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

			// ###Setup the view's DOM events
			events: {
				// Search-related events
				'click .filter li'                                 : 'toggleObject',
				'keyup .search'                                    : 'searchText',
				'click .objectButtons span'                        : 'searchObjectRemove',
				'click .filter-editor button.save'                 : 'searchFilterSave1',
				'click .filter-editor button.saveConfirm'          : 'searchFilterSave2',
				'click .filter-editor button.delete'               : 'searchFilterDelete',
				'click .filter-checked'                            : 'toggleTasks',
				// Action-related events
				'click .actions-contextual .delete'                : 'actionDeleteToggle',
				'click .actions-contextual-selection .select-all'  : 'actionSelectAll',
				'click .actions-contextual-selection .unselect-all': 'actionUnSelectAll',
				'click .actions-contextual-trigger button'         : 'actionDeleteExecute',
			},

			// ###Setup the view
			initialize: function() {
				var self = this;

				this.children = {
					"notes"      : [],
					"tags"       : [],
					"tasks"      : [],
					"noteFilters": [],
					"tagFilters" : [],
					"taskFilters": []
				};

				// this.filters stores the filters that actually filter the displayed collections
				// they can be cloned for saving
				this.filters = {
					"noteFilter": new Filter.Note(),
					"taskFilter": new Filter.Task(),
					"tagFilter" : new Filter.Tag()
				};

				this.listenTo(temp.coll.notes, 'sync add remove change:title add:tagLinks', function () {this.renderCollection("notes");});
				this.listenTo(temp.coll.tags, 'sync add remove change:label', function () {
					this.renderCollection("notes");
					this.renderCollection("tags");});
				this.listenTo(temp.coll.tasks, 'sync add remove change:label change:completed', function () {this.renderCollection("tasks");});

				this.listenTo(temp.coll.noteFilters, 'reset add remove', function () {this.searchRenderFilters("noteFilters");});
				this.listenTo(temp.coll.taskFilters, 'reset add remove', function () {this.searchRenderFilters("taskFilters");});
				this.listenTo(temp.coll.tagFilters, 'reset add remove', function () {this.searchRenderFilters("tagFilters");});
				this.listenTo(temp.coll.noteFilters, 'change add remove', function () {this.searchFiltersCtrlUpd("note");});
				this.listenTo(temp.coll.taskFilters, 'change add remove', function () {this.searchFiltersCtrlUpd("task");});
				this.listenTo(temp.coll.tagFilters, 'change add remove', function () {this.searchFiltersCtrlUpd("tag");});

				this.listenTo(this.filters.noteFilter, 'change add:tags remove:tags add:tasks remove:tasks', function () {
					channel.trigger("browser:search:filters:check-status:noteFilter", this.filters.noteFilter);
					this.renderCollection("notes");
					this.searchFiltersCtrlUpd("note");
					this.searchRenderFilterSuper("noteFilter"); });
				this.listenTo(this.filters.taskFilter, 'change add:tags remove:tags', function () {
					channel.trigger("browser:search:filters:check-status:taskFilter", this.filters.taskFilter);
					this.renderCollection("tasks");
					this.searchFiltersCtrlUpd("task");
					this.searchRenderFilterSuper("taskFilter");});
				this.listenTo(this.filters.tagFilter, 'change', function () {
					channel.trigger("browser:search:filters:check-status:tagFilter", this.filters.tagFilter);
					this.renderCollection("tags");
					this.searchFiltersCtrlUpd("tag");
					this.searchRenderFilterSuper("tagFilter");});

				this.listenTo(channel, 'keyboard:tag', function () {this.searchOpenAutocomplete("tags");});
				this.listenTo(channel, 'keyboard:task', function () {this.searchOpenAutocomplete("tasks");});
				this.listenTo(channel, 'keyboard:entity', function () {this.searchOpenAutocomplete("entities");});
				this.listenTo(channel, 'keyboard:escape', function () {this.searchCloseAutocomplete("escape");});
				this.listenTo(channel, 'keyboard:backspace', function () {this.searchCloseAutocomplete("backspace");});

				// Deactivated for testing purposes only
				this.searchFiltersCtrlUpd("note");
				this.searchFiltersCtrlUpd("task");
				this.searchFiltersCtrlUpd("tag");

				this.listenTo(channel, "browser:search:filters:activate", this.searchFilterActivate);

				// Actions management
				this.listenTo(channel, 'browser:actions:update-selectors:notes', function () {this.actionSelectorsUpdate("notes");});
				this.listenTo(channel, 'browser:actions:update-selectors:tasks', function () {this.actionSelectorsUpdate("tasks");});
				this.listenTo(channel, 'browser:actions:update-selectors:tags', function () {this.actionSelectorsUpdate("tags");});

				// Task dropzone management
				$( ".droppable" ).droppable({
					accept      : ".draggable li",
					activeClass : "target",
					hoverClass  : "target-hover",
					tolerance   : "pointer",
					drop        : function( event, ui ) {
						ui.draggable.data("dropped", true); // ne fonctionne pas pour communiquer
						// qu'il ne faut pas faire de sort...
						// trouver un event qu'on peut catcher ?

						console.log('DROPPED !!!');
						var sortedModel = temp.coll.tasks.get(ui.draggable.attr('data-cid'));

						sortedModel.set("position",0);
						sortedModel.set("todo_at",new Date($(this).attr("data-todo")));
						temp.coll.tasks.shiftDown(sortedModel);
						sortedModel.save();
						// ui.draggable.remove();

					}
				});
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

			/**
			 * Manages the buttons "select all" and "unselect all". Will be called every time an object
			 * is selected or unseleted to make sure that the right buttons are displayed
			 * 
			 * @method actionSelectorsUpdate
			 */
			actionSelectorsUpdate : function (collName) {
				var $listObjects = this.$(".listobjects."+collName);

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

			/**
			 * Should select all objects
			 * 
			 * @method actionSelectAll
			 */
			actionSelectAll: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");

				channel.trigger("browser:actions:select:all:"+collName); // To display checked boxes
				this.actionSelectorsUpdate(collName); // To update selectors
			},

			/**
			 * Should unselect all objects
			 * 
			 * @method actionUnSelectAll
			 */
			actionUnSelectAll: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");

				channel.trigger("browser:actions:select:none:"+collName); // To display checked boxes
				this.actionSelectorsUpdate(collName); // To update selectors
			},

			/**
			 * Displays or hides the controls necessary to select/unselect all objects, delete them,...
			 * Throws an event to make subviews display their checkboxes
			 * 
			 * @method actionDeleteToggle
			 */
			actionDeleteToggle: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");

				$listObjects.find(".actions-contextual .delete .action").toggle();
				$listObjects.find(".actions-contextual .delete .cancel").toggle();
				$listObjects.find(".actions-contextual-trigger").toggle();
				$listObjects.find(".actions-contextual-trigger .delete").toggle();
				$listObjects.find(".actions-contextual-selection").toggle();

				/**
				* To make objects subviews show/hide their checkbox.
				* @event browser:actions:toggle-checkboxes:[collName]
				*/
				channel.trigger("browser:actions:toggle-checkboxes:"+collName);

				if ($listObjects.find(".actions-contextual-selection").is(":visible")) {
					this.actionSelectorsUpdate(collName);
				}
			},

			/**
			 * Triggers an event, which will be heard by sub-views that will actually execute the action
			 * 
			 * @method actionDeleteExecute
			 */
			actionDeleteExecute: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
				var action       = $(event.target).attr('class');// Which action do we want to trigger ?

				/**
				* To make objects subviews kill themselves and destroy their model if they are selected.
				* @event browser:actions:delete:[collName]
				*/
				channel.trigger("browser:actions:delete:"+collName);

				$listObjects.find(".actions-contextual .delete .action").toggle();
				$listObjects.find(".actions-contextual .delete .cancel").toggle();
				$listObjects.find(".actions-contextual-trigger").toggle();
				$listObjects.find(".actions-contextual-trigger .delete").toggle();
				$listObjects.find(".actions-contextual-selection").toggle();
			},


			// Search business objets in database
			// =============================================================================


			/**
			 * @method toggleTasks
			 */
			toggleTasks: function(event) {
				var $button = $(event.target);
				var step = $button.attr('data-step');
				var sequence = {
					0 : 1,
					1 : 2,
					2 : 0,
				};

				this.filters.taskFilter.set('completed', sequence[step]);
				$button.hide().parent().find("[data-step="+sequence[step]+"]").show();
			},

			/**
			 * Checks whether the user is currently using a search input and if so tells which collection is visible
			 * 
			 * @method searchGetFocus
			 * @return {object} Returns the name of the collection studied (example : `notes`) or `false` if no search input has focus
			 */
			searchGetFocus: function () {
				var $listObjects;
				var sColl1 = false;
				this.$(".super-input").find('input').each(function(idx,el) {
					if ($(el).is(":focus")) {
						$listObjects = $(el).closest('.listobjects');
						sColl1 = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks'); //common
					}
				});
				return sColl1;
			},

			/**
			 * Will prepare and open an autocomplete input.
			 * It should help the user selecting objects from collection named `sColl2` (example : `tags`) 
			 * that will then be used to filter the objects from collection named `sColl1`
			 *
			 * @method searchOpenAutocomplete
			 * @param sColl2 the name of the collection (example : `tags`) used to filter the collection currently displayed in browser
			 */
			searchOpenAutocomplete: function (sColl2) {
				// Check focus before taking action
				var self = this;
				var sColl1 = this.searchGetFocus(); // the kind of object we are filtering now
				if (sColl1 === false) { return; }

				var $listObjects = this.$(".listobjects."+sColl1);
				var sColl1Filter = sColl1.replace(/(s)$/, function($1){ return ""; })+"Filter";

				// Parameter the autocomplete to propose the right kind of objects
				$listObjects.find(".search-wrapper .autocomplete").autocomplete({
					source: function (request, response) {
						// request.term : data typed in by the user ("new yor")
						// response : native callback that must be called with the data to suggest to the user
						var oColl2Filter = (sColl2 == "tasks") ? new Filter.Task ({text: request.term}) : new Filter.Tag ({text: request.term});

						response (
							temp.coll[sColl2].search(oColl2Filter).map(function (model, key, list) {
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
						var mSelection = temp.coll[sColl2].get(ui.item.value) // ui.item.value == model.cid
						if (self.filters[sColl1Filter].get(sColl2).contains(mSelection) !== true) { 
							self.filters[sColl1Filter].get(sColl2).add(mSelection);
						}
					}
				// Change the autocomplete's placeholder, empty it (in case it was used before), display it and focus in
				}).attr("placeholder","filter by related "+sColl2).val('').show().focus(); 
			},

			/**
			 * Controls what happens when the user tries to close the autocomplete
			 *
			 * @method searchCloseAutocomplete
			 * @param event the keyboard event
			 */
			searchCloseAutocomplete: function (event) {
				// Check focus before taking action
				var browserActiveView = this.searchGetFocus(); // the kind of object we are looking for
				if (browserActiveView === false) { return; }
				var $listObjects = this.$(".listobjects."+browserActiveView);
				// Listening to "backspace" & "escape" events triggered by mousetrap
				if ( event == "escape" || (event == "backspace" && $listObjects.find(".search-wrapper .autocomplete").val() == '') ) {
					$listObjects.find(".search-wrapper .autocomplete").hide();
					$listObjects.find(".search-wrapper .search").focus();
				}
			},

			/**
			 * Allows to remove from current filter the object that has been clicked on
			 *
			 * @method searchObjectRemove
			 * @param event the click event
			 */
			searchObjectRemove: function (event) {
				var $objectButton          = $(event.target);
				var $listObjects           = $objectButton.closest('.listobjects');
				var filteredColl           = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
				var filteredCollFilterName = filteredColl.replace(/(s)$/, function($1){ return ""; })+"Filter";
				var object                 = temp.coll[$objectButton.attr('data-class')].get($objectButton.attr('data-cid'));
				this.filters[filteredCollFilterName].get($objectButton.attr('data-class')).remove(object); // Removing model from Filter
			},

			/**
			 * Updates current filter with the text typed in by the user
			 *
			 * @method searchText
			 * @param event the keyboard event
			 */
			searchText: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var filterName   = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
				var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
				this.filters[filterName].set('text', $(event.target).val());
				this.searchFiltersCtrlUpd(collName.replace(/(s)$/, function($1){ return ""; }));
			},

			/**
			 * Should update the controls to save/delete filters
			 * If temp contains a filter similar to the one that is currently applied, we propose to delete it
			 * If not, we propose to save the currently applied one
			 *
			 * @method searchFiltersCtrlUpd
			 * @param {string} collName the name of the collection (example : `tags`)
			 */
			searchFiltersCtrlUpd: function (collName) { //note
				var $listObjects    = this.$(".listobjects."+collName+"s");
				var filtersCollName = collName+"Filters";
				var filterName      = collName+"Filter";

				$listObjects.find('.filter-editor .action').hide(); // No action controls should be displayed

				if (!this.filters[filterName].isEmpty()) { // The user has set a filter set in the super-input
					if (temp.coll[filtersCollName].containsSimilar(this.filters[filterName]) === false) {
						$listObjects.find('.filter-editor .action.save').show(); // "Save" button is displayed
					} else {
						$listObjects.find('.filter-editor .action.delete').show(); // "Delete" button is displayed
					}
				}
			},

			/**
			 * Displays the controls necessary to save a filter
			 *
			 * @method searchFilterSave1
			 * @param event
			 */
			searchFilterSave1: function (event) {
				var $listObjects    = $(event.target).closest(".listobjects");
				$listObjects.find(".filter-editor input").show().focus();
				$listObjects.find('.filter-editor .action.saveConfirm').show();
				$listObjects.find('.filter-editor .action.save').hide();
			},

			/**
			 * Saves the new filter with the chosen name and hides the controls
			 *
			 * @method searchFilterSave2
			 * @param event
			 */
			searchFilterSave2: function (event) {
				var $listObjects      = $(event.target).closest(".listobjects");
				var filterName        = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
				var filtersCollName   = filterName + "s";
				var $inputFilterLabel = $listObjects.find(".filter-editor input");
				this.filters[filterName].set('label', $inputFilterLabel.val());
				$listObjects.find('.filter-editor .action.saveConfirm').hide();
				$inputFilterLabel.hide().val('');
				var cloneFilter = this.filters[filterName].superClone();
				temp.coll[filtersCollName].add(cloneFilter);
				cloneFilter.save();
				channel.trigger("browser:search:filters:check-status:"+filterName, this.filters[filterName]);
			},

			/**
			 * Sends an event to make the filter view holding the active filter destroy its model
			 *
			 * @method searchFilterDelete
			 * @param event
			 */
			searchFilterDelete: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var filterName   = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
				/**
				* Will make the view holding the active filter destroy its model
				* @event browser:search:filters:remove:[filter-name]
				*/
				channel.trigger("browser:search:filters:remove:"+filterName);
			},

			/**
			 * Renders all the filters stored in the temp storage.
			 *
			 * @method searchRenderFilters
			 * @param filtersCollName
			 */
			searchRenderFilters: function (filtersCollName) {
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
				temp.coll[filtersCollName].each(function (element) {
					var newView = new BrowserBodyFilterView({ filterName: filterName, model: element, parent: self });
					self.children[filtersCollName].push (newView);
					$list.append(newView.render().el);
				}, this);
			},


			/**
			 * Forces the view's current filter to match the one clicked by the user
			 *
			 * @method searchRenderFilterSuper
			 * @param filter the model held by the filter view clicked on by the user
			 */
			searchRenderFilterSuper: function (filterName) {
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

			/**
			 * Forces the view's current filter to match the one clicked by the user
			 *
			 * @method searchFilterActivate
			 * @param filter the model held by the filter view clicked on by the user
			 */
			searchFilterActivate: function (filter) {
				var filterSubClass = filter.get('subClass'); // NoteFilter
				var filterName     = filterSubClass.charAt(0).toLowerCase() + filterSubClass.slice(1); // noteFilter
				this.filters[filterName].makeItMatch(filter);
				this.filters[filterName].trigger('change');
				/**
				* This event is listened by filter views to make them check
				* if they are active
				* @event browser:search:filters:check-status:[filter-name]
				*/
				channel.trigger("browser:search:filters:check-status:"+filterName, this.filters[filterName]);
			},

			//=================================================================================
			// Render business objects' sub views 
			//=================================================================================

			/**
			 * @method render
			 */
			render: function (event) {
				this.renderCollection('notes');
				this.renderCollection('tags');
				this.renderCollection('tasks');
			},

			/**
			 * @method renderCollection
			 */
			renderCollection: function (collName) {
				console.log('rendering...'+collName);
				var self = this;
				var filterName = collName == "notes" ? "noteFilter" : (collName == "tasks" ? "taskFilter" : "tagFilter");

				// First, emptying the DOM
				var $list = this.$('.listobjects.'+collName+' .'+collName);
				if ($list.is(':ui-sortable')) {
					$list.sortable( "destroy" );
				}
				$list.html('');

				// Second, killing children views of the right collection
				_.each(this.children[collName], function (child, index) {
					child.kill();
				});
				this.children[collName] = [];

				// Third, filling the DOM again
				var newView = {};
				var results = temp.coll[collName].search(this.filters[filterName]);

				results.each(function (element) {
					if (collName == "notes") { newView = new BrowserBodyNoteView({ collName:"notes", model: element }); }
					if (collName == "tags") { newView = new BrowserBodyTagView({ collName:"tags", model: element }); }
					if (collName == "tasks") { newView = new BrowserBodyTaskView({ collName:"tasks", model: element }); }
					self.children[collName].push (newView);
					$list.append(newView.render().el);
				}, this);

				if($list.hasClass('tasks')) {
					$list.sortable({
						placeholder: "ui-state-highlight",
						connectWith: '.droppable',
						receive: function( event, ui ) {
							return console.log("received !");
						},
						update: function( event, ui ) {
							return self.sortableUpdate(event, ui);
						}
					});
				}
			},

			/**
			 * This methods aims at saving the new todo_at and position values after a task is dropped
			 * in a dropzone.
			 * 
			 * @method droppableUpdate
			 * @param  {jQuery event} event http://api.jqueryui.com/sortable/#event-update the event triggered by jQuery
			 * @param  {jQuery ui} ui http://api.jqueryui.com/sortable/#event-update the ui object that is sortable
			 */
			droppableUpdate: function (event, ui) {
				// 1. Find the model corresponding to the sorted DOM node
				var droppedModel = temp.coll.tasks.get(ui.item.attr('data-cid'));
				// 2. Update the model according to the dropzone
				var $dropzone = ui.item.parent();
				droppedModel.set('todo_at',$dropzone.attr('todo_at'));
				droppedModel.save();
				// 3. Remove from DOM
				ui.item.hide(500).remove(); // Hide then remove from DOM
			},

			/**
			 * This methods aims at saving the new positions of the objects
			 * 
			 * @method sortableUpdate
			 * @param  {jQuery event} event http://api.jqueryui.com/sortable/#event-update the event triggered by jQuery
			 * @param  {jQuery ui} ui http://api.jqueryui.com/sortable/#event-update the ui object that is sortable
			 */
			sortableUpdate: function (event, ui) {
				if(ui.item.data("dropped")) {
					console.log("sortable not called");
					return false;
				}

				console.log('sortable');
				// 1. Find the model corresponding to the sorted DOM node
				var sortedModel = temp.coll.tasks.get(ui.item.attr('data-cid'));
				// 2. Find out in which scenario we are
				if (!ui.item.next().length) { // The moved item is now the last one of the list (than could be filtered)
					var prevModel = temp.coll.tasks.get(ui.item.prev().attr('data-cid'));
					sortedModel.set('position', prevModel.get('position')+1);
					sortedModel.set('todo_at', prevModel.get('todo_at'));
				} else { // The moved item is somewhere in the list
					var nextModel = temp.coll.tasks.get(ui.item.next().attr('data-cid'));
					sortedModel.set('position', nextModel.get('position'));
					sortedModel.set('todo_at', nextModel.get('todo_at'));
				}
				sortedModel.save();
				// 3. Shift all the following models
				temp.coll.tasks.shiftDown(sortedModel);
			},

			/**
			 * This methods aims at preparing the rendering of the tasks with the milestones at the right place
			 * It can be used only with tasks sorted by due date
			 * 
			 * @method insertMilestones
			 * @param  {Array} list The list of tasks
			 * @param  {Array} milestones The milestones list to be inserted within the tasks
			 * @param  {Array} result The final list of objects that should be rendered
			 */
			insertMilestones: function (list, milestones, result) {
				// Both are empty
				//---------------------------------
				if (list.length === 0 && milestones.length === 0) {
					return result;

				// Only milestones is empty
				//---------------------------------
				} else if (milestones.length === 0) {
					result.push(list.shift()); // remove first task from list but store it in the final result
					return insertMilestones(list, milestones, result);

				// Only list is empty
				//---------------------------------
				} else if (list.length === 0) {
					result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
					return insertMilestones(list, milestones, result);

				// Both still contain some information
				//---------------------------------
				} else {

					// Case 1 < 2 < X
					//---------------------------------
					if (milestones[0].todo_at > list[0].get('todo_at') && milestones[0].todo_at > list[1].get('todo_at')) {
						result.push(list.shift()); // remove first task from list but store it in the final result
						return insertMilestones(list, milestones, result);

					// Case 1 < X <= 2
					//---------------------------------
					} else if (milestones[0].todo_at > list[0].get('todo_at') && milestones[0].todo_at <= list[1].get('todo_at')) {
						result.push(list.shift()); // remove first task from list but store it in the final result
						result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
						return insertMilestones(list, milestones, result);

					// Case X <= 1 < 2
					//---------------------------------
					} else {
						result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
						return insertMilestones(list, milestones, result);
					}
				}
			},

		});

		return BrowserBodyView;
	}
);