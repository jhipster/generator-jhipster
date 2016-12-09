'use strict';

var aws;

var Rds = module.exports = function Rds(Aws) {
    aws = Aws;
};

Rds.prototype.createDatabase = function createDatabase(params, callback) {
    var dbInstanceClass = params.dbInstanceClass,
        dbName = params.dbName,
        dbEngine = params.dbEngine,
        dbPassword = params.dbPassword,
        dbUsername = params.dbUsername;

    createRdsSecurityGroup({rdsSecurityGroupName: dbName}, function (err, data) {
        if (err) {
            callback({message: err.message}, null);
        } else {
            var rdsSecurityGroupId = data.rdsSecurityGroupId;

            if (!rdsSecurityGroupId) {
                callback(null, {message: 'Database ' + dbName + ' already exists'});
            } else {
                authorizeSecurityGroupIngress({rdsSecurityGroupId: rdsSecurityGroupId}, function (err) {
                    if (err) {
                        callback({message: err.message}, null);
                    } else {
                        createDbInstance({
                            dbInstanceClass: dbInstanceClass,
                            dbName: dbName,
                            dbEngine: dbEngine,
                            dbPassword: dbPassword,
                            dbUsername: dbUsername,
                            rdsSecurityGroupId: rdsSecurityGroupId
                        }, function (err, data) {
                            if (err) {
                                callback({message: err.message}, null);
                            } else {
                                callback(null, {message: data.message});
                            }
                        });
                    }
                });
            }
        }
    });
};

Rds.prototype.createDatabaseUrl = function createDatabaseUrl(params, callback) {
    var rds = new aws.RDS(),
        dbName = params.dbName,
        dbEngine = params.dbEngine;

    rds.waitFor('dBInstanceAvailable', {DBInstanceIdentifier: dbName}, function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            var dbEndpoint = data.DBInstances[0].Endpoint,
                dbUrl = 'jdbc:' + dbEngine + '://' + dbEndpoint.Address + ':' + dbEndpoint.Port + '/' + dbName,
                message = 'Database available at ' + dbUrl;
            callback(null, {message: message, dbUrl: dbUrl});
        }
    });
};

function createRdsSecurityGroup(params, callback) {
    var ec2 = new aws.EC2();

    var securityGroupParams = {
        Description: 'Enable database access to Beanstalk application',
        GroupName: params.rdsSecurityGroupName
    };

    ec2.createSecurityGroup(securityGroupParams, function (err, data) {
        if (err && err.code === 'InvalidGroup.Duplicate') {
            callback(null, {message: 'Security group ' + params.rdsSecurityGroupName + ' already exists'});
        } else if (err) {
            callback(err, null);
        } else {
            callback(null, {rdsSecurityGroupId: data.GroupId});
        }
    });
}

function authorizeSecurityGroupIngress(params, callback) {
    var ec2 = new aws.EC2();

    var securityGroupParams = {
        GroupId: params.rdsSecurityGroupId,
        IpProtocol: 'tcp',
        FromPort: 0,
        ToPort: 65535,
        CidrIp: '0.0.0.0/0'
    };

    ec2.authorizeSecurityGroupIngress(securityGroupParams, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {message: 'Create security group successful'});
        }
    });
}

function createDbInstance(params, callback) {
    var rds = new aws.RDS();

    var dbInstanceParams = {
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

    rds.createDBInstance(dbInstanceParams, function (err) {
        if (err && err.code === 'DBInstanceAlreadyExists') {
            callback(null, {message: 'Database already exists'});
        } else if (err) {
            callback(err, null);
        } else {
            callback(null, {message: 'Database created successful'});
        }
    });
}
