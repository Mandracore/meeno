define ([
		'jquery',
		'underscore',
		'backbone',
		'lib/auth',
		'lib/alive',
		'mousetrap',
		'channel',
		'temp',
		'views/helper',
		'views/browser',
		'views/editor',
		// 'lib/backbone.sync.jwt', // No custom Backbone Sync to send jwt (done via $.ajaxSend)
	], function ($, _, Backbone, Auth, Alive, Mousetrap, channel, temp, HelperView, BrowserView, EditorView) {

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
				'click .logout'                   : 'logout',
				'submit #register'                : 'register',
				'click #toregister'               : 'toggleLR',
				'click #tologin'                  : 'toggleLR',
				'click .navigation button.open'   : 'openMenu',
				'click #nav .browse'              : 'browse',
				'click #editors-tabs > li .open'  : 'editorOpen',
				'click #editors-tabs > li .close' : 'editorClose',
			},

			initialize: function() {
				var self = this;
				self.isOnline = true;

				// Put swipe mouvements listeners
				$("#main > .navigation").on('flick', function(e) {

					if (e.orientation == "horizontal") {
						var way = (e.dx > 0) ? "left" : "right";
						if (way == "right") {
							$("#main").removeClass('navigating');
						}
					}
				});

				// Use ajaxComplete method to override behavior when an ajax request is completed
				// Aims at reacting adequately to a connexion loss when querying the server
				$( document ).ajaxComplete(function( event, request, settings ) {
					// console.log('ajaxComplete: '+request)
					if (request.status === 0) {
						if (self.isOnline) {
							channel.trigger('app:offline');
							self.isOnline = false;
						}
					} else {
						if (!self.isOnline) {
							self.isOnline = true;
							channel.trigger('app:online');
						}
					}
				});

				this.listenTo(channel, 'app:offline', function () { this.connectivity(false); } );
				this.listenTo(channel, 'app:online', function () { this.connectivity(true); } );

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
				this.listenTo(temp.coll.tasks, 'error', this.syncCallback);
				this.listenTo(temp.coll.tags, 'error', this.syncCallback);
				this.listenTo(temp.coll.notes, 'error', this.syncCallback);
				this.listenTo(temp.coll.noteFilters, 'error', this.syncCallback);
				this.listenTo(temp.coll.taskFilters, 'error', this.syncCallback);
				this.listenTo(temp.coll.tagFilters, 'error', this.syncCallback);

				this.fetchData();
			},

			/**
			 * To manage synchronization with backend in case of connectivity loss
			 *
			 * @method connectivity
			 */
			connectivity: function (online) {
				if (!online) {
					this.$("#connectivity").addClass('offline');
					this.AliveId = Alive.start(); // start pinging
				} else {
					Alive.stop(this.AliveId); // stop pinging
					this.$("#connectivity").removeClass('offline');
					this.$("#connectivity").addClass('online-not-synced');
					// Resync. with server
					// all changes are sent to the server and localStorage is updated
					temp.coll.tasks.syncDirtyAndDestroyed({
						success: function (coll, model, options) {
							if (!options.dirty) { this.$("#connectivity").removeClass('online-not-synced');	}
						},
					});
					temp.coll.tags.syncDirtyAndDestroyed({
						success: function (coll, model, options) {
							if (!options.dirty) { this.$("#connectivity").removeClass('online-not-synced');	}
						},
					});
					temp.coll.notes.syncDirtyAndDestroyed({
						success: function (coll, model, options) {
							if (!options.dirty) { this.$("#connectivity").removeClass('online-not-synced');	}
						},
					});
				}
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

			/**
			 * To save the token received after successful login or registering
			 *
			 * @method openMenu
			 */
			openMenu: function (event) {
				$("#main").addClass('navigating');
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

			logout: function () {
				var self = this;
				$.ajax({
					type: 'POST',
					url: "/logout",
					headers: {
						'x-access-token': Auth.tokenGet(),
					},
				})
				.done(function(data, status, xhr) {
					if (xhr.status != 200) {
						alert ('Communication error with server, logout failed.');
					} else {
						Auth.tokenSet(data.token);
						self.fetchData();
					}
				})
				.fail(function() {
					console.log("Connection to server failed");
				})
				return false;
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
					url: "/login",
					data: formData
				})
				.done(function(data, status, xhr) {

					if (xhr.status != 200) {
						$('#login').find(".errors").html(data);
					} else {
						Auth.tokenSet(data.token);
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
					if (xhr.status != 200) {
						$('#register').find(".errors").html(data);
					} else {
						console.log('registering successful');
						Auth.tokenSet(data.token);
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
			 * To open the browser in the right position
			 *
			 * @method browse
			 * @param {event} event backbone event
			 */
			browse: function (event) {
				this.minEditors();
				$("#main").removeClass('navigating');
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

