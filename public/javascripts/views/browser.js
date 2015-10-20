define ([
		'jquery.ui',
		'underscore',
		'backbone',
		'temp',
		'channel',
		'models/filter',
		'models/task',
		'views/browser-note',
		'views/browser-task',
		'views/browser-tag',
		'views/browser-filter',
	], function ($, _, Backbone, temp, channel, Filter, Task, BrowserNoteView, BrowserTaskView, BrowserTagView, BrowserFilterView) {

		/**
		 * This class will be used to support the main view of the object browser.
		 * From here, the user will be able to browse notes, tags and tasks, using filters and sorting out results.
		 * It controls the creation of several subviews, like {{#crossLink "BrowserTagView"}}{{/crossLink}},
		 * {{#crossLink "BrowserFilterView"}}{{/crossLink}},...
		 * 
		 * @class BrowserView
		 * @constructor
		 * @param {Object} parent Holds a reference to the mother browser view
		 * @extends Backbone.View
		 */
		var BrowserView = Backbone.View.extend ({

			// Initialize the view
			// =============================================================================
			// That view will be binded to a pre-existing piece of DOM
			// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
			// It also explains why we don't need a render function
			// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

			// ###Setup the view's DOM events
			events: {
				// Search-related events
				'keyup .search'                                     : 'searchText',
				'click .objectButtons span'                         : 'searchObjectRemove',
				'click .filter-editor button.save'                  : 'searchFilterSave1',
				'click .filter-editor button.saveConfirm'           : 'searchFilterSave2',
				'click .filter-editor button.delete'                : 'searchFilterDelete',
				'click .filter-checked'                             : 'toggleTasks',
				// Action-related events
				'click .new-task button'                            : 'newTask',
				'click .actions-contextual .delete'                 : 'actionDeleteToggle',
				'click .actions-contextual-selection .select-all'   : 'actionSelectAll',
				'click .actions-contextual-selection .unselect-all' : 'actionUnSelectAll',
				'click .actions-contextual-trigger button'          : 'actionDeleteExecute',
			},

			//===========================================================================================
			// View initialization
			//===========================================================================================
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

				// this.filters stores the filters that currently filter the displayed collections
				// they can be cloned for saving
				this.filters = {
					"noteFilter": new Filter.Note(),
					"taskFilter": new Filter.Task(),
					"tagFilter" : new Filter.Tag()
				};

				//------------------------------------------------
				// Event listeners
				//------------------------------------------------

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

				// Keyboard events listeners
				this.listenTo(channel, 'keyboard:escape', function () {this.kbEventProxy("escape");});
				this.listenTo(channel, 'keyboard:backspace', function () {this.kbEventProxy("backspace");});
				this.listenTo(channel, 'keyboard:enter', function () {this.kbEventProxy("enter");});

				// Deactivated for testing purposes only
				this.searchFiltersCtrlUpd("note");
				this.searchFiltersCtrlUpd("task");
				this.searchFiltersCtrlUpd("tag");

				this.listenTo(channel, "browser:search:filters:activate", this.searchFilterActivate);

				/*
				// Actions management
				this.listenTo(channel, 'browser:actions:update-selectors:notes', function () {this.actionSelectorsUpdate("notes");});
				this.listenTo(channel, 'browser:actions:update-selectors:tasks', function () {this.actionSelectorsUpdate("tasks");});
				this.listenTo(channel, 'browser:actions:update-selectors:tags', function () {this.actionSelectorsUpdate("tags");});
				*/

				//------------------------------------------------
				// Task dropzone and milestone management 
				//------------------------------------------------

				this.$( ".droppable" ).droppable({
					accept      : ".draggable li",
					activeClass : "target",
					hoverClass  : "target-hover",
					tolerance   : "pointer",
					drop        : function( event, ui ) {
						var sortedModel = temp.coll.tasks.get(ui.draggable.attr('data-cid'));
						sortedModel.set("position",_.min(temp.coll.tasks.pluck('position'))-1);
						if ($(this).hasClass('today')) {
							sortedModel.set("todo_at",_.min(_.map(temp.coll.tasks.pluck('todo_at'),
								function (sDate) {return new Date(sDate);})));
						} else {
							sortedModel.set("todo_at",new Date($(this).attr("data-todo")));
						}

						sortedModel.save();
						temp.coll.tasks.sort();
					}
				});

				// Launch dropzone setup at initialization and every time the dropzone .today is activated

				this.$( ".col1 .dropzone" ).on( "dropactivate", function( event, ui ) {
					$(this).fadeIn(200,
						function () {$(this).siblings().each(function( index, sib ) {
  							$(sib).hide();
						});}
					);
				} );
				this.$( ".col1 .dropzone" ).on( "dropdeactivate", function( event, ui ) {
					$(this).fadeOut(200,
						function () {$(this).siblings().each(function( index, sib ) {
  							$(sib).show();
						});}
					);
				} );

				this.$( ".droppable.today" ).on( "dropactivate", function( event, ui ) {
					// Make sure dropzones are adapted to current situation (an update is
					// necessary every day)
					var now = new Date ();
					if (now.getDay() != self.lastupdate.dropzone.getDay()) {
						self.setupDropZones();
					}
				} );

				var now = new Date ();
				self.setupDropZones();

				this.lastupdate = {
					dropzone: new Date(),
				};

				//------------------------------------------------
				// Initializing autocompletes for object filtering
				//------------------------------------------------

				// Autocomplete widget update to display categories
				$.widget( "custom.catcomplete", $.ui.autocomplete, {
					_create: function() {
						this._super();
						this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
					},
					_renderMenu: function( ul, items ) {
						var that = this,
						currentCategory = "";
						$.each( items, function( index, item ) {
							var li;
							if ( item.category != currentCategory ) {
								ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
								currentCategory = item.category;
							}
							li = that._renderItemData( ul, item );
							if ( item.category ) {
								li.attr( "aria-label", item.category + " : " + item.label );
							}
						});
					}
				});

				// Parameter one autocomplete for each nature of objects (except for tags)
				$(".listobjects:not(.tags) .search-wrapper input.autocomplete").catcomplete({
					source: function (request, response) {
						// request.term : data typed in by the user ("new yor")
						// response : native callback that must be called with the data to suggest to the user
						var tagFilter = new Filter.Tag ({text: request.term});

						response (
							// Find tags
							temp.coll.tags.search(tagFilter).map(function (model, key, list) {
								return {
									label    : model.get("label"),
									value    : model.cid,
									category : "Relevant tags",
								};
							})
						);
					},
					focus: function( event, ui ) {
						//$(event.target).val(ui.item.label);
						return false; // to cancel normal behaviour
					},
					select: function(event, ui) {
						collectionFiltered = $(event.target).closest(".listobjects").hasClass("notes") ? "noteFilter" : "taskFilter";

						// Saving input value into the global filter
						var modelSelected = temp.coll.tags.get(ui.item.value) // ui.item.value == model.cid
						if (self.filters[collectionFiltered].get("tags").contains(modelSelected) !== true) { 
							self.filters[collectionFiltered].get("tags").add(modelSelected);
						}
						$(event.target).focus();
						$(event.target).val("");

						return false; // to cancel normal behaviour
					}
				});
			},
			//===========================================================================================
			// End of view initialization
			//===========================================================================================


			// Keyboard event proxy
			// =============================================================================

			/**
			 * Should become the one proxy for all keyboard events. For now, it is only used for
			 * task creation.
			 *
			 * @method kbEventProxy
			 */
			kbEventProxy: function (event) {
				var $newTaskInput          = this.$(".new-task input");
				// var $noteAutocompleteInput = this.$(".listobjects.notes .search-wrapper input.autocomplete");
				// var $taskAutocompleteInput = this.$(".listobjects.tasks .search-wrapper input.autocomplete");

				// 1. The user wants to create a new task
				if ($newTaskInput.is(":focus") && event=="enter") {
					this.newTaskSub ($newTaskInput);
				}
/*
				// 2. The user wants to close an autocomplete
				if ($taskAutocompleteInput.is(":focus") && event=="escape") {
					$taskAutocompleteInput
				}*/
			},


			// Dropzones and milestones setup
			// =============================================================================
			/**
			 * Forces the browser to update the data attributes of the dropzones so that
			 * the behavior remains consistent from one day to another even if the page
			 * is not reloaded. It should be using a today date passed as parameter, just like {{setupMilestones}}
			 *
			 * @method setupDropZones
			 */
			setupDropZones: function () {
				console.log('start setupDropZones');
				// Setup milestones
				var today    = new Date();
				var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
				var nextweek = new Date(); nextweek.setDate(nextweek.getDate() + 7 - nextweek.getDay() + 1);
				var later    = new Date(); later.setDate(later.getDate() + 14 - later.getDay() + 1);

				if (today.getDay() === 0) {
					$(".droppable.tomorrow").hide();
				}

				$(".droppable.today").attr("data-todo", today.toISOString());
				$(".droppable.tomorrow").attr("data-todo", tomorrow.toISOString());
				$(".droppable.nextweek").attr("data-todo", nextweek.toISOString());
				$(".droppable.later").attr("data-todo", later.toISOString());
			},

			/**
			 * Forces the browser to update the milestones it should render along with the tasks.
			 * Indeed, the milestones to display will change depending on the day of the week.
			 *
			 * @method setupMilestones
			 */
			setupMilestones: function (today) {

				// Initialize with 'today' as point of reference
				var tomorrow      = new Date(); tomorrow.setDate(today.getDate()); tomorrow.setMonth(today.getMonth());
				var laterthisweek = new Date(); laterthisweek.setDate(today.getDate()); laterthisweek.setMonth(today.getMonth());
				var nextweek      = new Date(); nextweek.setDate(today.getDate()); nextweek.setMonth(today.getMonth());
				var later         = new Date(); later.setDate(today.getDate()); later.setMonth(today.getMonth());

				today.setHours(0,0,0,0);
				tomorrow.setHours(0,0,0,0);
				laterthisweek.setHours(0,0,0,0);
				nextweek.setHours(0,0,0,0);
				later.setHours(0,0,0,0);

				// Setup each date starting from today
				tomorrow.setDate(tomorrow.getDate() + 1);
				laterthisweek.setDate(laterthisweek.getDate() + 2);
				nextweek.setDate(today.getDay() === 0 ? nextweek.getDate() + 1 : (nextweek.getDate() + 7 - nextweek.getDay() + 1));
				later.setDate(today.getDay() === 0 ? nextweek.getDate() + 7 : (later.getDate() + 14 - later.getDay() + 1));

				var milestones = [];
				milestones.push ({label : "Today", todo_at: today.toISOString()});
				if (today.getDay() !== 0) { milestones.push ({label : "Tomorrow", todo_at: tomorrow.toISOString()}); }
				if (today.getDay() !== 0 && today.getDay() !== 6) { milestones.push ({label : "Later this week", todo_at: laterthisweek.toISOString()}); }
				milestones.push ({label : "Next week", todo_at: nextweek.toISOString()});
				milestones.push ({label : "Later", todo_at: later.toISOString()});

				this.milestones = milestones;
				return milestones;
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

			// Add new records
			// =============================================================================
			// Find below all the methods meant to create new tasks, tags or notes
			
			/**
			 * When a user wants to create a new task by clicking on a submit button
			 * 
			 * @method newTask
			 */
			newTask: function (event) {
				var $input = $(event.target).prev().find('input');
				this.newTaskSub($input);
			},

			/**
			 * Child of the method {{#crossLink "BrowserView/newTask:method"}}{{/crossLink}}.
			 * Allows to have the same behaviour, regardless of how the user validates the creation. So the calling method can be
			 * either {{#crossLink "BrowserView/newTask:method"}}{{/crossLink}} (creation by click on button) or
			 * {{#crossLink "BrowserView/kbEventProxy:method"}}{{/crossLink}} (creation by keying ENTER).
			 * 
			 * @method newTaskSub
			 */
			newTaskSub: function ($input) {
				temp.coll.tasks.sort();

				var position = 0
				var todo_at  = new Date();
				if (temp.coll.tasks.length > 0) {
					position = _.min(temp.coll.tasks.pluck('position'))-1;
					todo_at  = _.min(_.map(temp.coll.tasks.pluck('todo_at'),
						function (sDate) {return new Date(sDate);})
					);
				}

				var task = new Task ({
					label    : $input.val(),
					position : position,
					todo_at  : todo_at
				});

				temp.coll.tasks.add(task)
				task.save();
				$input.val("").focus();
			},

			// Mass actions
			// =============================================================================
			// Series of methods that allow for selecting several objects and operating an 
			// action on them (delete, tag, move,...)
			// Not ready yet, for future use.

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


			// Filter tasks by state
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


			// Search business objets in database
			// =============================================================================

			/**
			 * Controls what happens when the user tries to close the autocomplete
			 *
			 * @method searchCloseAutocomplete
			 * @param event the keyboard event
			 
			searchCloseAutocomplete: function (event) {
				var $listObjects = this.$(".listobjects."+browserActiveView);
				// Listening to "backspace" & "escape" events triggered by mousetrap
				if ( event == "escape" || (event == "backspace" && $listObjects.find(".search-wrapper .autocomplete").val() == '') ) {
					$listObjects.find(".search-wrapper .search").focus();
				}
			},*/

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
					var newView = new BrowserFilterView({ filterName: filterName, model: element, parent: self });
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
							var $objectButton = $("<span class='fa fa-tag'></span>")
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

				if (collName === "tasks") {
					// Special rendering for tasks
					var now = new Date ();
					self.setupMilestones(now);
					results = this.insertMilestones(results, this.milestones);

					for (var idx in results) {
						if (!results[idx].label) {
							// This is a task
							newView = new BrowserTaskView({ collName:"tasks", model: results[idx] });
							self.children[collName].push (newView);
							$list.append(newView.render().el);
						} else {
							// This is a milestone
							$list.append($('<li>', {
								id: results[idx].label,
								class: "milestone",
								"data-todo": results[idx].todo_at,
								text: results[idx].label
							}));
						}
					}

				} else {
					// Normal rendering for notes and tags
					results.each(function (element) {
						if (collName == "notes") { newView = new BrowserNoteView({ collName:"notes", model: element }); }
						if (collName == "tags") { newView = new BrowserTagView({ collName:"tags", model: element }); }
						// if (collName == "tasks") { newView = new BrowserTaskView({ collName:"tasks", model: element }); }
						self.children[collName].push (newView);
						$list.append(newView.render().el);
					}, this);
				}


				if($list.hasClass('tasks')) {
					$list.sortable({
						placeholder: "ui-state-highlight",
						connectWith: '.droppable',
						receive: function( event, ui ) { // Not sure it is useful
							return console.log("received !");
						},
						update: function( event, ui ) {
							return self.sortableUpdate(event, ui);
						},
						cancel: ".milestone",
					});
				}
			},

			/**
			 * This methods aims at saving the new positions of the objects
			 * 
			 * @method sortableUpdate
			 * @param  {jQuery event} event http://api.jqueryui.com/sortable/#event-update the event triggered by jQuery
			 * @param  {jQuery ui} ui http://api.jqueryui.com/sortable/#event-update the ui object that is sortable
			 */
			sortableUpdate: function (event, ui) {
				// 1. Find the model corresponding to the sorted DOM node
				var sortedModel = temp.coll.tasks.get(ui.item.attr('data-cid'));

				// 2. Find out in which scenario we are
				var domPrev = ui.item.prev(); // previous sibling
				var domNext = ui.item.next(); // next sibling

				if (!domPrev.length) {
					// Happens when the user tries to put the task before today
					// There is nothing in the list before this item (it must be placed just after the milestone 'Today')
					newPosition = _.min(temp.coll.tasks.pluck('position'))-1;
					newTodo     = _.min(_.map(temp.coll.tasks.pluck('todo_at'),
						function (sDate) {return new Date(sDate);}));
				} else {
					// If there is a task after
					if (domNext.length > 0 && !domNext.hasClass('milestone')) {
						nextModel   = temp.coll.tasks.get(domNext.attr('data-cid'));
						newPosition = nextModel.get('position') - 1;
						newTodo     = nextModel.get('todo_at');
					// If there is not task after
					} else {
						// If there is a task before
						if (!domPrev.hasClass('milestone')) {
							prevModel   = temp.coll.tasks.get(domPrev.attr('data-cid'));
							newPosition = prevModel.get('position') + 1;
							newTodo     = prevModel.get('todo_at');
						// Before, it's a milestone
						} else {
							newPosition = _.min(temp.coll.tasks.pluck('position'))-1;
							newTodo     = domPrev.attr('data-todo');
						}
					}
				}

				sortedModel.set('position', newPosition);
				sortedModel.set('todo_at', newTodo);
				sortedModel.save();
			},

			/**
			 * This methods aims at preparing the rendering of the tasks with the milestones at the right place
			 * It can be used only with tasks sorted by todo_at date
			 * 
			 * @method insertMilestones
			 * @param  {Array} list The list of tasks
			 * @param  {Array} milestones The milestones list to be inserted within the tasks
			 * @param  {Array} result The final list of objects that should be rendered
			 */
			insertMilestones: function (list, milestones, result) {
				if (!result) { result = []; }

				// Both are empty
				//---------------------------------
				if (list.length === 0 && milestones.length === 0) {
					return result;

				// Only milestones is empty
				//---------------------------------
				} else if (milestones.length === 0) {
					result.push(list.at(0)); // store first task from the list in the final result
					list.remove(list.at(0)); // remove first task from list
					return this.insertMilestones(list, milestones, result);

				// Only list is empty
				//---------------------------------
				} else if (list.length === 0) {
					result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
					return this.insertMilestones(list, milestones, result);

				// Both still contain some information
				//---------------------------------
				} else {
					mile  = milestones[0].todo_at;
					task0 = list.at(0).get('todo_at');
					task1 = !list.at(1) ? task0 : list.at(1).get('todo_at');

					if (milestones[0].label == "Today") {
						result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
						return this.insertMilestones(list, milestones, result);
					}

					// Case 0 < 1 < X
					//---------------------------------
					if (mile > task0 && mile > task1) {
						result.push(list.at(0)); // store first task from the list in the final result
						list.remove(list.at(0)); // remove first task from list
						return this.insertMilestones(list, milestones, result);

					// Case 0 < X <= 1
					//---------------------------------
					} else if (mile > task0 && mile <= task1) {
						result.push(list.at(0)); // store first task from the list in the final result
						list.remove(list.at(0)); // remove first task from list
						result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
						return this.insertMilestones(list, milestones, result);

					// Case X <= 0 < 1
					//---------------------------------
					} else {
						result.push(milestones.shift()); // remove first milestone from milestones but store it in the final result
						return this.insertMilestones(list, milestones, result);
					}
				}
			},

		});

		return BrowserView;
	}
);