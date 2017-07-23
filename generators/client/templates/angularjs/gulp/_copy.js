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
    rev = require('gulp-rev'),
    plumber = require('gulp-plumber'),
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    replace = require('gulp-replace'),
    bowerFiles = require('main-bower-files'),
    changed = require('gulp-changed');

var handleErrors = require('./handle-errors');
var config = require('./config');

module.exports = {<% if(enableTranslation) { /* copy i18n folders only if translation is enabled */ %>
    i18n: i18n,
    languages: languages,<% } %>
    fonts: fonts,
    common: common,
    swagger: swagger,
    images: images
}
<% if(enableTranslation) { %>
var yorc = require('../.yo-rc.json')['generator-jhipster'];

function i18n() {
    return gulp.src(config.app + 'i18n/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'i18n/'))
        .pipe(gulp.dest(config.dist + 'i18n/'));
}

function languages() {
    var locales = yorc.languages.map(function (locale) {
        return config.bower + 'angular-i18n/angular-locale_' + locale + '.js';
    });
    return gulp.src(locales)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.app + 'i18n/'))
        .pipe(gulp.dest(config.app + 'i18n/'));
}
<% } %>
function fonts() {
    return es.merge(<% if(!useSass) { %>gulp.src(config.bower + 'bootstrap/fonts/*.*')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/fonts/'))
        .pipe(rev())
        .pipe(gulp.dest(config.dist + 'content/fonts/'))
        .pipe(rev.manifest(config.revManifest, {
            base: config.dist,
            merge: true
        }))
        .pipe(gulp.dest(config.dist)),<% } %>
        gulp.src(config.app + 'content/**/*.{woff,woff2,svg,ttf,eot,otf}')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/fonts/'))
        .pipe(flatten())
        .pipe(rev())
        .pipe(gulp.dest(config.dist + 'content/fonts/'))
        .pipe(rev.manifest(config.revManifest, {
            base: config.dist,
            merge: true
        }))
        .pipe(gulp.dest(config.dist))
    );
}

function common() {
    return gulp.src([
        config.app + 'robots.txt',
        config.app + 'favicon.ico',
        config.app + '.htaccess',
        // config.app + 'sw.js',
        config.app + 'manifest.webapp'
    ], { dot: true })
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist))
        .pipe(gulp.dest(config.dist));
}

function swagger() {
    return es.merge(
        gulp.src([config.bower + 'swagger-ui/dist/**',
             '!' + config.bower + 'swagger-ui/dist/index.html',
             '!' + config.bower + 'swagger-ui/dist/swagger-ui.min.js',
             '!' + config.bower + 'swagger-ui/dist/swagger-ui.js'])
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(changed(config.swaggerDist))
            .pipe(gulp.dest(config.swaggerDist)),
        gulp.src(config.app + 'swagger-ui/index.html')
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(changed(config.swaggerDist))
            .pipe(replace('../bower_components/swagger-ui/dist/', ''))
            .pipe(replace('swagger-ui.js', 'lib/swagger-ui.min.js'))
            .pipe(gulp.dest(config.swaggerDist)),
        gulp.src(config.bower  + 'swagger-ui/dist/swagger-ui.min.js')
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(changed(config.swaggerDist + 'lib/'))
            .pipe(gulp.dest(config.swaggerDist + 'lib/'))
    );
}

function images() {
    return gulp.src(bowerFiles({filter: ['**/*.{gif,jpg,png}']}), { base: config.bower })
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist +  'bower_components'))
        .pipe(gulp.dest(config.dist +  'bower_components'));
}
