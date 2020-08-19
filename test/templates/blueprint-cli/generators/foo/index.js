const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    initializing() {
        /* eslint-disable no-console */
        console.log('Running foo');
        if (this.options.fooBar) {
            /* eslint-disable no-console */
            console.log('Running bar');
            console.log(this.options.fooBar);
        }
    }
};
