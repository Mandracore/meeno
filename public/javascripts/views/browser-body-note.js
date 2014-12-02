define ([
		'jquery',
		'underscore',
		'backbone',
		'channel',
		'views/browser-body-object',
		'views/editor',
	], function ($, _, Backbone, channel, BrowserBodyObjectView, EditorView) {

		/**
		 * Displays notes in the browser.
		 * 
		 * @class BrowserBodyNoteView
		 * @extends BrowserBodyObjectView
		 */
		var BrowserBodyNoteView = BrowserBodyObjectView.extend({

			template : '#browser-body-note-template',

			events: function(){
				return _.extend({},BrowserBodyObjectView.prototype.events,{
					'click .edit'           : 'edit',
				});
			},

			initialize: function(options){
				BrowserBodyObjectView.prototype.initialize.apply(this, [options])
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
				newEditor.render();
				newEditor.toggle();
			}
		});

		return BrowserBodyNoteView;
	}
);