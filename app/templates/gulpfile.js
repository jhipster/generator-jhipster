// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

var gulp = require('gulp'),
  prefix = require('gulp-autoprefixer'),
  minifyCss = require('gulp-minify-css'),
  usemin = require('gulp-usemin'),
  uglify = require('gulp-uglify'),<% if(useCompass) { %>
  sass = require('gulp-ruby-sass'),<% } %>
  minifyHtml = require('gulp-minify-html'),
  jshint = require('gulp-jshint'),
  rev = require('gulp-rev'),
  connect = require('gulp-connect'),
  proxy = require('proxy-middleware');

var yeoman = {
    app: 'src/main/webapp/',//require('./bower.json').appPath || 'app',
    dist: 'src/main/webapp/dist',
    tmp: '.tmp/'<% if(useCompass) { %>,
    scss: 'src/main/scss/'<% } %>
}

gulp.task('clean', function(){});
gulp.task('test', function(){});

<% if(useCompass) { %>
gulp.task('sass', function() {
  return gulp.src(yeoman.scss + '{,*/}*.scss').
    pipe(sass({loadPath: [yeoman.app + 'bower_components']})).
    pipe(gulp.dest(yeoman.tmp + 'styles'));
});
<% } %>

gulp.task('styles', [<% if(useCompass) { %> 'sass'<% } %>], function() {
  return gulp.src(yeoman.app + '{,*/}*.css').
    pipe(gulp.dest(yeoman.tmp));
});

gulp.task('connect', [<% if(useCompass) { %> 'sass'<% } %>], function() {
  connect.server(
    {
      root: [yeoman.app, yeoman.tmp],
      port: 9000,
      livereload: true,
      middleware: function(connect, o) {
	return [
	  (function() {
	    var url = require('url');
	    var proxy = require('proxy-middleware');
	    var options = url.parse('http://localhost:8080/app');
	    options.route = '/app';
	    return proxy(options);
	  })(),
	  (function() {
	    var url = require('url');
	    var proxy = require('proxy-middleware');
	    var options = url.parse('http://localhost:8080/metrics');
	    options.route = '/metrics';
	    return proxy(options);
	  })(),
	  (function() {
	    var url = require('url');
	    var proxy = require('proxy-middleware');
	    var options = url.parse('http://localhost:8080/dump');
	    options.route = '/dump';
	    return proxy(options);
	  })()<% if (devDatabaseType == 'h2Memory') { %>,
	  (function() {
	    var url = require('url');
	    var proxy = require('proxy-middleware');
	    var options = url.parse('http://localhost:8080/console');
	    options.route = '/console';
	    return proxy(options);
	  })()<% } %>
	];
      }
    }
  );
});

gulp.task('build', ['clean'], function() {
  gulp.run('usemin');
});

gulp.task('usemin', ['styles'], function(){
  return gulp.src(yeoman.app + '{,*/}*.html').
    pipe(usemin({
      css: [
	prefix.apply(),
	minifyCss(),
	rev(),
	'concat'
      ],
      html: [
	minifyHtml({empty: true, conditionals:true})
      ],
      js: [
	uglify(),
	rev(),
	'concat'
      ]
    })).
    pipe(gulp.dest(yeoman.dist));
});

gulp.task('default', function() {
  gulp.run('test');
  gulp.run('build');
});