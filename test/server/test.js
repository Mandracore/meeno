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
var aaron   = new Person({ name: 'Aaron16', age: 100 });
var brandon = new Person({ name: 'Brandon16', age: 10 });

aaron.save(function (err) {
	if (err) { console.log (err); return; }
	console.log('[Person] aaron SAVED');
	console.log ('[Person] %s', aaron);

	var story1 = new Story({
		title: "Once upon a timex.16",
		_creator: aaron    // assign the _id from the person
	});

	story1.save(function (err) {
		if (err) { console.log (err); return; }
		console.log('[Story] story1 SAVED');
		console.log ('[Story] %s', story1);
		
		Story
		.findOne({ title: 'Once upon a timex.16' })
		.populate('_creator')
		.exec(function (err, story) {
			if (err) { console.log (err); return; }
			console.log ('[Story.findOne] %s', story);
			console.log ('[Story.findOne.title] %s', story.title);
			console.log ('[Story.findOne._creator] %s', story._creator);
			console.log ('[Story.findOne._creator.name] %s', story._creator.name);
			// prints "The creator is Aaron"
		});

		aaron.stories.push(story1);
		aaron.save(function (err) {
			if (err) { console.log (err); return; }
			console.log ('[Person] %s', aaron);
			
			Person
			.findOne({ name: 'Aaron16' })
			.populate('stories')
			.exec(function (err, person) {
				if (err) { console.log (err); return; }
				console.log ('[person.findOne] %s', person);
			});

			Story
			.findOne({ title: 'Once upon a timex.16' })
			.populate('_creator fans')
			.exec(function (err, story) {
				if (err) { console.log (err); return; }
				console.log ('[Story.findOne] %s', story);
			});

		});




	});
});

// console.log (story1);




// console.log(story1)

