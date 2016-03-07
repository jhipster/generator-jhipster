// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= packagejs.name %> <%= packagejs.version %>
'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    prefix = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),<% if(useSass) { %>
    expect = require('gulp-expect-file'),
    sass = require('gulp-sass'),<% } %>
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngConstant = require('gulp-ng-constant-fork'),
    eslint = require('gulp-eslint'),
    rev = require('gulp-rev'),<% if (testFrameworks.indexOf('protractor') > -1) { %>
    protractor = require('gulp-protractor').protractor,<% } %>
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    del = require('del'),
    wiredep = require('wiredep').stream,
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    sourcemaps = require('gulp-sourcemaps'),
    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    handleErrors = require('./gulp/handleErrors'),
    serve = require('./gulp/serve'),
    util = require('./gulp/utils'),
    gulpIf = require('gulp-if'),
    footer = require('gulp-footer');

var yorc = require('./.yo-rc.json')['generator-jhipster'];

var config = {
    app: '<%= MAIN_SRC_DIR %>',
    dist: '<%= DIST_DIR %>',
    test: '<%= TEST_SRC_DIR %>'<% if(useSass) { %>,
    scss: '<%= MAIN_SRC_DIR %>scss/',
    sassSrc: '<%= MAIN_SRC_DIR %>scss/**/*.{scss,sass}',
    cssDir: '<%= MAIN_SRC_DIR %>content/css'<% } %>,
    bower: '<%= MAIN_SRC_DIR %>bower_components/'
};

gulp.task('clean', function () {
    return del([config.dist], { dot: true });
});

gulp.task('copy', function () {
    return es.merge( <% if(enableTranslation) { /* copy i18n folders only if translation is enabled */ %>
        gulp.src(config.app + 'i18n/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'i18n/'))
        .pipe(gulp.dest(config.dist + 'i18n/')),<% } %><% if(!useSass) { %>
        gulp.src(config.bower + 'bootstrap/fonts/*.*')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/fonts/'))
        .pipe(gulp.dest(config.dist + 'content/fonts/')),<% } %>
        gulp.src(config.app + 'content/**/*.{woff,svg,ttf,eot}')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/fonts/'))
        .pipe(flatten())
        .pipe(gulp.dest(config.dist + 'content/fonts/')),
        gulp.src([config.app + 'robots.txt', config.app + 'favicon.ico', config.app + '.htaccess'], { dot: true })
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist))
        .pipe(gulp.dest(config.dist))
    );
});

gulp.task('images', function () {
    return gulp.src(config.app + 'content/images/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/images'))
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest(config.dist + 'content/images'))
        .pipe(browserSync.reload({stream: true}));
});

<%_ if(useSass) { _%>
gulp.task('sass', function () {
    return es.merge(
        gulp.src(config.sassSrc)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(expect(config.sassSrc))
        .pipe(changed(config.cssDir, {extension: '.css'}))
        .pipe(sass({includePaths:config.bower}).on('error', sass.logError))
        .pipe(gulp.dest(config.cssDir)),
        gulp.src(config.bower + 'bootstrap-sass/assets/fonts/bootstrap/*.*')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.app + 'content/fonts'))
        .pipe(gulp.dest(config.app + 'content/fonts'))
    );
});
<%_ } _%>

<%_ if(enableTranslation) { _%>
gulp.task('languages', function () {
    return gulp.src(config.bower + 'angular-i18n/angular-locale_{' + yorc.languages.join(',') + '}.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.app + 'i18n/'))
        .pipe(gulp.dest(config.app + 'i18n/'));
});
<%_ } _%>

gulp.task('styles', [<% if(useSass) { %>'sass'<% } %>], function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('wiredep', ['wiredep:test', 'wiredep:app']);

gulp.task('wiredep:app', function () {
    var stream = gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(wiredep({
            exclude: [
                /angular-i18n/,  // localizations are loaded dynamically<% if (useSass) { %>
                'bower_components/bootstrap-sass/assets/javascripts/', // Exclude Bootstrap js files as we use ui-bootstrap<% } else { %>
                'bower_components/bootstrap/dist/js/' // exclude bootstrap js files as we use ui-bootstrap<% } %>
            ]
        }))
        .pipe(gulp.dest(config.app));

    return <% if (useSass) { %>es.merge(stream, gulp.src(config.sassSrc)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(wiredep({
            ignorePath: /\.\.\/webapp\/bower_components\// // remove ../webapp/bower_components/ from paths of injected sass files
        }))
        .pipe(gulp.dest(config.scss)));<% } else { %>stream;<% } %>
});

gulp.task('wiredep:test', function () {
    return gulp.src(config.test + 'karma.conf.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(wiredep({
            exclude: [
                /angular-i18n/,  // localizations are loaded dynamically
                /angular-scenario/,<% if (useSass) { %>
                'bower_components/bootstrap-sass/assets/javascripts/' // Exclude Bootstrap js files as we use ui-bootstrap<% } else { %>
                'bower_components/bootstrap/dist/js/' // exclude Bootstrap js files as we use ui-bootstrap<% } %>
            ],
            ignorePath: /\.\.\/\.\.\//, // remove ../../ from paths of injected JavaScript files
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

gulp.task('usemin', ['images', 'styles'], function () {
    return gulp.src([config.app + '**/*.html', '!' + config.bower + '**/*.html'])
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
            '    {%= __ngModule %}\n' +
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
        .on('error', function() {
            gutil.log('E2E Tests failed');
            process.exit(1);
        });
});

gulp.task('itest', ['protractor']);
<%_ } _%>

gulp.task('watch', function () {
    gulp.watch('bower.json', ['wiredep']);
    gulp.watch(['gulpfile.js', <% if(buildTool == 'maven') { %>'pom.xml'<% } else { %>'build.gradle'<% } %>], ['ngconstant:dev']);
    gulp.watch(<% if(useSass) { %>config.sassSrc<% } else { %>config.app + 'content/css/**/*.css'<% } %>, ['styles']);
    gulp.watch(config.app + 'content/images/**', ['images']);
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
});

gulp.task('install', function (done) {
    runSequence('wiredep', 'ngconstant:dev'<% if(useSass) { %>, 'sass'<% } %><% if(enableTranslation) { %>, 'languages'<% } %>, done);
});

gulp.task('serve', function () {
    runSequence('install', serve);
});

gulp.task('build', function (cb) {
    runSequence('clean', 'copy', 'wiredep:app', 'ngconstant:prod', 'eslint', 'usemin', cb);
});

gulp.task('default', ['serve']);
