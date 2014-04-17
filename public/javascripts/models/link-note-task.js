var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A link object between 'Note' and 'Task'
meenoAppCli.Classes.LinkNoteTask = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});