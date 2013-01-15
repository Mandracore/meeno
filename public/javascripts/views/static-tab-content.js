// js/views/staticTabContent.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};
meenoAppCli.views = meenoAppCli.views || {};

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

		if (this.options.browse) {
			meenoAppCli.Notes.on('add destroy reset change', this.render, this );
			meenoAppCli.Tags.on('add destroy reset change', this.render, this );
			this.render();
		}
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
	filterTasks: function() {this.filter(2);},

	render: function() {
		// Trigger rendering of notes
		var $noteList = this.$('.listobjects.notes .notes');
		$noteList.html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) {
			var noteOverView = new meenoAppCli.Classes.NoteOverView({ model: note });
			$noteList.append(noteOverView.render().el);
			meenoAppCli.views[noteOverView];
		}, this);		
		// Trigger rendering of tags
		var $tagList = this.$('.listobjects.tags .tags');
		$tagList.html(''); // First, emptying the list
		meenoAppCli.Tags.each(function (tag) {
			var tagOverView = new meenoAppCli.Classes.TagOverView({ model: tag });
			$tagList.append(tagOverView.render().el);
			meenoAppCli.views[tagOverView];
		}, this);
	},
});