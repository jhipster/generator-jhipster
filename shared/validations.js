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
        }
    }
};
