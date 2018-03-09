const AWS = require('aws-sdk'); // eslint-disable-line
const spinner = require('./utils').spinner;
const _ = require('lodash');

module.exports = class AwSSM {
    constructor(region) {
        this.ssm = new AWS.SSM({ region });
    }

    /**
     * Returns an AWS SSM managed parameter. If no property can be found, an undefined value is returned
     * @param parameterName Name of the parameter to retrieve
     */
    getSSMParameter(parameterName) {
        return spinner(this.ssm.getParameters({
            Names: [parameterName],
            WithDecryption: true
        }).promise()
            .then(resultParams => _.get(resultParams, 'Parameters[0].Value')));
    }

    /**
     * Sets an AWS SSM Managed parameter
     * @param parameterName
     *  The name of the parameter to set
     * @param parameterValue
     *  The value of the parameter
     * @param description
     *  A description to associate with the parameter
     * @param parameterType
     *  The type of parameter, either "String", "StringList" or "SecureString"
     */
    setSSMParameter(parameterName, parameterValue, description = '', parameterType = 'SecureString') {
        return spinner(this.ssm.putParameter({
            Name: parameterName,
            Type: parameterType,
            Description: description,
            Value: parameterValue,
            Overwrite: true
        }).promise());
    }
};
