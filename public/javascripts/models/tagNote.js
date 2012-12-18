// js/models/tag-note.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// Link model to create a many-to-many relationship between Notes and Tags
meenoAppCli.Classes.TagNote = Backbone.RelationalModel.extend({
	idAttribute: "_id"
});