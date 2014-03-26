var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test-meeno');

var Schema = mongoose.Schema

var personSchema = Schema({
	name    : String,
	age     : Number,
	stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = Schema({
	_creator : { type: Schema.Types.ObjectId, ref: 'Person' },
	title    : String,
	fans     : [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

var Story  = mongoose.model('Story', storySchema);
var Person = mongoose.model('Person', personSchema);


// var aaron = new Person({ _id: 0, name: 'Aaron', age: 100 });
var aaron = new Person({ name: 'Aaron12', age: 100 });

aaron.save(function (err) {
	if (err) { console.log (err); return; }
	console.log('[Person] aaron SAVED');
	console.log ('[Person] %s', aaron);

	var story1 = new Story({
		title: "Once upon a timex.12",
		_creator: aaron._id    // assign the _id from the person
	});

	story1.save(function (err) {
		if (err) { console.log (err); return; }
		console.log('[Story] story1 SAVED');
		console.log ('[Story] %s', story1);
		
		Story
			.findOne({ title: 'Once upon a timex.12' })
			.populate('_creator')
			.exec(function (err, story) {
				if (err) { console.log (err); return; }
				console.log ('[Story.findOne] %s', story1);
				console.log ('[Story.title] %s', story.title);
				console.log ('[Story._creator] %s', story._creator);
				console.log ('[Story._creator.name] %s', story._creator.name);
				// prints "The creator is Aaron"
			});
	});
});

// console.log (story1);




// console.log(story1)

