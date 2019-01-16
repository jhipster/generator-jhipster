const chalk = require('chalk');
const jhipsterUtils = require('../utils');

module.exports = class {
    addBlockContentToFile(fullPath, content, needleTag) {
        try {
            jhipsterUtils.rewriteFile(
                {
                    file: fullPath,
                    needle: needleTag,
                    splicable: [content]
                },
                this
            );
        } catch (e) {
            this.log(
                chalk.yellow('\nUnable to find ') +
                fullPath +
                chalk.yellow(' or missing required jhipster-needle. Content not added to JHipster app.\n')
            );
            this.debug('Error:', e);
        }
    }
};
