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
	},

	initialize: function() {
		this.children = {
			"notes" : [],
			"tags"  : [],
			"tasks" : []
		};
		this.filters = {
			"notes" : "",
			"tags"  : "",
			"tasks" : ""
		};

		this.listenTo(this.options.collections.notes, 'add remove', function() {this.renderCollection("notes");});
		this.listenTo(this.options.collections.tags, 'add remove', function() {this.renderCollection("tags");});
		this.listenTo(this.options.collections.tasks, 'add remove', function() {this.renderCollection("taks");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:notes:resetSelection', function () {this.resetSelection("notes");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:tags:resetSelection', function () {this.resetSelection("tags");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:taks:resetSelection', function () {this.resetSelection("tasks");});
		this.render();
	},

	// --------------------------------------------------------------------------------
	// Mass actions
	resetSelection: function(collName) {
		this.$(".listobjects ."+collName+" span.checkbox").each(function (idx, checkbox) {
			$(checkbox).addClass("icon-check-empty").removeClass("icon-check");
		});
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
		// Display selectors or hide them
		$listObjects.find("span.checkbox").toggle();
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
	search : function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var collName = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
		var sKey = $(event.target).find(".search."+collName.toLowerCase()).val();
		console.log('search='+sKey);
		this.filters[collName] = sKey;
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
		console.log("renderCollection:"+collName);

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
		this.options.collections[collName].search(this.filters[collName]).each(function (item) {
			if (collName == "notes") { newView = new meenoAppCli.Classes.BrowserBodyNoteView({ model: item }); }
			if (collName == "tags") { newView = new meenoAppCli.Classes.BrowserBodyTagView({ model: item }); }
			if (collName == "tasks") { newView = new meenoAppCli.Classes.BrowserBodyTaskView({ model: item }); }
			this.children[collName].push (newView);
			$list.append(newView.render().el);
		}, this);
	},
});