// js/views/staticTabContent.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.StaticTabContentView = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter .notes': 'filterNotes',
		'click .filter .tags' : 'filterTags',
		'click .filter .tasks': 'filterTasks'
	},

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
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
	// This section is meant for Browse tab only
	filter: function (iObject) {
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
	filterNotes: function() {this.filter(0);},
	filterTags: function() {this.filter(1);},
	filterTasks: function() {this.filter(2);}
});

meenoAppCli.Classes.StaticTabContentView2 = Backbone.View.extend ({

	// That view will be binded to a pre-existing piece of DOM
	// ("el" is passed directly to the class constructor : see http://backbonejs.org/#View-constructor)
	// It also explains why we don't need a render function
	// It's meant to be used for both Help and Browse tabs, which explains some functions won't be used in some cases

	events: {
		'click .filter .notes': 'filterNotes',
		'click .filter .tags' : 'filterTags',
		'click .filter .tasks': 'filterTasks'
	},

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:toggle:' + this.options.sound, this.toggle, this);
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
	// This section is meant for Browse tab only
	filter: function (iObject) {
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
	filterNotes: function() {this.filter(0);},
	filterTags: function() {this.filter(1);},
	filterTasks: function() {this.filter(2);}

	render: function() {
		// A render method is needed because here we have models !
		// Render notes
		// Render tags
		// Render tasks

		// Needs to take into account what filter is currently applyed
		// Have to decide wether we filter now or only when when chose object

		this.$('#note-list').html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) {
			var noteView = new meenoAppCli.Classes.NoteView({ model: note });
			$('#note-list').append(noteView.render().el);
		}, this);
	}
});