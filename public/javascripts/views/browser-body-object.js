var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyObjectView = Backbone.View.extend({
	tagName  : 'li',

	// The DOM events specific to an item.
	events: {
		'click .checkbox': 'check',
		'click .edit'    : 'edit'
	},

	initialize: function() {
		this.listenTo(this.model, 'add:tagLinks remove:tagLinks change:title', this.render);
		this.listenTo(meenoAppCli.dispatcher, 'browser:notes:delete', function () {this.deleteIfSelected("notes")});
		this.listenTo(meenoAppCli.dispatcher, 'browser:tags:delete', function () {this.deleteIfSelected("tags")});
		this.listenTo(meenoAppCli.dispatcher, 'browser:taks:delete', function () {this.deleteIfSelected("taks")});
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