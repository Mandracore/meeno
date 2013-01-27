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

	initialize: function() {
		meenoAppCli.dispatcher.on('tab:quit:' + this.options.sound, this.quit, this);
		meenoAppCli.dispatcher.on('tab:objectEvent:' + this.$el.attr('id'), this.keyPressProxy, this);
		console.log(this.el);
	},

	keyPressProxy: function( event ) {

		console.log("...successfully passed to subobject "+this.$el.attr('id'));
		console.log(event.keyCode);

		if (event.keyCode == 13 || event.keyCode == 9) { // The user wants to stop editing tag
			event.preventDefault();
			return this.out();
		}
	},

	out: function() {
		console.log ('out of this tag');
		// Moving the caret out of the object
		$contentEditable = this.$el.closest('section.edit-content');
		// console.log($contentEditable);
		// var pos = $contentEditable.caret();console.log(pos);
		// // var offset = this.$el.html().length + 6;console.log(offset);
		// var offset = 8;console.log(offset);
		// $contentEditable.caret(pos + offset);console.log(pos + offset)

/*

########## TRY THIS !!! ########

$('section.edit-content').index($('#m1xMm9pNa2'));
-1
$('section.edit-content').contents().index($('#m1xMm9pNa2'));
1
range = document.createRange();
range.setStart($('section.edit-content')[0],2);
undefined
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection



*/

		span = this.$el[0];//This is the element that you want to move the caret to the end of

        range = document.createRange();//Create a range (a range is a like the selection but invisible)

		range.setStartAfter(span);
		range.setEndAfter(span);
		range.collapse();

        // range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        // range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection

        // range.setStart($contentEditable, )

		this.save();
	},

	save: function() {
		this.model.set({
			label  :this.$el.html()
		})

		meenoAppCli.Tags.add(this.model,{merge: true}); // We add it to the collection in case it has been freshly created
		this.model.save({},{ // Now that the model is into a collection, the .save() method will work
			success: function() {
				console.log('save success');
			},
			error  : function() {
				console.log('save error');
			}
		});
	},

	quit: function() {
		console.log('quit tag reference');
		this.remove();
	}
});