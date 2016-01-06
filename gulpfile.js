(function() {
  'use strict';

  var gulp = require('gulp');
  var bumper = require('gulp-bump');
  var git = require('gulp-git');
  var shell = require('gulp-shell');
  var rename = require('gulp-rename');
  var fs = require('fs');
  var sequence = require('gulp-sequence');
  var path = require('path');
  var eslint = require('gulp-eslint');
  var excludeGitignore = require('gulp-exclude-gitignore');
  var mocha = require('gulp-mocha');
  var istanbul = require('gulp-istanbul');
  var nsp = require('gulp-nsp');
  var plumber = require('gulp-plumber');

  gulp.task('static', function () {
    return gulp.src('**/*.js')
      .pipe(excludeGitignore())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });

  gulp.task('nsp', function (cb) {
    nsp({package: path.resolve('package.json')}, cb);
  });

  gulp.task('pre-test', function () {
    return gulp.src('generators/app/index.js')
      .pipe(istanbul({
        includeUntested: true
      }))
      .pipe(istanbul.hookRequire());
  });

  gulp.task('test', ['pre-test'], function (cb) {
    var mochaErr;

    gulp.src('test/**/*.js')
      .pipe(plumber())
      .pipe(mocha({reporter: 'spec'}))
      .on('error', function (err) {
        mochaErr = err;
      })
      .pipe(istanbul.writeReports())
      .on('end', function () {
        cb(mochaErr);
      });
  });

  gulp.task('bump-patch', bump('patch'));
  gulp.task('bump-minor', bump('minor'));
  gulp.task('bump-major', bump('major'));

  gulp.task('git-commit', function() {
    var v = 'update to version ' + version();
    gulp.src(['./generators/**/*','./README.md', './package.json', './gulpfile.js', './.travis.yml', './travis/**/*'])
      .pipe(git.add())
      .pipe(git.commit(v));
  });

  gulp.task('git-push', function(cb) {
    var v = version();
    git.push('origin', 'master', function(err) {
      if (err) return cb(err);
      git.tag(v, v, function(err) {
        if (err) return cb(err);
        git.push('origin', 'master', {
          args: '--tags'
        }, cb);
      });
    });
  });

  gulp.task('npm', shell.task([
    'npm publish'
  ]));

  function bump(level) {
    return function() {
      return gulp.src(['./package.json'])
        .pipe(bumper({
          type: level
        }))
        .pipe(gulp.dest('./'));
    };
  }

  function version() {
    return JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  }

  gulp.task('prepublish', ['nsp']);
  gulp.task('default', ['static', 'test']);
  gulp.task('deploy-patch', sequence('test', 'bump-patch', 'git-commit', 'git-push', 'npm'));
  gulp.task('deploy-minor', sequence('test', 'bump-minor', 'git-commit', 'git-push', 'npm'));
  gulp.task('deploy-major', sequence('test', 'bump-major', 'git-commit', 'git-push', 'npm'));

})();
