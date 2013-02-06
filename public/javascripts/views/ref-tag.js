var meenoAppCli     = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.TagRefView = Backbone.View.extend({
	// That view will always be binded to pre-existing pieces of DOM ("el" is passed directly to the class constructor)
	// It explains why we don't need a render function

	// The DOM events we listen to
	events: {
		'keypress': 'keyPressProxy',
		'blur': 'out'
	},

/* il me faut créer quelque chose qui surveille le dom de ref-tag .html()
Dès qu'il diminue, je lance un delete de la view complete (si la création a déjà été faite)
if (html.length < savedhtml.length) return this.destroy
il va me falloir malheureusement un poll...c'est dégueulasse.
*/


	initialize: function() {
		this.options.locked = false;
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quit, this);
		meenoAppCli.dispatcher.on('tab:object:' + this.$el.attr('id'), this.keyPressProxy, this);
		console.log(this.el);
		this.model.on('change', this.beware, this);
		var idx = this.$el.parent().contents().index(this.$el);
		moveCaret (this.$el.parent()[0], idx+1);
	},

	keyPressProxy: function( event ) {

		if (event.keyCode == 8 && this.options.locked) { // The user wants to remove the tag
			console.log('removing tag');
			this.quit();
			return;
		}

		this.save();
		if (event.keyCode == 13 || event.keyCode == 9) { // The user wants to stop editing tag
			event.preventDefault();
			return this.out();
		}
	},

	out: function() {
		this.options.locked = true;
		// Moving the caret out of the object
		var idx = this.$el.parent().contents().index(this.$el);
		moveCaret (this.$el.parent()[0], idx+2);		
	},

	beware: function () {
		// Fuck : no change event is thrown when return is pressed

		//console.log ('beware');
	},

	save: function() {
		this.model.set({
			label  :this.$el.html()
		})

		meenoAppCli.Tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
		this.model.save(); // Now that the model is into a collection, the .save() method will work
	},

	quit: function() {
		console.log('quit tag reference');
		this.remove();
	}
});