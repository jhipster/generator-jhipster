const INSTANCE_PROFILE_ROLE = 'aws-elasticbeanstalk-ec2-role';
const SERVICE_PROFILE_ROLE = 'aws-elasticbeanstalk-service-role';
const AWS_POLICY_ARN = suffix => `arn:aws:iam::aws:policy/${suffix}`;
const AWS_SERVICE_ARN = suffix => `arn:aws:iam::aws:policy/service-role/${suffix}`;

let aws;
let log;

const Iam = module.exports = function Iam(Aws, generator) {
    aws = Aws;
    log = generator.log;
};

const createRole = (RoleName, Description, AssumeRolePolicyDocument) => {
    const iam = new aws.IAM();
    return iam.createRole({
        RoleName,
        Description,
        AssumeRolePolicyDocument
    }).promise();
};

const attachRolePolicy = (PolicyArn, RoleName) => {
    const iam = new aws.IAM();
    return iam.attachRolePolicy({ PolicyArn, RoleName }).promise();
};


const attachServicePolicyToRole = (policySuffix, roleName) => attachRolePolicy(AWS_SERVICE_ARN(policySuffix), roleName);
const attachPolicyToRole = (policySuffix, roleName) => attachRolePolicy(AWS_POLICY_ARN(policySuffix), roleName);

const getRole = (RoleName) => {
    const iam = new aws.IAM();
    return iam.getRole({ RoleName }).promise();
};

const hasRole = roleName => getRole(roleName).then(() => true).catch((err) => {
    if (err && err.code === 'NoSuchEntity') {
        return false;
    }
    throw err;
});

const hasInstanceProfile = () => hasRole(INSTANCE_PROFILE_ROLE);
const hasServiceProfile = () => hasRole(SERVICE_PROFILE_ROLE);


const createServiceProfileWithAttachedPolicies = () => {
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

    return createRole(roleName, description, assumedPolicyDoc)
        .then(() => {
            const policiesToAttach = [
                attachServicePolicyToRole('AWSElasticBeanstalkEnhancedHealth', roleName),
                attachServicePolicyToRole('AWSElasticBeanstalkService', roleName)
            ];
            return Promise.all(policiesToAttach);
        });
};

const createInstanceProfileWithAttachedPolicies = () => {
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

    return createRole(roleName, description, assumedPolicyDoc)
        .then(() => {
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
    hasInstanceProfile()
        .then((instanceProfileExists) => {
            if (!instanceProfileExists) {
                log(`Instance profile '${INSTANCE_PROFILE_ROLE}' does not exist. Creating based on defaults.`);
                return createInstanceProfileWithAttachedPolicies();
            }

            return instanceProfileExists;
        })
        .then(() => hasServiceProfile())
        .then((serviceProfileExists) => {
            if (!serviceProfileExists) {
                log(`Service Profile profile '${SERVICE_PROFILE_ROLE}' does not exist. Creating based on defaults.`);
                return createServiceProfileWithAttachedPolicies();
            }

            return serviceProfileExists;
        })
        .then(() => callback(null, null))
        .catch((err) => {
            callback({ message: err.message }, null);
        });
};
