var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyView = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter .notes' : 'toggleNotes',
		'click .filter .tags'  : 'toggleTags',
		'click .filter .tasks' : 'toggleTasks',
		'keyup .search.notes'  : 'searchNotes',
		'keyup .search.tags'   : 'searchTags',
		'keyup .search.tasks'  : 'searchTasks'
	},

	initialize: function() {
		this.children = {
			"notes" : [],
			"tags"  : [],
			"tasks" : []
		};
		this.filters = {
			"notes" : {},
			"tags"  : {},
			"tasks" : {}
		};

		this.options.collections.notes.on('change', null, { collName: 'notes' }, this.renderCollection, this );
		this.options.collections.tags.on('change:label', null, { collName: 'tags' }, this.renderCollection, this );
		this.options.collections.tasks.on('change:description', null, { collName: 'tasks' }, this.renderCollection, this );

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
	// Search business objets among database
	searchNotes : function () {this.search("notes");},
	searchTags  : function () {this.search("tags");},
	searchTasks : function () {this.search("tasks");},
	search      : function (collName) {
		var sKey = this.$(".search."+collName.toLowerCase()).val();
		console.log('search='+sKey);
		this.filters[collName] = sKey;
		this.renderCollection(collName);


		// var tag0 = meenoAppCli.Tags.models[0]

		// var aSearchedTags = ["50e81e8587d0b89757000008"];

		// meenoAppCli.Notes.filter(function(note) {
		// 	var passIt = 0;
		// 	// On regarde si la note possède tous les tags présents dans l'array aSearchedTags
		// 	_.each(aSearchedTags, function(searchedTagId) { // Loop on searched tags
		// 		_.each(note.get("tags"), function(tag) { // Loop on the tags of the current note
		// 			if (tag._id === searchedTagId) {passIt++; return;}
		// 		});
		// 	});
		// 	if (passIt == aSearchedTags.length) {return true;}
		// 	return false;
		// });
	},

	// --------------------------------------------------------------------------------
	// Render business objects' sub views 
	render : function () {
		this.renderCollection('notes');
		this.renderCollection('tags');
		this.renderCollection('tasks');
	},

	renderCollection : function (event) {
		// var collName = (typeof event == "string" ) ? event : "notes"; // Function called by this.render or by event listener ?
		var collName = (typeof event == "string" ) ? event : event.data.collName; // Function called by this.render or by event listener ?

		console.log("renderCollection:"+collName)
		console.log(this.children[collName])

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