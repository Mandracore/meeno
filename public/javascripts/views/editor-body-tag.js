var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({

	tagName   :'span',
	className :'object tag icon-tag',
	template  :'#emb-tag-template',

	// The DOM events specific to an item.
	events: {
		'input'    : 'autocomplete',
		'keypress' : 'keyProxy'
	},

	// Mousetrap is not working since it can't act on a reduced scope of the DOM
	/*keyboardEvents: {
		'esc'       : 'delete',
		'enter'     : 'lock',
		'backspace' : 'delete',
		'del'       : 'delete'
	},*/

	initialize: function() {
		this.options.isLocked = false;
		Backbone.View.prototype.initialize.apply(this, arguments);
		this.options.class = "emb-tag";

		if (this.model) {
			this.options.id = this.$el.attr('id');
			this.options.isLocked = true;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'remove', this.kill);
		} else {
			this.options.id = makeid();
		}
		this.listenTo(this.options.note, 'change:content', this.checkChanges);

		console.log ('Init[emb_tag]');
		console.log (this.el);
		console.log (this.options.id);
	},

	checkChanges: function () {
		console.log('======Checking DOM changes')
		if (this.options.parentDOM.find(this.$el).length == 0) {
			console.log("DOM not found");
			if (this.model) {this.kill();}
			this.unlink();
		}
		else {console.log('DOM found')}
	},

	keyProxy: function() {
		console.log('keyProxy')
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
	},

	// delete: function () {
	// 	if (this.options.isLocked) {
	// 		console.log('============== Removing locked tag ==============');
	// 		console.log(this);
	// 		this.unlink();
	// 		this.kill();
	// 	}
	// },

	error: function (msg) {
		console.error(msg);
		this.$el.addClass("broken");
	},

	lock: function (event) {console.log("locking")
		if (!this.options.isLocked) {
			if (this.$('.body').val().length <= 2) {
				// We save only tags of more than 2 characters
				console.log('##WARNING## tag too short to lock');
			} else {
				console.log('______ Locking Object ______');

				var view = this;
				var selectedModel = meenoAppCli.tags.find(function (tag) {
					return tag.get('label') == this.$(".body").val() 
				});

				if (!selectedModel) {
					console.log('--- Creating new tag ---');
					this.model = new meenoAppCli.Classes.Tag({
						label : this.$(".body").val()
					});
					meenoAppCli.tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
					this.model.save({},{ // Now that the model is into a collection, the .save() method will work
						success: function () {view.link ();},
						error  : function () {view.error("Impossible to save new model");}
					});
				} else {
					console.log('--- Linking to selected tag ---');
					this.model = selectedModel;
					this.link ();
				}
			}
		}
	},

	link: function () {
		console.log('------ trying to link tag');
		var self = this;
		this.options.note.get('tagLinks').add( { tag: this.model } );
		this.options.note.save({},{
			success: function () {
				var $newSpan = $("<span>",{class:"body"}).html(self.model.get('label'));
				self.$(".body").parent().remove();
				self.$el.append($newSpan);
				self.$el.removeClass("broken");
				self.$el.addClass("locked");
				self.$el.attr("data-model-id",self.model.get("_id"));
				self.isLocked = true;
				moveCaret (self.$el.next()[0], 1); // Moving the caret out of the object
				console.log('Tag "'+self.model.get('label')+'" linked to current note');
				self.options.isLocked = true;
				self.options.parent.save();
			},
			error: function () {self.error('Impossible to link new Tag "'+self.model.get('label')+'" to current note');}
		});
	},

	unlink: function () {
		console.log('------ trying to unlink tag ------');
		this.options.note.get('tagLinks').remove( 
			this.options.note.get('tagLinks').find(function(tagLink){return tagLink.get('tag') == this.model }) );
		this.options.note.save ({},{
			success: console.log('Object successfully unlinked'),
			error  : console.error ('Impossible to unlink object')
		});
	}
});