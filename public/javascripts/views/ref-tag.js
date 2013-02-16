var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({
	// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
	// It explains why we don't need a render function

	// The DOM events we listen to
	events: {
		'keypress': 'keyPressProxy'
	},

/*
IL MANQUE TOUTE LA PARTIE DE CREATION DU LINK AVEC LA NOTE !!!

*/


	initialize: function() {
		this.options.locked      = false;
		this.options.cleanupDone = false;
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quit, this);
		meenoAppCli.dispatcher.on('tab:object:' + this.$el.attr('id'), this.keyPressProxy, this);
		this.model.on('change', this.render, this);
		moveCaret (this.$(".body")[0], 1);
	},

	keyPressProxy: function( event ) {
		console.log('proxyed !')
		// First, get rid of the useless space within span.content
		if (!this.options.cleanupDone && this.$('.body').html().length == 8) {
			console.log('go clean !');
			var sHtml = this.$('.body').html();
			console.log(sHtml);
			console.log(sHtml.replace(/^(\&nbsp;)| (.*)/g, "$2"));
			this.$('.body').html(sHtml.replace(/^(\&nbsp;)| (.*)/g, "$2"));
			moveCaret (this.$(".body")[0], 1);
			this.options.cleanupDone = true;
		}

		// We destroy the view if the user erases up to the last character of the tag
		// Not working yet
		if (event.keyCode == 8 && this.$('.body').html().length == 0) {
			console.log('removing tag');
			this.quit();
		}

		if (this.options.locked) { 
			if (event.keyCode == 8) { // The user asked to remove the object
				console.log('removing tag');
				this.quit();
				return;
			} else { // The object is locked, don't do anything
				event.preventDefault();
				return;
			}
		}

		// We save only tags of more than 1 character
		// if (this.$el.html().length > 2) {
		// 	this.save();
		// }
		
		if (event.keyCode == 13 || event.keyCode == 9) { // The user wants to stop editing tag
			console.log('Locking object');
			event.preventDefault();
			return this.lock();
		}

		// We display the autocompleter !
		// var pattern = new RegExp(this.$el.html(),"gi");
		// var proposals = meenoAppCli.Tags.filter(function (tag) {
		// 	return pattern.test(tag.get('label'));
		// });
		// console.log(proposals);

	},

	lock: function() {
		this.options.locked = true;
		this.save();
		this.$el.addClass("locked");
		// Moving the caret out of the object
		var idx = this.$el.parent().contents().index(this.$el);
		// moveCaret (this.$el.parent()[0], idx+2);		
		console.log(this.$el.next())
		moveCaret (this.$el.next()[0], 1);
	},

	save: function() {
		this.model.set({
			label  :this.$el.html()
		});
		meenoAppCli.Tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
		this.model.save(); // Now that the model is into a collection, the .save() method will work
	},

	render: function() {
		console.log('rendering');
	},

	quit: function() {
		console.log('quit tag reference');
		this.remove();
	}
});