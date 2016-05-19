'use strict';

module.exports = {
    askForModuleName,
    askForClientSideOpts,
    askFori18n
};

function askForModuleName() {

    if (this.baseName) return;

    this.askModuleName(this, this.currentQuestion++, this.totalQuestions);
}

function askForClientSideOpts() {
    if (this.existingProject) return;

    var done = this.async();
    var getNumberedQuestion = this.getNumberedQuestion;
    var generator = this;
    var prompts = [
        {
            type: 'confirm',
            name: 'useSass',
            message: function (response) {
                return getNumberedQuestion('Would you like to use the LibSass stylesheet preprocessor for your CSS?', generator.currentQuestion, generator.totalQuestions, function (current) {
                    generator.currentQuestion = current;
                }, true);
            },
            default: false
        }
    ];
    this.prompt(prompts, function (props) {
        this.useSass = props.useSass;
        done();
    }.bind(this));
}

function askFori18n() {
    if (this.existingProject || this.configOptions.skipI18nQuestion) return;

    this.aski18n(this, this.currentQuestion++, this.totalQuestions);
}
