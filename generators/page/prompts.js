module.exports = {
    askForPage
};

function askForPage(meta) {
    if (!meta && this.existingProject) return;

    const prompts = {
        type: 'input',
        name: 'pageName',
        message: 'What is the name of your page?',
        default: 'MyPage',
        validate: input => (/^([A-Z][a-zA-Z]*)$/.test(input) ? true : 'This is not a valid page name (ex: MyPage).'),
    };

    if (meta) return prompts;

    const done = this.async();

    this.prompt(prompts).then((prompt) => {
        this.pageName = prompt.pageName;
        done();
    });
}
