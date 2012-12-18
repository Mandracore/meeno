// js/collections/notes.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.Tags = Backbone.Collection.extend({
	model: meenoAppCli.Classes.Tag, 
	url: '/api/tags',
});