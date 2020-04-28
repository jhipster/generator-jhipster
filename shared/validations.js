module.exports = {
    applicationOptions: {
        applicationType: {
            prompt: {
                when() {
                    // Make sure applicationType is set.
                    this.generator.applicationType = this.generator.applicationType || this.definition.defaultValue;
                    return !this.generator.skipServer;
                }
            }
        },
        reactive: {
            prompt: {
                when(answers) {
                    const applicationType = answers.applicationType || this.generator.applicationType;
                    return ['gateway', 'monolith', 'microservice'].includes(applicationType);
                }
            }
        },
        testFrameworks: {
            prompt: {
                when() {
                    return !this.generator.skipServer || !this.generator.skipClient;
                },
                choices(_) {
                    const choices = [];
                    const { availableChoices } = this.prompt;
                    if (!this.generator.skipServer) {
                        // all server side test frameworks should be added here
                        choices.push(availableChoices.gatling, availableChoices.cucumber);
                    }
                    if (!this.generator.skipClient) {
                        // all client side test frameworks should be added here
                        choices.push(availableChoices.protractor);
                    }
                    return choices;
                }
            }
        }
    }
};
