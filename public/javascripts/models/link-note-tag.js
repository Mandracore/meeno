var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// A link object between 'Note' and 'Tag'
meenoAppCli.Classes.LinkNoteTag = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});