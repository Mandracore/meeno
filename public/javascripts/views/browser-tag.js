define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
		'temp',
		'views/browser-object',
	], function ($, _, Backbone, channel, temp, BrowserObjectView) {

		/**
		 * A backbone view to display one tag in the browser
		 * 
		 * @class BrowserTagView
		 * @extends BrowserObjectView
		 */
		var BrowserTagView = BrowserObjectView.extend({

			template : '#browser-tag-template',

			events: function(){
				return _.extend({},BrowserObjectView.prototype.events,{
					'click .expand'                     : 'editLabel',
					'click .form .actions .cancel'      : 'editLabelCancel',
					'click .form .actions .save'        : 'editLabelSubmit',
					'click .colorpicker .fa-eyedropper' : 'editColor',
					'click .colorpicker .color'         : 'editColorSelect',
					'click .colorpicker .fa-remove'     : 'editColorCancel',
					'click .delete'                     : 'delete'
				});
			},

			initialize: function(options){
			},

			/**
			 * Renders one tag : generates the HTML and appends it to the DOM element of the view
			 *
			 * @method render
			 * @chainable
			 */
			render: function() {
				this.collName = "tags";
				var templateFn = _.template( $(this.template).html() );
				this.$el.html (templateFn (this.model.toJSON()));
				return this;
			},

			/**
			 * Display inline colorpicker when the user clicks on the eyedropper
			 *
			 * @method editColor
			 */
			editColor: function() {
				if (!this.$el.hasClass("coloring")) {
					if (this.$el.hasClass("editing")) {
						this.$el.removeClass("editing");
					}
					this.$el.addClass("coloring");
				}
			},

			/**
			 * Update tag's color to match the one selected by the user
			 *
			 * @method editColorSelect
			 */
			editColorSelect: function(event) {
				this.editColorCancel();
				this.model.set({
					color: $(event.target).attr('data-color'),
				}).save({},{
					error  : function() {
						console.log('save error');
					},
					success  : function() {
						//console.log('save success');
					}
				});				
			},

			/**
			 * Hides the colorpicker
			 *
			 * @method editColorCancel
			 */
			editColorCancel: function() {
				this.$el.removeClass("coloring");
			},

			/**
			 * Select all text displayed in the label input
			 *
			 * @method editLabel
			 */
			editLabel: function() {
				if (!this.$el.hasClass("editing")) {
					this.$el.addClass("editing");
					this.$(".input input").focus().select();
					this.listenStart();
				}
			},

			/**
			 * Select all text displayed in the label input
			 *
			 * @method editLabelCancel
			 */
			editLabelCancel: function() {
				this.$el.removeClass('editing');
				this.$('.form .label input').val(this.model.get('label'));
				this.$('.form .label').removeClass('updated');
				this.listenStop();
			},

			/**
			 * Sets the view's model label to the input (`span.label`) value and saves the model
			 *
			 * @method editLabelSubmit
			 */
			editLabelSubmit: function() {
				this.model.set({
					label  :this.$(".form .label input").val(),
				}).save({},{
					error  : function() {
						console.log('save error');
					}
				});
			},
		});

		return BrowserTagView;
	}
);