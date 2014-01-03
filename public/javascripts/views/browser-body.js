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
			"notes" : "",
			"tags"  : "",
			"tasks" : ""
		};

		this.listenTo(this.options.collections.notes, 'add remove', function() {this.renderCollection("notes");});
		this.listenTo(this.options.collections.tags, 'add remove', function() {this.renderCollection("tags");});
		this.listenTo(this.options.collections.tasks, 'add remove', function() {this.renderCollection("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:notes:reSyncSelectors', function () {this.reSyncSelectors("notes");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:tags:reSyncSelectors', function () {this.reSyncSelectors("tags");});
		this.listenTo(meenoAppCli.dispatcher, 'browser:taks:reSyncSelectors', function () {this.reSyncSelectors("tasks");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:tag', function () {this.searchObject("tag");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:task', function () {this.searchObject("task");});
		this.listenTo(meenoAppCli.dispatcher, 'keyboard:entity', function () {this.searchObject("entity");});
		this.render();

		var availableTags = [
			"ROM1ActionScript",
			"ROM1AppleScript",
			"ROM1Asp",
			"ROM1BASIC",
			"ROM1C",
			"ROM1C++",
			"ROM1Clojure",
			"ROM1COBOL",
			"ROM1ColdFusion",
			"ROM1Erlang",
			"ROM1Fortran",
			"ROM1Groovy",
			"ROM1Haskell",
			"ROM1Java",
			"ROM1JavaScript",
			"ROM1Lisp",
			"ROM1Perl",
			"ROM1PHP",
			"ROM1Python",
			"ROM1Ruby",
			"ROM1Scala",
			"ROM1Scheme"
		];

		this.$(".autocomplete").autocomplete({
			source: function (request, response) {
				// request.term : data typed in by the user ("new yor")
				// response : native callback that must be called with the data to suggest to the user
				response (availableTags);
				// It's important when providing a custom source callback to handle errors during the request
				// When filtering data locally, you can make use of the built-in $.ui.autocomplete.escapeRegex function
			},
			select: function(event, ui) {
				self.searchObjectSelect (ui);
			}
		});
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

	searchObject: function (searchWhat) {
		// Check focus before taking action
		var focus = false;
		$(".listobjects").find('input.search').each(function(idx,el) {
			if ($(el).is(":focus")) {
				focus = true;
				var $listObjects = $(el).closest('.listobjects');
				var searchWhere = $listObjects.hasClass('notes') ? 'notes' : ($listObjects.hasClass('tags') ? 'tags' : 'tasks');
				console.log ('search '+searchWhere+' related to '+searchWhat);
			}
		});
		if (!focus) { return; }

		//autocomplete: function() {
		console.log('autocomplete');
		var strHint = (this.$(".body").val());
		if (strHint.length > -1) {
			var pattern = new RegExp(strHint,"i");
			var proposals = meenoAppCli.tags.filter(function (tag) {
				return pattern.test(tag.get('label'));
			});
			var datalistOptions = proposals.map(function (obj, key) {
				return "<option class='trick' data-model-id='"+obj.get('_id')+"' value='"+obj.get('label')+"'>"+obj.get('label')+"</option>";
			});
			this.$(".datalist").html(datalistOptions);
		}

		// Do the searching
		switch (searchWhat) {
			case "tag":

			break;
			case "task":

			break;
			case "entity":

			break;
		}
		return false;
	},

	searchObjectSelect : function (ui) {
		console.log('An option has been selected');
	},

	search : function (event) {
		var $listObjects = $(event.target).closest(".listobjects");
		var collName = $listObjects.hasClass("notes") ? "notes" : ($listObjects.hasClass("tags") ? "tags" : "tasks");
		var sKey = $(event.target).val();
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

//_.extend(meenoAppCli.Classes.BrowserBodyView.prototype, meenoAppCli.l18n.BrowserBodyView);