
module.exports = {
    askForClient,
    askForClientTheme,
    askForClientThemeVariant,
    askForClientSideOpts
};

function askForClient(meta) {
    if (!meta && this.existingProject) return;

    const applicationType = this.applicationType;

    const choices = [
        {
            value: 'vue',
            name: 'Vue.js'
        }
    ];

    const PROMPT = {
        type: 'list',
        name: 'clientFramework',
        when: () => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: () => 'Which *Framework* would you like to use for the client?',
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

function askForClientTheme(meta) {
    if (!meta && this.existingProject) {
        return;
    }

    const applicationType = this.applicationType;

    const choices = [
        {
            value: 'none',
            name: 'Default JHipster'
        },
        { value: 'cerulean', name: 'Cerulean' },
        { value: 'cosmo', name: 'Cosmo' },
        { value: 'cerulean', name: 'Cyborg' },
        { value: 'darkly', name: 'Darkly' },
        { value: 'flatly', name: 'Flatly' },
        { value: 'journal', name: 'Journal' },
        { value: 'litera', name: 'Litera' },
        { value: 'lumen', name: 'Lumen' },
        { value: 'lux', name: 'Lux' },
        { value: 'materia', name: 'Materia' },
        { value: 'minty', name: 'Minty' },
        { value: 'pulse', name: 'Pulse' },
        { value: 'sandstone', name: 'Sandstone' },
        { value: 'simplex', name: 'Simplex' },
        { value: 'sketchy', name: 'Sketchy' },
        { value: 'slate', name: 'Slate' },
        { value: 'solar', name: 'Solar' },
        { value: 'spacelab', name: 'Spacelab' },
        { value: 'superhero', name: 'Superhero' },
        { value: 'united', name: 'United' },
        { value: 'yeti', name: 'Yeti' }
    ];

    const PROMPT = {
        type: 'list',
        name: 'clientTheme',
        when: () => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: 'Would you like to use a Bootswatch theme (https://bootswatch.com/)?',
        choices,
        default: 'none'
    };

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then((prompt) => {
        this.clientTheme = prompt.clientTheme;
        done();
    });
}

function askForClientThemeVariant(meta) {
    if (!meta && this.existingProject) {
        return;
    }
    if (this.clientTheme === 'none') {
        this.clientThemeVariant = '';
        return;
    }

    const applicationType = this.applicationType;

    const choices = [
        { value: 'primary', name: 'Primary' },
        { value: 'dark', name: 'Dark' },
        { value: 'light', name: 'Light' }
    ];

    const PROMPT = {
        type: 'list',
        name: 'clientThemeVariant',
        when: () => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: 'Choose a Bootswatch variant navbar theme (https://bootswatch.com/)?',
        choices,
        default: 'primary'
    };

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then((prompt) => {
        this.clientThemeVariant = prompt.clientThemeVariant;
        done();
    });
}

function askForClientSideOpts() {
    if (this.existingProject) return;

    this.useSass = true;
}
