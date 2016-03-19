'use strict';

var IllegalArgumentException = module.exports = function(message) {
  this.name = 'IllegalArgumentException';
  this.message = (message || '');
};
IllegalArgumentException.prototype = new Error();
