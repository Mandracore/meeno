define ([
		'jquery.ui',
		'underscore',
		'backbone',
		'temp',
		'channel',
		'models/filter',
		'models/task',
		'models/note',
		'models/tag',
		'views/browser-note',
		'views/browser-task',
		'views/browser-tag',
		'views/browser-filter',
	], function ($, _, Backbone, temp, channel, Filter, Task, Note, Tag, BrowserNoteView, BrowserTaskView, BrowserTagView, BrowserFilterView) {

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
				'keyup .search-box input'               : 'searchText',
				'click .search-box .tags button'        : 'searchObjectRemove',
				'click .search-box .reset button'       : 'searchReset',
				'click .listobjects .add button.save'   : 'addModelByClick',
				'click .listobjects .add button.cancel' : 'addModelCancelByClick',
				'click .filter-checked'                 : 'tasksToggleChecked',
				'click .milestones li'                  : 'tasksToggleMilestones',
				// 'click .filter-editor button.save'        : 'searchFilterSave1',
				// 'click .filter-editor button.saveConfirm' : 'searchFilterSave2',
				// 'click .filter-editor button.delete'      : 'searchFilterDelete',
				// Action-related events
				// 'click .actions-contextual .delete'                 : 'actionDeleteToggle',
				// 'click .actions-contextual-selection .select-all'   : 'actionSelectAll',
				// 'click .actions-contextual-selection .unselect-all' : 'actionUnSelectAll',
				// 'click .actions-contextual-trigger button'          : 'actionDeleteExecute',
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
				
				// First data loading (one shot)
				this.listenTo(channel, "fetching:done", function () {
					this.renderCollection("notes");
					this.renderCollection("tasks");
					this.renderCollection("tags");
				});

				// 'Sync' event is triggered by Backbone each time .save() is called
				this.listenTo(temp.coll.notes, 'add remove', function () {this.renderCollection("notes");});
				this.listenTo(temp.coll.tags, 'add remove', function () {
					this.renderCollection("tags");});
				this.listenTo(temp.coll.tags, 'change:label change:color', function () {
					this.renderCollection("notes");
					this.renderCollection("tasks");
					this.renderCollection("tags");});
				this.listenTo(temp.coll.tasks, 'add remove change:completed', function () {
					this.renderCollection("tasks");});

				// this.listenTo(temp.coll.noteFilters, 'reset add remove', function () {this.searchRenderFilters("noteFilters");});
				// this.listenTo(temp.coll.taskFilters, 'reset add remove', function () {this.searchRenderFilters("taskFilters");});
				// this.listenTo(temp.coll.tagFilters, 'reset add remove', function () {this.searchRenderFilters("tagFilters");});
				// this.listenTo(temp.coll.noteFilters, 'change add remove', function () {this.searchFiltersCtrlUpd("notes");});
				// this.listenTo(temp.coll.taskFilters, 'change add remove', function () {this.searchFiltersCtrlUpd("tasks");});
				// this.listenTo(temp.coll.tagFilters, 'change add remove', function () {this.searchFiltersCtrlUpd("tags");});

				this.listenTo(this.filters.noteFilter, 'change add:tags remove:tags add:tasks remove:tasks', function () {
					// channel.trigger("browser:search:filters:check-status:noteFilter", this.filters.noteFilter);
					this.renderCollection("notes");
					// this.searchFiltersCtrlUpd("notes");
					this.searchRenderInputFilter("noteFilter"); });
				this.listenTo(this.filters.taskFilter, 'change add:tags remove:tags', function () {
					// channel.trigger("browser:search:filters:check-status:taskFilter", this.filters.taskFilter);
					this.renderCollection("tasks");
					// this.searchFiltersCtrlUpd("tasks");
					this.searchRenderInputFilter("taskFilter");});
				this.listenTo(this.filters.tagFilter, 'change', function () {
					// channel.trigger("browser:search:filters:check-status:tagFilter", this.filters.tagFilter);
					this.renderCollection("tags");
					// this.searchFiltersCtrlUpd("tags");
					this.searchRenderInputFilter("tagFilter");});

				this.listenTo(channel, 'browser:refresh:notes', function () {this.renderCollection("notes");});
				this.listenTo(channel, 'browser:refresh:tags', function () {this.renderCollection("tags");});
				this.listenTo(channel, 'browser:refresh:tasks', function () {this.renderCollection("tasks");});

				// Keyboard events listeners
				// this.listenTo(channel, 'keyboard:escape', function () {this.kbEventProxy("escape");});
				// this.listenTo(channel, 'keyboard:backspace', function () {this.kbEventProxy("backspace");});
				// this.listenTo(channel, 'keyboard:enter', function () {this.kbEventProxy("enter");});

				// Deactivated for testing purposes only
				// this.searchFiltersCtrlUpd("notes");
				// this.searchFiltersCtrlUpd("tasks");
				// this.searchFiltersCtrlUpd("tags");

				// this.listenTo(channel, "browser:search:filters:activate", this.searchFilterActivate);

				/*
				// Actions management
				this.listenTo(channel, 'browser:actions:update-selectors:notes', function () {this.actionSelectorsUpdate("notes");});
				this.listenTo(channel, 'browser:actions:update-selectors:tasks', function () {this.actionSelectorsUpdate("tasks");});
				this.listenTo(channel, 'browser:actions:update-selectors:tags', function () {this.actionSelectorsUpdate("tags");});
				*/

				//-------------------------------------------------------------------------------
				// Key DOM events listeners : on inputs, and on keyboard events
				//-------------------------------------------------------------------------------
				this.listenInputStart();
				this.listenTo(channel, 'keyboard:enter', function () {this.listenKbProxy("enter");});
				this.listenTo(channel, 'keyboard:escape', function () {this.listenKbProxy("escape");});

				//------------------------------------------------
				// Task dropzone and milestone management 
				//------------------------------------------------
				this.milestonesSetupDrop();

				//------------------------------------------------
				// Preparing vars for object rendering
				//------------------------------------------------

				this.$renderingAreas = {
					notes : this.$('.tab.notes ul.objects'),
					tags  : this.$('.tab.tags ul.objects'),
					tasks : {
						today    : this.$('.tab.tasks ul.today'),
						tomorrow : this.$('.tab.tasks ul.tomorrow'),
						nextweek : this.$('.tab.tasks ul.nextweek'),
						later    : this.$('.tab.tasks ul.later'),
					},
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
				$(".tab:not(.tags) .search-box input.autocomplete").catcomplete({
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
									category : "Select an item below to filter by tag",
								};
							})
						);
					},
					focus: function( event, ui ) {
						//$(event.target).val(ui.item.label);
						return false; // to cancel normal behaviour
					},
					select: function(event, ui) {
						collectionFiltered = $(event.target).closest(".tab").hasClass("notes") ? "noteFilter" : "taskFilter";

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


			// DOM events listener initialization
			// =============================================================================

			/**
			 * Initialize event listeners
			 * Listen to the `input` event (any change, inc. copy/paste) of the inputs
			 * and do the right actions (display form controls or not)
			 * 
			 * @method listenInputStart
			 */
			listenInputStart: function() {
				var self = this;

				// Start watching events on add all boxes
				this.$('.listobjects .add input').each(function (index){
					var $input = $(this);
					// Initialize 'input' events listener (any change, inc. copy/paste to inputs)
					$input.on('input', function() {
						if($input.val() != "") {
							$input.closest('.add').addClass('updated');
						} else {
							$input.closest('.add').removeClass('updated');
						}
					});
				});
			},

			/**
			 * Should become the one proxy for all keyboard events.
			 * 
			 * @method listenKbProxy
			 */
			listenKbProxy: function (event) {
				var $focused = $(document.activeElement); // most efficient way to retrieve currently focus element
				if ($focused.attr('data-input-usage')) {
					// Option A / The user wants to create objects
					if ($focused.attr('data-input-usage') == "add") {
						switch (event) {
							case "enter": 
								this.addModel($focused);
								break;
							case "escape":
								this.addModelCancel($focused);
								break;
						}
					}
				}
			},


			// Dropzones and milestones setup
			// =============================================================================
			/**
			 * Should store in the milestones the right dates, so that tasks are correctly updated
			 * when dropped on a milestone.
			 * 
			 * @method milestonesSetupDrop
			 */
			milestonesSetupDrop: function () {
				console.log('start milestonesSetupDrop');
				var self = this;

				// Store the right dates into the milestones and hide tomorrow in case we are sunday
				var today    = new Date();
				var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
				var nextweek = new Date(); nextweek.setDate(nextweek.getDate() + 7 - nextweek.getDay() + 1);
				var later    = new Date(); later.setDate(later.getDate() + 14 - later.getDay() + 1);
				var $milestones = this.$(".milestones");

				if (today.getDay() === 0) {
					$milestones.find(".tomorrow").hide();
				}
				$milestones.find(".today").attr("data-todo", today.toISOString());
				$milestones.find(".tomorrow").attr("data-todo", tomorrow.toISOString());
				$milestones.find(".nextweek").attr("data-todo", nextweek.toISOString());
				$milestones.find(".later").attr("data-todo", later.toISOString());

				// Setup jquery droppable on milestones
				this.$(".milestones li").droppable({
					// accept      : ".tab.tasks .draggable li",
					accept      : ".task",
					activeClass : "target",
					hoverClass  : "target-hover",
					tolerance   : "pointer",
					activate    : function( event, ui ) {
						self.dropped = false;
						// Visual hint to help the user discover the dropzones
						var $milestone = $(this);
						var delay = $milestone.nextAll().length * 100;

						setTimeout(function() {
							$milestone.addClass('target-hover');
							setTimeout(function() {
								$milestone.removeClass('target-hover');
							}, 200);
						}, delay);
					},
					drop        : function( event, ui ) {
						self.dropped = true;
						var $target = $(this);
						var sortedModel = temp.coll.tasks.get(ui.draggable.attr('data-cid'));

						sortedModel.set("position",_.min(temp.coll.tasks.pluck('position'))-1);

						if ($target.hasClass('today')) {
							var todos        = temp.coll.tasks.pluck('todo_at');
							var todos_nonull = todos.filter(function (date) { return date !== null; });
							var todos_dates  = todos_nonull.map(function (date) { return new Date(date); });
							var todos_min    = _.min(todos_dates);
							sortedModel.set("todo_at", todos_min);
						} else {
							sortedModel.set("todo_at",$target.attr("data-todo"));
						}

						sortedModel.save();
						temp.coll.tasks.sort();
						self.renderCollection("tasks");
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

			// =============================================================================
			// Add new records
			// =============================================================================
			// Find below all the methods meant to create new tasks, tags or notes

			/**
			 * When a user wants to abort creating a new object by clicking on `cancel` button
			 * Will just call the function {{#crossLink "BrowserView/addModelCancel:method"}}{{/crossLink}} with the
			 * right parameter.
			 * 
			 * @method addModelCancelByClick
			 */
			addModelCancelByClick: function (event) {
				this.addModelCancel($(event.target).closest('.add').find('input'));
			},

			/**
			 * When a user wants to abort creating a new object.
			 * Can be triggered either by keyboard ({{#crossLink "BrowserView/listenKbProxy:method"}}{{/crossLink}})
			 * or by click on `cancel` button ({{#crossLink "BrowserView/addModelCancelByClick:method"}}{{/crossLink}}).
			 * 
			 * @method addModelCancel
			 */
			addModelCancel: function ($input) {
				$input.blur().val('').trigger('input').focus();
			},

			/**
			 * When a user wants to create a new object by clicking on `save` button
			 * Will just call the function {{#crossLink "BrowserView/addModel:method"}}{{/crossLink}} with the
			 * right parameter.
			 * 
			 * @method addModelByClick
			 */
			addModelByClick: function (event) {
				this.addModel($(event.target).closest('.add').find('input'));
			},


			/**
			 * When a user wants to create a new object.
			 * Can be triggered either by keyboard ({{#crossLink "BrowserView/listenKbProxy:method"}}{{/crossLink}})
			 * or by click on `save` button ({{#crossLink "BrowserView/addModelByClick:method"}}{{/crossLink}}).
			 * 
			 * @method addModel
			 */
			addModel: function ($input) {
				switch ($input.closest('.tab').attr('data-class')) {
					case "notes" :
						var newModel = new Note ({
							title : $input.val(),
						});
						temp.coll.notes.add(newModel);
						break;
					case "tags" :
						var newModel = new Tag ({
							label : $input.val(),
						});
						temp.coll.tags.add(newModel);
						break;

					case "tasks" :
						temp.coll.tasks.sort();

						var position = 0
						var todo_at  = new Date();
						if (temp.coll.tasks.length > 0) {
							var todos        = temp.coll.tasks.pluck('todo_at');
							var todos_nonull = todos.filter(function (date) { return date !== null; });
							var todos_dates  = todos_nonull.map(function (date) { return new Date(date); });

							position = _.min(temp.coll.tasks.pluck('position'))-1;
							todo_at  = _.min(todos_dates);
						}

						var newModel = new Task ({
							label    : $input.val(),
							position : position,
							todo_at  : todo_at
						});
						temp.coll.tasks.add(newModel);
						break;
				}

				newModel.save();
				$input.val("").focus();
			},

			// =============================================================================
			// Mass actions
			// =============================================================================
			// Series of methods that allow for selecting several objects and operating an 
			// action on them (delete, tag, move,...)
			// Not ready yet, for future use.

			// /**
			//  * Manages the buttons "select all" and "unselect all". Will be called every time an object
			//  * is selected or unseleted to make sure that the right buttons are displayed
			//  * 
			//  * @method actionSelectorsUpdate
			//  */
			// actionSelectorsUpdate : function (collName) {
			// 	var $listObjects = this.$(".listobjects."+collName);

			// 	var countUnselected = $listObjects.find("span.checkbox.icon-check-empty").length;
			// 	if (countUnselected === 0) { // "Unselect all" only
			// 		$listObjects.find(".actions-contextual-selection .select-all").hide();
			// 		$listObjects.find(".actions-contextual-selection .unselect-all").show();
			// 	} else {
			// 		var countSelected = $listObjects.find("span.checkbox.icon-check").length;
			// 		if (countSelected === 0) { // "Select all" only
			// 			$listObjects.find(".actions-contextual-selection .select-all").show();
			// 			$listObjects.find(".actions-contextual-selection .unselect-all").hide();
			// 		} else { // "Select all" and "Unselect all"
			// 			$listObjects.find(".actions-contextual-selection .select-all").show();
			// 			$listObjects.find(".actions-contextual-selection .unselect-all").show();
			// 		}
			// 	}
			// },

			// /**
			//  * Should select all objects
			//  * 
			//  * @method actionSelectAll
			//  */
			// actionSelectAll: function (event) {
			// 	var $listObjects = $(event.target).closest(".listobjects");
			// 	var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");

			// 	channel.trigger("browser:actions:select:all:"+collName); // To display checked boxes
			// 	this.actionSelectorsUpdate(collName); // To update selectors
			// },

			// /**
			//  * Should unselect all objects
			//  * 
			//  * @method actionUnSelectAll
			//  */
			// actionUnSelectAll: function (event) {
			// 	var $listObjects = $(event.target).closest(".listobjects");
			// 	var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");

			// 	channel.trigger("browser:actions:select:none:"+collName); // To display checked boxes
			// 	this.actionSelectorsUpdate(collName); // To update selectors
			// },

			// *
			//  * Displays or hides the controls necessary to select/unselect all objects, delete them,...
			//  * Throws an event to make subviews display their checkboxes
			//  * 
			//  * @method actionDeleteToggle
			 
			// actionDeleteToggle: function (event) {
			// 	var $listObjects = $(event.target).closest(".listobjects");
			// 	var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");

			// 	$listObjects.find(".actions-contextual .delete .action").toggle();
			// 	$listObjects.find(".actions-contextual .delete .cancel").toggle();
			// 	$listObjects.find(".actions-contextual-trigger").toggle();
			// 	$listObjects.find(".actions-contextual-trigger .delete").toggle();
			// 	$listObjects.find(".actions-contextual-selection").toggle();

			// 	/**
			// 	* To make objects subviews show/hide their checkbox.
			// 	* @event browser:actions:toggle-checkboxes:[collName]
			// 	*/
			// 	channel.trigger("browser:actions:toggle-checkboxes:"+collName);

			// 	if ($listObjects.find(".actions-contextual-selection").is(":visible")) {
			// 		this.actionSelectorsUpdate(collName);
			// 	}
			// },

			// /**
			//  * Triggers an event, which will be heard by sub-views that will actually execute the action
			//  * 
			//  * @method actionDeleteExecute
			//  */
			// actionDeleteExecute: function (event) {
			// 	var $listObjects = $(event.target).closest(".listobjects");
			// 	var collName     = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
			// 	var action       = $(event.target).attr('class');// Which action do we want to trigger ?

			// 	/**
			// 	* To make objects subviews kill themselves and destroy their model if they are selected.
			// 	* @event browser:actions:delete:[collName]
			// 	*/
			// 	channel.trigger("browser:actions:delete:"+collName);

			// 	$listObjects.find(".actions-contextual .delete .action").toggle();
			// 	$listObjects.find(".actions-contextual .delete .cancel").toggle();
			// 	$listObjects.find(".actions-contextual-trigger").toggle();
			// 	$listObjects.find(".actions-contextual-trigger .delete").toggle();
			// 	$listObjects.find(".actions-contextual-selection").toggle();
			// },





			// Filter tasks by state
			// =============================================================================

			/**
			 * To toggle the kind of tasks displayed (done, todo, both)
			 * 
			 * @method tasksToggleChecked
			 */
			tasksToggleChecked: function(event) {
				var $button = $(event.target);
				var step = $button.attr('data-step');

				var sequence = {
					0 : 1,
					1 : 2,
					2 : 0,
				};

				this.filters.taskFilter.set('completed', sequence[step]);

				$button.removeClass('active');
				$button.siblings("[data-step="+sequence[step]+"]").addClass('active');
			},

			/**
			 * To toggle the kind of tasks displayed (done, todo, both)
			 * 
			 * @method tasksToggleMilestones
			 */
			tasksToggleMilestones: function(event) {
				var $button = $(event.target);

				this.$('.tab.tasks ul.objects').each(function (index) {
					$(this).removeClass('active');
				});
				this.$('.tab.tasks ul.'+$button.attr('data-mile')).addClass('active');

				$button.siblings().each(function (index) {
					$(this).removeClass('active');
				});
				$button.addClass('active');
			},


			// =============================================================================
			// Search business objets in database
			// =============================================================================

			/**
			 * Updates current filter with the text typed in by the user
			 *
			 * @method searchText
			 * @param event the keyboard event
			 */
			searchText: function (event) {
				var $input     = $(event.target);
				var collName   = $input.attr("data-filter");
				var filterName = collName.replace(/(s)$/, function($1){ return ""; })+"Filter";

				this.filters[filterName].set('text', $input.val());
				// this.searchFiltersCtrlUpd(collName);
			},

			/**
			 * Allows to remove from current filter the object that has been clicked on
			 *
			 * @method searchReset
			 * @param event
			 */
			searchReset: function (event) {
				var self = this;
				var $resetButton = $(event.target);
				var filteredColl = $resetButton.closest('.tab').attr('data-class');
				var filterName   = filteredColl.replace(/(s)$/, function($1){ return ""; })+"Filter";

				this.filters[filterName].set('text','');

				if (filteredColl != "tags") {
					this.filters[filterName].get('tags').each(function (tag) {
						self.filters[filterName].get('tags').remove(tag); // Removing model from Filter
					});
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
				var $listObjects           = $objectButton.closest('.tab');
				var filteredColl           = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
				var filteredCollFilterName = filteredColl.replace(/(s)$/, function($1){ return ""; })+"Filter";
				var object                 = temp.coll[$objectButton.attr('data-class')].get($objectButton.attr('data-cid'));
				this.filters[filteredCollFilterName].get($objectButton.attr('data-class')).remove(object); // Removing model from Filter
			},

			/**
			 * Forces the view's current filter to match the one clicked by the user
			 *
			 * @method searchRenderInputFilter
			 * @param filter the model held by the filter view clicked on by the user
			 */
			searchRenderInputFilter: function (filterName) {
				var self         = this;
				var filter       = this.filters[filterName];
				var filteredColl = filterName.replace(/(Filter)$/, function($1){ return "s"; }); // noteFilter => notes
				var $searchBox   = this.$(".tab."+filteredColl+" .search-box");

				// Empty the tags rendered in the super input
				$searchBox.find('.tags button').remove();
				// Make the input's content match the collection filter just updated
				$searchBox.find('input').val(filter.get('text')).focus();

				if (filterName != "tagFilter") {
					filter.get('tags').each(function (tag) {
						var $tag = $("<button></button>")
							.attr('data-class', "tags") //tags
							.attr('data-cid', tag.cid)
							.html(tag.get('label'));
						$searchBox.find('.tags').append($tag);
					});
				}
			},

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
			 * Should update the controls to save/delete filters
			 * If temp contains a filter similar to the one that is currently applied, we propose to delete it
			 * If not, we propose to save the currently applied one
			 *
			 * @method searchFiltersCtrlUpd
			 * @param {string} collName the name of the collection (example : `tags`)
			 *
			searchFiltersCtrlUpd: function (collName) { //note
				var $listObjects    = this.$(".listobjects."+collName);
				var filtersCollName = collName.replace(/(s)$/, function($1){ return ""; })+"Filters";
				var filterName      = collName.replace(/(s)$/, function($1){ return ""; })+"Filter";

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
			 *
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
			 *
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
			 
			searchFilterDelete: function (event) {
				var $listObjects = $(event.target).closest(".listobjects");
				var filterName   = $listObjects.hasClass("notes") ? "noteFilter" : ($listObjects.hasClass("tags") ? "tagFilter" : "taskFilter");
				/**
				* Will make the view holding the active filter destroy its model
				* @event browser:search:filters:remove:[filter-name]
				*
				channel.trigger("browser:search:filters:remove:"+filterName);
			},*/

			/**
			 * Renders all the filters stored in the temp storage.
			 *
			 * @method searchRenderFilters
			 * @param filtersCollName
			 
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
			},*/


			/**
			 * Forces the view's current filter to match the one clicked by the user
			 *
			 * @method searchFilterActivate
			 * @param filter the model held by the filter view clicked on by the user
			 *
			searchFilterActivate: function (filter) {
				var filterSubClass = filter.get('subClass'); // NoteFilter
				var filterName     = filterSubClass.charAt(0).toLowerCase() + filterSubClass.slice(1); // noteFilter
				this.filters[filterName].makeItMatch(filter);
				this.filters[filterName].trigger('change');
				/**
				* This event is listened by filter views to make them check
				* if they are active
				* @event browser:search:filters:check-status:[filter-name]
				*
				channel.trigger("browser:search:filters:check-status:"+filterName, this.filters[filterName]);
			},*/

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
				console.log	('render collection ' + collName);
				var self = this;
				var filterName = collName == "notes" ? "noteFilter" : (collName == "tasks" ? "taskFilter" : "tagFilter");

				// Destroy task sortables
				if (collName === "tasks") {
					_.each(self.$('.tab.tasks ul.objects'), function (child, index) {
						if ($(child).is(':ui-sortable')) {
							$(child).sortable( "destroy" );
						}
					});
				}

				// Empty the DOM
				//$list.children(':not(.add)').remove();
				//$list.html('');

				// Second, killing children views of the right collection
				_.each(this.children[collName], function (child, index) {
					child.kill();
				});
				this.children[collName] = [];

				// Third, filling the DOM again
				var newView = {};
				var $target  = {};
				var results = temp.coll[collName].search(this.filters[filterName]);

				if (collName === "tasks") {
					// console.log('========RENDER========')
					// console.log(results.pluck('todo_at'))
				}

				results.each(function (element) {
					switch (collName) {
						case "notes" :
							newView = new BrowserNoteView({ collName:"notes", model: element });
							$target = self.$renderingAreas.notes;
							break;
						case "tags" :
							newView = new BrowserTagView({ collName:"tags", model: element });
							$target = self.$renderingAreas.tags;
							break;
						case "tasks" :
							newView = new BrowserTaskView({ collName:"tasks", model: element });

							// Setup dates
							var todo     = new Date(element.get('todo_at'));
							var today    = new Date();
							var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
							var nextweek = new Date(); nextweek.setDate(nextweek.getDate() + 7 - nextweek.getDay() + 1);
							var later    = new Date(); later.setDate(later.getDate() + 14 - later.getDay() + 1);

							// Compare date part only
							todo.setHours(0,0,0,0);
							tomorrow.setHours(0,0,0,0);
							nextweek.setHours(0,0,0,0);
							later.setHours(0,0,0,0);

							if (today.getDay() == 0) { // Sunday case => no tomorrow
								if (todo < nextweek) { $target = self.$renderingAreas.tasks.today; break; }
							} else {
								if (todo < tomorrow) { $target = self.$renderingAreas.tasks.today; break; }
								if (todo < nextweek) { $target = self.$renderingAreas.tasks.tomorrow; break; }
							}
							if (todo < later) { $target = self.$renderingAreas.tasks.nextweek; break; }
							$target = self.$renderingAreas.tasks.later;
							break;
						default:
					}

					self.children[collName].push (newView);
					$target.append(newView.render().el);

				}, this);


				// Initialize task sortables
				if (collName === "tasks") {
					_.each(self.$('.tab.tasks ul.objects'), function (child, index) {
						$(child).sortable({
							placeholder : "ui-state-highlight",
							connectWith : '.droppable',
							handle      : ".move",
							cancel      : ".milestone",
							update: function( event, ui ) {
								return self.sortableUpdate(event, ui);
							},
						});
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
				var self = this;

				setTimeout(function(){
					if(self.dropped) {
					// The object has been dropped first
						return;
					} else {
					// The object is only sorted
						// 1. Find the model corresponding to the sorted DOM node
						var sortedModel = temp.coll.tasks.get(ui.item.attr('data-cid'));

						// 2. Find out in which scenario we are
						var domPrev = ui.item.prev(); // previous sibling
						var domNext = ui.item.next(); // next sibling

						// No task before => there is something after
						if (!domPrev.length) {
							nextModel   = temp.coll.tasks.get(domNext.attr('data-cid'));
							newPosition = nextModel.get('position') - 1;
							newTodo     = nextModel.get('todo_at');
						} else {
						// There is something before
							if (domNext.length > 0) {
							// There is also something after
								prevModel   = temp.coll.tasks.get(domPrev.attr('data-cid'));
								nextModel   = temp.coll.tasks.get(domNext.attr('data-cid'));
								newPosition = 0.5*(prevModel.get('position') + nextModel.get('position'));
								newTodo     = nextModel.get('todo_at');
							} else {
							// There is nothing after
								prevModel   = temp.coll.tasks.get(domPrev.attr('data-cid'));
								newPosition = prevModel.get('position')+1;
								newTodo     = prevModel.get('todo_at');
							}
						}

						sortedModel.set('position', newPosition);
						sortedModel.set('todo_at', newTodo);
						sortedModel.save();
					}
				}, 50); // Wait 50ms just to be sure the drop event has been triggered (if it is supposed to)

			},
		});

		return BrowserView;
	}
);