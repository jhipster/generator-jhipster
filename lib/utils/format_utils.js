'use strict';

module.exports = {
  formatComment: formatComment,
  dateFormatForLiquibase: dateFormatForLiquibase
};

/**
 * formats a comment
 * @param {String} comment string.
 * @returns {String} formatted comment string
 */
function formatComment(comment) {
  if (!comment) {
    return undefined;
  }
  var parts = comment.trim().split('\n');
  if (parts.length === 1 && parts[0].indexOf('*') !== 0) {
    return parts[0];
  }
  return parts.reduce(function(previousValue, currentValue) {
    // newlines in the middle of the comment should stay to achieve:
    // multiline comments entered by user drive unchanged from JDL studio to generated domain class
    var delimiter = '';
    if (previousValue !== '') {
      delimiter = '\n';
    }
    return previousValue.concat(delimiter, currentValue.trim().replace(/[*]*\s*/, ''));
  }, '');
}

function dateFormatForLiquibase(increment) {
  var now = new Date();
  var now_utc = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds());
  var year = '' + now_utc.getFullYear();
  var month = '' + (now_utc.getMonth() + 1);
  if (month.length === 1) {
    month = `0${month}`;
  }
  var day = '' + now_utc.getDate();
  if (day.length === 1) {
    day = `0${day}`;
  }
  var hour = '' + now_utc.getHours();
  if (hour.length === 1) {
    hour = `0${hour}`;
  }
  var minute = '' + now_utc.getMinutes();
  if (minute.length === 1) {
    minute = `0${minute}`;
  }
  var second = '' + (now_utc.getSeconds() + increment) % 60;
  if (second.length === 1) {
    second = `0${second}`;
  }
  return `${year}${month}${day}${hour}${minute}${second}`;
}
