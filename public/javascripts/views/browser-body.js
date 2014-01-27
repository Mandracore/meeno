var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyView = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter li'                                  : 'toggleObject',
		'keyup .search'                                     : 'search',
		'click .actions-contextual .delete'                 : 'deleteToggle',
		'click .actions-contextual-selection .select-all'   : 'selectAll',
		'click .actions-contextual-selection .unselect-all' : 'unSelectAll',
		'click span.checkbox'                               : 'selection',
		'click .actions-contextual-trigger button'          : 'actionTrigger',
		'click .objectButtons span'                         : 'searchObjectButtonRemove',
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
			"tasks" : []
		};
		this.filters = {
			"notes" : {text:"",objects:[]},
			"tags"  : {text:"",objects:[]},
			"tasks" : {text:"",objects:[]},
		};

		this.listenTo(this.options.collections.notes, 'add remove', function() {this.renderCollection("notes");});
		this.listenTo(this.options.collections.tags, 'add remove', function() {this.renderCollection("tags");});
		this.listenTo(this.options.collections.tasks, 'add remove', function() {this.renderCollection("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:notes:reSyncSelectors', function () {this.reSyncSelectors("notes");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:tags:reSyncSelectors', function () {this.reSyncSelectors("tags");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:taks:reSyncSelectors', function () {this.reSyncSelectors("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:tag', function () {this.searchOpenAutocomplete("tags");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:task', function () {this.searchOpenAutocomplete("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:entity', function () {this.searchOpenAutocomplete("entities");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:escape', function () {this.searchCloseAutocomplete("escape");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:backspace', function () {this.searchCloseAutocomplete("backspace");});
		this.render();
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

	// --------------------------------------------------------------------------------
	// Search business objets among database
	searchGetFocus: function (io) {
		var focus = false;
		var $listObjects = {};
		var inputClass = io ? "search" : "autocomplete";
		this.$(".listobjects").find('input.'+inputClass).each(function(idx,el) {
			if ($(el).is(":focus")) {
				focus = true;
				$listObjects = $(el).closest('.listobjects');
				browserActiveView = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
				// console.log ('search '+browserActiveView+' related to '+searchWhat);
			}
		});
		if (!focus) { return false; }
		else {
			return browserActiveView;
		}
	},

	searchOpenAutocomplete: function (searchWhat) {
		// searchWhat : the kind of object that will be used to retrieve the ones we look for
		var self = this;
		
		// Check focus before taking action
		var browserActiveView = this.searchGetFocus(true); // the kind of object we are looking for
		if (browserActiveView === false) { return; }
		var $listObjects = this.$(".listobjects."+browserActiveView);

		console.log ('search '+browserActiveView+' related to '+searchWhat);

		// Parameter the autocomplete to propose the right kind of objects
		$listObjects.find(".autocomplete").autocomplete({
			source: function (request, response) {
				// request.term : data typed in by the user ("new yor")
				// response : native callback that must be called with the data to suggest to the user
				var searchObject = {
					text: request.term,
					objects: []
				};
				response (
					self.options.collections[searchWhat].search(searchObject).map(function (model, key, list) {
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
				var objectRef = {
					class: searchWhat,
					cid: ui.item.value
				}
				if (self.searchObjectFind(browserActiveView,objectRef) === true) { return; }
				self.searchObjectAdd(browserActiveView,objectRef);
				objectRef.label = ui.item.label;
				console.log("Selected option: "+objectRef.label);
				self.searchObjectButtonAppend(browserActiveView, objectRef);
			}
		// Change the autocomplete's placeholder, empty it (in case it was used before), display it and focus in
		}).attr("placeholder","filter by related "+searchWhat).val('').show().focus(); 
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

	searchObjectAdd: function (browserActiveView, objectRef) {
		this.filters[browserActiveView].objects.push({
			class: objectRef.class,
			cid: objectRef.cid
		});
		$(".listobjects."+browserActiveView+" .search").keyup(); // Trick to re-render collections
	},

	searchObjectFind: function (browserActiveView, objectRef) {
		var bFound = _.find(this.filters[browserActiveView].objects, function(item){
			return (item.class == objectRef.class && item.cid == objectRef.cid);
		});
		if (bFound === undefined) {return false;}
		else {return true;}
	},

	searchObjectRemove: function (browserActiveView, objectRef) {
		this.filters[browserActiveView].objects = _.filter(this.filters[browserActiveView].objects, function(item){
			return (item.class != objectRef.class && item.cid != objectRef.cid);
		});
		$(".listobjects."+browserActiveView+" .search").keyup(); // Trick to re-render collections
	},

	searchObjectButtonAppend: function (browserActiveView, object) {
		var $objectButton = $("<span></span>").attr('data-class',object.class).attr('data-cid',object.cid).html(object.label);
		this.$(".listobjects."+browserActiveView+" .objectButtons").append($objectButton);
	},

	searchObjectButtonRemove: function (event) {
		var $objectButton = $(event.target);
		var $listObjects = $objectButton.closest('.listobjects');
		var browserActiveView = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
		var objectRef = {
			class: $objectButton.attr('data-class'),
			cid: $objectButton.attr('data-cid')
		};
		$objectButton.remove();
		this.searchObjectRemove(browserActiveView,objectRef);
	},

	search: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var collName = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
		this.filters[collName].text = $(event.target).val();
		this.renderCollection(collName);
	},

	// --------------------------------------------------------------------------------
	// Render business objects' sub views 
	render : function (event) {
		this.renderCollection('notes');
		this.renderCollection('tags');
		this.renderCollection('tasks');
	},

	renderCollection : function (collName) {
		//console.log("renderCollection:"+collName);
		var self = this;
		// First, emptying the DOM
		var $list = this.$('.listobjects.'+collName+' .'+collName);
		$list.html('');
		// Second, killing children views of right collection
		_.each(this.children[collName], function (child, index) {
			child.kill();
		});
		this.children[collName] = [];
		// Third, filling the DOM again
		var tmpCollections = {
			notes : this.options.collections.notes,
			tags  : this.options.collections.tags,
			tasks : this.options.collections.tasks
		};
		var newView = {};

		// var aFilteredModels = this.options.collections[collName].search(this.filters[collName],tmpCollections);
		// console.log(aFilteredModels);
		// _.each(aFilteredModels, function (element, index, list) { // for now we ignore complex searches
		this.options.collections[collName].search(this.filters[collName],tmpCollections).each(function (element) { // for now we ignore complex searches
			if (collName == "notes") { newView = new meenoAppCli.Classes.BrowserBodyNoteView({ model: element }); }
			if (collName == "tags") { newView = new meenoAppCli.Classes.BrowserBodyTagView({ model: element }); }
			if (collName == "tasks") { newView = new meenoAppCli.Classes.BrowserBodyTaskView({ model: element }); }
			self.children[collName].push (newView);
			$list.append(newView.render().el);
		}, this);
	},
});

//_.extend(meenoAppCli.Classes.BrowserBodyView.prototype, meenoAppCli.l18n.BrowserBodyView);