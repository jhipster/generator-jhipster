module.exports = {
    app: {
        default: true,
        alias: 'a',
        desc: 'Creates a new JHipster application based on the selected options'
    },
    aws: {
        desc: 'Initializes a AWS app and generates a WAR file that is ready to push to AWS.'
    },
    'ci-cd': {
        alias: 'ci',
        desc: 'Creates pipeline scripts for various CI/CD tools based on the selected options'
    },
    client: {
        desc: 'Creates a new JHipster client side application based on the selected options'
    },
    cloudfoundry: {
        alias: 'cf',
        desc: 'Generates a `deploy/cloudfoundry` folder with a specific manifest.yml to deploy to Cloud Foundry'
    },
    'docker-compose': {
        alias: 'dc',
        desc: 'Creates all required Docker deployment configuration for the selected applications'
    },
    entity: {
        alias: 'e',
        argument: ['name'],
        desc: 'Creates a new JHipster entity: JPA entity, Spring server side components and Angular client side components'
    },
    'export-jdl': {
        alias: 'ejdl',
        argument: ['jdlFile'],
        desc: 'Creates JDL from the json entities'
    },
    heroku: {
        alias: 'hr',
        desc: 'Initializes a Heroku app and generates a WAR file that is ready to push to Heroku'
    },
    'import-jdl': {
        alias: 'ijdl',
        argument: ['jdlFiles...'],
        desc: 'Creates entities from the passed JDL file location'
    },
    info: {
        alias: 'i',
        desc: 'Display information about your current project and system'
    },
    kubernetes: {
        alias: 'k8',
        desc: 'Creates all required Kubernetes deployment configuration for the selected applications'
    },
    languages: {
        alias: 'ln',
        argument: ['languages...'],
        desc: 'Select languages from a list of available languages. The i18n files will be copied to the /webapp/i18n folder'
    },
    'rancher-compose': {
        alias: 'rc',
        desc: 'Creates all required rancher-compose deployment configuration for the selected applications'
    },
    server: {
        desc: 'Creates a new JHipster server side application based on the selected options'
    },
    service: {
        argument: ['name'],
        desc: 'Creates a new JHipster service: this is a simple transactional Spring service bean'
    },
    upgrade: {
        alias: 'up',
        desc: 'Updates JHipster version, and upgrades generated application'
    }
};
