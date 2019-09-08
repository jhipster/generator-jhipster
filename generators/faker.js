const faker = require('faker');

/*
 * Current faker version is 4.1.0 and was release in 2017
 * It is outdated
 * Replace 'recent' function with current version:
 * https://github.com/Marak/faker.js/blob/10bfb9f467b0ac2b8912ffc15690b50ef3244f09/lib/date.js#L73-L96
 * Needed for reproducible builds
 */
/* eslint-disable-next-line */
faker.date.recent = function (days, refDate) {
    /* eslint-disable */
    var date = new Date();
    if (typeof refDate !== "undefined") {
        date = new Date(Date.parse(refDate));
    }

    var range = {
            min: 1000,
            max: (days || 1) * 24 * 3600 * 1000
    };

    var future = date.getTime();
    future -= faker.random.number(range); // some time from now to N days ago, in milliseconds
    date.setTime(future);

    return date;
};

module.exports = faker;
