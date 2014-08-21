var mee = mee || {};
mee.cla = mee.cla || {};

/**
 * This class retains all core features for displaying objects views in the browser.
 * Several classes will inherit from it, one per kind of business object :
 * - mee.cla.BrowserBodyNoteView
 * - mee.cla.BrowserBodyTaskView
 * - mee.cla.BrowserBodyTagView
 * - ...
 * 
 * @class mee.cla.BrowserBodyObjectView
 * @extends Backbone.View
 */
mee.cla.BrowserBodyObjectView = Backbone.View.extend({
	tagName  : 'li',

	// The DOM events specific to an item.
	events: {
		'click .checkbox': 'check',
		'click .edit'    : 'edit'
	},

	initialize: function() {
		this.collName = undefined;
		// this.listenTo(this.model, 'add:tagLinks remove:tagLinks change:title', this.render);
		this.listenTo(this.model, 'change:title change:position', this.render);
		this.listenTo(mee.dispatcher, 'browser:notes:delete', function () {this.deleteIfSelected("notes")});
		this.listenTo(mee.dispatcher, 'browser:tags:delete', function () {this.deleteIfSelected("tags")});
		this.listenTo(mee.dispatcher, 'browser:taks:delete', function () {this.deleteIfSelected("taks")});
	},

	deleteIfSelected: function(collName) {
		if (collName == this.collName && this.$('span.checkbox').hasClass("icon-check")) {
			this.model.destroy();
			this.kill();
		}
	},

	check: function() {
		if (this.$("span.checkbox").hasClass('icon-check')) {
			this.$("span.checkbox").removeClass('icon-check');
			this.$("span.checkbox").addClass('icon-check-empty');
		} else {
			this.$("span.checkbox").removeClass('icon-check-empty');
			this.$("span.checkbox").addClass('icon-check');
		}
	}
});