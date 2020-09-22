/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { merge } = require('./object-utils');

module.exports = {
    formatComment,
    formatDateForLiquibase,
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
    return parts.reduce((previousValue, currentValue) => {
        // newlines in the middle of the comment should stay to achieve:
        // multiline comments entered by user drive unchanged from JDL
        // studio to generated domain class
        let delimiter = '';
        if (previousValue !== '') {
            delimiter = '\\n';
        }
        return previousValue.concat(delimiter, currentValue.trim().replace(/[*]*\s*/, ''));
    }, '');
}

/**
 * Formats an optional date to be used by Liquibase.
 * @param {Object} args - the function's arguments.
 * @param {Date} args.date - the date to format, optional.
 * @param {Number} args.increment - an increment to be used to set minutes, optional.
 * @return {string} the formatted Date.
 */
function formatDateForLiquibase(args) {
    if (args && args.date) {
        // to safely handle the date, we create a copy of the date
        args.date = new Date(args.date.getTime());
    }
    const merged = merge(defaultsForLiquibaseDateFormatting(), args);
    merged.date.setMinutes(merged.date.getMinutes() + merged.increment);

    const nowUtc = new Date(
        merged.date.getUTCFullYear(),
        merged.date.getUTCMonth(),
        merged.date.getUTCDate(),
        merged.date.getUTCHours(),
        merged.date.getUTCMinutes(),
        merged.date.getUTCSeconds()
    );
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

function defaultsForLiquibaseDateFormatting() {
    return {
        date: new Date(),
        increment: 0,
    };
}
