var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyView = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter .notes'                                                 : 'toggleNotes',
		'click .filter .tags'                                                  : 'toggleTags',
		'click .filter .tasks'                                                 : 'toggleTasks',
		'keyup .search'                                                        : 'search',
		'click .listobjects.notes .actions-contextual .delete'                 : 'deleteToggle',
		'click .listobjects.notes .actions-contextual-selection .select-all'   : 'selectAll',
		'click .listobjects.notes .actions-contextual-selection .unselect-all' : 'unSelectAll',
		'click span.checkbox'                                                  : 'selection',
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

		this.listenTo(this.options.collections.notes, 'add remove', this.renderCollectionNotes);
		this.listenTo(this.options.collections.tags, 'add remove', this.renderCollectionTags);
		this.listenTo(this.options.collections.tasks, 'add remove', this.renderCollectionTasks);
		this.render();
	},

	// --------------------------------------------------------------------------------
	// Selection of objects
	selection : function (event) {
		var $listObjects = !event.listObjects ? $(event.target).closest(".listobjects") : $(event.listObjects);
		var countUnselected = $listObjects.find("span.checkbox.icon-check-empty").length;
		if (countUnselected == 0) { // "Unselect all" only
			$listObjects.find(".actions-contextual-selection .select-all").hide();
			$listObjects.find(".actions-contextual-selection .unselect-all").show();
		} else {
			var countSelected = $listObjects.find("span.checkbox.icon-check").length;
			if (countSelected == 0) { // "Select all" only
				$listObjects.find(".actions-contextual-selection .select-all").show();
				$listObjects.find(".actions-contextual-selection .unselect-all").hide();
			} else { // "Select all" and "Unselect all"
				$listObjects.find(".actions-contextual-selection .select-all").show();
				$listObjects.find(".actions-contextual-selection .unselect-all").show();
			}
		}
	},

	selectAll: function(event) {
		var $listObjects = $(event.target).closest(".listObjects");
		$listObjects.find("span.checkbox.icon-check").addClass(".icon-check-empty").removeClass(".icon-check");
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
	toggleNotes  : function () {this.toggleObject("notes");},
	toggleTags   : function () {this.toggleObject("tags");},
	toggleTasks  : function () {this.toggleObject("tasks");},
	toggleObject : function (objectClass) {
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
	// Delete objects
	deleteToggle: function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		// Display selectors or hide them
		$listObjects.find("span.checkbox").toggle();
		$listObjects.find(".actions-contextual .action").toggle();
		$listObjects.find(".actions-contextual .cancel").toggle();
		$listObjects.find(".actions-contextual-trigger").toggle();
		$listObjects.find(".actions-contextual-selection").toggle();

		if ($listObjects.find(".actions-contextual-selection").is(":visible")) {
			this.selection($listObjects);
		}
	},

	// --------------------------------------------------------------------------------
	// Search business objets among database
	search : function (event) {
		var $listObjects = $(event.target).closest(".listObjects");
		var collName = $target.hasClass("notes") ? "notes" : ($target.hasClass("tags") ? "tags" : "tasks");
		var sKey = $(event.target).find(".search."+collName.toLowerCase()).val();
		console.log('search='+sKey);
		this.filters[collName] = sKey;
		this.renderCollection(collName);
	},

	// --------------------------------------------------------------------------------
	// Render business objects' sub views 
	renderCollectionNotes : function () {return this.renderCollection("notes");},
	renderCollectionTags : function () {return this.renderCollection("tags");},
	renderCollectionTasks : function () {return this.renderCollection("tasks");},
	render : function (event) {
		this.renderCollection('notes');
		this.renderCollection('tags');
		this.renderCollection('tasks');
	},

	renderCollection : function (collName) {
		console.log("renderCollection:"+collName)

		// First, emptying the DOM
		var $list = this.$('.listobjects.'+collName+' .'+collName);
		$list.html('');
		// Second, killing children views of right collection
		_.each(this.children[collName], function (child, index) { 
			child.kill();
		});
		this.children[collName] = [];
		// Third, filling the DOM again
		this.options.collections[collName].search(this.filters[collName]).each(function (item) {
			if (collName == "notes") { var view = new meenoAppCli.Classes.ListNoteView({ model: item }); }
			if (collName == "tags") { var view = new meenoAppCli.Classes.ListTagView({ model: item }); }
			if (collName == "tasks") { var view = new meenoAppCli.Classes.ListTaskView({ model: item }); }
			this.children[collName].push (view);
			$list.append(view.render().el);
		}, this);
	},
});