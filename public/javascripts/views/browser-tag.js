define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
		'views/browser-object',
	], function ($, _, Backbone, channel, BrowserObjectView) {

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
					'click .edit'    : 'edit',
					'click .delete'  : 'delete',
					'blur .label'    : 'save'
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

				/**
				 * Event triggered on `channel` when this.render() method is called
				 * @event browser:tags:reSyncSelectors
				 */
				channel.trigger("browser:tags:reSyncSelectors");
				return this;
			},

			/**
			 * Displays an input to edit the tag label
			 *
			 * @method edit
			 */
			edit: function() {
				console.log('edit');
				this.$("span.label").attr('contenteditable','true').focus().select();
				document.execCommand('selectAll',false,null);
			},

			/**
			 * Sets the view's model label to the input (`span.label`) value and saves the model
			 *
			 * @method save
			 */
			save: function() {
				this.$("span.label").attr('contenteditable','false');
				console.log('save');
				this.model.set({
					label  :this.$("span.label").html()
				}).save({},{
					success: function() {
						console.log('save success');
					},
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
				mee.Tags.remove(this.model);
				this.remove();
			},
		});

		return BrowserTagView;
	}
);