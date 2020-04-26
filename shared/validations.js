module.exports = {
    applicationOptions: {
        applicationType: {
            prompt: {
                when() {
                    return !this.skipServer;
                }
            }
        },
        reactive: {
            prompt: {
                when(answers) {
                    const applicationType = answers.applicationType || this.applicationType;
                    return ['gateway', 'monolith', 'microservice'].includes(applicationType);
                }
            }
        }
    }
};
