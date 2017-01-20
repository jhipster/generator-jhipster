'use strict';

module.exports = {
    askPipelines,
    askIntegrations
};

function askPipelines() {
    if (this.abort) return;
    var done = this.async();
    var prompts = [
        {
            type: 'checkbox',
            name: 'pipelines',
            message: 'What CI/CD pipeline do you want to generate ?',
            default: [],
            choices: [
                {name: 'Jenkins pipeline', value: 'jenkins'},
                {name: 'Gitlab CI', value: 'gitlab'},
                {name: 'Circle CI', value: 'circle'}
            ]
        }
    ];
    this.prompt(prompts).then(props => {
        if(props.pipelines.length === 0) {
            this.abort = true;
        }
        this.pipelines = props.pipelines;
        done();
    });
}

function askIntegrations() {
    if (this.abort) return;
    var done = this.async();
    var choices = [];
    if (this.pipelines.includes('jenkins') || this.pipelines.includes('gitlab')) {
        choices.push({name: '[Docker] Perform the build in a docker container', value: 'docker'});
    }
    if(this.pipelines.includes('jenkins')) {
        choices.push({name: '[Sonar] Analyze code with Sonar', value: 'sonar'});
        choices.push({name: '[Gitlab] Send build status to Gitlab', value: 'gitlab'});
    }
    if(this.herokuAppName) {
        choices.push({name: '[Heroku] Deploy to heroku', value: 'heroku'});
    }

    var prompts = [
        {
            type: 'checkbox',
            name: 'integrations',
            message: 'What tasks/integrations do you want to include ?',
            default: [],
            choices: choices
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.integrations.includes('sonar'),
            type: 'input',
            name: 'jenkinsSonarName',
            message: 'What is the name of the Sonar server ?',
            default: 'Sonar'
        },
        {
            when: response => response.integrations.includes('heroku'),
            type: 'input',
            name: 'herokuApiKey',
            message: 'What is the Heroku API Key ?',
            default: ''
        },
    ];
    this.prompt(prompts).then(props => {
        this.integrations = props.integrations;
        this.jenkinsSonarName = props.jenkinsSonarName;
        this.herokuApiKey = props.herokuApiKey;
        done();
    });
}
