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
					'click .open button'   : 'open',
					'click .delete button' : 'delete',
					'click .label'         : 'expand',
					'click .reduce'        : 'reduce',
					'click .label .cancel' : 'editLabelCancel',
					'click .tags .cancel'  : 'editTagsCancel',
					'click .label .save'   : 'editLabelSubmit',
					'click .tags .link'    : 'editTagsSubmit',
				});
			},

			initialize: function(options){
				//this.listenTo(this.model, 'add:tagLinks remove:tagLinks change:title', this.render);
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

			/**
			 * Update the model's label attribute
			 * 
			 * @method editLabelSubmit
			 */
			editLabelSubmit: function() {
				this.$('.form .label').removeClass('updated');
				this.model.set('title', this.$('.form .label input').val());
				this.model.save();
				this.reduce();
				this.render();
				this.expand();
			},

			/**
			 * Reset the label's input
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
			 * Open the note's editor
			 * 
			 * @method open
			 */
			open: function() {
				var newEditor = new EditorView ({ model: this.model });
				$("#editors").append(newEditor.render().el);
				$("#editors-tabs").children().eq(0).find("span.open").click();
				this.model.set('isOpened',true);
			}
		});

		return BrowserNoteView;
	}
);