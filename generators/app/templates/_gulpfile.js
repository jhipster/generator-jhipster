var browserify   = require('browserify');
var watchify     = require('watchify');
var bundleLogger = require('./gulp-util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('./gulp-util/handleErrors');
var source       = require('vinyl-source-stream');
var babelify     = require('babelify');
var browserSync  = require('browser-sync');
var sequence     = require('gulp-sequence');

var src = './src/main/webapp',
dest = src + '/content',
dist = src + '/dist'
mui = './node_modules/material-ui/src';

var config = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + '/**'
    ]
  },
  markup: {
    src: [src + "/index.html"]
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/app/app.jsx',
      dest: dest + '/js',
      outputName: 'app.js'
    }],
    extensions: ['.jsx'],
  }
};

gulp.task('markup', function() {
  return gulp.src(config.markup.src)
    .pipe(gulp.dest(dist));
});

gulp.task('content', function() {
  return gulp.src(src + '/content/**')
    .pipe(gulp.dest(dist + '/content'));
});

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('watch', ['setWatch', 'browserSync'], function() {
  gulp.watch(config.markup.src, ['markup']);
});

gulp.task('build', sequence('browserify', 'markup', 'content'));

gulp.task('default', ['watch']);

gulp.task('browserSync', ['build'], function() {
  browserSync(config.browserSync);
});

/* browserify task
   ---------------
   Bundle javascripty things with browserify!
   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.
   See browserify.bundleConfigs in gulp/config.js
*/

gulp.task('browserify', function(callback) {

  var bundleQueue = config.browserify.bundleConfigs.length;

  var browserifyThis = function(bundleConfig) {

    var bundler = browserify({
      // Required watchify args
      cache: {}, packageCache: {}, fullPaths: false,
      // Specify the entry point of your app
      entries: bundleConfig.entries,
      // Add file extentions to make optional in your requires
      extensions: config.browserify.extensions,
      // Enable source maps!
      debug: config.browserify.debug
    });

    var bundle = function() {
      // Log when bundling starts
      bundleLogger.start(bundleConfig.outputName);

      return bundler
        .bundle()
        // Report compile errors
        .on('error', handleErrors)
        // Use vinyl-source-stream to make the
        // stream gulp compatible. Specifiy the
        // desired output filename here.
        .pipe(source(bundleConfig.outputName))
        // Specify the output destination
        .pipe(gulp.dest(bundleConfig.dest))
        .on('end', reportFinished);
    };

    bundler.transform(babelify.configure());

    if (global.isWatching) {
      // Wrap with watchify and rebundle on changes
      bundler = watchify(bundler);
      // Rebundle on update
      bundler.on('update', bundle);
    }

    var reportFinished = function() {
      // Log when bundling completes
      bundleLogger.end(bundleConfig.outputName);

      if (bundleQueue) {
        bundleQueue--;
        if (bundleQueue === 0) {
          // If queue is empty, tell gulp the task is complete.
          // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
          callback();
        }
      }
    };

    return bundle();
  };

  // Start bundling with Browserify for each bundleConfig specified
  config.browserify.bundleConfigs.forEach(browserifyThis);
});
