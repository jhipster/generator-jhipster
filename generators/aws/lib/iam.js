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

const INSTANCE_PROFILE_ROLE = 'aws-elasticbeanstalk-ec2-role';
const SERVICE_PROFILE_ROLE = 'aws-elasticbeanstalk-service-role';
const AWS_POLICY_ARN = suffix => `arn:aws:iam::aws:policy/${suffix}`;
const AWS_SERVICE_ARN = suffix => `arn:aws:iam::aws:policy/service-role/${suffix}`;

let aws;
let log;

const Iam = (module.exports = function Iam(Aws, generator) {
    aws = Aws;
    log = generator.log;
});

const createRole = (RoleName, Description, AssumeRolePolicyDocument) => {
    const iam = new aws.IAM();
    return iam
        .createRole({
            RoleName,
            Description,
            AssumeRolePolicyDocument
        })
        .promise();
};

const createInstanceProfile = InstanceProfileName => {
    const iam = new aws.IAM();
    return iam
        .createInstanceProfile({
            InstanceProfileName
        })
        .promise();
};

const addRoleToInstanceProfile = (InstanceProfileName, RoleName) => {
    const iam = new aws.IAM();
    return iam
        .addRoleToInstanceProfile({
            InstanceProfileName,
            RoleName
        })
        .promise();
};

const attachRolePolicy = (PolicyArn, RoleName) => {
    const iam = new aws.IAM();
    return iam
        .attachRolePolicy({
            PolicyArn,
            RoleName
        })
        .promise();
};

const attachServicePolicyToRole = (policySuffix, roleName) => attachRolePolicy(AWS_SERVICE_ARN(policySuffix), roleName);
const attachPolicyToRole = (policySuffix, roleName) => attachRolePolicy(AWS_POLICY_ARN(policySuffix), roleName);

const getRole = RoleName => {
    const iam = new aws.IAM();
    return iam
        .getRole({
            RoleName
        })
        .promise();
};

const hasRole = roleName =>
    getRole(roleName)
        .then(() => true)
        .catch(err => {
            if (err && err.code === 'NoSuchEntity') {
                return false;
            }
            throw err;
        });

const hasInstanceProfileName = InstanceProfileName => {
    const iam = new aws.IAM();
    return iam
        .getInstanceProfile({
            InstanceProfileName
        })
        .promise()
        .then(() => true)
        .catch(err => {
            if (err && err.code === 'NoSuchEntity') {
                return false;
            }
            throw err;
        });
};

const hasInstanceProfile = () => hasInstanceProfileName(INSTANCE_PROFILE_ROLE);
const hasInstanceRole = () => hasRole(INSTANCE_PROFILE_ROLE);
const hasServiceProfileRole = () => hasRole(SERVICE_PROFILE_ROLE);

const createInstanceProfileWithAttachment = () =>
    createInstanceProfile(INSTANCE_PROFILE_ROLE).then(() => addRoleToInstanceProfile(INSTANCE_PROFILE_ROLE, INSTANCE_PROFILE_ROLE));

const createServiceProfileRoleWithAttachedPolicies = () => {
    const roleName = SERVICE_PROFILE_ROLE;
    const description = 'Default Elastic Beanstalk Service profile created by JHipster.';
    const assumedPolicyDoc = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticbeanstalk.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "elasticbeanstalk"
        }
      }
    }
  ]
}`;

    return createRole(roleName, description, assumedPolicyDoc).then(() => {
        const policiesToAttach = [
            attachServicePolicyToRole('AWSElasticBeanstalkEnhancedHealth', roleName),
            attachServicePolicyToRole('AWSElasticBeanstalkService', roleName)
        ];
        return Promise.all(policiesToAttach);
    });
};

const createInstanceRoleWithAttachedPolicies = () => {
    const roleName = INSTANCE_PROFILE_ROLE;
    const description = 'Default Elastic Beanstalk instance profile created by JHipster.';
    const assumedPolicyDoc = `{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`;

    return createRole(roleName, description, assumedPolicyDoc).then(() => {
        const policiesToAttach = [
            attachPolicyToRole('AWSElasticBeanstalkWebTier', roleName),
            attachPolicyToRole('AWSElasticBeanstalkWorkerTier', roleName),
            attachPolicyToRole('AWSElasticBeanstalkMulticontainerDocker', roleName)
        ];
        return Promise.all(policiesToAttach);
    });
};

/**
 * Verifies that the Elastic Beanstalk roles have been created in the IAM Account. This is for situations
 * where we're deploying to a new/fresh AWS account, and an Elastic Beanstalk application has not been deployed via
 * the web-application or CLI.
 *
 * See [service role info here]{@link https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/iam-servicerole.html}
 * and [instance profile info here]{@link https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/iam-instanceprofile.html#iam-instanceprofile-verify}
 * @param params
 * @param callback
 */
Iam.prototype.verifyRoles = function verifyRoles(params, callback) {
    hasInstanceRole()
        .then(instanceRole => {
            if (!instanceRole) {
                log(`Instance role '${INSTANCE_PROFILE_ROLE}' does not exist. Creating based on defaults.`);
                return createInstanceRoleWithAttachedPolicies();
            }

            return instanceRole;
        })
        .then(() => hasInstanceProfile())
        .then(instanceProfileExists => {
            if (!instanceProfileExists) {
                log(`Instance profile '${INSTANCE_PROFILE_ROLE}' does not exist. Creating based on defaults.`);
                return createInstanceProfileWithAttachment();
            }

            return instanceProfileExists;
        })
        .then(() => hasServiceProfileRole())
        .then(serviceProfileExists => {
            if (!serviceProfileExists) {
                log(`Service Profile profile '${SERVICE_PROFILE_ROLE}' does not exist. Creating based on defaults.`);
                return createServiceProfileRoleWithAttachedPolicies();
            }

            return serviceProfileExists;
        })
        .then(() => callback(null, null))
        .catch(err => {
            callback(
                {
                    message: err.message
                },
                null
            );
        });
};
