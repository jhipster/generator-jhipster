/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const AWS = require('aws-sdk'); // eslint-disable-line
const _ = require('lodash');
const chalk = require('chalk');

const STACK_LISTENER_INTERVAL = 15000;
const PHYSICAL_RESOURCE_SEPARATOR = ':';
const STACK_EVENT_STATUS_DISPLAY_LENGTH = 35;

let stdOut = message => console.error(message.trim()); // eslint-disable-line
let stdErr = message => console.error(message.trim()); // eslint-disable-line
module.exports = class CloudFormation {
    constructor(region) {
        this.cf = new AWS.CloudFormation({ region });
    }

    setOutputs(stdout, stderr) {
        stdOut = stdout;
        stdErr = stderr;
    }

    /**
     * Create an object which can be supplied to cloudformation for initialisation
     * @param key
     * @param value
     * @returns {{ParameterKey: *, ParameterValue: *}}
     */
    cfParameter(key, value) {
        return { ParameterKey: key, ParameterValue: value };
    }

    /**
     * Create a CloudFormation Stack in AWS
     * @param stackName the stack to give to the name. It MUST to be unique in the WHOLE region the Stack is created in
     * @param templateUrl url to the desired template.
     * @param additionalParams additional parameter array to add to CF script
     * @returns {Promise.<TResult>}
     */
    createCloudFormationStack(stackName, templateUrl, additionalParams = []) {
        return this.cf
            .createStack({
                StackName: stackName,
                Capabilities: ['CAPABILITY_IAM'],
                OnFailure: 'DELETE',
                Parameters: [this.cfParameter('shouldDeployService', 'false')].concat(additionalParams),
                TemplateURL: templateUrl
            })
            .promise()
            .then(() => this._stackCreationEventListener(stackName));
    }

    /**
     * Fetch the name of the ECR repository out of the CloudFormation Stack.
     * @param stackId
     * @returns {Promise.<TResult>}
     */
    getEcrId(stackId) {
        return this.cf
            .describeStackResource({
                StackName: stackId,
                LogicalResourceId: 'JHipsterContainerRegistry'
            })
            .promise()
            .then(data => data.StackResourceDetail.PhysicalResourceId);
    }

    /**
     * Check that the AWS CloudFormation stack exists.
     * @param stackName the name of the stack to look for.
     * @returns {Promise<PromiseResult<D, E>>}
     */
    getStack(stackName) {
        return this.cf.describeStacks({ StackName: stackName }).promise();
    }

    /**
     * Create a Listener for the Parent Stack we create. It will listen to all of the events and display them.
     * @param stackName the name of the stack to listen to.
     * @returns {Promise}
     * @private
     */
    _stackCreationEventListener(stackName) {
        return new Promise((resolve, reject) => {
            const params = { StackName: stackName };
            const parentEvents = {};
            let listenerInterval;
            let previousEventId;
            const nestedStacks = {};

            const cancel = error => {
                clearInterval(listenerInterval);
                _.forEach(nestedStacks, o => clearInterval(o.listenerInterval));
                reject(error);
            };
            const complete = result => {
                clearInterval(listenerInterval);
                _.forEach(nestedStacks, o => clearInterval(o.listenerInterval));
                resolve({
                    ...result.Stacks[0],
                    nestedStacks: _.map(nestedStacks, (stack, key) => ({
                        appName: stack.appName,
                        stackId: key
                    }))
                });
            };

            listenerInterval = setInterval(
                () =>
                    this.cf
                        .describeStackEvents(params)
                        .promise()
                        .then(result => {
                            const unproceedEvents = _.chain(result.StackEvents)
                                .filter(event => !_.has(parentEvents, event.EventId))
                                .reverse()
                                .value();
                            unproceedEvents.forEach(stack => {
                                parentEvents[stack.EventId] = stack;
                                if (stack.EventId !== previousEventId) {
                                    stdOut(_getStackLogLine(stack));
                                    previousEventId = stack.EventId;
                                }
                                if (_isStackEventError(stack)) {
                                    cancel(new Error('Creation of stack failed.'));
                                }

                                if (_.has(nestedStacks, stack.PhysicalResourceId) || !_doesEventContainsNestedStackId(stack)) {
                                    return;
                                }

                                const nestedStackId = stack.PhysicalResourceId;
                                nestedStacks[nestedStackId] = {
                                    appName: stack.LogicalResourceId,
                                    listenerInterval: null,
                                    events: {},
                                    previousEventId: null
                                };
                                nestedStacks[nestedStackId].listenerInterval = setInterval(
                                    () =>
                                        this.cf
                                            .describeStackEvents({ StackName: nestedStackId })
                                            .promise()
                                            .then(result => {
                                                const stackMeta = nestedStacks[nestedStackId];
                                                const unproceedEvents = _.chain(result.StackEvents)
                                                    .filter(event => !_.has(stackMeta.events, event.EventId))
                                                    .reverse()
                                                    .value();

                                                unproceedEvents.forEach(stack => {
                                                    stackMeta.events[stack.EventId] = stack;

                                                    if (stack.EventId !== stackMeta.previousEventId) {
                                                        stdOut(_getStackLogLine(stack, 1));
                                                        stackMeta.previousEventId = stack.EventId;
                                                    }
                                                    if (_isStackEventError(stack)) {
                                                        cancel(new Error('Creation of nested stack failed'));
                                                    }
                                                });
                                            })
                                            .catch(cancel),
                                    STACK_LISTENER_INTERVAL
                                );
                            });
                        })
                        .catch(cancel),
                STACK_LISTENER_INTERVAL
            );

            return this.cf
                .waitFor('stackCreateComplete', params)
                .promise()
                .then(complete)
                .catch(cancel);
        });
    }

    /**
     * TODO: Manage deletion/recreation of nested stack
     * @param stackName
     * @param nestedStackNames
     */
    updateCloudFormationStack(stackName, nestedStackNames = [], templateUrl, additionalParams, deployService = 'false') {
        const stackToListen = _.concat(nestedStackNames, stackName);
        const listeners = { 0: { previousEventId: null, listenerId: null } };
        const clearIntervals = () => _.forEach(listeners, l => clearInterval(l.listenerId));

        return new Promise((resolve, reject) =>
            this.cf
                .updateStack({
                    StackName: stackName,
                    Capabilities: ['CAPABILITY_IAM'],
                    Parameters: [this.cfParameter('shouldDeployService', deployService)].concat(additionalParams),
                    TemplateURL: templateUrl
                })
                .promise()
                .catch(reject)
                .then(() => {
                    const success = result => {
                        clearIntervals();
                        resolve(result);
                    };
                    const failure = error => {
                        clearIntervals();
                        reject(error);
                    };
                    _.forEach(stackToListen, id => {
                        listeners[id] = {};
                        listeners[id].previousEventId = null;
                        listeners[id].listenerId = setInterval(
                            () =>
                                this.cf
                                    .describeStackEvents({ StackName: id })
                                    .promise()
                                    .then(result => {
                                        const listener = listeners[id];
                                        const stack = result.StackEvents[0];
                                        if (stack.EventId !== listener.previousEventId) {
                                            stdOut(_getStackLogLine(stack, 1));
                                            listener.previousEventId = stack.EventId;
                                            listeners[id] = listener;
                                        }
                                        if (_isStackEventError(stack)) {
                                            failure(new Error('Creation of nested stack failed'));
                                        }
                                    })
                                    .catch(failure),
                            STACK_LISTENER_INTERVAL
                        );
                    });

                    return this.cf
                        .waitFor('stackUpdateComplete', { StackName: stackName })
                        .promise()
                        .then(success)
                        .catch(failure);
                })
        );
    }
};

