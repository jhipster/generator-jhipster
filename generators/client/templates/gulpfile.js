// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= packagejs.name %> <%= packagejs.version %>
'use strict';

var gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),<% if(useSass) { %>
    sass = require('gulp-sass'),<% } %>
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngConstant = require('gulp-ng-constant-fork'),
    eslint = require('gulp-eslint'),
    rev = require('gulp-rev'),<% if (testFrameworks.indexOf('protractor') > -1) { %>
    protractor = require('gulp-protractor').protractor,<% } %>
    proxy = require('proxy-middleware'),
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    del = require('del'),
    url = require('url'),
    wiredep = require('wiredep').stream,
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    sourcemaps = require('gulp-sourcemaps'),
    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    handleErrors = require('./gulp/handleErrors'),
    util = require('./gulp/utils'),
    gulpIf = require('gulp-if'),
    footer = require('gulp-footer'),
    expect = require('gulp-expect-file');

var config = {
    app: '<%= MAIN_SRC_DIR %>',
    dist: '<%= MAIN_SRC_DIR %>dist/',
    test: '<%= TEST_SRC_DIR %>'<% if(useSass) { %>,
    importPath: '<%= MAIN_SRC_DIR %>bower_components',
    scss: '<%= MAIN_SRC_DIR %>scss/'<% } %>,
    port: 9000,
    apiPort: 8080,
    liveReloadPort: 35729
};

gulp.task('clean', function () {
    return del([config.dist]);
});

gulp.task('test', ['wiredep:test', 'ngconstant:dev'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/' + config.test + 'karma.conf.js',
        singleRun: true
    }, done).start();
});

<%_ if (testFrameworks.indexOf('protractor') > -1) { _%>
gulp.task('protractor', function () {
    return gulp.src([config.test + 'e2e/**/*.js'])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(protractor({
            configFile: config.test + 'protractor.conf.js'
        }))
        .on('error', function(err) {
            console.log('E2E Tests failed');
            process.exit(1);
        });
});
<%_ } _%>

gulp.task('copy', function () {
    return es.merge( <% if(enableTranslation) { %> // copy i18n folders only if translation is enabled
        gulp.src(config.app + 'i18n/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'i18n/'))
        .pipe(gulp.dest(config.dist + 'i18n/')),<% } %>
        gulp.src(config.app + 'bower_components/bootstrap/fonts/*.*')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/fonts/'))
        .pipe(gulp.dest(config.dist + 'content/fonts/')),
        gulp.src(config.app + 'content/**/*.{woff,svg,ttf,eot}')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/fonts/'))
        .pipe(flatten())
        .pipe(gulp.dest(config.dist + 'content/fonts/')));
});

gulp.task('images', function () {
    return gulp.src(config.app + 'content/images/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/images'))
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest(config.dist + 'content/images'))
        .pipe(browserSync.reload({stream: true}));
});
<% if(useSass) { %>
gulp.task('sass', function () {
    var files = config.scss + '**/*.{scss,sass}',
        cssDir = config.app + 'content/css';
    return gulp.src(files)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(expect(files))
        .pipe(changed(config.app + 'content/css', {extension: '.css'}))
        .pipe(sass({includePaths:config.importPath}).on('error', sass.logError))
        .pipe(gulp.dest(cssDir));
});
<% } %>
gulp.task('styles', [<% if(useSass) { %>'sass'<% } %>], function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('install', function (done) {
    runSequence('wiredep', 'ngconstant:dev'<% if(useSass) { %>, 'sass'<% } %>, done);
});

gulp.task('serve', function () {
    runSequence('install', function () {
        var baseUri = 'http://localhost:' + config.apiPort;
        // Routes to proxy to the backend. Routes ending with a / will setup
        // a redirect so that if accessed without a trailing slash, will
        // redirect. This is required for some endpoints for proxy-middleware
        // to correctly handle them.
        var proxyRoutes = [
            '/api',
            '/health',
            '/configprops',
            '/env',
            '/v2/api-docs',
            '/swagger-ui',
            '/configuration/security',
            '/configuration/ui',
            '/swagger-resources',
            '/metrics',
            '/websocket/tracker',
            '/dump'<% if (authenticationType == 'oauth2') { %>,
            '/oauth/token'<% } %><% if (devDatabaseType == 'h2Disk' || devDatabaseType == 'h2Memory') { %>,
            '/console/'<% } %>
        ];

        var requireTrailingSlash = proxyRoutes.filter(function (r) {
            return util.endsWith(r, '/');
        }).map(function (r) {
            // Strip trailing slash so we can use the route to match requests
            // with non trailing slash
            return r.substr(0, r.length - 1);
        });

        var proxies = [
            // Ensure trailing slash in routes that require it
            function (req, res, next) {
                requireTrailingSlash.forEach(function (route){
                    if (url.parse(req.url).path === route) {
                        res.statusCode = 301;
                        res.setHeader('Location', route + '/');
                        res.end();
                    }
                });

                next();
            }
        ]
        .concat(
            // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
            proxyRoutes.map(function (r) {
                var options = url.parse(baseUri + r);
                options.route = r;
                options.preserveHost = true;
                return proxy(options);
            }));

        browserSync({
            open: true,
            port: config.port,
            server: {
                baseDir: config.app,
                middleware: proxies
            }
        });

        gulp.start('watch');
    });
});

gulp.task('watch', function () {
    gulp.watch('bower.json', ['wiredep']);
    gulp.watch(['gulpfile.js', <% if(buildTool == 'maven') { %>'pom.xml'<% } else { %>'build.gradle'<% } %>], ['ngconstant:dev']);
    gulp.watch(<% if(useSass) { %>config.scss + '**/*.{scss,sass}'<% } else { %>config.app + 'content/css/**/*.css'<% } %>, ['styles']);
    gulp.watch(config.app + 'content/images/**', ['images']);
    gulp.watch(config.app + 'app/**/*.js', ['eslint']);
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
});

gulp.task('wiredep', ['wiredep:test', 'wiredep:app']);

gulp.task('wiredep:app', function () {
    var stream = gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(wiredep({
            exclude: [/angular-i18n/]
        }))
        .pipe(gulp.dest(config.app));

    return <% if (useSass) { %>es.merge(stream, gulp.src(config.scss + '*.{scss,sass}')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(wiredep({
            exclude: [
                /angular-i18n/,  // localizations are loaded dynamically
                'bower_components/bootstrap/' // Exclude Bootstrap LESS as we use bootstrap-sass
            ],
            ignorePath: /\.\.\/webapp\/bower_components\// // remove ../webapp/bower_components/ from paths of injected sass files
        }))
        .pipe(gulp.dest(config.scss)));<% } else { %>stream;<% } %>
});

gulp.task('wiredep:test', function () {
    return gulp.src(config.test + 'karma.conf.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(wiredep({
            exclude: [/angular-i18n/, /angular-scenario/],
            ignorePath: /\.\.\/\.\.\//, // remove ../../ from paths of injected javascripts
            devDependencies: true,
            fileTypes: {
                js: {
                    block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
                    detect: {
                        js: /'(.*\.js)'/gi
                    },
                    replace: {
                        js: '\'src/{{filePath}}\','
                    }
                }
            }
        }))
        .pipe(gulp.dest(config.test));
});

