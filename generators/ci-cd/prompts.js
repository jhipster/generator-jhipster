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
            message: 'What CI/CD pipeline do you want to generate?',
            default: [],
            choices: [
                {name: 'Jenkins pipeline', value: 'jenkins'},
                {name: 'Travis CI', value: 'travis'},
                {name: 'GitLab CI', value: 'gitlab'},
                {name: 'CircleCI', value: 'circle'}
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
    if (this.abort || this.pipelines.length === 0) return;
    var done = this.async();
    var herokuChoices = [];
    if (this.pipelines.includes('jenkins')) {
        herokuChoices.push({name: 'In Jenkins pipeline', value: 'jenkins'});
    }
    if (this.pipelines.includes('gitlab')) {
        herokuChoices.push({name: 'In GitLab CI', value: 'gitlab'});
    }
    if (this.pipelines.includes('circle')) {
        herokuChoices.push({name: 'In CircleCI', value: 'circle'});
    }
    if (this.pipelines.includes('travis')) {
        herokuChoices.push({name: 'In Travis CI', value: 'travis'});
    }

    var prompts = [
        {
            when: this.pipelines.includes('jenkins'),
            type: 'checkbox',
            name: 'jenkinsIntegrations',
            message: 'Jenkins pipeline: what tasks/integrations do you want to include?',
            default: [],
            choices: [
                {name: 'Perform the build in a Docker container', value: 'docker'},
                {name: 'Analyze code with Sonar', value: 'sonar'},
                {name: 'Send build status to GitLab', value: 'gitlab'}
            ]
        },
        {
            when: response => this.pipelines.includes('jenkins') && response.jenkinsIntegrations.includes('sonar'),
            type: 'input',
            name: 'jenkinsSonarName',
            message: 'What is the name of the Sonar server?',
            default: 'Sonar'
        },
        {
            when: this.pipelines.includes('gitlab'),
            type: 'confirm',
            name: 'gitlabUseDocker',
            message: 'In GitLab CI, perform the build in a docker container (hint: GitLab.com uses Docker container)?',
            default: false
        },
        {
            when: (this.pipelines.includes('jenkins') || this.pipelines.includes('gitlab') || this.pipelines.includes('circle') || this.pipelines.includes('travis')) && this.herokuAppName,
            type: 'checkbox',
            name: 'heroku',
            message: 'Deploy to heroku?',
            default: [],
            choices: herokuChoices
        }
    ];
    this.prompt(prompts).then(props => {
        this.jenkinsIntegrations = props.jenkinsIntegrations;
        this.jenkinsSonarName = props.jenkinsSonarName;
        this.gitlabUseDocker = props.gitlabUseDocker;
        this.heroku = props.heroku;
        done();
    });
}
