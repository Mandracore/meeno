var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: "/base/public/javascripts/",
  paths: {
    'test'               : '../../test',
    jquery               : 'lib/jquery-1.8.3.min',
    'jquery.ui'          : 'lib/jquery-ui-1.10.3.custom.min',
    'jquery.dateFormat'  : 'lib/jquery.dateFormat-1.0',
    underscore           : 'lib/underscore',
    backbone             : 'lib/backbone',
    'backbone.relational': 'lib/backbone-relational',
    'backbone.mousetrap' : 'lib/backbone.mousetrap',
    mousetrap            : 'lib/mousetrap.min'
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
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});