gulp.task('build', function (cb) {
    runSequence('clean', 'copy', 'wiredep:app', 'ngconstant:prod', 'usemin', cb);
});

gulp.task('usemin', ['images', 'styles'], function () {
    return gulp.src([config.app + '**/*.html', '!' + config.app + '@(dist|bower_components)/**/*.html'])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(usemin({
            css: [
                prefix,
                'concat',
                cssnano,
                rev
            ],
            html: [
                htmlmin.bind(htmlmin, {collapseWhitespace: true})
            ],
            js: [
                sourcemaps.init,
                ngAnnotate,
                footer.bind(footer, ';'),
                'concat',
                uglify.bind(uglify, { mangle: false }),
                rev,
                sourcemaps.write.bind(sourcemaps.write, '.')
            ]
        }))
        .pipe(gulp.dest(config.dist));
});

gulp.task('ngconstant:dev', function () {
    return ngConstant({
        dest: 'app.constants.js',
        name: '<%= angularAppName %>',
        deps:   false,
        noFile: true,
        interpolate: /\{%=(.+?)%\}/g,
        wrap:
            '(function() {\n' +
            '    "use strict";\n' +
            '    // DO NOT EDIT THIS FILE, EDIT THE GULP TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE\n' +
            '    {%= __ngModule %}\n' +
            '})();\n',
        constants: {
            ENV: 'dev',
            VERSION: util.parseVersion()
        }
    })
    .pipe(gulp.dest(config.app + 'app/'));
});

gulp.task('ngconstant:prod', function () {
    return ngConstant({
        dest: 'app.constants.js',
        name: '<%= angularAppName %>',
        deps:   false,
        noFile: true,
        interpolate: /\{%=(.+?)%\}/g,
        wrap:
            '(function() {\n' +
            '    "use strict";\n' +
            '    // DO NOT EDIT THIS FILE, EDIT THE GULP TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE\n' +
            '    {%= __ngModule %}\n ' +
            '})();\n',
        constants: {
            ENV: 'prod',
            VERSION: util.parseVersion()
        }
    })
    .pipe(gulp.dest(config.app + 'app/'));
});

// check app for eslint errors
gulp.task('eslint', function () {
    return gulp.src(['gulpfile.js', config.app + 'app/**/*.js'])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

// check app for eslint errors anf fix some of them
gulp.task('eslint-and-fix', function () {
    return gulp.src(config.app + 'app/**/*.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(util.isLintFixed, gulp.dest(config.app + 'app')));
});

<%_ if (testFrameworks.indexOf('protractor') > -1) { _%>
gulp.task('itest', ['protractor']);
<%_ } _%>
gulp.task('default', ['serve']);
