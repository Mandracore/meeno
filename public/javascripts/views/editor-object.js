define ([
	// path aliases preconfigured in ../main.js
		'jquery',
		'underscore',
		'backbone',
		'temp',
		'lib/tools',
		'models/task',
		'models/tag',
	], function ($, _, Backbone, temp, tools, Task, Tag) {
		var EditorBodyObjectView = Backbone.View.extend({
			// this.options.modelClass = 'tag' OR 'task'
			tagName  :'span',
			className:'object',
			template : '#editor-body-object-template',

			// The DOM events specific to an item.
			events: {
				'input'    : 'autocomplete',
				'keypress' : 'keyProxy'
			},

			initialize: function(options) {
				this.options = options;
				//this.options.isLocked
				//this.options.id
				//this.options.parentDOM
				//this.options.note
				//this.options.modelClass
				this.options.isLocked = false;
				Backbone.View.prototype.initialize.apply(this, arguments);

				if (this.model) {
					this.options.id = this.$el.attr('id');
					this.options.isLocked = true;
					this.listenTo(this.model, 'change', this.render);
					this.listenTo(this.model, 'remove', this.kill);
				} else {
					this.options.id = tools.makeid();
				}
				this.listenTo(this.options.note, 'change:content', this.checkChanges);
			},

			checkChanges: function () {
				if (this.options.parentDOM.find(this.$el).length === 0) {
					console.log(this.cid+"'s DOM element has been removed");
					if (!this.model) {
						this.kill();
					} else {
						this.unlink();
					}
				}
				else {console.log(this.cid+"'s DOM element still exists");}
			},

			/**
			 * Filters the keyboard events to pass only ENTER and TAB to the lock() method
			 * @param  {keyboard event} event The keyboard event
			 * @return {void}
			 */
			keyProxy: function(event) {
				if (event.keyCode == 13 || event.keyCode == 9) {
					this.lock();
				}
			},

			render: function() {
				console.log ('TTTR[emb-'+this.options.modelClass+']');
				this.$el.attr('id', this.options.id);
				this.$el.attr('contentEditable',false);

				var hTemplate        = $(this.template).html();
				var compiledTemplate = _.template(hTemplate);
				this.$el.html( compiledTemplate({ id:this.options.id }) );

				if (!this.$el.hasClass(this.options.modelClass)) { this.$el.addClass(this.options.modelClass); }
				if (!this.$el.hasClass('icon-'+this.options.modelClass+'s')) { this.$el.addClass('icon-'+this.options.modelClass+'s'); }
				return this;
			},

			autocomplete: function() {
				var strHint = (this.$(".body").val());
				if (strHint.length > -1) {
					var pattern = new RegExp(strHint,"i");
					var proposals = temp.coll[this.options.modelClass+'s'].filter(function (model) {
						return pattern.test(model.get('label'));
					});
					var datalistOptions = proposals.map(function (obj, key) {
						return "<option class='trick' data-model-id='"+obj.get('_id')+"' value='"+obj.get('label')+"'>"+obj.get('label')+"</option>";
					});
					this.$(".datalist").html(datalistOptions);
				}
			},

			error: function (msg) {
				console.error(msg);
				this.$el.addClass("broken");
			},

			/**
			 * Triggered once the user finishes typing in the new object.
			 * Used as a proxy to either link the note to a new object, or to create a new object
			 * @param  {keyboard event} event The keyboard event
			 * @return {void}
			 */
			lock: function (event) {
				console.log("locking");
				var self = this;
				if (!this.options.isLocked) {
					if (this.$('.body').val().length <= 2) {
						console.log('##WARNING## '+this.options.modelClass+' too short to lock'); // We save only tasks/tags of more than 2 characters
					} else {
						console.log('______ Locking Object ______');

						var selectedModel = temp.coll[this.options.modelClass+'s'].find(function (model) {
							return model.get('label') == self.$(".body").val();
						});

						if (!selectedModel) {
						// If the model doesn't exist, we create it
							console.log('--- Creating new '+this.options.modelClass+' ---');
							
							if (this.options.modelClass == "task") {
								this.model = new Task ({
									label : this.$(".body").val()
								});
								temp.coll.tasks.shiftDown(this.model);
							} else {
								this.model = new Tag ({
									label : this.$(".body").val()
								});
							}
							temp.coll[this.options.modelClass+'s'].add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
							
							// Now that the model is into a collection, the .save() method will work
							this.model.save({}, {
								success: function () { 
									console.log ("[OK] "+self.options.modelClass+" successfully created");
									self.link();
								},
								error  : function () { self.error("### Impossible to link "+self.options.modelClass); }
							});
						} else {
						// The model already exists, so we retrieve it
							if (_.contains(selectedModel.get('noteLinks').pluck('note'), this.options.note)) {
								console.log(this.options.modelClass+' already linked to this note');
								return;
							}
							this.model = selectedModel;
							this.link();
						}
					}
				}
			},

			link: function () {
				// Linking view's model (created or retrieved) to the note
				var self = this;
				console.log('------ trying to link '+this.options.modelClass);
				
				if (this.options.modelClass == "tag") {
					this.options.note.get('tagLinks').add( { tag: this.model } );
				} else {
					this.options.note.get('taskLinks').add({ task : this.model });
				}

				this.options.note.save({},{ 
					success: function () {
						var $newSpan = $("<span>",{class:"body"}).html(self.model.get('label'));
						self.$(".body").parent().remove();
						self.$el.append($newSpan);
						self.$el.removeClass("broken");
						self.$el.addClass("locked");
						self.$el.attr("data-model-id",self.model.get("_id"));
						self.isLocked = true;
						tools.moveCaret (self.$el.next()[0], 1); // Moving the caret out of the object
						console.log("[OK] "+self.options.modelClass+' "'+self.model.get('label')+'" linked to current note');
						self.options.isLocked = true;
					},
					error  : function () {self.error("### Impossible to link "+self.options.modelClass);}
				});
			},

			unlink: function () {
				var self = this;
				var link2remove = this.model.get('noteLinks').find(function(noteLink){return noteLink.get(self.options.modelClass) == self.model; });
				//this.model.get('noteLinks').remove(link2remove);
				link2remove.destroy({},{
					success: function () {console.log('Object successfully unlinked');self.kill();},
					error: function () {console.error('Impossible to unlink object');self.kill();}
				});
			}
		});

		return EditorBodyObjectView;
	}
);
