// This file aims at setting up Require.js and loading initially important dependancies for testing
// Modules are loaded relatively to this boot strap and always append with ".js". So the module "app" will load "app.js" which is in the same directory as the bootstrap.

// Configuring aliases for most important modules and libraries to load
require.config({
	baseUrl: "../../public/javascripts/",
	urlArgs: 'cb=' + Math.random(),
	paths: {
		jquery               : 'lib/jquery-1.8.3.min',
		'jquery.ui'          : 'lib/jquery-ui-1.10.3.custom.min',
		'jquery.dateFormat'  : 'lib/jquery.dateFormat-1.0',
		underscore           : 'lib/underscore',
		backbone             : 'lib/backbone',
		'backbone.custom'    : 'backbone.custom',
		'backbone.relational': 'lib/backbone-relational',
		'backbone.mousetrap' : 'lib/backbone.mousetrap',
		mousetrap            : 'lib/mousetrap.min',
		jasmine              : '../../test/client/lib/jasmine-1.3.1/jasmine',
		'jasmine-html'       : '../../test/client/lib/jasmine-1.3.1/jasmine-html',
		'jasmine-jquery'     : '../../test/client/lib/jasmine-jquery',
		spec                 : '../../test/client/spec/',
	},
	shim: {
		'jquery.ui': {
			deps: ['jquery'],
			exports: '$'
		},
		'jquery.dateFormat': {
			deps: ['jquery'],
			exports: '$'
		},
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'backbone.relational': {
			deps: ['backbone'],
			exports: 'Backbone'
		},
		'backbone.mousetrap': {
			deps: ['backbone'],
			exports: 'Backbone'
		},
		jasmine: {
			exports: 'jasmine'
		},
		'jasmine-html': {
			deps: ['jasmine'],
			exports: 'jasmine'
		},
		'jasmine-jquery': {
			deps: ['jasmine'],
			exports: 'jasmine'
		},
	}
});


require([
		'underscore', 'jquery', 'jasmine-html', 'jasmine-jquery'
	],function(_, $, jasmine){

	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	var specs = [];

	// Specs to be executed must be defined hereafter
	// specs.push('spec/app');
	specs.push('spec/model.spec');
	specs.push('spec/view-browser');
	// specs.push('spec/view-editor');

	$(function(){
		require(specs, function(){
			jasmineEnv.execute();
		});
	});

});