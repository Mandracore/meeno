#meeno

##About
#####General
meeno is a note-taking web app designed for both professional and personal use. It enables you to write enhanced notes with tasks or reminders, to link it to projects or topics, and thus manage your knowledge and your business commitments in the simplest and most efficient fashion.
It's codebase has been written with Backbone.js for the frontend and Node.js + Express (feat. Stylus & Jade for templating and CSS) for the backend.
Many thanks to [Addy Osmani](https://github.com/addyosmani) who wrote the [Backbone Fundamentals Book](https://github.com/addyosmani/backbone-fundamentals) that tremendously helped us to begin this project.
See [blog.mandracore.com](http://blog.mandracore.com) to read tutorials about this application's development.

#####Versioning
The master branch contains the last stable versions of the software, while the Dev branch contains our day-to-day work. 
You can also check the tags which all points to stable commits of the master branch.

##Installation

Download full source, then run the following command in the root folder of the app :
````
npm install
````
This should download the node.js modules specified in package.json.
You can now launch the server by executing this last command :
````
npm run start
````
The server will be listening on port 3000 (you can modify `appSrv.js` to change it), so launch your favorite browser on [http://localhost:3000](http://localhost:3000) and start enjoying the app.

##Documentation

Code documentation can be found in the folder `docs/`. Use the command `npm run doc` to regenerate it, for instance if you made some updates.

##Testing
Both unit-testing and integration-testing routines have been implemented to ensure front-end code stability. The related specifications (BDD style) can be found in the folder `test`.

####Unit tests
Relies on Jasmine (tester) and Karma (runner). Run `npm run test-unit` to execute the test runner and check the results.

####Integration tests
Relies on Jasmine (tester), jasmine-node (runner) and Zombie (emulated browser). Run `npm run test-int` to execute the test runner and check the results.