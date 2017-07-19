let aws;

const Rds = module.exports = function Rds(Aws) {
    aws = Aws;
};

Rds.prototype.createDatabase = function createDatabase(params, callback) {
    const dbInstanceClass = params.dbInstanceClass;
    const dbName = params.dbName;
    const dbEngine = params.dbEngine;
    const dbPassword = params.dbPassword;
    const dbUsername = params.dbUsername;

    createRdsSecurityGroup({ rdsSecurityGroupName: dbName }, (err, data) => {
        if (err) {
            callback({ message: err.message }, null);
        } else {
            const rdsSecurityGroupId = data.rdsSecurityGroupId;

            if (!rdsSecurityGroupId) {
                callback(null, { message: `Database ${dbName} already exists` });
            } else {
                authorizeSecurityGroupIngress({ rdsSecurityGroupId }, (err) => {
                    if (err) {
                        callback({ message: err.message }, null);
                    } else {
                        createDbInstance({
                            dbInstanceClass,
                            dbName,
                            dbEngine,
                            dbPassword,
                            dbUsername,
                            rdsSecurityGroupId
                        }, (err, data) => {
                            if (err) {
                                callback({ message: err.message }, null);
                            } else {
                                callback(null, { message: data.message });
                            }
                        });
                    }
                });
            }
        }
    });
};

Rds.prototype.createDatabaseUrl = function createDatabaseUrl(params, callback) {
    const rds = new aws.RDS();
    const dbName = params.dbName;
    const dbEngine = params.dbEngine;

    rds.waitFor('dBInstanceAvailable', { DBInstanceIdentifier: dbName }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            const dbEndpoint = data.DBInstances[0].Endpoint;
            const dbUrl = `jdbc:${dbEngine}://${dbEndpoint.Address}:${dbEndpoint.Port}/${dbName}`;
            const message = `Database available at ${dbUrl}`;
            callback(null, { message, dbUrl });
        }
    });
};

function createRdsSecurityGroup(params, callback) {
    const ec2 = new aws.EC2();

    const securityGroupParams = {
        Description: 'Enable database access to Beanstalk application',
        GroupName: params.rdsSecurityGroupName
    };

    ec2.createSecurityGroup(securityGroupParams, (err, data) => {
        if (err && err.code === 'InvalidGroup.Duplicate') {
            callback(null, { message: `Security group ${params.rdsSecurityGroupName} already exists` });
        } else if (err) {
            callback(err, null);
        } else {
            callback(null, { rdsSecurityGroupId: data.GroupId });
        }
    });
}

function authorizeSecurityGroupIngress(params, callback) {
    const ec2 = new aws.EC2();

    const securityGroupParams = {
        GroupId: params.rdsSecurityGroupId,
        IpProtocol: 'tcp',
        FromPort: 0,
        ToPort: 65535,
        CidrIp: '0.0.0.0/0'
    };

    ec2.authorizeSecurityGroupIngress(securityGroupParams, (err) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { message: 'Create security group successful' });
        }
    });
}

function createDbInstance(params, callback) {
    const rds = new aws.RDS();

    const dbInstanceParams = {
        AllocatedStorage: 5,
        DBInstanceClass: params.dbInstanceClass,
        DBInstanceIdentifier: params.dbName,
        Engine: params.dbEngine,
        MasterUserPassword: params.dbPassword,
        MasterUsername: params.dbUsername,
        DBName: params.dbName,
        VpcSecurityGroupIds: [params.rdsSecurityGroupId],
        MultiAZ: false,
        Iops: 0
    };

    rds.createDBInstance(dbInstanceParams, (err) => {
        if (err && err.code === 'DBInstanceAlreadyExists') {
            callback(null, { message: 'Database already exists' });
        } else if (err) {
            callback(err, null);
        } else {
            callback(null, { message: 'Database created successful' });
        }
    });
}
