var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({
/*
IL MANQUE TOUTE LA PARTIE DE CREATION DU LINK AVEC LA NOTE !!!
*/

	initialize: function() {
		this.options.class = "emb-tag";

		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.kill, this);
		meenoAppCli.dispatcher.on('tab:object:key:' + this.$el.attr('id'), this.keyProxy, this);
		meenoAppCli.dispatcher.on('note:link:object:slave:' + this.model.cid, this.noteLink, this);
		this.model.on('change', this.render, this);
		this.model.on('remove', this.kill, this);
		if (this.options.isNew) { // Needed only for new tags
			meenoAppCli.dispatcher.on('tab:object:markDom:' + this.model.cid, this.lockSlave, this);
			this.$(".body").focus();
		}
		this.$("input.body").on("click", function () {console.log('testing a')})
		console.log ('Embedded tag view initialized');
	},

	beforeKill: function() {
		// External listeners have to be removed in order to destroy last reference to the view and allow Garbage collecting
		meenoAppCli.dispatcher.off('tab:quit:' + this.options.sound, this.kill, this);
		meenoAppCli.dispatcher.off('tab:object:key:' + this.$el.attr('id'), this.keyProxy, this);
		meenoAppCli.dispatcher.off('note:link:object:slave:' + this.model.cid, this.noteLink, this);
		meenoAppCli.dispatcher.off('tab:object:markDom:' + this.model.cid, this.lockSlave, this);
	},

	render: function() {
		console.log('rendering emb-tag');
		this.$(".body").html(this.model.get('label'));
		if (!this.model) {this.$el.addClass('broken');}
		return this;
	},

	keyProxy: function( event ) {

		//-------------------------------
		// Autocomplete in other cases
		//-------------------------------
		if (event.type == "keyup" &&
		event.keyCode != 33 && // page up
		event.keyCode != 34 && // page down
		event.keyCode != 35 && // end
		event.keyCode != 36 && // home
		event.keyCode != 37 && // left arrow
		event.keyCode != 38 && // up arrow
		event.keyCode != 39 && // right arrow
		event.keyCode != 40) {
			var strHint = (this.$(".body").val());
			if (strHint.length > -1) {
				console.log("hint="+strHint)
				var pattern = new RegExp(strHint,"i");
				var proposals = meenoAppCli.Tags.filter(function (tag) {
					return pattern.test(tag.get('label'));
				});
				var datalistOptions = proposals.map(function (obj, key) { 
					return "<option value='"+obj.get('label')+"'>"+obj.get('label')+"</option>"; 
				});
				this.$(".datalist").html(datalistOptions);
			}
		}

		if (event.type == "keydown") {
		//-------------------------------
		// Destroying tags
		//-------------------------------

			// We destroy the view if the user erases up to the last character of the tag
			if (event.keyCode == 8 && this.$('.body').val().length == 0) {
				console.log('removing tag');
				this.kill();
			}
			// We destroy the view when the object is locked and the user presses Back key
			if (this.$el.hasClass('locked')) {
				if (event.keyCode == 8) { // The user asked to remove the object
					console.log('removing locked tag');
					this.kill();
				} else { // The object is locked, don't do anything unless moving caret
					if (event.keyCode != 33 && // page up
						event.keyCode != 34 && // page down
						event.keyCode != 35 && // end
						event.keyCode != 36 && // home
						event.keyCode != 37 && // left arrow
						event.keyCode != 38 && // up arrow
						event.keyCode != 39 && // right arrow
						event.keyCode != 40) { // down arrow
						event.preventDefault();
					}
				}
				return;
			}

		//-------------------------------
		// Locking tags (stop edition)
		//-------------------------------
			if (event.keyCode == 13 || event.keyCode == 9) {
				event.preventDefault();
				if (this.$('.body').val().length > 2) {
				// We save only tags of more than 2 characters
					return this.lock();
				}
				console.log('won\'t lock')
			}
		}
	},

	lock: function () {
		console.log('############# Locking object #############');

		// First DOM manipulation
		this.$el.addClass("locked"); // Locking the object
		var newTagLabel = this.$(".body").val();
		var $newSpan = $("<span>",{class:"body"}).html(newTagLabel);

		this.$(".body").parent().remove();
		this.$el.append($newSpan);
		moveCaret (this.$el.next()[0], 1); // Moving the caret out of the object

		// Setting/Saving Model
		this.model.set({
			label  :this.$(".body").html()
		});
		meenoAppCli.Tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
		this.model.save({},{ // Now that the model is into a collection, the .save() method will work
			success: function(model, response, options) {
				// Shouting to warn the note editor that the new tag has to be linked to the note
				meenoAppCli.dispatcher.trigger('note:link:object:slave:' + model.cid);
				meenoAppCli.dispatcher.trigger('tab:object:markDom:' + model.cid); // To save model._id within html

			},
			error  : function() {
				console.log('saving failed');
			}
		});
	},

	lockSlave: function () {
		// Second DOM manipulation : saving the model id into the DOM for further initialization
		this.$el.attr("data-model-id",this.model.get("_id"));
	},

	noteLink: function () {
		meenoAppCli.dispatcher.trigger('note:link:object:' + this.options.sound, {type: "tag", model: this.model});
	}
});