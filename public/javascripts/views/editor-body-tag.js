var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({
	
	tagName   :'span',
	className :'object tag icon-tag',
	template  :'#emb-tag-template',

	initialize: function() {
		this.options.class = "emb-tag";
		this.options.id = !this.options.id ? 0 : this.options.id;

		if (this.model) {
			this.model.on('change', this.render, this);
			this.model.on('remove', this.kill, this);
		}

		this.listenTo(meenoAppCli.dispatcher, 'tab:quit:' + this.options.sound, this.kill);
		this.listenTo(meenoAppCli.dispatcher, 'tab:object:key:' + this.$el.attr('id'), this.keyProxy);

		console.log ('Init[emb_tag]');
	},

	render: function() {
		console.log ("R[emb-tag]");
		this.$el.attr('id', this.options.id);
		var templateData = {
			id: this.options.id
		}
		var templateFn = _.template( $(this.template).html() );
		this.$el.html( templateFn( templateData ) );
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
				var pattern = new RegExp(strHint,"i");
				var proposals = meenoAppCli.tags.filter(function (tag) {
					return pattern.test(tag.get('label'));
				});
				var datalistOptions = proposals.map(function (obj, key) { 
					return "<option class='trick' data-model-id='"+obj.get('_id')+"' value='"+obj.get('label')+"'>"+obj.get('label')+"</option>"; 
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
					console.log('...Removing locked tag...');
					this.unlink();
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
				console.log("nb of charss in input:"+this.$el.find('.body').val().length)
				console.log("nb of charss in input:"+this.$('input').val().length)
				if (this.$('.body').val().length > 2) {
				// We save only tags of more than 2 characters
					return this.freeze();
				}
				console.log('won\'t lock')
			}
		}
	},

		// Apparemment buggé, reste à déterminer pourquoi.
	freeze: function () {
		console.log('############# Locking object #############');

		var view = this;
		var existing = meenoAppCli.tags.find(function (tag) {
			return tag.get('label') == this.$(".body").val() 
		});

		if (existing == undefined) {
			console.log('## Creating new tag');
			this.model.set({
				label  :this.$(".body").val()
			});
			meenoAppCli.tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
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
		console.log('--trying to link tag')
		// var view = this;
		// this.options.note.add('tags', this.model);
		
		// var lion = new Animal( { species: 'Lion', livesIn: artis } );
		this.options.note.get('tagLinks').add( { tag: this.model } );
		/*
		var newLink = new meenoAppCli.Classes.linkNoteTag ({ 
			note: this.options.note,
			tag: this.model
		});*/

		this.options.note.save({},{
			success: callbacks.success,
			error  : callbacks.error
		});
	},

	unlink: function (note, callbacks) {
		console.log('--trying to unlink tag')
		var view = this;
		note.add('tags', this.model);
		note.save({},{
			success: callbacks.success,
			error  : callbacks.error
		});
	}
});