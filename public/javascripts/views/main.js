
// js/views/main-meeno.js

var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

// The Application
// ---------------

// MainView is the master piece of UI
meenoAppCli.Classes.MainView = Backbone.View.extend({

	// Instead of generating a new DOM element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#meenoApp',

	events: {
		'click #new'       : 'new',
		'keyup #search'    : 'search',
		'submit #login'    : 'login',
		'submit #register' : 'register',
		'click #toregister': 'toggleLR',
		'click #tologin'   : 'toggleLR'
	},

	initialize: function() {
		this.auth                 = false;
		this.logging              = false;
		this.registering          = false;
		meenoAppCli.editorCounter = 0;

		meenoAppCli.Notes.on('add destroy reset change', this.render, this );
		this.on('editor:counter', this.editorCounter, this );
		this.on('server:auth', this.toggleAuth, this );

		meenoAppCli.Notes.fetch({
			// success: function (collection, xhr, options) {
			// 	meenoAppCli.TagsNotes.fetch({});
			// },
			error: function (collection, xhr, options) {
				if (xhr.status == 401) {
					console.log ("Server responded 401 - Unauthorized, displaying user authentification form");
					meenoAppCli.mainView.trigger('server:auth');
				}
			}
		});
	},

	render: function() {
		this.$('#note-list').html(''); // First, emptying the list
		meenoAppCli.Notes.each(function (note) {
			var noteView = new meenoAppCli.Classes.NoteView({ model: note });
			$('#note-list').append(noteView.render().el);
		}, this);
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
				meenoAppCli.Notes.fetch();
				// meenoAppCli.TagsNotes.fetch();
				meenoAppCli.mainView.toggleAuth();
			}
		})
		.fail(function() {
			console.log("Connection to server failed");
		})
		.always(function() {
			meenoAppCli.mainView.logging = false;
			$('#do-login').val($('#do-login').attr("data-init-value"));
		});
		return false;
	},

	register: function () {
		if (this.registering) { return false; } // To avoid submitting twice
		this.registering = true;
		$('#do-register').val("please wait...");
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
				// meenoAppCli.Notes.fetch();
				meenoAppCli.mainView.toggleAuth();
			}
		})
		.fail(function() {
			console.log("Connection to server failed");
		})
		.always(function() {
			meenoAppCli.mainView.registering = false;
			$('#do-register').val($('#do-register').attr("data-init-value"));
		});
		return false;
	},

	new: function() {
		if (meenoAppCli.editorCounter > 3) {
			alert("Can't open more editors");
			return;
		}
		this.trigger('editor:new',true);
		var newNote                = meenoAppCli.Notes.create({silent:true});
		newNote.openInEditor       = true;
		var noteEditorTabView      = new meenoAppCli.Classes.NoteEditorTabView({ model: newNote });
		var noteEditorControlsView = new meenoAppCli.Classes.NoteEditorControlsView({ model: newNote });
		var noteEditorView         = new meenoAppCli.Classes.NoteEditorView({ model: newNote });
		$('#editor-tabs-list').append(noteEditorTabView.render().el);
		$('#editor-controls-list').append(noteEditorControlsView.render().el);
		$('#editor-content-list').append(noteEditorView.render().el);
		noteEditorTabView.toggle();
	},

	search: function() {
		var term = $("#search").val();
		if (term == "") {
			meenoAppCli.Notes.reset();
			meenoAppCli.Notes.fetch();
			console.log('Refetching whole collection');
			return;
		} 
		
		var pattern = new RegExp(term,"gi");
		meenoAppCli.Notes.reset();
		meenoAppCli.Notes.fetch();
		meenoAppCli.Notes.reset(_.filter(meenoAppCli.Notes.models, function(data){
			return pattern.test(data.get("title")) || pattern.test(data.get("content"));
		}));

		meenoAppCli.dispatcher.trigger('search:hi',term);
	},

	editorCounter: function(add) {
		if (add) {
			meenoAppCli.editorCounter ++;
		} else {
			meenoAppCli.editorCounter --;
		}
	}


});