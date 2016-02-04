var notify = require("gulp-notify");

module.exports = function() {

  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
      title:    "JHipster Gulp Build",
      subtitle: "Failure!",
      message:  "Error: <%= error.message %>",
      sound:    "Beep"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};
