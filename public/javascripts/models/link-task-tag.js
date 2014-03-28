var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A link object between 'Task' and 'Tag'
meenoAppCli.Classes.LinkTaskTag = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});