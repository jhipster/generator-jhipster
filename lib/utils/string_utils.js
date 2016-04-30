'use strict';

module.exports = {
  isNilOrEmpty: isNilOrEmpty
};

function isNilOrEmpty(string) {
  return string == null || string === '';
}
