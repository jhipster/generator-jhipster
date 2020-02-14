const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    initializing() {
        console.log('Running foo');
    }
};
