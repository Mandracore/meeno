var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({

	// The DOM events specific to an item.
	events: {
		'keyup'  : 'keyUp',
		'keydown' : 'keyDown'
	},

	keyboardEvents: {
		// some issue with mousetrap on chrome
		// '#': 'newTag',
		// '@': 'newPerson',
		'esc': 'tryDelete',
		'enter': 'tryLock',
		'tab': 'tryLock',
		'backspace': 'tryDelete',
		'del': 'tryDelete'
	},

	initialize: function() {
		Backbone.View.prototype.initialize.apply(this, arguments);
		this.options.class = "emb-tag";

		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.kill, this);
		meenoAppCli.dispatcher.on('tab:object:key:' + this.$el.attr('id'), this.keyProxy, this);
		this.model.on('change', this.render, this);
		this.model.on('remove', this.kill, this);
		if (this.options.isNew) { // Needed only for new tags
			this.$(".body").focus();
		}
		// this.$(".datalistoption").on("click", function () {console.log('testing a')})
		// $(this.$el.attr('id')+" option").on("click", function(event){
		// 	alert("ALERT");
		// });
		$("#tabs").on("click", ".trick",  function () {alert('testing a')})
		console.log ('Embedded tag view initialized');

	},

	beforeKill: function() {
		// External listeners have to be removed in order to destroy last reference to the view and allow Garbage collecting
		meenoAppCli.dispatcher.off('tab:quit:' + this.options.sound, this.kill, this);
		meenoAppCli.dispatcher.off('tab:object:key:' + this.$el.attr('id'), this.keyProxy, this);
	},

	render: function() {
		console.log ("R[emb-tag]");
		this.$(".body").html(this.model.get('label'));
		if (!this.model) {this.$el.addClass('broken');}
		return this;
	},

	keyUp: function( event ) {

		//-------------------------------
		// Autocomplete in other cases
		//-------------------------------
		if (event.keyCode != 33 && // page up
		event.keyCode != 34 && // page down
		event.keyCode != 35 && // end
		event.keyCode != 36 && // home
		event.keyCode != 37 && // left arrow
		event.keyCode != 38 && // up arrow
		event.keyCode != 39 && // right arrow
		event.keyCode != 40) {
			var strHint = (this.$(".body").val());
			if (strHint.length > -1) {
				var pattern = new RegExp(strHint,"i");
				var proposals = meenoAppCli.Tags.filter(function (tag) {
					return pattern.test(tag.get('label'));
				});
				var datalistOptions = proposals.map(function (obj, key) {
					return "<option class='trick' data-model-id='"+obj.get('_id')+"' value='"+obj.get('label')+"'>"+obj.get('label')+"</option>";
				});
				this.$(".datalist").html(datalistOptions);
			}
		}
	},

	keyDown: function( event ) {
		console.log('key down');
		if (this.$el.hasClass('locked') &&
			event.keyCode != 33 && // page up
			event.keyCode != 34 && // page down
			event.keyCode != 35 && // end
			event.keyCode != 36 && // home
			event.keyCode != 37 && // left arrow
			event.keyCode != 38 && // up arrow
			event.keyCode != 39 && // right arrow
			event.keyCode != 40) { // down arrow
			console.log('bien locké');
			// The object is locked, don't do anything unless moving caret
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				// internet explorer
				event.returnValue = false;
			}
		}
	},

	tryLock: function(){
		console.log('Try to lock');
		//-------------------------------
		// Locking tags (stop edition)
		//-------------------------------
		if (this.$('.body').val().length > 2) {
			// We save only tags of more than 2 characters
			this.freeze();
		} else {
			console.log('won\'t lock');
		}
		return false;
	},

	tryDelete: function(){
		//-------------------------------
		// Destroying tags
		//-------------------------------
		console.log('Try to delete');
		if(!this.$('.body').val().length){
			console.log('removing tag');
			this.kill();
		}
		if (this.$el.hasClass('locked')) {
			console.log('...Removing locked tag...');
			this.unlink();
			this.kill();
		}
	},
	// Apparemment buggé, reste à déterminer pourquoi.
	freeze: function () {
		console.log('############# Locking object #############');

		var view = this;
		var inputVal = this.$(".body").val();
		var existing = meenoAppCli.Tags.find(function (tag) { return tag.get('label') == inputVal; });

		if (!existing) {
			console.log('## Creating new tag');
			this.model.set({
				label  :this.$(".body").val()
			});
			meenoAppCli.Tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
			this.model.save({},{ // Now that the model is into a collection, the .save() method will work
				success: function(model, response, options) {
					view.link ({
						success: function () {
							view.transform(view.$(".body").val());
							view.clean();
							view.lock();
							console.log('Tag "'+view.model.get('label')+'" linked to current note');
						},
						error: function () {
							view.dirty();
							console.log('Impossible to link Tag "'+view.model.get('label')+'" to current note');
						}
					});
					moveCaret (view.$el.next()[0], 1); // Moving the caret out of the object
				},
				error  : function() {
					console.log('!!! Saving new model failed');
					view.dirty();
				}
			});
		} else {
			console.log('## Linking to existing tag');
			this.model = existing;
			this.link ({
				success: function () {
					view.transform(view.$(".body").val());
					view.clean();
					view.lock();
					console.log('Tag "'+view.model.get('label')+'" linked to current note');
				},
				error: function () {
					view.dirty();
					console.log('Impossible to link Tag "'+view.model.get('label')+'" to current note');
				}
			});
			moveCaret (view.$el.next()[0], 1); // Moving the caret out of the object
		}
	},

	lock: function () {
		console.log('Locking object');
		this.$el.addClass("locked");
		this.$el.attr("data-model-id",this.model.get("_id"));
	},

	dirty: function () {
		console.log('Breaking object');
		this.$el.addClass("broken");
	},

	clean: function () {
		console.log('Cleaning object');
		this.$el.removeClass("broken");
	},

	transform: function (newLabel) {
		var $newSpan = $("<span>",{class:"body"}).html(newLabel);
		this.$(".body").parent().remove();
		this.$el.append($newSpan);
	},

	link: function (callbacks) {
		console.log('--trying to link tag');
		var view = this;
		this.options.note.add('tags', this.model);
		this.options.note.save({},{
			success: callbacks.success,
			error  : callbacks.error
		});
	},

	unlink: function (note, callbacks) {
		console.log('--trying to unlink tag');
		var view = this;
		note.add('tags', this.model);
		note.save({},{
			success: callbacks.success,
			error  : callbacks.error
		});
	}
});