
module.exports = {
    askForClient,
    askForClientSideOpts
};

function askForClient(meta) {
    if (!meta && this.existingProject) return;

    const applicationType = this.applicationType;

    const choices = [
        {
            value: 'vue',
            name: 'VueJS'
        }
    ];

    const PROMPT = {
        type: 'list',
        name: 'clientFramework',
        when: response => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: response => this.getNumberedQuestion(
            'Which *Framework* would you like to use for the client?',
            applicationType !== 'microservice' && applicationType !== 'uaa'
        ),
        choices,
        default: 'vue'
    };

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then((prompt) => {
        this.clientFramework = prompt.clientFramework;
        done();
    });
}

function askForClientSideOpts() {
    if (this.existingProject) return;

    this.useSass = true;
}
