var mee = mee || {};
mee.cla = mee.cla || {};

// A link object between 'Note' and 'Task'
mee.cla.LinkNoteTask = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});