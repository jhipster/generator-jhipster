module.exports = {
    app: {
        default: true,
        desc: 'Create a new JHipster application based on the selected options'
    },
    aws: {
        desc: 'Deploy the current application to Amazon Web Services'
    },
    'aws-containers': {
        desc: 'Deploy the current application to Amazon Web Services using ECS'
    },
    'ci-cd': {
        desc: 'Create pipeline scripts for popular Continuous Integration/Continuous Deployment tools'
    },
    client: {
        desc: 'Create a new JHipster client-side application based on the selected options'
    },
    cloudfoundry: {
        desc: 'Generate a `deploy/cloudfoundry` folder with a specific manifest.yml to deploy to Cloud Foundry'
    },
    'docker-compose': {
        desc: 'Create all required Docker deployment configuration for the selected applications'
    },
    entity: {
        argument: ['name'],
        desc: 'Create a new JHipster entity: JPA entity, Spring server-side components and Angular client-side components'
    },
    'export-jdl': {
        argument: ['jdlFile'],
        desc: 'Create a JDL file from the existing entities'
    },
    gae: {
        desc: 'Deploy the current application to Google App Engine'
    },
    heroku: {
        desc: 'Deploy the current application to Heroku'
    },
    'import-jdl': {
        argument: ['jdlFiles...'],
        cliOnly: true,
        desc: 'Create entities from the JDL file passed in argument',
        help: `
    --skip-install        # Do not automatically install dependencies                              Default: false
    --db                  # Provide DB option for the application when using skip-server flag
    --json-only           # Generate only the JSON files and skip entity regeneration              Default: false
    --ignore-application  # Ignores application generation                                         Default: false
    --skip-ui-grouping    # Disable the UI grouping behaviour for entity client side code          Default: false

Arguments:
    jdlFiles  # The JDL file names  Type: String[]  Required: true

Example:
    jhipster import-jdl myfile.jdl
    jhipster import-jdl myfile1.jdl myfile2.jdl
        `
    },
    info: {
        desc: 'Display information about your current project and system'
    },
    kubernetes: {
        desc: 'Deploy the current application to Kubernetes'
    },
    languages: {
        argument: ['languages...'],
        desc: 'Select languages from a list of available languages. The i18n files will be copied to the /webapp/i18n folder'
    },
    // login: {
    //     desc: 'Link the installed JHipster CLI to your JHipster Online account'
    // },
    // logout: {
    //     desc: 'Unlink the installed JHipster CLI from your JHipster Online account'
    // },
    openshift: {
        desc: 'Deploy the current application to OpenShift'
    },
    'rancher-compose': {
        desc: 'Deploy the current application to Rancher'
    },
    server: {
        desc: 'Create a new JHipster server-side application'
    },
    'spring-service': {
        alias: 'service',
        argument: ['name'],
        desc: 'Create a new Spring service bean'
    },
    'spring-controller': {
        argument: ['name'],
        desc: 'Create a new Spring controller'
    },
    upgrade: {
        desc: 'Upgrade the JHipster version, and upgrade the generated application'
    }
};
