'use strict';

var WrongFileException = module.exports = function(message) {
  this.name = 'WrongFileException';
  this.message = (message || '');
};
WrongFileException.prototype = new Error();