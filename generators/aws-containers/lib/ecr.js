const AWS = require('aws-sdk'); // eslint-disable-line
const _ = require('lodash');

module.exports = class ECR {
    constructor(region) {
        this.ecr = new AWS.ECR({ region });
    }

    /**
     * Returns the instance of the ECR class from the SDK
     * @returns {AWS.ECR|ECR}
     */
    get sdk() {
        return this.ecr;
    }

    /**
     * Fetch the URI of the ECR repository off.
     * @param respositoryName
     * @returns {Promise.<string>}
     */
    getEcrRepositoryURI(respositoryName) {
        return this.ecr.describeRepositories({
            repositoryNames: [respositoryName]
        }).promise()
            .then(result => _(result.repositories).first().repositoryUri);
    }
};
