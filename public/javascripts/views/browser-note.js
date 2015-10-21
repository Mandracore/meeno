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
					'click .edit'           : 'edit',
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
					tags: _.map(this.model.get('tagLinks').pluck('tag'), function(tag) {return tag.get('label')})
				};

				var templateFn = _.template( $(this.template).html() );
				this.$el.html (templateFn (json));

				return this;
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