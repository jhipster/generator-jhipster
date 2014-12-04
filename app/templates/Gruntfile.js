// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

// usemin custom step
var path = require('path');
var useminAutoprefixer = {
    name: 'autoprefixer',
    createConfig: function(context, block) {
        var cfg = { files: [] };
        var outfile = path.join(context.outDir, block.dest);

        var files = {};
        files.dest = outfile;
        files.src = [];
        context.inFiles.forEach(function (f) {
            files.src.push(path.join(context.inDir, f));
        });
        cfg.files.push(files);
        context.outFiles = [block.dest];

        return cfg;
    }
};

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'src/main/webapp/dist',
            name: require('./bower.json').appName
        },
        watch: {<% if (useCompass) { %>
            compass: {
                files: ['src/main/scss/**/*.{scss,sass}'],
                tasks: ['compass:server']
            },<% } %>
            styles: {
                files: ['src/main/webapp/styles/**/*.css']
            },
            livereload: {
                options: {
                    livereload: 35729
                },
                files: [
                    'src/main/webapp/**/*.html',
                    'src/main/webapp/**/*.json',
                    '.tmp/styles/**/*.css',
                    '{.tmp/,}src/main/webapp/app.js',
                    '{.tmp/,}src/main/webapp/app/**/*.js',
                    '{.tmp/,}src/main/webapp/components/**/*.js',
                    'src/main/webapp/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        autoprefixer: {
        // not used since Uglify task does autoprefixer,
        //    options: ['last 1 version'],
        //    dist: {
        //        files: [{
        //            expand: true,
        //            cwd: '.tmp/styles/',
        //            src: '**/*.css',
        //            dest: '.tmp/styles/'
        //        }]
        //    }
        },
        connect: {
            proxies: [
                {
                    context: '/app',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/metrics',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/dump',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/health',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/configprops',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/beans',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/api-docs',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                }<% if (authenticationType == 'token') { %>,
                {
                    context: '/oauth/token',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                }<% } %><% if (devDatabaseType == 'h2Memory') { %>,
                {
                    context: '/console',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                 }<% } %>
            ],
            options: {
                port: 9000,
                // Change this to 'localhost' to deny access to the server from outside.
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        'src/main/webapp'
                    ],
                    middleware: function (connect) {
                        return [
                            proxySnippet,
                            connect.static('.tmp'),
                            connect.static('src/main/webapp')
                        ];
                    }
                }
            },
            test: {
                options: {
                 port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        'src/main/webapp'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%%= yeoman.dist %>'
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%%= yeoman.dist %>/*',
                        '!<%%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'src/main/webapp/app.js',
                'src/main/webapp/app/{,*/}*.js',
                'src/main/webapp/components/{,*/}*.js'
            ]
        },
        coffee: {
            options: {
                sourceMap: true,
                sourceRoot: ''
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/main/webapp/scripts',
                    src: '**/*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '**/*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },<% if (useCompass) { %>
        compass: {
            options: {
                sassDir: 'src/main/scss',
                cssDir: 'src/main/webapp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: 'src/main/webapp/images',
                javascriptsDir: 'src/main/webapp/scripts',
                fontsDir: 'src/main/webapp/styles/fonts',
                importPath: 'src/main/webapp/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },<% } %>
        concat: {
            // not used since Uglify task does concat,
            // but still available if needed
            dist: {}
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%%= yeoman.dist %>/scripts/**/*.js',
                        '<%%= yeoman.dist %>/styles/**/*.css',
                        '<%%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%%= yeoman.dist %>/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: 'src/main/webapp/**/*.html',
            options: {
                dest: '<%%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['concat', useminAutoprefixer, 'cssmin']
                        },
                            post: {}
                        }
                    }
            }
        },
        usemin: {
            html: ['<%%= yeoman.dist %>/**/*.html'],
            css: ['<%%= yeoman.dist %>/styles/**/*.css'],
            options: {
                assetsDirs: ['<%%= yeoman.dist %>/**/'],
                dirs: ['<%%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/main/webapp/images',
                src: '**/*.{jpg,jpeg}', // we don't optimize PNG files as it doesn't work on Linux. If you are not on Linux, feel free to use '{,*/}*.{png,jpg,jpeg}'
                    dest: '<%%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/main/webapp/images',
                    src: '**/*.svg',
                    dest: '<%%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            // By default, your `index.html` <!-- Usemin Block --> will take care of
            // minification. This option is pre-configured if you do not wish to use
            // Usemin blocks.
            // dist: {
            //     files: {
            //         '<%%= yeoman.dist %>/styles/main.css': [
            //             '.tmp/styles/{,*/}*.css',
            //             'styles/{,*/}*.css'
            //         ]
            //     }
            // }
        },
        ngtemplates:    {
            dist: {
                cwd: 'src/main/webapp',
                src: ['app/**/*.html', 'components/**/*.html',],
                dest: '.tmp/templates/templates.js',
                options: {
                    module: '<%%= yeoman.name %>',
                    usemin: 'scripts/scripts.js',
                    htmlmin:  {
                        removeCommentsFromCDATA: true,
                        // https://github.com/yeoman/grunt-usemin/issues/44
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        conservativeCollapse: true,
                        removeAttributeQuotes: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true
                    }
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    conservativeCollapse: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true
                },
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.dist %>',
                    src: ['*.html'],
                    dest: '<%%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'src/main/webapp',
                    dest: '<%%= yeoman.dist %>',
                    src: [
                        '*.html',
                        'fonts/*',
                        'images/**/*.{png,gif,webp}',
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }]
            },
            generateHerokuDirectory: {
                    expand: true,
                    dest: 'deploy/heroku',
                    src: [
                        'pom.xml',
                        'src/main/**'
                ]
            },
            generateOpenshiftDirectory: {
                    expand: true,
                    dest: 'deploy/openshift',
                    src: [
                        'pom.xml',
                        'src/main/**'
                ]
            }
        },
        concurrent: {
            server: [<% if (useCompass) { %>
                'compass:server'<% } %>
            ],
            test: [<% if (useCompass) { %>
                'compass'<% } %>
            ],
            dist: [<% if (useCompass) { %>
                'compass:dist',<% } %>
                'imagemin',
                'svgmin'
            ]
        },
        karma: {
            unit: {
                configFile: 'src/main/webapp/test/karma.conf.js',
                singleRun: true
            }
        },
        cdnify: {
            dist: {
                html: ['<%%= yeoman.dist %>/*.html']
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },
        replace: {
            dist: {
                src: ['<%%= yeoman.dist %>/index.html'],
                    overwrite: true,                                 // overwrite matched source files
                    replacements: [{
                        from: '<div class="development"></div>',
                        to: ''
                    }]
                }
            },
        uglify: {
            // not used since Uglify task does uglify
            //dist: {
            //    files: {
            //        '<%%= yeoman.dist %>/scripts/scripts.js': [
            //            '<%%= yeoman.dist %>/scripts/scripts.js'
            //        ]
            //    }
            //}
        },
        buildcontrol: {
            options: {
                commit: true,
                push: false,
                connectCommits: false,
                message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
            },
            heroku: {
                options: {
                    dir: 'deploy/heroku',
                    remote: 'heroku',
                    branch: 'master'
                }
            },
            openshift: {
                options: {
                    dir: 'deploy/openshift',
                    remote: 'openshift',
                    branch: 'master'
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'configureProxies',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'ngtemplates',
        'concurrent:dist',
        'concat',
        'autoprefixer',
        'copy:dist',
        'ngAnnotate',
        'cssmin',
        'replace',
        'uglify',
        'rev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('buildHeroku', [
        'test',
        'build',
        'copy:generateHerokuDirectory',
    ]);

    grunt.registerTask('deployHeroku', [
        'test',
        'build',
        'copy:generateHerokuDirectory',
        'buildcontrol:heroku'
    ]);

    grunt.registerTask('buildOpenshift', [
        'test',
        'build',
        'copy:generateOpenshiftDirectory',
    ]);

    grunt.registerTask('deployOpenshift', [
        'test',
        'build',
        'copy:generateOpenshiftDirectory',
        'buildcontrol:openshift'
    ]);

    grunt.registerTask('default', [
        'test',
        'build'
    ]);
};
