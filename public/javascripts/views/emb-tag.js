var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({
	// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
	// It explains why we don't need a render function

	// The DOM events we listen to
	events: {
		// 'keypress': 'keyProxy'
	},

/*
IL MANQUE TOUTE LA PARTIE DE CREATION DU LINK AVEC LA NOTE !!!

*/


	initialize: function() {

		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quit, this);
		meenoAppCli.dispatcher.on('tab:object:key:' + this.$el.attr('id'), this.keyProxy, this);
		meenoAppCli.dispatcher.on('note:link:object:slave:' + this.model.cid, this.link, this);
		this.model.on('change', this.render, this);
		this.model.on('remove', this.quit, this);
		if (this.options.isNew) { // Needed only for new tags
			meenoAppCli.dispatcher.on('tab:object:markDom:' + this.model.cid, this.markDom, this);
			moveCaret (this.$(".body")[0], 1);
		}
		console.log ('Embedded tag view initialized');
	},

	render: function() {
		console.log('rendering');
		this.$(".body").html(this.model.get('label'));
		if (!this.model) {this.$el.addClass('broken');}
		return this;
	},

	keyProxy: function( event ) {
		console.log('proxyed !')
		//-------------------------------
		// Tag cleanup
		//-------------------------------
		if (!this.$el.hasClass('cleanupDone') && this.$('.body').html().length == 8) {
			var sHtml = this.$('.body').html();
			this.$('.body').html(sHtml.replace(/^(\&nbsp;)| (.*)/g, "$2"));
			moveCaret (this.$(".body")[0], 1);
			this.$el.addClass('cleanupDone');
		}

		//-------------------------------
		// Destroying tags
		//-------------------------------
		// We destroy the view if the user erases up to the last character of the tag
		// Not working yet
		if (event.keyCode == 8 && this.$('.body').html().length == 0) {
			console.log('removing tag');
			this.quit();
		}
		// We destroy the view when the object is locked and the user presses Back key
		if (this.$el.hasClass('locked')) { console.log('locked')
			if (event.keyCode == 8) { // The user asked to remove the object
				console.log('removing locked tag');
				this.quit();
				return;
			} else { // The object is locked, don't do anything
				event.preventDefault();
				return;
			}
		}

		//-------------------------------
		// Locking tags (stop edition)
		//-------------------------------
		if (event.keyCode == 13 || event.keyCode == 9) { 
			event.preventDefault();
			if (this.$('.body').html().length > 2 && this.$el.hasClass('cleanupDone')) {
			// We save only tags of more than 1 character
				console.log('Locking object');
				return this.lock();
			}
			console.log('won\'t lock')
		}

		// We display the autocompleter !
		// var pattern = new RegExp(this.$el.html(),"gi");
		// var proposals = meenoAppCli.Tags.filter(function (tag) {
		// 	return pattern.test(tag.get('label'));
		// });
		// console.log(proposals);

	},

	lock: function() {
		this.save();
		this.$el.addClass("locked"); // Locking the object
		// Moving the caret out of the object
		var idx = this.$el.parent().contents().index(this.$el);
		// moveCaret (this.$el.parent()[0], idx+2);		
		moveCaret (this.$el.next()[0], 1);
	},

	save: function() {
		this.model.set({
			label  :this.$(".body").html()
		});
		meenoAppCli.Tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
		this.model.save({},{ // Now that the model is into a collection, the .save() method will work
			success: function(model, response, options) {
				meenoAppCli.dispatcher.trigger('tab:object:markDom:' + model.cid);
				meenoAppCli.dispatcher.trigger('note:link:object:slave:' + model.cid);
			},
			error  : function() {
				console.log('saving failed');
			}
		});
	},

	link: function() {
		meenoAppCli.dispatcher.trigger('note:link:object:' + this.options.sound, {type: "link", model: this.model});
	},

	markDom: function() {
		this.$el.attr("data-model-id",this.model.get("_id")); // Saving the model id into the DOM for further initialization
	},

	quit: function() {
		console.log('quit embedded object view (id=' + this.$el.attr('id') + ')');
		this.kill();
	}
});