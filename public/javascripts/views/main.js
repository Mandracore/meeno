define ([
	// path aliases preconfigured in ../main.js
		'jquery',
		'underscore',
		'backbone',
		'mousetrap',
		'channel',
		'temp',
	], function ($, _, Backbone, Mousetrap, channel, temp) {

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
				'click .actions-main .note'   : 'newNote', // Create new note and open it in a new tab
				// 'click .actions-main .tag' : 'newTag', // Create a new tag in a popup window
				'submit #login'               : 'login',
				'submit #register'            : 'register',
				'click #toregister'           : 'toggleLR',
				'click #tologin'              : 'toggleLR'
			},

			initialize: function() {
				this.auth                 = false;
				this.logging              = false;
				this.registering          = false;
				this.on('server:auth', this.toggleAuth, this );

				Mousetrap.bind(['ctrl+alt+shift+h'], function() {
					channel.trigger('keyboard:tag');
					// return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind(['ctrl+alt+shift+a'], function() {
					channel.trigger('keyboard:entity');
					// return false; // return false to prevent default browser behavior and stop event from bubbling
				});
				Mousetrap.bind(['ctrl+alt+shift+t'], function() {
					channel.trigger('keyboard:task');
					// return false; // return false to prevent default browser behavior and stop event from bubbling
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

				this.fetchData();
			},

			fetchData: function() {
				temp.coll.tags.fetch({
					success: function (collection, xhr, options) {
						temp.coll.tasks.fetch({})
						temp.coll.notes.fetch({})
						temp.coll.noteFilters.fetch({});
						temp.coll.taskFilters.fetch({});
						temp.coll.tagFilters.fetch({});
						// Initialize mandatory static tabs
						new HelperView();
						new BrowserView();
					},
					error: function (collection, xhr, options) {
						console.log ("Fetching tasks failed // Server response status : "+xhr.status);
						if (xhr.status == 401) {
							console.log ("Unauthorized, displaying user authentification form");
							App.mainView.trigger('server:auth');
						}
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
					url: "/login",
					data: formData
				})
				.done(function(data, status, xhr) {
					if (xhr.status != 200) {
						$('#login').find(".errors").html(data);
					} else {
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

			newNote: function() {
				var newNote   = App.notes.create({silent:true});
				var newEditor = new EditorView ({ model: newNote });
				newEditor.render();
				newEditor.toggle();
			},
		});

		return MainView; // The module returns the class
	}
);

