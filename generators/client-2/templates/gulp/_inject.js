'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    inject = require('gulp-inject'),
    angularFilesort = require('gulp-angular-filesort'),
    naturalSort = require('gulp-natural-sort'),
    es = require('event-stream'),
    bowerFiles = require('main-bower-files');

var handleErrors = require('./handleErrors');

var config = require('./config');

module.exports = {
    app: app,
    vendor: vendor,
    test: test,
    troubleshoot: troubleshoot
}
// TODO temp filter out ng2 files, need to completeley remove this task
function app() {
    return gulp.src(config.dist + 'index.html')
        .pipe(inject(gulp.src([config.dist + 'app/**/*.js',
            '!' + config.dist + 'app/**/upgrade_adapter.js',
            '!' + config.dist + 'app/**/profile-info.js',
            '!' + config.dist + 'app/**/profile.service.js',
            '!' + config.dist + 'app/**/page-ribbon.component.js',
            '!' + config.dist + 'app/**/app.main.js'])
            .pipe(naturalSort())
            .pipe(angularFilesort()), {relative: true}))
        .pipe(gulp.dest(config.dist));
}

function vendor() {
    var stream = gulp.src(config.dist + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {
            name: 'bower',
            relative: false,
            transform: function (filepath) {
                '<script src="' + filepath.replace('/src/main/webapp/', '') + '"></script>'; // TODO temp hack
            }
        }))
        .pipe(gulp.dest(config.dist));

    return <% if (useSass) { %>es.merge(stream, gulp.src(config.sassVendor)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles({filter:['**/*.{scss,sass}']}), {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.scss)));<% } else { %>stream;<% } %>
}

function test() {
    return gulp.src(config.test + 'karma.conf.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles({includeDev: true, filter: ['**/*.js']}), {read: false}), {
            starttag: '// bower:js',
            endtag: '// endbower',
            transform: function (filepath) {
                return '\'' + filepath.substring(1, filepath.length) + '\',';
            }
        }))
        .pipe(gulp.dest(config.test));
}

function troubleshoot() {
    /* this task removes the troubleshooting content from index.html*/
    return gulp.src(config.dist + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        /* having empty src as we dont have to read any files*/
        .pipe(inject(gulp.src('', {read: false}), {
            starttag: '<!-- inject:troubleshoot -->',
            removeTags: true,
            transform: function () {
                return '<!-- Angular views -->';
            }
        }))
        .pipe(gulp.dest(config.dist));
}
