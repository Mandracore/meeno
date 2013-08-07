var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyView = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter .notes'           : 'toggleNotes',
		'click .filter .tags'            : 'toggleTags',
		'click .filter .tasks'           : 'toggleTasks',
		'keyup .search.notes' : 'searchNotes',
		'keyup .search.tags'  : 'searchTags',
		'keyup .search.tasks' : 'searchTasks'
	},

	initialize: function() {
		meenoAppCli.Notes.on('add destroy reset change', this.renderNotes, this );
		meenoAppCli.Tags.on('add destroy reset change', this.renderTags, this );
		this.children = {
			"notes" : [],
			"tags"  : [],
			"tasks" : []
		};
		this.collections = {
			"notes" : meenoAppCli.Notes,
			"tags"  : meenoAppCli.Tags,
			"tasks" : meenoAppCli.Tasks
		};
		this.filters = {
			"notes" : {},
			"tags"  : {},
			"tasks" : {}
		};
		this.render();
	},

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
	toggleNotes : function () {this.toggleObject(0);},
	toggleTags  : function () {this.toggleObject(1);},
	toggleTasks : function () {this.toggleObject(2);},
	toggleObject: function (iObject) {
		var objectClass = (iObject == 0 ? "notes" : (iObject == 1 ? "tags" : "tasks"));
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
	searchNotes : function () {this.search("notes");},
	searchTags  : function () {this.search("tags");},
	searchTasks : function () {this.search("tasks");},
	search      : function (collName) {
		var sKey = this.$(".search."+objectClass).val();
		console.log('search='+sKey);
		this.filters[collName] = sKey;
		this.renderCollection(collName);
	},

	// --------------------------------------------------------------------------------
	// Render business objects' sub views 
	render: function () {
		this.renderCollection('notes');
		this.renderCollection('tags');
		this.renderCollection('tasks');
	},

	renderCollection: function (collName) {
		var modelClasses = {
			notes : "ListNoteView",
			tags  : "ListTagView",
			tasks : "ListTaskView",
		}

		var $list = this.$('.listobjects.'+collName+' .'+collName);
		$list.html(''); // First, emptying the DOM
		_.each(this.children[collName], function (child) { // Second, killing children views of right collection
			child.kill();
		});

		// Third, filling the DOM again
		this.collections[collName].search(this.filters[collName]).each(function (item) {
			// fruits.push("Kiwi")
			var view = new meenoAppCli.Classes[modelClasses[collName]]({ model: item });
			this.children[collName].push (view);
			$list.append(view.render().el);
		}, this);

	},
});