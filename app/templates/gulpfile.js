// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
/* jshint camelcase: false */
'use strict';

var gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),<% if(useCompass) { %>
    compass = require('gulp-compass'),<% } %>
    minifyHtml = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    ngAnnotate = require('gulp-ng-annotate'),
    jshint = require('gulp-jshint'),
    rev = require('gulp-rev'),
    connect = require('gulp-connect'),
    proxy = require('proxy-middleware'),
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    clean = require('gulp-clean'),
    replace = require('gulp-replace'),
    url = require('url');

var karma = require('gulp-karma')({configFile: 'src/test/javascript/karma.conf.js'});

var yeoman = {
    app: 'src/main/webapp/',
    dist: 'src/main/webapp/dist/',
    test: 'src/test/javascript/spec/',
    tmp: '.tmp/'<% if(useCompass) { %>,
    scss: 'src/main/scss/'<% } %>,
    port: 9000,
    apiPort: 8080,
    liveReloadPort: 35729
};

gulp.task('clean', function() {
    return gulp.src(yeoman.dist, {read: false}).
        pipe(clean());
});

gulp.task('clean:tmp', function() {
    return gulp.src(yeoman.tmp, {read: false}).
        pipe(clean());
});

gulp.task('test', function() {
    karma.once();
});

gulp.task('copy', ['clean'], function() {
    return es.merge(gulp.src(yeoman.app + 'i18n/**').
              pipe(gulp.dest(yeoman.dist + 'i18n/')),
              gulp.src(yeoman.app + 'assets/**/*.{woff,svg,ttf,eot}').
              pipe(flatten()).
              pipe(gulp.dest(yeoman.dist + 'assets/fonts/')));
});

gulp.task('images', function() {
    return gulp.src(yeoman.app + 'assets/images/**').
        pipe(imagemin({optimizationLevel: 5})).
        pipe(gulp.dest(yeoman.dist + 'assets/images')).
        pipe(connect.reload());
});
<% if(useCompass) { %>
gulp.task('compass', function() {
    return gulp.src(yeoman.scss + '**/*.scss').
        pipe(compass({
                project: __dirname,
                sass: 'src/main/scss',
                css: 'src/main/webapp/assets/styles',
                generated_images: '.tmp/images/generated',
                image: 'src/main/webapp/assets/images',
                javascript: 'src/main/webapp/scripts',
                font: 'src/main/webapp/assets/fonts',
                import_path: 'src/main/webapp/bower_components',
                relative: false
        })).
        pipe(gulp.dest(yeoman.tmp + 'styles'));
});
<% } %>
gulp.task('styles', [<% if(useCompass) { %>'compass'<% } %>], function() {
    return gulp.src(yeoman.app + 'assets/styles/**/*.css').
        pipe(gulp.dest(yeoman.tmp)).
        pipe(connect.reload());
});

gulp.task('scripts', function () {
    gulp.src(yeoman.app + 'scripts/**').
        pipe(connect.reload());
});

gulp.task('server', ['watch'<% if(useCompass) { %>, 'compass'<% } %>], function() {
    var baseUri = 'http://localhost:' + yeoman.apiPort;
    // Routes to proxy to the backend
    var proxyRoutes = [
        '/api',
        '/health',
        '/configprops',
        '/api-docs',
        '/metrics',
        '/dump'<% if (authenticationType == 'token') { %>,
        '/oauth/token'<% } %><% if (devDatabaseType == 'h2Memory') { %>,
        '/console'<% } %>
    ];

    connect.server({
        root: [yeoman.app, yeoman.tmp],
        port: yeoman.port,
        livereload: {
            port: yeoman.liveReloadPort
        },
        middleware: function() {
            // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
            return proxyRoutes.map(function (r) {
                var options = url.parse(baseUri + r);
                options.route = r;
                return proxy(options);
            });
        }
    });
});

gulp.task('watch', function() {
    gulp.watch(yeoman.app + '*.html', ['usemin']);
    gulp.watch(yeoman.app + 'scripts/**', ['scripts']);
    gulp.watch(<% if(useCompass) { %>yeoman.scss + '**/*.scss'<% } else { %>yeoman.app + 'assets/styles/**/*.css'<% } %>, ['styles']);
    gulp.watch('src/images/**', ['images']);
});

gulp.task('server:dist', ['build'], function() {
    var baseUri = 'http://localhost:' + yeoman.apiPort;
    // Routes to proxy to the backend
    var proxyRoutes = [
        '/api',
        '/metrics',
        '/dump',
        '/api-docs'<% if (authenticationType == 'token') { %>,
        '/oauth/token'<% } %><% if (devDatabaseType == 'h2Memory') { %>,
        '/console'<% } %>
    ];

    connect.server({
        root: [yeoman.dist],
        port: yeoman.port,
        /*livereload: {
         port: yeoman.liveReloadPort
         },*/
        middleware: function() {
            // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
            return proxyRoutes.map(function (r) {
                var options = url.parse(baseUri + r);
                options.route = r;
                return proxy(options);
            });
        }
    });
});

gulp.task('build', ['copy'], function () {
    gulp.run('usemin');
});

gulp.task('usemin', ['images', 'styles'], function() {
    return gulp.src(yeoman.app + '*.html').
        pipe(usemin({
            css: [
                prefix.apply(),
                replace(/[0-9a-zA-Z\-_\s\.\/]*\/([a-zA-Z\-_\.0-9]*\.(woff|eot|ttf|svg))/g, '/assets/fonts/$1'),
                //minifyCss(),
                'concat',
                rev()
            ],
            html: [
                minifyHtml({empty: true, conditionals:true})
            ],
            js: [
                ngAnnotate(),
                uglify(),
                'concat',
                rev()
            ]
        })).
        pipe(gulp.dest(yeoman.dist)).
        pipe(connect.reload());
});

gulp.task('jshint', function() {
    return gulp.src(['gulpfile.js', yeoman.app + 'scripts/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', function() {
    gulp.run('test');
    gulp.run('build');
});
