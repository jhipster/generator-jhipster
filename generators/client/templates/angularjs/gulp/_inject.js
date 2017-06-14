<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    inject = require('gulp-inject'),
    es = require('event-stream'),
    naturalSort = require('gulp-natural-sort'),
    angularFilesort = require('gulp-angular-filesort'),
    bowerFiles = require('main-bower-files');

var handleErrors = require('./handle-errors');

var config = require('./config');

module.exports = {
    app: app,
    vendor: vendor,
    test: test,
    troubleshoot: troubleshoot
}

function app() {
    return gulp.src(config.app + 'index.html')
        .pipe(inject(gulp.src(config.app + 'app/**/*.js')
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(naturalSort())
            .pipe(angularFilesort()), {relative: true}))
        .pipe(gulp.dest(config.app));
}

function vendor() {
    var stream = gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.app));

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
    return gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        /* having empty src as we dont have to read any files*/
        .pipe(inject(gulp.src('', {read: false}), {
            starttag: '<!-- inject:troubleshoot -->',
            removeTags: true,
            transform: function () {
                return '<!-- Angular views -->';
            }
        }))
        .pipe(gulp.dest(config.app));
}
