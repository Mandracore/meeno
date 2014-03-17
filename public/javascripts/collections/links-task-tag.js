var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.LinksTaskTag = Backbone.Collection.extend({
	model: meenoAppCli.Classes.LinkTaskTag,
	url: '/api/links-task-tag',
});