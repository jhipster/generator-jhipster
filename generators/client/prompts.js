
module.exports = {
    askForModuleName,
    askForClient,
    askForClientSideOpts,
    askFori18n
};

function askForModuleName() {
    if (this.baseName) return;

    this.askModuleName(this);
}

function askForClient() {
    if (this.existingProject) return;

    const done = this.async();
    const applicationType = this.applicationType;

    this.prompt({
        type: 'list',
        name: 'clientFramework',
        when: response => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: response => this.getNumberedQuestion('Which *Framework* would you like to use for the client?',
            applicationType !== 'microservice' && applicationType !== 'uaa'),
        choices: [
            {
                value: 'angular1',
                name: 'AngularJS 1.x'
            },
            {
                value: 'angular2',
                name: '[BETA] Angular 4'
            }
        ],
        default: 'angular1'
    }).then((prompt) => {
        this.clientFramework = prompt.clientFramework;
        done();
    });
}

function askForClientSideOpts() {
    if (this.existingProject) return;

    const done = this.async();
    const prompts = [
        {
            type: 'confirm',
            name: 'useSass',
            message: response => this.getNumberedQuestion('Would you like to use the LibSass stylesheet preprocessor for your CSS?', true),
            default: false
        }
    ];
    this.prompt(prompts).then((props) => {
        this.useSass = props.useSass;
        done();
    });
}

function askFori18n() {
    if (this.existingProject || this.configOptions.skipI18nQuestion) return;

    this.aski18n(this);
}
