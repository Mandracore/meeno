#meeno

##About

Note-taking web app designed for both professional or personal use. Enables you to write enhanced notes with tasks or reminders, to link it to projects or topics, and thus manage your knowledge and your business commitments in the simplest and most efficient fashion.
It's codebase has been written with Backbone.js for the frontend and Node.js + Express (feat. Stylus & Jade for templating and CSS) for the backend.
Many thanks to [Addy Osmani](https://github.com/addyosmani) who wrote the [Backbone Fundamentals Book](https://github.com/addyosmani/backbone-fundamentals) that tremendously helped us to begin this project.

##Installation

Download full source, then run the following command in the root folder of the app :
````
node install
````
This should download the node.js modules specified in package.json.
You can now launch the server by executing this last command :
````
node app/appSrv.js
````
The server will be listening on port 3000 (you can modify `app/appSrv.js` to change it), so launch your favorite browser on [http://localhost:3000](http://localhost:3000) and start enjoying the app.