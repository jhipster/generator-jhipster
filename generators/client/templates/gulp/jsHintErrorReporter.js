'use strict';

var map = require('map-stream'),
    events = require('events'),
    emmitter = new events.EventEmitter();

module.exports = function(file, cb) {
    return map(function (file, cb) {
        if (!file.jshint.success) {
            var nbErrors = 0;
            file.jshint.results.map(function (data) {
            if (data.error && data.error.code && data.error.code[0] === 'E') {
                nbErrors++;
            }});
            if (nbErrors){
                emmitter.emit('error', new Error('JSHint failed for: ' + file.relative + ' (' + nbErrors + ' errors)\n'));
            }
        }
        cb(null, file);
    });
};
