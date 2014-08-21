var mee = mee || {};
mee.cla = mee.cla || {};

// A link object between 'Note' and 'Tag'
mee.cla.LinkNoteTag = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});