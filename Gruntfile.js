module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		autoprefixer: {
			// TODO : configuration
			options: {
				// Task-specific options go here.
			},

			// just prefix the specified file
			single_file: {
				options: {
					// Target-specific options go here.
				},
				src: 'src/css/file.css',
				dest: 'dest/css/file.css'
			},

			// prefix all specified files and save them separately
			multiple_files: {
				expand: true,
				flatten: true,
				src: 'src/css/*.css', // -> src/css/file1.css, src/css/file2.css
				dest: 'dest/css/' // -> dest/css/file1.css, dest/css/file2.css
			},

			// prefix all specified files and concat them into the one file
			concat: {
				src: 'src/css/*.css', // -> src/css/file1.css, src/css/file2.css
				dest: 'dest/css/concatenated.css' // -> dest/css/concatenated.css
			},

			// if you specify only `src` param, the destination will be set automatically,
			// so specified source files will be overwrited
			no_dest: {
				src: 'dest/css/file.css' // globbing is also possible here
			}
		},
		bower: {
			// TODO : configuration
			target: {
				rjsConfig: 'app/config.js'
			}
		},
		uglify: {
			// TODO : configuration
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		requirejs: {
			// TODO : configuration
			compile: {
				options: {
					baseUrl: "path/to/base",
					mainConfigFile: "path/to/config.js",
					done: function(done, output) {
						var duplicates = require('rjs-build-analysis').duplicates(output);

						if (duplicates.length > 0) {
							grunt.log.subhead('Duplicates found in requirejs build:');
							grunt.log.warn(duplicates);
							done(new Error('r.js built duplicate modules, please check the excludes option.'));
						}

						done();
					}
				}
			}
		},
		htmlmin: {                                          // Task
			// TODO : configuration
			dist: {                                         // Target
				options: {                                  // Target options
					removeComments: true,
					collapseWhitespace: true
				},
				files: {                                    // Dictionary of files
					'dist/index.html': 'src/index.html',    // 'destination': 'source'
					'dist/contact.html': 'src/contact.html'
				}
			},
			dev: {                                          // Another target
				files: {
					'dist/index.html': 'src/index.html',
					'dist/contact.html': 'src/contact.html'
				}
			}
		},
		appcache: {
			// TODO : configuration
			options: {
				basePath: 'static'
			},
			all: {
				dest: 'static/manifest.appcache',
				cache: 'static/**/*',
				network: '*',
				fallback: '/ /offline.html'
			}
		},
		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: ['gruntfile.js', 'src/**/*.js', '/public/javascripts/**/*.js', 'test/**/*.js'],
					outdir: './doc/',
					linkNatives	: true,
					tabtospace	: 4,
					markdown		: {
						gfm			: true,
						tables		: true,
						breaks		: true,
						smartLists	: true
					}
				}
			}
		},
		jshint: {
			// define the files to lint
			files: ['gruntfile.js', 'src/**/*.js', '/public/javascripts/**/*.js', 'test/**/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: '<%= pkg.jshintConfig %>'
		},
		complexity: {
			// TODO : configuration ?
            generic: {
                src: ['grunt.js', 'tasks/grunt-complexity.js'],
                options: {
                    jsLintXML: 'report.xml', // create XML JSLint-like report
                    checkstyleXML: 'checkstyle.xml', // create checkstyle report
                    errorsOnly: false, // show only maintainability errors
                    cyclomatic: 3,
                    halstead: 8,
                    maintainability: 100
                }
            }
        }
	});

	// Load the plugins for the tasks.
	grunt.loadNpmTasks('grunt-bower-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-complexity');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-appcache');
	grunt.loadNpmTasks('grunt-karma');

	// Default task(s).
	grunt.registerTask('default', ['jshint','csslint','yuidoc','complexity']);
	grunt.registerTask('dev',['autoprefixer','bower']);
	grunt.registerTask('prod',['autoprefixer','bower','requirejs','uglify','htmlmin','appcache']);

};