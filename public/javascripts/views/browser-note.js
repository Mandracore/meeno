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
					'click .label'  : 'expand',
					'click .reduce' : 'reduce',
				});
			},

			/*
			 ADD NEW EVENT LISTENER TO TOGGLE FORM CONTROLS : WHENEVER THE INPUT DIFFERS FROM IDLE, DISPLAY CONTROLS




			*/

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
			expand: function(date) {
				if(!this.$el.hasClass('expanded')) {
					this.$el.addClass('expanded');
					this.listenStart();
				}
			},

			/**
			 * Listen to the `input` event (any change, inc. copy/paste) of the inputs and do the right actions (display form controls or not)
			 * 
			 * @method listenStart
			 */
			listenStart: function(date) {
				this.$('.label input').on('input', function() {
					alert('label changed!');
				});
				this.$('.tags input').on('input', function() {
					alert('tags changed!');
				});
			},

			/**
			 * Stop listening to the `input` event (any change, inc. copy/paste) of the inputs
			 * 
			 * @method listenStop
			 */
			listenStop: function(date) {
				this.$('.label input').off('input');
				this.$('.tags input').off('input');
			},

			/**
			 * reduce the note
			 * 
			 * @method reduce
			 */
			reduce: function(date) {
				if(this.$el.hasClass('expanded')) {
					this.$el.removeClass('expanded');
					this.listenStop();
				}
			},

			edit: function() {
				var newEditor = new EditorView ({ model: this.model });
				$("#editors").append(newEditor.render().el);
				newEditor.updateEditorsClass(function () {
					newEditor.show();	
				});
				this.model.set('isOpened',true);
			}
		});

		return BrowserNoteView;
	}
);