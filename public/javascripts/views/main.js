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
				'submit #login'           : 'login',
				'submit #register'        : 'register',
				'click #toregister'       : 'toggleLR',
				'click #tologin'          : 'toggleLR',
				'click nav .browse.notes' : 'browseNotes',
				'click nav .browse.tasks' : 'browseTasks',
				'click nav .browse.tags'  : 'browseTags',
			},

			initialize: function() {
				this.auth                 = false;
				this.logging              = false;
				this.registering          = false;

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
				var self = this;
				temp.coll.tags.fetch({
					silent:true,
					success: function (collection, xhr, options) {
						// Initialize mandatory static tabs
						new HelperView();
						//new BrowserView();
						new BrowserView({ el: $("#tabs .browse") })
						// End data retrieval
						temp.coll.tasks.fetch({silent: true});
						temp.coll.notes.fetch({silent: true});
						temp.coll.noteFilters.fetch({silent: false});
						temp.coll.taskFilters.fetch({silent: false});
						temp.coll.tagFilters.fetch({silent: false});
					},
					error: function (collection, xhr, options) {
						console.log ("Fetching failed // Server response status : "+xhr.status);
						if (xhr.status == 401) {
							console.log ("Unauthorized, displaying user authentification form");
							self.toggleAuth();
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
/*
			newNote: function() {
				var newNote   = temp.coll.notes.create({silent:true});
				var newEditor = new EditorView ({ model: newNote });
				newEditor.render();
				newEditor.toggle();
			},*/

			/**
			 * To open the browser in position notes
			 *
			 * @method browseNotes
			 * @param {event} event Backbone event
			 */
			browseNotes: function (event) {
				this.minEditors();
				if (!($(event.target).hasClass('selected'))) {
					$(event.target).siblings().removeClass('selected');
					$(event.target).addClass('selected');
					this.$('#tabs .listobjects.notes').siblings().removeClass('selected');
					this.$('#tabs .listobjects.notes').addClass('selected');
				}
			},

			/**
			 * To open the browser in position tasks
			 *
			 * @method browseTasks
			 * @param {event} event Backbone event
			 */
			browseTasks: function (event) {
				this.minEditors();
				if (!($(event.target).hasClass('selected'))) {
					$(event.target).siblings().removeClass('selected');
					$(event.target).addClass('selected');
					this.$('#tabs .listobjects.tasks').siblings().removeClass('selected');
					this.$('#tabs .listobjects.tasks').addClass('selected');
				}
			},

			/**
			 * To open the browser in position tags
			 *
			 * @method browseTags
			 * @param {event} event Backbone event
			 */
			browseTags: function (event) {
				this.minEditors();
				if (!($(event.target).hasClass('selected'))) {
					$(event.target).siblings().removeClass('selected');
					$(event.target).addClass('selected');
					this.$('#tabs .listobjects.tags').siblings().removeClass('selected');
					this.$('#tabs .listobjects.tags').addClass('selected');
				}
			},

			/**
			 * To minimize the editors
			 * 
			 * @method minEditors
			 * @param {event} event Backbone event
			 */
			minEditors: function () {
				var $editors = $('#editors');
				$editors.addClass('hidden',500);
				$editors.removeClass('visible');
			},

		});

		return MainView; // The module returns the class
	}
);

