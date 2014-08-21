var mee = mee || {};
mee.cla = mee.cla || {};

// A link object between 'Task' and 'Tag'
mee.cla.LinkTaskTag = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});