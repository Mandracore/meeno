({
	// Define our base URL - all module paths are relative to this
	// base directory.
	baseUrl        : './public/javascripts',
	// Load the RequireJS config() definition from the main.js file.
	// Otherwise, we would have to redefine all of our paths again here.
	mainConfigFile : './public/javascripts/main.js',
	// Name of the root module to be used
	name           : 'main',
	// User dir directive below to uglify a whole folder
	// Use out instead to minify a whole folder and to uglify the resulting file
	// dir         : './public/javascripts-built',
	out            : './public/javascripts-built/main.js',
	optimize       : "none",
	wrapShim       : true,
})