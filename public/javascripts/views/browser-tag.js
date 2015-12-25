define ([
		'jquery',
		'simplecolorpicker',
		'underscore',
		'backbone',
		'channel',
		'views/browser-object',
	], function ($, $, _, Backbone, channel, BrowserObjectView) {

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
					'click .edit'                       : 'editLabel',
					'click .controls .cancel'           : 'editLabelCancel',
					'click .controls .save'             : 'editLabelSave',
					'click .colorpicker .fa-eyedropper' : 'editColor',
					'click .colorpicker .fa-remove'     : 'editColorCancel',
					'click .delete'                     : 'delete'
				});
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
					this.$el.addClass("coloring");
					this.$('select').simplecolorpicker();
				}
			},

			/**
			 * Hides the colorpicker
			 *
			 * @method editColorCancel
			 */
			editColorCancel: function() {
				this.$el.removeClass("coloring");
				this.$('select').simplecolorpicker('destroy');
				this.$('select').hide();
			},

			/**
			 * Select all text displayed in the label input
			 *
			 * @method editLabel
			 */
			editLabel: function() {
				this.$el.addClass("editing");
				this.$(".input input").focus().select();
			},

			/**
			 * Select all text displayed in the label input
			 *
			 * @method editLabelCancel
			 */
			editLabelCancel: function() {
				this.$el.removeClass('editing')
			},

			/**
			 * Sets the view's model label to the input (`span.label`) value and saves the model
			 *
			 * @method editLabelSave
			 */
			editLabelSave: function() {
				this.model.set({
					label  :this.$(".input input").val()
				}).save({},{
					error  : function() {
						console.log('save error');
					}
				});
			},

			/**
			 * Will destroy the view's model and the view itself when the user clics on `.delete` class DOM element
			 *
			 * @method delete
			 */
			delete: function() {
				this.model.destroy();
				this.remove();
			},
		});

		return BrowserTagView;
	}
);