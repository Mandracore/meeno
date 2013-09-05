var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({

	tagName   :'span',
	className :'object tag icon-tag',
	template  :'#emb-tag-template',

	// The DOM events specific to an item.
	events: {
		'input': 'autocomplete',
		'blur .body': 'tryLock'
	},

	keyboardEvents: {
		'esc'       : 'tryDelete',
		'enter'     : 'tryLock',
		'backspace' : 'tryDelete',
		'del'       : 'tryDelete'
	},

	initialize: function() {
		Backbone.View.prototype.initialize.apply(this, arguments);
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
		this.$el.attr('contentEditable',false);
		var templateData = {
			id: this.options.id
		};
		var templateFn = _.template( $(this.template).html() );
		this.$el.html( templateFn( templateData ) );
		return this;
	},

	autocomplete: function() {
		console.log('autocomplete');
		//-------------------------------
		// Autocomplete in other cases
		//-------------------------------
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
	},

	tryLock: function( event ){
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
		var existing = meenoAppCli.tags.find(function (tag) {
			return tag.get('label') == this.$(".body").val() 
		});

		if (!existing) {
			console.log('## Creating new tag');
			this.model.set({
				label  :this.$(".body").val()
			});
			meenoAppCli.tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
			this.model.save({},{ // Now that the model is into a collection, the .save() method will work
				success: function(model, response, options) {
					view.link ({
						success: function () {
							view.transform(view.model.get('label'));
							view.clean();
							view.lock();
							view.options.parent.save();
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
					view.options.parent.save();
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
		console.log('--trying to unlink tag');
		var view = this;
		note.add('tags', this.model);
		note.save({},{
			success: callbacks.success,
			error  : callbacks.error
		});
	}
});