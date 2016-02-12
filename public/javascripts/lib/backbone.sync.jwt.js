define([
	'backbone',
	'lib/auth',
	], function (Backbone, Auth) {
    'use strict';

    /*
     * Store a version of Backbone.sync to call from the
     * modified version we create
     */
    var backboneSync = Backbone.sync;

    Backbone.sync = function (method, model, options) {
        /*
         * The jQuery `ajax` method includes a 'headers' option
         * which lets you set any headers you like
         */
        options.headers = {
            /* 
             * Set the 'x-access-token' header and get the access
             * token from the `Auth` module
             */
            'x-access-token': Auth.tokenGet()
        };

        /*
         * Call the stored original Backbone.sync method with
         * extra headers argument added
         */
        backboneSync(method, model, options);
    };
});