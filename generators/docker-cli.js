/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const exec = require('child_process').exec;

/**
 * This is the DockerCli object. it allows Yeoman to interact with Docker via Docker CLI.
 * NB: It is vital that these functions are bound to the generator context.
 */
module.exports = {
    setOutputs,
    command,
    getImageID,
    tagImage,
    loginToAws,
    pushImage
};

let stdOut = data => console.log(data.toString().trim()); // eslint-disable-line
let stdErr = data => console.error(data.toString().trim()); // eslint-disable-line
function setOutputs(stdout, stderr) {
    stdOut = stdout;
    stdErr = stderr;
}

/**
 * Execute the shell command given as a parameter and execute the callback at the end. Callback has profile:
 * `function(err, stdout, stderr)`
 * @param cmd the command to execute
 * @param cb the callback that will be called after the function is executed.
 * @param opts additional options
 * @attr silent flag to deactivate the live stderr and stdout. Default to false
 * @attr maxBuffer value of the buffer to store the live outputs. Default to 10240000
 */
function command(cmd, cb, opts = {}) {
    const options = {
        silent: false,
        maxBuffer: 10240000,
        ...opts
    };
    const command = exec(`${cmd}`, { maxBuffer: options.maxBuffer }, cb);

    if (!options.silent) {
        command.stdout.on('data', stdOut);
        command.stderr.on('data', stdErr);
    }
}

/**
 *
 * @param imageName the image name
 * @param tag the image tag (optional)
 * @returns {Promise} returns the image ID on success, an error message on failure (exception or noId).
 */
function getImageID(imageName, tag) {
    const dockerNameTag = `${imageName}${_.isNil(tag) ? '' : `:${tag}`}`;
    const commandLine = `docker image ls --quiet ${dockerNameTag}`;

    return new Promise((resolve, reject) =>
        command(
            commandLine,
            (err, stdout) => {
                if (err) {
                    reject(err);
                }
                const dockerID = _.trim(stdout);
                if (_.isEmpty(dockerID)) {
                    reject(new Error(`No Docker ID found for ${dockerNameTag}`));
                } else {
                    resolve(dockerID);
                }
            },
            { silent: true }
        )
    );
}

function tagImage(from, to) {
    const commandLine = `docker tag ${from} ${to}`;

    return new Promise((resolve, reject) =>
        command(
            commandLine,
            (err, stdout) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout);
            },
            { silent: true }
        )
    );
}

/**
 * Log docker to AWS.
 * @param region
 * @param accountId
 * @param username
 * @param password
 * @returns {Promise}
 */
function loginToAws(region, accountId, username, password) {
    const commandLine = `docker login --username AWS --password ${password} https://${accountId}.dkr.ecr.${region}.amazonaws.com`;
    return new Promise(
        (resolve, reject) =>
            command(commandLine, (err, stdout) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout);
            }),
        { silent: true }
    );
}

/**
 * Pushes the locally constructed Docker image to the supplied respository
 * @param repository tag, for example: 111111111.dkr.ecr.us-east-1.amazonaws.com/sample
 * @returns {Promise<any>}
 */
function pushImage(repository) {
    const commandLine = `docker push ${repository}`;
    return new Promise((resolve, reject) =>
        command(commandLine, (err, stdout) => {
            if (err) {
                reject(err);
            }
            resolve(stdout);
        })
    );
}
