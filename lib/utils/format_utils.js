

const _ = require('lodash');
const merge = require('./object_utils').merge;

module.exports = {
  formatComment,
  dateFormatForLiquibase
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
  const parts = comment.trim().split('\n');
  if (parts.length === 1 && parts[0].indexOf('*') !== 0) {
    return parts[0];
  }
  return _.reduce(parts, (previousValue, currentValue) => {
    // newlines in the middle of the comment should stay to achieve:
    // multiline comments entered by user drive unchanged from JDL
    // studio to generated domain class
    let delimiter = '';
    if (previousValue !== '') {
      delimiter = '\n';
    }
    return previousValue.concat(
      delimiter,
      currentValue.trim().replace(/[*]*\s*/, ''));
  }, '');
}

function defaultsForLiquibaseDateFormatting() {
  return {
    date: new Date(),
    increment: 0
  };
}

function dateFormatForLiquibase(args) {
  if (args && args.date) {
    // to safely handle the date, we create a copy of the date
    args.date = new Date(JSON.parse(JSON.stringify(args.date)));
  }
  const merged = merge(defaultsForLiquibaseDateFormatting(), args);
  merged.date.setSeconds(merged.date.getUTCSeconds() + merged.increment);
  const nowUtc = new Date(
    merged.date.getUTCFullYear(),
    merged.date.getUTCMonth(),
    merged.date.getUTCDate(),
    merged.date.getUTCHours(),
    merged.date.getUTCMinutes(),
    merged.date.getUTCSeconds());
  const year = `${nowUtc.getFullYear()}`;
  let month = `${nowUtc.getMonth() + 1}`;
  if (month.length === 1) {
    month = `0${month}`;
  }
  let day = `${nowUtc.getDate()}`;
  if (day.length === 1) {
    day = `0${day}`;
  }
  let hour = `${nowUtc.getHours()}`;
  if (hour.length === 1) {
    hour = `0${hour}`;
  }
  let minute = `${nowUtc.getMinutes()}`;
  if (minute.length === 1) {
    minute = `0${minute}`;
  }
  let second = `${nowUtc.getSeconds()}`;
  if (second.length === 1) {
    second = `0${second}`;
  }
  return `${year}${month}${day}${hour}${minute}${second}`;
}
