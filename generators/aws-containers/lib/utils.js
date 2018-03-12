const _ = require('lodash'); // eslint-disable-line
const ora = require('ora'); // eslint-disable-line

/**
 * Wraps the promise in a CLI spinner
 * @param promise
 * @param text
 * @param spinnerIcon
 */
function spinner(promise, text = 'loading', spinnerIcon = 'monkey') {
    const spinner = ora({ spinner: spinnerIcon, text }).start();
    return new Promise((resolve, reject) => {
        promise.then((resolved) => {
            spinner.stop();
            resolve(resolved);
        }).catch((err) => {
            spinner.stop();
            reject(err);
        });
    });
}

function formatRDSUsername(username) {
    return _.chain(username)
        .replace('_', '')
        .truncate({ length: 16, omission: '' })
        .value();
}

module.exports = {
    spinner,
    formatRDSUsername
};
