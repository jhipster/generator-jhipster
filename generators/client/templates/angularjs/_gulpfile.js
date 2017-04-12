<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= packagejs.name %> <%= packagejs.version %>
'use strict';

var gulp = require('gulp'),<% if(useSass) { %>
    expect = require('gulp-expect-file'),
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    sass = require('gulp-sass'),<% } %>
    rev = require('gulp-rev'),
    templateCache = require('gulp-angular-templatecache'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    ngConstant = require('gulp-ng-constant'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),<% if (protractorTests) { %>
    argv = require('yargs').argv,
    gutil = require('gulp-util'),
    protractor = require('gulp-protractor').protractor,<% } %>
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    gulpIf = require('gulp-if');

var handleErrors = require('./gulp/handle-errors'),
    serve = require('./gulp/serve'),
    util = require('./gulp/utils'),
    copy = require('./gulp/copy'),
    inject = require('./gulp/inject'),
    build = require('./gulp/build');

var config = require('./gulp/config');

gulp.task('clean', function () {
    return del([config.dist], { dot: true });
});

gulp.task('copy', [<% if(enableTranslation) { %>'copy:i18n', <% } %>'copy:fonts', 'copy:common']);
<% if(enableTranslation) { /* copy i18n folders only if translation is enabled */ %>
gulp.task('copy:i18n', copy.i18n);

gulp.task('copy:languages', copy.languages);
<% } %>
gulp.task('copy:fonts', copy.fonts);

gulp.task('copy:common', copy.common);

gulp.task('copy:swagger', copy.swagger);

gulp.task('copy:images', copy.images);

gulp.task('images', function () {
    return gulp.src(config.app + 'content/images/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/images'))
        .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
        .pipe(rev())
        .pipe(gulp.dest(config.dist + 'content/images'))
        .pipe(rev.manifest(config.revManifest, {
            base: config.dist,
            merge: true
        }))
        .pipe(gulp.dest(config.dist))
        .pipe(browserSync.reload({stream: true}));
});

<%_ if(useSass) { _%>
gulp.task('sass', function () {
    return es.merge(
        gulp.src(config.sassSrc)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(expect(config.sassSrc))
        .pipe(sass({includePaths:config.bower}).on('error', sass.logError))
        .pipe(gulp.dest(config.cssDir)),
        gulp.src(config.bower + '**/fonts/**/*.{woff,woff2,svg,ttf,eot,otf}')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.app + 'content/fonts'))
        .pipe(flatten())
        .pipe(gulp.dest(config.app + 'content/fonts'))
    );
});
<%_ } _%>

gulp.task('styles', [<% if(useSass) { %>'sass'<% } %>], function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('inject', function() {
    runSequence('inject:dep', 'inject:app');
});

gulp.task('inject:dep', ['inject:test', 'inject:vendor']);

gulp.task('inject:app', inject.app);

gulp.task('inject:vendor', inject.vendor);

gulp.task('inject:test', inject.test);

gulp.task('inject:troubleshoot', inject.troubleshoot);

gulp.task('assets:prod', ['images', 'styles', 'html', 'copy:swagger', 'copy:images'], build);

gulp.task('html', function () {
    return gulp.src(config.app + 'app/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(templateCache({
            module: '<%= angularAppName %>',
            root: 'app/',
            moduleSystem: 'IIFE'
        }))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('ngconstant:dev', function () {
    return ngConstant({
        name: '<%= angularAppName %>',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: true
        },
        template: config.constantTemplate,
        stream: true
    })
    .pipe(rename('app.constants.js'))
    .pipe(gulp.dest(config.app + 'app/'));
});

gulp.task('ngconstant:prod', function () {
    return ngConstant({
        name: '<%= angularAppName %>',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: false
        },
        template: config.constantTemplate,
        stream: true
    })
    .pipe(rename('app.constants.js'))
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
gulp.task('eslint:fix', function () {
    return gulp.src(config.app + 'app/**/*.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(util.isLintFixed, gulp.dest(config.app + 'app')));
});

gulp.task('test', ['inject:test', 'ngconstant:dev'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/' + config.test + 'karma.conf.js',
        singleRun: true
    }, done).start();
});

<%_ if (protractorTests) { _%>
/* to run individual suites pass `gulp itest --suite suiteName` */
gulp.task('protractor', function () {
    var configObj = {
        configFile: config.test + 'protractor.conf.js'
    };
    if (argv.suite) {
        configObj['args'] = ['--suite', argv.suite];
    }
    return gulp.src([])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(protractor(configObj))
        .on('error', function () {
            gutil.log('E2E Tests failed');
            process.exit(1);
        });
});

gulp.task('itest', ['protractor']);
<%_ } _%>

gulp.task('watch', function () {
    gulp.watch('bower.json', ['install']);
    gulp.watch(['gulpfile.js', <% if(buildTool == 'maven') { %>'pom.xml'<% } else { %>'build.gradle'<% } %>], ['ngconstant:dev']);
    gulp.watch(<% if(useSass) { %>config.sassSrc<% } else { %>config.app + 'content/css/**/*.css'<% } %>, ['styles']);
    gulp.watch(config.app + 'content/images/**', ['images']);
    gulp.watch(config.app + 'app/**/*.js', ['inject:app']);
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
});

gulp.task('install', function () {
    runSequence(['inject:dep', 'ngconstant:dev']<% if(useSass) { %>, 'sass'<% } %><% if(enableTranslation) { %>, 'copy:languages'<% } %>, 'inject:app', 'inject:troubleshoot');
});

gulp.task('serve', ['install'], serve);

gulp.task('build', ['clean'], function (cb) {
    runSequence(['copy', 'inject:vendor', 'ngconstant:prod'<% if(enableTranslation) { %>, 'copy:languages'<% } %>], 'inject:app', 'inject:troubleshoot', 'assets:prod', cb);
});

gulp.task('default', ['serve']);