/**
 * Check if the stack event contains the name a Nested Stack name.
 * @param stack The StackEvent object.
 * @returns {boolean} true if the object contain a Nested Stack name, false otherwise.
 * @private
 */
function _doesEventContainsNestedStackId(stack) {
    if (stack.ResourceType !== 'AWS::CloudFormation::Stack') {
        return false;
    }
    if (stack.ResourceStatusReason !== 'Resource creation Initiated') {
        return false;
    }
    if (stack.ResourceStatus !== 'CREATE_IN_PROGRESS') {
        return false;
    }
    if (_.isNil(stack.PhysicalResourceId)) {
        return false;
    }

    return _hasLabelNestedStackName(stack.PhysicalResourceId);
}

/**
 * returns a formatted status string ready to be displayed
 * @param status
 * @returns {*} a string
 * @private
 */
function _formatStatus(status) {
    let statusColorFn = chalk.grey;
    if (_.endsWith(status, 'IN_PROGRESS')) {
        statusColorFn = chalk.yellow;
    } else if (_.endsWith(status, 'FAILED') || _.startsWith(status, 'DELETE')) {
        statusColorFn = chalk.red;
    } else if (_.endsWith(status, 'COMPLETE')) {
        statusColorFn = chalk.greenBright;
    }

    const sanitizedStatus = _.replace(status, '_', ' ');
    const paddedStatus = _.padEnd(sanitizedStatus, STACK_EVENT_STATUS_DISPLAY_LENGTH);
    return statusColorFn(paddedStatus);
}

/**
 * Generate an enriched string to display a CloudFormation Stack creation event.
 * @param stack Stack event
 * @param indentation level of indentation to display (between the date and the rest of the log)
 * @returns {string}
 * @private
 */
function _getStackLogLine(stack, indentation = 0) {
    const time = chalk.blue(`${stack.Timestamp.toLocaleTimeString()}`);
    const spacing = _.repeat('\t', indentation);
    const status = _formatStatus(stack.ResourceStatus);

    const stackName = chalk.grey(stack.StackName);
    const resourceType = chalk.bold(stack.ResourceType);
    return `${time} ${spacing}${status} ${resourceType}\t${stackName}`;
}

/**
 * Check if the PhysicalResourceId label contains a Nested Stack name.
 * @param physicalResource the label to evaluate
 * @returns {boolean|*}
 * @private
 */
function _hasLabelNestedStackName(physicalResource) {
    return _(physicalResource)
        .split(PHYSICAL_RESOURCE_SEPARATOR)
        .last()
        .startsWith('stack/');
}

function _isStackEventError(stack) {
    return _.includes(['CREATE_FAILED', 'DELETE_IN_PROGRESS'], stack.ResourceStatus);
}
