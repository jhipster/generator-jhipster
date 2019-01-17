const chalk = require('chalk');
const jhipsterUtils = require('../utils');

module.exports = class {
    constructor(generator) {
        this.generator = generator;
    }

    addBlockContentToFile(rewriteFileModel, errorMessage) {
        try {
            jhipsterUtils.rewriteFile(
                {
                    file: rewriteFileModel.file,
                    needle: rewriteFileModel.needle,
                    splicable: rewriteFileModel.splicable
                },
                this.generator
            );
        } catch (e) {
            this.logNeedleNotFound(e, errorMessage, rewriteFileModel.file);
        }
    }

    logNeedleNotFound(exception, message, fullPath) {
        if (!message) {
            message = 'Content not added to file';
        }
        this.generator.log(chalk.yellow('\nUnable to find ') +
         fullPath +
         chalk.yellow(` or missing required jhipster-needle. ${message}\n`));
        this.generator.debug('Error:', exception);
    }

    generateFileModelWithPath(aPath, aFile, needleTag, ...content) {
        return Object.assign(this.generateFileModel(aFile, needleTag, ...content), { path: aPath });
    }

    generateFileModel(aFile, needleTag, ...content) {
        return {
            file: aFile,
            needle: needleTag,
            splicable: content
        };
    }
};
