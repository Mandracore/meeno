define ([
		'jquery',
		'underscore',
		'backbone',
		'mousetrap',
		'channel',
		'temp',
		'views/helper',
		'views/browser',
		'views/editor',
	], function ($, _, Backbone, Mousetrap, channel, temp, HelperView, BrowserView, EditorView) {

		/**
		 * This backbone view holds the entire UI.
		 * 
		 * @class MainView
		 * @extends Backbone.View
		 */
		var MainView = Backbone.View.extend({

			// Instead of generating a new DOM element, bind to the existing skeleton of
			// the App already present in the HTML.
			el: '#meenoApp',

			events: {
				'submit #login'                   : 'login',
				'submit #register'                : 'register',
				'click #toregister'               : 'toggleLR',
				'click #tologin'                  : 'toggleLR',
				'click #nav .browse'              : 'browse',
				'click #editors-tabs > li .open'  : 'editorOpen',
				'click #editors-tabs > li .close' : 'editorClose',
			},

			initialize: function() {
				this.auth                 = false;
				this.logging              = false;
				this.registering          = false;

				Mousetrap.bind('# #', function() {
					channel.trigger('keyboard:tag');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind('@ @', function() {
					channel.trigger('keyboard:entity');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind('& &', function() {
					channel.trigger('keyboard:task');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind('§ §', function() {
					channel.trigger('keyboard:header');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind(['escape'], function() {
					channel.trigger('keyboard:escape');
				});
				Mousetrap.bind(['backspace'], function() {
					channel.trigger('keyboard:backspace');
				});
				Mousetrap.bind('enter', function() {
					channel.trigger('keyboard:enter');
				}, 'keydown');

				// Make sur that all sync errors are caught (probably because of missing authorization)
				this.listenTo(temp.coll.tags, 'request', this.beforeSyncCallback);
				this.listenTo(temp.coll.tasks, 'error', this.syncCallback);
				this.listenTo(temp.coll.tags, 'error', this.syncCallback);
				this.listenTo(temp.coll.notes, 'error', this.syncCallback);
				this.listenTo(temp.coll.noteFilters, 'error', this.syncCallback);
				this.listenTo(temp.coll.taskFilters, 'error', this.syncCallback);
				this.listenTo(temp.coll.tagFilters, 'error', this.syncCallback);

				this.fetchData();
			},

			/**
			 * To make sure the token is sent on every request (if it exists)
			 *
			 * @method beforeSyncCallback
			 */
			beforeSyncCallback: function (coll, xhr, options) {
				console.log(xhr);
			},

			/**
			 * To save the token received after successful login or registering
			 *
			 * @method syncCallback
			 */
			syncCallback: function (coll, resp, options) {
				if (resp.status == 401) {
					console.log ("Unauthorized, displaying user authentification form");
					this.toggleAuth();
				} else {
					alert('Error: impossible to communicate with server');
				}
			},

			fetchData: function() {
				var self = this;
				temp.coll.tags.fetch({
					silent:true,
					success: function (collection, xhr, options) {
						// Initialize mandatory static tabs
						new HelperView();
						//new BrowserView();
						new BrowserView({ el: $("#browser") })
						// End data retrieval
						temp.coll.tasks.fetch({
							silent: true,
							success: function (collection, xhr, options) {
								temp.coll.notes.fetch({
									silent: true,
									success: function (collection, xhr, options) {
										channel.trigger('fetching:done');
									}
								});
							}
						});
						temp.coll.noteFilters.fetch({silent: false});
						temp.coll.taskFilters.fetch({silent: false});
						temp.coll.tagFilters.fetch({silent: false});
					}
				});
			},

			toggleNav: function() {
				console.dir(this);
			},

			toggleAuth: function () {
				this.auth = !this.auth;
				if (this.auth) {
					$("#meenoApp").children().each(function (index, obj) {
						if($(obj).attr('id')!='form-wrapper'){
							$(obj).hide();
						} else {
							$(obj).fadeIn();
						}
					});
				} else {
					$("#meenoApp").children().each(function (index, obj) {
						if($(obj).attr('id')!='form-wrapper'){
							$(obj).show();
						} else {
							$(obj).hide();
						}
					});
				}
			},

			toggleLR: function () {
				$("#login").toggle();
				$("#register").toggle();
			},

			login: function () {
				if (this.logging) { return false; } // To avoid submitting twice
				this.logging = true;
				$('#do-login').val("please wait...");
				var self = this;
				var formData = $('#login').serialize();

				// Attempt login on server...
				$.ajax({
					type: 'POST',
					url: "/login2",
					data: formData
				})
				.done(function(data, status, xhr) {

					if (xhr.status != 200) {
						$('#login').find(".errors").html(data);
					} else {
						self.tokenSave(data.token);
						$('#login').find(".errors").html("");
						self.toggleAuth();
						self.fetchData();
					}
				})
				.fail(function() {
					console.log("Connection to server failed");
				})
				.always(function() {
					self.logging = false;
					$('#do-login').val($('#do-login').attr("data-init-value"));
				});
				return false;
			},

			register: function () {
				if (this.registering) { return false; } // To avoid submitting twice
				this.registering = true;
				$('#do-register').val("please wait...");
				var self = this;
				var formData = $('#register').serialize();

				// Attempt registering on server...
				$.ajax({
					type: 'POST',
					url: "/register",
					data: formData
				})
				.done(function(data, status, xhr) {
					if (xhr.status != 201) {
						$('#register').find(".errors").html(data);
					} else {
						$('#register').find(".errors").html("");
						self.toggleAuth();
						self.fetchData();
					}
				})
				.fail(function() {
					console.log("Connection to server failed");
				})
				.always(function() {
					self.registering = false;
					$('#do-register').val($('#do-register').attr("data-init-value"));
				});
				return false;
			},

			/**
			 * To save the token received after successful login or registering
			 *
			 * @method tokenSave
			 */
			tokenSave: function (token) {
				console.log(token);
			},

			/**
			 * To open the browser in the right position
			 *
			 * @method browse
			 * @param {event} event backbone event
			 */
			browse: function (event) {
				this.minEditors();
				var $button = $(event.target);
				var type    = $button.attr("data-type");

				temp.coll[type].sort();
				channel.trigger('browser:refresh:'+type);

				if (!($button.hasClass('selected'))) {
					$button.siblings().removeClass('selected');
					$button.addClass('selected');
					this.$('#browser').removeClass('active');
					this.$('#browser').addClass('active');
					this.$('#browser').children().removeClass('active');
					this.$('#browser > .tab.' + type).addClass('active');
				}
			},

			/**
			 * To open the right note editor.
			 *
			 * @method editorOpen
			 */
			editorOpen: function (event) {
				this.minBrowser();
				var $button = $(event.target).closest('li');
				var noteCid = $button.attr("data-cid");
				if (!($button.hasClass('selected'))) {
					$button.siblings().removeClass('selected');
					$button.addClass('selected'); // activate the button tab itself
					this.$('#editors').removeClass('active').addClass('active');
					this.$('#editors').children().removeClass('active');
					this.$('#editors .editor[data-cid=' + noteCid + ']').addClass('active'); // display the right editor
				}
			},

			/**
			 * To close the right editor and go back to browser. Most actions are delegated to the editor view itself via
			 * the event editors:close:noteCid
			 *
			 * @method editorClose
			 */
			editorClose: function (event) {
				var noteCid = $(event.target).closest('li').attr("data-cid");
				channel.trigger('editors:close:'+noteCid);
			},


			/**
			 * To minimize the editors
			 * 
			 * @method minEditors
			 */
			minEditors: function () {
				$('#editors').removeClass('active');
				$('#editors-tabs').children().removeClass('selected');
			},

			/**
			 * To minimize the browser
			 * 
			 * @method minBrowser
			 */
			minBrowser: function () {
				$('#browser').removeClass('active');
				$('#nav').children().removeClass('selected');
			},

		});

		return MainView; // The module returns the class
	}
);

