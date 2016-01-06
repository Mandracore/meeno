define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
		'views/browser-object',
		'views/editor',
	], function ($, _, Backbone, channel, BrowserObjectView, EditorView) {

		/**
		 * Displays notes in the browser.
		 * 
		 * @class BrowserNoteView
		 * @extends BrowserObjectView
		 */
		var BrowserNoteView = BrowserObjectView.extend({

			template : '#browser-note-template',

			events: function(){
				return _.extend({},BrowserObjectView.prototype.events,{
					'click .label'         : 'expand',
					'click .reduce'        : 'reduce',
					'click .label .cancel' : 'editLabelCancel',
					'click .tags .cancel'  : 'editTagsCancel',
					'click .label .save'   : 'editLabelSubmit',
					'click .tags .link'    : 'editTagsSubmit',
				});
			},

			initialize: function(options){
				BrowserObjectView.prototype.initialize.apply(this, [options])
				this.options = options;
				this.listenTo(this.model, 'add:tagLinks remove:tagLinks change:title', this.render);
				this.listenTo(this.model, 'change:title change:position', this.render);
			},

			render: function () {
				// var json        = this.model.toJSON();
				// json.created_at = json.created_at.toString('dddd, MMMM ,yyyy');
				var json = {
					note: this.model.toJSON(),
					tags: _.map(this.model.get('tagLinks').pluck('tag'), function(tag) {
						return {
							'cid'   : tag == null ? null : tag.cid,
							'label' : tag == null ? "BROKEN" : tag.get('label'),
							'color' : tag == null ? "#000000" : tag.get('color'),
					}}),
				};

				var templateFn = _.template( $(this.template).html() );
				this.$el.html (templateFn (json));

				return this;
			},

			/**
			 * Expand the note to allow quick edition
			 * 
			 * @method expand
			 */
			expand: function() {
				if(!this.$el.hasClass('expanded')) {
					this.$el.addClass('expanded');
					this.$('.label input').focus().select();
					this.listenStart();
				}
			},

			/**
			 * Initialize event listeners
			 * In order to minimize the number of listeners, each browser object view only starts listening
			 * when they are maximized.
			 * Listen to the `input` event (any change, inc. copy/paste) of the inputs
			 * and do the right actions (display form controls or not)
			 * 
			 * @method listenStart
			 */
			listenStart: function() {
				var self = this;

				// Listen to the keyboard events
				this.listenTo(channel, 'keyboard:enter', function () {this.kbEventProxy("enter");});
				this.listenTo(channel, 'keyboard:escape', function () {this.kbEventProxy("escape");});

				// Init the autocomplete
				this.editTagsAutocompleteInit();

				// Listen to the `input` event (any change, inc. copy/paste) of the inputs
				// and do the right actions (display form controls or not)
				this.$('.label input').on('input', function() {
					if(self.model.get('title') != $(this).val()) {
						$(this).closest('.label').addClass('updated');
					} else {
						$(this).closest('.label').removeClass('updated');
					}
				});
				this.$('.tags input').on('input', function() {
					if($(this).val() != "") {
						$(this).closest('.tags').addClass('updated');
					} else {
						$(this).closest('.tags').removeClass('updated');
					}
				});
			},

			/**
			 * Destroy event listeners
			 * 
			 * @method listenStop
			 */
			listenStop: function() {
				this.stopListening(channel, 'keyboard:enter');
				this.stopListening(channel, 'keyboard:escape');
				this.editTagsAutocompleteKill();
				this.$('.label input').off('input');
				this.$('.tags input').off('input');
			},

			/**
			 * A proxy meant to interpret all keyboard events received and to dispatch them seamlessly
			 * 
			 * @method kbEventProxy
			 */
			kbEventProxy: function(event) {
				var $inputEditLabel = this.$(".form .label input");
				var $inputEditTags  = this.$(".form .tags input");

				// 1. The user is updating the label
				if ($inputEditLabel.is(":focus")) {
					if (event == "escape") {
						this.$('.form .label input').blur(); // Mandatory to blur the input or it triggers infinite loop with the input event
						this.editLabelCancel();
						return;
					}
					if (event == "enter") {
						this.editLabelSubmit();
						return;
					}
				}

				// 2. The user is updating the tags
				if ($inputEditTags.is(":focus")) {
					// 2.1 The user wants to rollback
					if (event == "escape") {
						this.$('.form .tags input').blur();
						this.editTagsCancel(); // Mandatory to blur the input or it triggers infinite loop with the input event
						return;
					}
					// 2.2 The user wants to link a tag that doesn't exist to the current task
					// Will handle what happens if the user keyes in ENTER in the input, which bypasses the autocomplete, 
					// whether the autocomplete provided a match or not
					if (event == "enter") {
						this.editTagsSubmit ();
					}
				}
			},

			/**
			 * Empty the label's input
			 * 
			 * @method editLabelSubmit
			 */
			editLabelSubmit: function() {
				this.model.set('title', this.$('.form .label input').val());
				this.model.save();
				this.render();
			},

			/**
			 * Empty the label's input
			 * 
			 * @method editLabelCancel
			 */
			editLabelCancel: function() {
				this.$('.form .label input').val(this.model.get('title')).trigger('input').focus().select();
			},

			/**
			 * Empty the tags' input
			 * 
			 * @method editTagsCancel
			 */
			editTagsCancel: function() {
				this.$('.form .tags input').val('').trigger('input').focus();
			},


			/**
			 * reduce the note
			 * 
			 * @method reduce
			 */
			reduce: function() {
				if(this.$el.hasClass('expanded')) {
					this.$el.removeClass('expanded');
					this.listenStop();
				}
			},
/*
			edit: function() {
				var newEditor = new EditorView ({ model: this.model });
				$("#editors").append(newEditor.render().el);
				newEditor.updateEditorsClass(function () {
					newEditor.show();	
				});
				this.model.set('isOpened',true);
			}
*/
		});

		return BrowserNoteView;
	}
);