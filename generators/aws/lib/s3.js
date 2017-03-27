const fs = require('fs');

const FILE_EXTENSION = '.original';
const S3_STANDARD_REGION = 'us-east-1';

let Progressbar;


const S3 = module.exports = function S3(Aws, generator) {
    this.Aws = Aws;
    try {
        Progressbar = require('progress'); // eslint-disable-line
    } catch (e) {
        generator.error(`Something went wrong while running jhipster:aws:\n${e}`);
    }
};

S3.prototype.createBucket = function createBucket(params, callback) {
    const bucket = params.bucket;
    const region = this.Aws.config.region;

    const s3Params = {
        Bucket: bucket,
        CreateBucketConfiguration: { LocationConstraint: region }
    };

    if (region.toLowerCase() === S3_STANDARD_REGION) {
        s3Params.CreateBucketConfiguration = undefined;
    }

    const s3 = new this.Aws.S3({
        params: s3Params,
        signatureVersion: 'v4'
    });

    s3.headBucket((err) => {
        if (err && err.statusCode === 404) {
            s3.createBucket((err) => {
                if (err) {
                    error(err.message, callback);
                } else {
                    success(`Bucket ${bucket} created successful`, callback);
                }
            });
        } else if (err && err.statusCode === 301) {
            error(`Bucket ${bucket} is already in use`, callback);
        } else if (err) {
            error(err.message, callback);
        } else {
            success(`Bucket ${bucket} already exists`, callback);
        }
    });
};

S3.prototype.uploadWar = function uploadWar(params, callback) {
    const bucket = params.bucket;
    const buildTool = params.buildTool;
    let buildFolder;

    if (buildTool === 'gradle') {
        buildFolder = 'build/libs/';
    } else {
        buildFolder = 'target/';
    }

    findWarFilename(buildFolder, (err, warFilename) => {
        if (err) {
            error(err, callback);
        } else {
            const warKey = warFilename.slice(0, -FILE_EXTENSION.length);

            const s3 = new this.Aws.S3({
                params: {
                    Bucket: bucket,
                    Key: warKey
                },
                signatureVersion: 'v4',
                httpOptions: { timeout: 600000 }
            });

            const filePath = buildFolder + warFilename;
            const body = fs.createReadStream(filePath);

            uploadToS3(s3, body, (err, message) => {
                if (err) {
                    error(err.message, callback);
                } else {
                    callback(null, { message, warKey });
                }
            });
        }
    });
};

function findWarFilename(buildFolder, callback) {
    let warFilename = '';
    fs.readdir(buildFolder, (err, files) => {
        if (err) {
            error(err, callback);
        }
        files.filter(file => file.substr(-FILE_EXTENSION.length) === FILE_EXTENSION)
        .forEach((file) => {
            warFilename = file;
        });
        callback(null, warFilename);
    });
}

function uploadToS3(s3, body, callback) {
    let bar;

    s3.waitFor('bucketExists', (err) => {
        if (err) {
            callback(err, null);
        } else {
            s3.upload({ Body: body }).on('httpUploadProgress', (evt) => {
                if (bar === undefined && evt.total) {
                    const total = evt.total / 1000000;
                    bar = new Progressbar('uploading [:bar] :percent :etas', {
                        complete: '=',
                        incomplete: ' ',
                        width: 20,
                        total,
                        clear: true
                    });
                }

                const curr = evt.loaded / 1000000;
                bar.tick(curr - bar.curr);
            }).send((err) => {
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
    callback(null, { message });
}

function error(message, callback) {
    callback({ message }, null);
}
