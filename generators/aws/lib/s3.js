'use strict';
var fs = require('fs');

const FILE_EXTENSION = '.original',
    S3_STANDARD_REGION = 'us-east-1';

var progressbar;


var S3 = module.exports = function S3(Aws, generator) {
    this.Aws = Aws;
    try {
        progressbar = require('progress');
    } catch (e) {
        generator.error('Something went wrong while running jhipster:aws:\n' + e);
    }
};

S3.prototype.createBucket = function createBucket(params, callback) {
    var bucket = params.bucket,
        region = this.Aws.config.region;

    var s3Params = {
        Bucket: bucket,
        CreateBucketConfiguration: {LocationConstraint: region}
    };

    if (region.toLowerCase() === S3_STANDARD_REGION) {
        s3Params.CreateBucketConfiguration = undefined;
    }

    var s3 = new this.Aws.S3({
        params: s3Params,
        signatureVersion: 'v4'
    });

    s3.headBucket(function (err) {
        if (err && err.statusCode === 404) {
            s3.createBucket(function (err) {
                if (err) {
                    error(err.message, callback);
                } else {
                    success('Bucket ' + bucket + ' created successful', callback);
                }
            });
        } else if (err && err.statusCode === 301) {
            error('Bucket ' + bucket + ' is already in use', callback);
        } else if (err) {
            error(err.message, callback);
        } else {
            success('Bucket ' + bucket + ' already exists', callback);
        }
    });
};

S3.prototype.uploadWar = function uploadWar(params, callback) {
    var bucket = params.bucket;
    var buildTool = params.buildTool;
    var buildFolder;

    if (buildTool === 'gradle') {
        buildFolder = 'build/libs/';
    } else {
        buildFolder = 'target/';
    }

    findWarFilename(buildFolder, function (err, warFilename) {
        if (err) {
            error(err, callback);
        } else {
            var warKey = warFilename.slice(0, -FILE_EXTENSION.length);

            var s3 = new this.Aws.S3({
                params: {
                    Bucket: bucket,
                    Key: warKey
                },
                signatureVersion: 'v4',
                httpOptions: {timeout: 600000}
            });

            var filePath = buildFolder + warFilename,
                body = fs.createReadStream(filePath);

            uploadToS3(s3, body, function (err, message) {
                if (err) {
                    error(err.message, callback);
                } else {
                    callback(null, {message: message, warKey: warKey});
                }
            });
        }
    }.bind(this));
};

function findWarFilename(buildFolder, callback) {
    var warFilename = '';
    fs.readdir(buildFolder, function (err, files) {
        if (err) {
            error(err, callback);
        }
        files.filter(function (file) {
            return file.substr(-FILE_EXTENSION.length) === FILE_EXTENSION;
        })
        .forEach(function (file) {
            warFilename = file;
        });
        callback(null, warFilename);
    });
}

function uploadToS3(s3, body, callback) {
    var bar;

    s3.waitFor('bucketExists', function (err) {
        if (err) {
            callback(err, null);
        } else {
            s3.upload({Body: body}).on('httpUploadProgress', function (evt) {

                if (bar === undefined && evt.total) {
                    var total = evt.total / 1000000;
                    bar = new progressbar('uploading [:bar] :percent :etas', {
                        complete: '=',
                        incomplete: ' ',
                        width: 20,
                        total: total,
                        clear: true
                    });
                }

                var curr = evt.loaded / 1000000;
                bar.tick(curr - bar.curr);
            }).send(function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, 'War uploaded successful');
                }
            });
        }
    });
}

function success(message, callback) {
    callback(null, {message: message});
}

function error(message, callback) {
    callback({message: message}, null);
}
