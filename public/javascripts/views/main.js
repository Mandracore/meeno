define ([
		'jquery',
		'underscore',
		'lib/auth',
		'lib/alive',
		'mousetrap',
		'channel',
		'temp',
		'views/helper',
		'views/browser',
		'views/editor',
		'backbone',
		'backbone.dualStorage',
	], function ($, _, Auth, Alive, Mousetrap, channel, temp, HelperView, BrowserView, EditorView, Backbone) {

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

				self.syncStatus = {
					"notes" : false,
					"tasks" : false,
					"tags"  : false,
				};

				// Put swipe mouvements listeners
				$("#main > .navigation").on('flick', function(e) {

					if (e.orientation == "horizontal") {
						var way = (e.dx > 0) ? "left" : "right";
						if (way == "right") {
							$("#main").removeClass('navigating');
						}
					}
				});

				this.listenTo(channel, 'app:offline', function () { this.connectivity(0); } );
				this.listenTo(channel, 'app:online', function () { this.connectivity(1); } );
				this.listenTo(channel, 'app:sync', function () { this.connectivity(2); } );
				this.listenTo(channel, 'fetching:done', function () { this.syncBack(); } );

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
				Mousetrap.bind('ctrl+up', function() {
					channel.trigger('keyboard:header');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind('ctrl+l', function() {
					channel.trigger('keyboard:list');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind('ctrl+b', function() {
					channel.trigger('keyboard:bold');
					return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind('ctrl ctrl', function() {
					channel.trigger('keyboard:strike');
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
				}, 'keyup');

				// All ajax requests once completed will trigger this callback to :
				// 1. Display login forms is token is not provided (error 401)
				// 2. Detect offline mode (error 0) and try to reach server => channel.trigger('app:offline');
				// 3. Resync. data with server when connexion is restored (response 200/304) => channel.trigger('app:online');
				$( document ).ajaxComplete(function( event, request, settings ) {
					switch(request.status) {
						// Server is not answering
						case 0:
							if (self.isOnline) {
								self.isOnline = false;
								channel.trigger('app:offline');
							}
							break;
						// Server is answering OK
						case 200: // OK
						case 202: // OK used by login page
						case 304: // Not modified
							if (!self.isOnline) {
								self.isOnline = true;
								channel.trigger('app:online');
							}
							break;
						// Server denied request (not authorized)
						case 401:
							console.log ("Unauthorized, displaying user authentification form");
							self.toggleAuth();
							break;
						// Server is returning an unexpected value.
						default:
							alert('Impossible to sync. data with server (error code = '+request.status+'). Please provide the error code to the administrator so that the error can be corrected.');
							//default code block
					}
				});

				this.fetchData();
			},

			/**
			 * To try to reconnect to backend in case of connectivity loss
			 *
			 * @method connectivity
			 */
			connectivity: function (status) {
				switch (status) {
					case 0:
						this.$("#connectivity").addClass('state0'); // offline
						this.$("#connectivity").removeClass('state1'); // online - sync in progress
						this.$("#connectivity").removeClass('state2'); // online - synced
						this.AliveId = Alive.start(); // start pinging
						break;
					case 1:
						Alive.stop(this.AliveId); // stop pinging
						this.$("#connectivity").removeClass('state0');
						this.$("#connectivity").removeClass('state2');
						this.$("#connectivity").addClass('state1');
						this.syncBack();
						break;
					case 2:
						if (!this.isOnline) return;
						if(this.syncStatus.notes && this.syncStatus.tasks && this.syncStatus.tags) {
							this.$("#connectivity").removeClass('state0'); // offline
							this.$("#connectivity").removeClass('state1'); // online - sync in progress
							this.$("#connectivity").addClass('state2'); // online - synced
						} else {
							this.$("#connectivity").removeClass('state0'); // offline
							this.$("#connectivity").removeClass('state2'); // online - synced
							this.$("#connectivity").addClass('state1'); // online - sync in progress
						}
						break;
				}
			},

			/**
			 * To sync models on localstorage with those on backend database
			 *
			 * @method connectivity
			 */
			syncBack: function () {
				var self = this;
				// Resync. with server
				// all changes are sent to the server and localStorage is updated
				if(temp.coll.notes.destroyedModelIds().length > 0 || temp.coll.notes.dirtyModels().length > 0) {
					console.log('sync / start syncing notes');
					temp.coll.notes.syncDirtyAndDestroyed({
						success: function (coll, model, options) {
							if (!options.dirty) {
								console.log('sync / notes synced successfully');
								self.syncStatus.notes = true
								channel.trigger('app:sync');
							}
						},
					});
				} else {
					console.log ('sync / notes already synced');
					self.syncStatus.notes = true
					channel.trigger('app:sync');
				}

				if(temp.coll.tasks.destroyedModelIds().length > 0 || temp.coll.tasks.dirtyModels().length > 0) {
					console.log('sync / start syncing tasks');
					temp.coll.tasks.syncDirtyAndDestroyed({
						success: function (coll, model, options) {
							if (!options.dirty) {
								console.log('sync / tasks synced successfully');
								self.syncStatus.tasks = true
							}
						},
					});
				} else {
					console.log ('sync / tasks already synced');
					self.syncStatus.tasks = true
					channel.trigger('app:sync');
				}

				if(temp.coll.tags.destroyedModelIds().length > 0 || temp.coll.tags.dirtyModels().length > 0) {
					console.log('sync / start syncing tags');
					temp.coll.tags.syncDirtyAndDestroyed({
						success: function (coll, model, options) {
							if (!options.dirty) {
								console.log('sync / tags synced successfully');
								self.syncStatus.tags = true
							}
						},
					});
				} else {
					console.log ('sync / tags already synced');
					self.syncStatus.tags = true
					channel.trigger('app:sync');
				}
			},

			/**
			 * To open the menu when in mobile mode
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

